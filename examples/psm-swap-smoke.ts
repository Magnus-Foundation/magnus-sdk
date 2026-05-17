/**
 * Live-chain smoke test for the Cross-FX PSM via `@magnus/sdk`.
 *
 * Quotes 500 mUSD → mEUR through the PSM precompile, then either:
 *   - prints the swap tx wire payload (dry-run, default), or
 *   - broadcasts it with `--broadcast` and reports the on-chain delta.
 *
 * Usage:
 *   pnpm tsx examples/psm-swap-smoke.ts
 *   MAGNUS_PRIVKEY=0x... pnpm tsx examples/psm-swap-smoke.ts --broadcast
 *
 * Environment:
 *   MAGNUS_RPC_URL  — JSON-RPC endpoint (default = local devnet at :8545)
 *   MAGNUS_PRIVKEY  — secp256k1 key (default = Anvil-0)
 *   AMOUNT_IN       — atto-units of mUSD to swap in (default = 500_000_000 = 500 mUSD)
 */

import { decodeFunctionResult, encodeFunctionData, hexToBigInt } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  CROSS_FX_PSM_ADDRESS,
  MAGNUS_USD_ADDRESS,
  crossFxPSMAbi,
  encodeMagnusSignature,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
  magnusDevnet,
  serializeMagnusTransaction,
  type MagnusTransaction,
} from '../src/index.js'

const ANVIL0 = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const
const MEUR_ADDRESS = '0x20c0000000000000000000000000000000000030' as const

const RPC_URL = process.env.MAGNUS_RPC_URL ?? 'http://localhost:8545'
const PRIVKEY = (process.env.MAGNUS_PRIVKEY ?? ANVIL0) as `0x${string}`
const BROADCAST = process.argv.includes('--broadcast')
const AMOUNT_IN = BigInt(process.env.AMOUNT_IN ?? '500000000')

let nextId = 1
async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  })
  const json = (await res.json()) as {
    result?: T
    error?: { message: string; code: number }
  }
  if (json.error) throw new Error(`RPC ${method} error ${json.error.code}: ${json.error.message}`)
  if (json.result === undefined) throw new Error(`RPC ${method} returned no result`)
  return json.result
}

async function readBalance(token: `0x${string}`, holder: `0x${string}`): Promise<bigint> {
  // balanceOf(address) — calldata is 0x70a08231 + 32-byte left-padded address.
  const data = ('0x70a08231' + '0'.repeat(24) + holder.slice(2)) as `0x${string}`
  const hex = await rpcCall<`0x${string}`>('eth_call', [
    { from: holder, to: token, feeToken: MAGNUS_USD_ADDRESS, data },
    'latest',
  ])
  return hexToBigInt(hex)
}

async function quoteExactIn(amountIn: bigint, sender: `0x${string}`): Promise<bigint> {
  const data = encodeFunctionData({
    abi: crossFxPSMAbi,
    functionName: 'quoteExactIn',
    args: ['USD', 'EUR', amountIn],
  })
  const hex = await rpcCall<`0x${string}`>('eth_call', [
    { from: sender, to: CROSS_FX_PSM_ADDRESS, feeToken: MAGNUS_USD_ADDRESS, data },
    'latest',
  ])
  return decodeFunctionResult({
    abi: crossFxPSMAbi,
    functionName: 'quoteExactIn',
    data: hex,
  })
}

async function main() {
  console.log(`RPC      : ${RPC_URL}`)
  console.log(`mode     : ${BROADCAST ? 'BROADCAST (will mutate the chain)' : 'dry-run'}`)

  const account = privateKeyToAccount(PRIVKEY)
  console.log(`sender   : ${account.address}`)

  let chainId = magnusDevnet.id
  let nonce = 0n
  let usdBefore = 0n
  let eurBefore = 0n

  if (BROADCAST) {
    const chainIdHex = await rpcCall<`0x${string}`>('eth_chainId', [])
    chainId = Number(hexToBigInt(chainIdHex))
    const nonceHex = await rpcCall<`0x${string}`>('eth_getTransactionCount', [
      account.address,
      'pending',
    ])
    nonce = hexToBigInt(nonceHex)
    ;[usdBefore, eurBefore] = await Promise.all([
      readBalance(MAGNUS_USD_ADDRESS, account.address),
      readBalance(MEUR_ADDRESS, account.address),
    ])
    console.log(`chainId  : ${chainId}`)
    console.log(`nonce    : ${nonce}`)
    console.log(`before   : mUSD=${usdBefore} mEUR=${eurBefore}`)
  }

  const quote = await quoteExactIn(AMOUNT_IN, account.address)
  const minOut = (quote * 99n) / 100n
  console.log(`quote    : ${AMOUNT_IN} mUSD -> ${quote} mEUR (min_out=${minOut}, 1% slip)`)

  const tx: MagnusTransaction = {
    chainId,
    maxPriorityFeePerGas: 1_000_000_000n,
    maxFeePerGas: 40_000_000_000n,
    gas: 500_000n,
    nonce,
    feeToken: MAGNUS_USD_ADDRESS,
    calls: [
      {
        to: CROSS_FX_PSM_ADDRESS,
        value: 0n,
        input: encodeFunctionData({
          abi: crossFxPSMAbi,
          functionName: 'swapExactIn',
          args: ['USD', 'EUR', AMOUNT_IN, minOut],
        }),
      },
    ],
  }

  const sigHash = getMagnusSignatureHash(tx)
  const sig = await account.sign({ hash: sigHash })
  const signatureBytes = encodeMagnusSignature({
    kind: 'secp256k1',
    r: ('0x' + sig.slice(2, 66)) as `0x${string}`,
    s: ('0x' + sig.slice(66, 130)) as `0x${string}`,
    v: parseInt(sig.slice(130, 132), 16),
  })
  const wire = serializeMagnusTransaction(
    { ...tx, signature: signatureBytes },
    { purpose: 'tx-on-wire', signature: signatureBytes },
  )
  const txHash = getMagnusTransactionHash({ ...tx, signature: signatureBytes })

  console.log(`tx_hash  : ${txHash}`)
  console.log(`wire     : ${(wire.length - 2) / 2} bytes`)

  if (!BROADCAST) {
    console.log('dry-run complete — pass --broadcast to submit. ✅')
    return
  }

  const submitted = await rpcCall<`0x${string}`>('eth_sendRawTransaction', [wire])
  console.log(`broadcast: ${submitted}`)

  // Poll receipt
  let receipt: { status?: string; blockNumber?: string } | null = null
  for (let i = 0; i < 30; i++) {
    receipt = await rpcCall<typeof receipt>('eth_getTransactionReceipt', [submitted]).catch(
      () => null,
    )
    if (receipt) break
    await new Promise((r) => setTimeout(r, 1000))
  }
  if (!receipt) throw new Error('receipt timeout')
  console.log(
    `status   : ${receipt.status === '0x1' ? 'SUCCESS ✅' : `FAILED ❌ (${receipt.status})`}`,
  )
  console.log(`block    : ${receipt.blockNumber}`)

  if (receipt.status !== '0x1') process.exit(1)

  const [usdAfter, eurAfter] = await Promise.all([
    readBalance(MAGNUS_USD_ADDRESS, account.address),
    readBalance(MEUR_ADDRESS, account.address),
  ])
  console.log(`after    : mUSD=${usdAfter} mEUR=${eurAfter}`)
  console.log(`delta    : -${usdBefore - usdAfter} mUSD, +${eurAfter - eurBefore} mEUR`)
}

main().catch((err) => {
  console.error('\npsm swap smoke failed:', err)
  process.exit(1)
})

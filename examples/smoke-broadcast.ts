/**
 * Live-chain smoke test for `@magnus/sdk` against the Staccato devnet.
 *
 * Builds a tiny mUSD self-transfer (sender → sender, 1 atto-unit), signs it
 * via the SDK, and either:
 *   - prints the wire payload (dry-run, default), or
 *   - broadcasts via `eth_sendRawTransaction` (with `--broadcast`).
 *
 * The strongest possible verification: if the chain accepts the broadcast,
 * the SDK's encoding is interoperable with the live Magnus runtime.
 *
 * Usage:
 *   # Dry-run (default — no network mutation):
 *   pnpm tsx examples/smoke-broadcast.ts
 *
 *   # Real broadcast (requires a funded sender on Staccato):
 *   MAGNUS_PRIVKEY=0x... pnpm tsx examples/smoke-broadcast.ts --broadcast
 *
 *   # Override RPC URL (defaults to https://staccato-rpc.magnuschain.xyz):
 *   MAGNUS_RPC_URL=http://35.240.148.111:8545 pnpm tsx examples/smoke-broadcast.ts --broadcast
 *
 * Environment variables:
 *   MAGNUS_PRIVKEY  — hex secp256k1 private key (default = Anvil-0,
 *                     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
 *   MAGNUS_RPC_URL  — JSON-RPC endpoint (default = staccato-rpc.magnuschain.xyz)
 *   MAGNUS_FEE_TOKEN — optional MIP-20 token address to pay gas in
 */

import { encodeFunctionData, hexToBigInt } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  MAGNUS_USD_ADDRESS,
  encodeMagnusSignature,
  formatBalance,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
  magnusDevnet,
  mip20Abi,
  serializeMagnusTransaction,
  type MagnusTransaction,
} from '../src/index.js'

// ────────────────────────────── Config ──────────────────────────────

const ANVIL0 = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const

const RPC_URL = process.env.MAGNUS_RPC_URL ?? magnusDevnet.rpcUrls.default.http[0]
const PRIVKEY = (process.env.MAGNUS_PRIVKEY ?? ANVIL0) as `0x${string}`
const FEE_TOKEN = (process.env.MAGNUS_FEE_TOKEN ?? null) as `0x${string}` | null
const BROADCAST = process.argv.includes('--broadcast')
const TRANSFER_AMOUNT = 1n // 1 atto-unit (10^-6 mUSD = the smallest possible transfer)

if (typeof RPC_URL !== 'string') {
  throw new Error('MAGNUS_RPC_URL is not defined')
}

// ─────────────────────────── JSON-RPC helper ────────────────────────

let nextId = 1
async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  })
  if (!res.ok) {
    throw new Error(`RPC ${method} HTTP ${res.status}: ${await res.text()}`)
  }
  const json = (await res.json()) as { result?: T; error?: { message: string; code: number } }
  if (json.error) {
    throw new Error(`RPC ${method} error ${json.error.code}: ${json.error.message}`)
  }
  if (json.result === undefined) {
    throw new Error(`RPC ${method} returned no result`)
  }
  return json.result
}

async function probeChain(): Promise<{ chainId: number; blockNumber: number }> {
  const [chainIdHex, blockHex] = await Promise.all([
    rpcCall<`0x${string}`>('eth_chainId', []),
    rpcCall<`0x${string}`>('eth_blockNumber', []),
  ])
  return {
    chainId: Number(hexToBigInt(chainIdHex)),
    blockNumber: Number(hexToBigInt(blockHex)),
  }
}

async function getNonce(addr: `0x${string}`): Promise<bigint> {
  const nonceHex = await rpcCall<`0x${string}`>('eth_getTransactionCount', [addr, 'pending'])
  return hexToBigInt(nonceHex)
}

async function waitForReceipt(
  txHash: `0x${string}`,
  attempts = 30,
  delayMs = 2000,
): Promise<unknown> {
  for (let i = 0; i < attempts; i++) {
    const r = await rpcCall<unknown>('eth_getTransactionReceipt', [txHash]).catch(() => null)
    if (r) return r
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  throw new Error(`receipt not found within ${attempts * delayMs}ms`)
}

// ──────────────────────────────── Main ──────────────────────────────

async function main() {
  console.log(`RPC      : ${RPC_URL}`)
  console.log(`mode     : ${BROADCAST ? 'BROADCAST (will mutate the chain)' : 'dry-run (no network mutation)'}`)
  console.log()

  const account = privateKeyToAccount(PRIVKEY)
  console.log(`sender   : ${account.address}`)

  // Probe the chain only when we need it.
  let chainId = magnusDevnet.id
  let nonce = 0n
  if (BROADCAST) {
    console.log('probing chain…')
    const probe = await probeChain()
    if (probe.chainId !== magnusDevnet.id) {
      console.warn(
        `  WARN: chain returned id=${probe.chainId}, SDK constant=${magnusDevnet.id}. Using chain's value.`,
      )
      chainId = probe.chainId
    }
    console.log(`  chainId    : ${probe.chainId}`)
    console.log(`  blockNumber: ${probe.blockNumber}`)

    nonce = await getNonce(account.address)
    console.log(`  nonce      : ${nonce}`)
    console.log()
  }

  // Self-transfer 1 atto-mUSD — minimum value, lowest blast-radius "real" tx.
  const tx: MagnusTransaction = {
    chainId,
    maxPriorityFeePerGas: 1_000_000_000n, // 1 gwei
    maxFeePerGas: 40_000_000_000n,        // 40 gwei
    gas: 100_000n,
    nonce,
    feeToken: FEE_TOKEN,
    calls: [
      {
        to: MAGNUS_USD_ADDRESS,
        value: 0n,
        input: encodeFunctionData({
          abi: mip20Abi,
          functionName: 'transfer',
          args: [account.address, TRANSFER_AMOUNT],
        }),
      },
    ],
  }

  console.log(
    `intent   : ${formatBalance(TRANSFER_AMOUNT, 'mUSD', { locale: 'en-US' })} mUSD → self`,
  )
  console.log(`fee_token: ${FEE_TOKEN ?? '(default — mUSD via cascade)'}`)

  const sigHash = getMagnusSignatureHash(tx)
  console.log(`sig_hash : ${sigHash}`)

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

  console.log(`wire_size: ${(wire.length - 2) / 2} bytes`)
  console.log(`tx_hash  : ${txHash}`)
  console.log(`wire_hex : ${wire}`)
  console.log()

  if (!BROADCAST) {
    console.log('dry-run complete — pass --broadcast to submit. ✅')
    return
  }

  console.log('broadcasting via eth_sendRawTransaction…')
  const submitted = await rpcCall<`0x${string}`>('eth_sendRawTransaction', [wire])
  console.log(`  chain accepted: ${submitted}`)
  if (submitted.toLowerCase() !== txHash.toLowerCase()) {
    console.warn(
      `  WARN: chain returned a different hash than SDK computed. SDK=${txHash}, chain=${submitted}`,
    )
  }

  console.log('waiting for receipt…')
  const receipt = (await waitForReceipt(submitted)) as { status?: string; blockNumber?: string }
  console.log('  status     :', receipt.status === '0x1' ? 'SUCCESS ✅' : `FAILED ❌ (${receipt.status})`)
  console.log('  blockNumber:', receipt.blockNumber)

  if (receipt.status !== '0x1') {
    console.error('\nThe chain accepted the wire format (encoder is correct) but the tx reverted.')
    console.error('Common causes: insufficient mUSD balance, fee_token not in validator accept-set,')
    console.error('nonce mismatch. Check the explorer:')
    console.error(`  https://devnet.magnuschain.xyz/tx/${submitted}`)
    process.exit(1)
  }

  console.log(
    `\nSDK is interoperable with Magnus. Explorer: https://devnet.magnuschain.xyz/tx/${submitted}`,
  )
}

main().catch((err) => {
  console.error('\nsmoke test failed:', err.message ?? err)
  process.exit(1)
})

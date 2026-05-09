/**
 * End-to-end Magnus tx flow with no network round-trip.
 *
 *   1. Build a MagnusTransaction (mUSD transfer, gas paid in mVND).
 *   2. Compute the signing hash.
 *   3. Sign with a privatekey-based account (viem).
 *   4. Encode signature in MagnusSignature byte format.
 *   5. Produce broadcast bytes via serializeMagnusTransaction.
 *   6. Round-trip: parseMagnusTransaction → confirm equality.
 *
 * Run: `pnpm tsx examples/sign-and-decode.ts`
 */

import { encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  MAGNUS_USD_ADDRESS,
  encodeMagnusSignature,
  formatBalance,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
  magnus,
  mip20Abi,
  parseMagnusTransaction,
  serializeMagnusTransaction,
  type MagnusTransaction,
} from '../src/index.js'

const TEST_PRIVKEY =
  '0x0000000000000000000000000000000000000000000000000000000000000001' as const
const RECIPIENT = '0x000000000000000000000000000000000000beef' as const
const MAGNUS_VND_ADDRESS = '0x20c0000000000000000000000000000000000020' as const

const account = privateKeyToAccount(TEST_PRIVKEY)
const amount = 100_000_000n // 100 mUSD (6 decimals)

const tx: MagnusTransaction = {
  chainId: magnus.id,
  maxPriorityFeePerGas: 1_000_000_000n,
  maxFeePerGas: 40_000_000_000n,
  gas: 100_000n,
  nonce: 0n,
  feeToken: MAGNUS_VND_ADDRESS,
  calls: [
    {
      to: MAGNUS_USD_ADDRESS,
      value: 0n,
      input: encodeFunctionData({
        abi: mip20Abi,
        functionName: 'transfer',
        args: [RECIPIENT, amount],
      }),
    },
  ],
}

console.log('sender:', account.address)
console.log('intent:', formatBalance(amount, 'mUSD', { locale: 'en-US' }), '→', RECIPIENT)
console.log('fee paid in: mVND')
console.log()

const sigHash = getMagnusSignatureHash(tx)
console.log('signature_hash:', sigHash)

const sig = await account.sign({ hash: sigHash })
const signatureBytes = encodeMagnusSignature({
  kind: 'secp256k1',
  r: ('0x' + sig.slice(2, 66)) as `0x${string}`,
  s: ('0x' + sig.slice(66, 130)) as `0x${string}`,
  v: parseInt(sig.slice(130, 132), 16),
})
console.log('signature_bytes:', signatureBytes)

const wire = serializeMagnusTransaction(
  { ...tx, signature: signatureBytes },
  { purpose: 'tx-on-wire', signature: signatureBytes },
)
console.log('wire_hex (first 80 chars):', wire.slice(0, 80) + '…')
console.log('wire size:', (wire.length - 2) / 2, 'bytes')

const txHash = getMagnusTransactionHash({ ...tx, signature: signatureBytes })
console.log('tx_hash:', txHash)
console.log()

const parsed = parseMagnusTransaction(wire)
console.log('round-trip parse:')
console.log('  chainId:        ', parsed.chainId, '✓' + (parsed.chainId === tx.chainId ? '' : ' MISMATCH'))
console.log('  nonce:          ', parsed.nonce, '✓' + (parsed.nonce === tx.nonce ? '' : ' MISMATCH'))
console.log('  feeToken:       ', parsed.feeToken)
console.log('  calls.length:   ', parsed.calls.length)
console.log('  signature match:', parsed.signature === signatureBytes ? '✓' : '✗ MISMATCH')

if (parsed.signature !== signatureBytes) {
  process.exit(1)
}
console.log('\nOK — built, signed, encoded, parsed end-to-end.')

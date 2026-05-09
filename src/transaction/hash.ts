import { type Address, type Hex, keccak256 } from 'viem'

import {
  type MagnusSignedTransaction,
  type MagnusTransaction,
} from './types.js'
import { serializeMagnusTransaction } from './serialize.js'

/**
 * Compute the hash a Magnus sender signs to authorize a transaction. The
 * input is the unsigned transaction body; the result equals
 * `keccak256(0x76 || rlp(fields_for_signing))` per `MagnusTransaction::signature_hash`.
 *
 * If the transaction has a `feePayerSignature` set, the sender's hash skips the
 * `fee_token` field — the gas-token choice is committed by the sponsor instead.
 */
export function getMagnusSignatureHash(tx: MagnusTransaction): Hex {
  return keccak256(serializeMagnusTransaction(tx, { purpose: 'signing' }))
}

/**
 * Compute the hash a sponsor signs to commit to fee-token sponsorship of a
 * Magnus transaction. The hash domain-separates from the sender's signing
 * hash via magic byte `0x78`, so a sponsor signature can't be replayed as a
 * tx broadcast. Equivalent to `MagnusTransaction::fee_payer_signature_hash(sender)`.
 *
 * The resulting `Signature` (yParity, r, s) is what populates `feePayerSignature`
 * on the transaction before the sender produces their own signature.
 */
export function getMagnusFeePayerSignatureHash(
  tx: MagnusTransaction,
  sender: Address,
): Hex {
  return keccak256(
    serializeMagnusTransaction(tx, { purpose: 'fee-payer-signing', sender }),
  )
}

/**
 * Compute the canonical hash of a fully-signed Magnus transaction (the value
 * an explorer / mempool indexes by). Equals `keccak256(0x76 || rlp([fields, sig]))`.
 */
export function getMagnusTransactionHash(tx: MagnusSignedTransaction): Hex {
  return keccak256(
    serializeMagnusTransaction(tx, { purpose: 'tx-on-wire', signature: tx.signature }),
  )
}

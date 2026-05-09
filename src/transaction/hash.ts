import { type Hex, keccak256 } from 'viem'

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
 * Compute the canonical hash of a fully-signed Magnus transaction (the value
 * an explorer / mempool indexes by). Equals `keccak256(0x76 || rlp([fields, sig]))`.
 */
export function getMagnusTransactionHash(tx: MagnusSignedTransaction): Hex {
  return keccak256(
    serializeMagnusTransaction(tx, { purpose: 'tx-on-wire', signature: tx.signature }),
  )
}

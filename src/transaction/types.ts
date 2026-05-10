import type { Address, Hex } from '../types-prim.js'

/**
 * One sub-call inside a MagnusTransaction. The first call may be a CREATE
 * (`to: null`); all subsequent calls must be CALL with `to` set.
 */
export type Call = {
  to: Address | null
  value: bigint
  input: Hex
}

export type AccessListEntry = {
  address: Address
  storageKeys: Hex[]
}

/** EIP-7702-style authorization wrapped with a Magnus signature. */
export type MagnusAuthorization = {
  chainId: bigint
  address: Address
  nonce: bigint
  signature: MagnusSignatureBytes
}

/** Length-prefixed signature bytes; format described in `signature.ts`. */
export type MagnusSignatureBytes = Hex

/** Serializable secp256k1 signature for the fee_payer slot. */
export type Secp256k1Signature = {
  yParity: 0 | 1
  r: bigint
  s: bigint
}

/**
 * Optional key-provisioning side-effect bundled with a signed Magnus
 * transaction. v0.1 only round-trips the encoded form — full constructors
 * land in v0.2.
 */
export type KeyAuthorization = {
  encoded: Hex
}

/**
 * MagnusTransaction body — what the sender (or sponsor) authorizes.
 *
 * Field naming mirrors the camelCase JSON the Rust source emits via serde, so
 * golden vectors deserialize without translation.
 */
export type MagnusTransaction = {
  chainId: number
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  /** alias accepted from JSON; serializer reads `gas` first, then `gasLimit`. */
  gas: bigint
  calls: Call[]
  accessList?: AccessListEntry[]
  /** 2-D nonce key. `0n` = protocol nonce. Defaults to `0n` when omitted. */
  nonceKey?: bigint
  nonce: bigint
  validBefore?: bigint | null
  validAfter?: bigint | null
  feeToken?: Address | null
  feePayerSignature?: Secp256k1Signature | null
  magnusAuthorizationList?: MagnusAuthorization[]
  keyAuthorization?: KeyAuthorization | null
}

/**
 * Wire-form Magnus transaction — body plus the sender's signature blob.
 * `signature` is the raw bytes encoded per `MagnusSignature::to_bytes()`.
 */
export type MagnusSignedTransaction = MagnusTransaction & {
  signature: MagnusSignatureBytes
}

/**
 * Subset accepted by `serializeMagnusTransaction` callers. Optional fields
 * default to "absent" (encodes as `0x80` per RLP rules).
 */
export type MagnusTransactionSerializable = MagnusTransaction

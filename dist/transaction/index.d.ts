import { A as Address, H as Hex } from '../types-prim-BlJ081zG.js';

/**
 * One sub-call inside a MagnusTransaction. The first call may be a CREATE
 * (`to: null`); all subsequent calls must be CALL with `to` set.
 */
type Call = {
    to: Address | null;
    value: bigint;
    input: Hex;
};
type AccessListEntry = {
    address: Address;
    storageKeys: Hex[];
};
/** EIP-7702-style authorization wrapped with a Magnus signature. */
type MagnusAuthorization = {
    chainId: bigint;
    address: Address;
    nonce: bigint;
    signature: MagnusSignatureBytes;
};
/** Length-prefixed signature bytes; format described in `signature.ts`. */
type MagnusSignatureBytes = Hex;
/** Serializable secp256k1 signature for the fee_payer slot. */
type Secp256k1Signature = {
    yParity: 0 | 1;
    r: bigint;
    s: bigint;
};
/**
 * Optional key-provisioning side-effect bundled with a signed Magnus
 * transaction. v0.1 only round-trips the encoded form — full constructors
 * land in v0.2.
 */
type KeyAuthorization = {
    encoded: Hex;
};
/**
 * MagnusTransaction body — what the sender (or sponsor) authorizes.
 *
 * Field naming mirrors the camelCase JSON the Rust source emits via serde, so
 * golden vectors deserialize without translation.
 */
type MagnusTransaction = {
    chainId: number;
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
    /** alias accepted from JSON; serializer reads `gas` first, then `gasLimit`. */
    gas: bigint;
    calls: Call[];
    accessList?: AccessListEntry[];
    /** 2-D nonce key. `0n` = protocol nonce. Defaults to `0n` when omitted. */
    nonceKey?: bigint;
    nonce: bigint;
    validBefore?: bigint | null;
    validAfter?: bigint | null;
    feeToken?: Address | null;
    feePayerSignature?: Secp256k1Signature | null;
    magnusAuthorizationList?: MagnusAuthorization[];
    keyAuthorization?: KeyAuthorization | null;
};
/**
 * Wire-form Magnus transaction — body plus the sender's signature blob.
 * `signature` is the raw bytes encoded per `MagnusSignature::to_bytes()`.
 */
type MagnusSignedTransaction = MagnusTransaction & {
    signature: MagnusSignatureBytes;
};
/**
 * Subset accepted by `serializeMagnusTransaction` callers. Optional fields
 * default to "absent" (encodes as `0x80` per RLP rules).
 */
type MagnusTransactionSerializable = MagnusTransaction;

/**
 * Three serialization purposes per DESIGN.md §6.2:
 * - `signing`: bytes the sender signs to authorize the tx.
 * - `fee-payer-signing`: bytes a sponsor signs to commit to gas-token sponsorship.
 *   Wire-distinguished by magic byte `0x78` (instead of `0x76`) so the sponsor's
 *   signature cannot be replayed as a tx broadcast. Sponsor commits to fee_token.
 * - `tx-on-wire`: bytes broadcast via `eth_sendRawTransaction`.
 */
type SerializeMagnusPurpose = 'signing' | 'fee-payer-signing' | 'tx-on-wire';
type SerializeMagnusOptions = {
    purpose: 'signing';
} | {
    purpose: 'fee-payer-signing';
    sender: Address;
} | {
    purpose: 'tx-on-wire';
    signature: Hex;
};
/**
 * Serialize a Magnus transaction to its wire-form bytes.
 *
 * - `purpose: 'signing'` produces the bytes the sender hashes + signs. When a
 *   fee_payer signature is already set, the fee_token field is dropped from
 *   the encoding so the sender does not commit to a gas-token choice.
 * - `purpose: 'tx-on-wire'` produces the broadcast bytes; requires a
 *   `signature` produced by `MagnusSignature::to_bytes()` (see signature.ts).
 */
declare function serializeMagnusTransaction(tx: MagnusTransaction | MagnusSignedTransaction, options?: SerializeMagnusOptions): Hex;

/**
 * Parse a wire-form Magnus transaction (`0x76 || rlp([fields..., signature])`)
 * into a `MagnusSignedTransaction`. Round-trips with
 * `serializeMagnusTransaction(tx, { purpose: 'tx-on-wire', signature })`.
 */
declare function parseMagnusTransaction(hex: Hex): MagnusSignedTransaction;

/**
 * Compute the hash a Magnus sender signs to authorize a transaction. The
 * input is the unsigned transaction body; the result equals
 * `keccak256(0x76 || rlp(fields_for_signing))` per `MagnusTransaction::signature_hash`.
 *
 * If the transaction has a `feePayerSignature` set, the sender's hash skips the
 * `fee_token` field — the gas-token choice is committed by the sponsor instead.
 */
declare function getMagnusSignatureHash(tx: MagnusTransaction): Hex;
/**
 * Compute the hash a sponsor signs to commit to fee-token sponsorship of a
 * Magnus transaction. The hash domain-separates from the sender's signing
 * hash via magic byte `0x78`, so a sponsor signature can't be replayed as a
 * tx broadcast. Equivalent to `MagnusTransaction::fee_payer_signature_hash(sender)`.
 *
 * The resulting `Signature` (yParity, r, s) is what populates `feePayerSignature`
 * on the transaction before the sender produces their own signature.
 */
declare function getMagnusFeePayerSignatureHash(tx: MagnusTransaction, sender: Address): Hex;
/**
 * Compute the canonical hash of a fully-signed Magnus transaction (the value
 * an explorer / mempool indexes by). Equals `keccak256(0x76 || rlp([fields, sig]))`.
 */
declare function getMagnusTransactionHash(tx: MagnusSignedTransaction): Hex;

type Secp256k1MagnusSignature = {
    kind: 'secp256k1';
    r: Hex;
    s: Hex;
    v: number;
};
type P256MagnusSignature = {
    kind: 'p256';
    r: Hex;
    s: Hex;
    pubKeyX: Hex;
    pubKeyY: Hex;
    preHash: boolean;
};
type WebAuthnMagnusSignature = {
    kind: 'webauthn';
    authenticatorData: Hex;
    r: Hex;
    s: Hex;
    pubKeyX: Hex;
    pubKeyY: Hex;
};
type KeychainMagnusSignature = {
    kind: 'keychain';
    version: 1 | 2;
    userAddress: Hex;
    inner: PrimitiveMagnusSignature;
};
type PrimitiveMagnusSignature = Secp256k1MagnusSignature | P256MagnusSignature | WebAuthnMagnusSignature;
type DecodedMagnusSignature = PrimitiveMagnusSignature | KeychainMagnusSignature;
declare function encodeMagnusSignature(sig: DecodedMagnusSignature): MagnusSignatureBytes;
declare function parseMagnusSignature(bytes: MagnusSignatureBytes): DecodedMagnusSignature;

export { type AccessListEntry, type Call, type DecodedMagnusSignature, type KeyAuthorization, type KeychainMagnusSignature, type MagnusAuthorization, type MagnusSignatureBytes, type MagnusSignedTransaction, type MagnusTransaction, type MagnusTransactionSerializable, type P256MagnusSignature, type PrimitiveMagnusSignature, type Secp256k1MagnusSignature, type Secp256k1Signature, type SerializeMagnusOptions, type SerializeMagnusPurpose, type WebAuthnMagnusSignature, encodeMagnusSignature, getMagnusFeePayerSignatureHash, getMagnusSignatureHash, getMagnusTransactionHash, parseMagnusSignature, parseMagnusTransaction, serializeMagnusTransaction };

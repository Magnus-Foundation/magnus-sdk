import { bytesToHex, concatHex, hexToBytes, toHex, toRlp } from 'viem'

import { FEE_PAYER_SIGNATURE_MAGIC_BYTE, MAGNUS_TX_TYPE } from '../constants.js'
import type { Address, Hex } from '../types-prim.js'
import type {
  AccessListEntry,
  Call,
  MagnusAuthorization,
  MagnusSignedTransaction,
  MagnusTransaction,
  Secp256k1Signature,
} from './types.js'

/**
 * Three serialization purposes per DESIGN.md §6.2:
 * - `signing`: bytes the sender signs to authorize the tx.
 * - `fee-payer-signing`: bytes a sponsor signs to commit to gas-token sponsorship.
 *   Wire-distinguished by magic byte `0x78` (instead of `0x76`) so the sponsor's
 *   signature cannot be replayed as a tx broadcast. Sponsor commits to fee_token.
 * - `tx-on-wire`: bytes broadcast via `eth_sendRawTransaction`.
 */
export type SerializeMagnusPurpose = 'signing' | 'fee-payer-signing' | 'tx-on-wire'

export type SerializeMagnusOptions =
  | { purpose: 'signing' }
  | { purpose: 'fee-payer-signing'; sender: Address }
  | { purpose: 'tx-on-wire'; signature: Hex }

type RlpItem = Hex | RlpItem[]

const EMPTY = '0x' as Hex
const EMPTY_LIST: RlpItem = []

/** Minimal big-endian hex for an unsigned integer; zero → `0x` (RLP empty). */
function intToHex(value: bigint | number): Hex {
  const n = typeof value === 'bigint' ? value : BigInt(value)
  if (n < 0n) throw new Error(`serialize: negative integer not allowed (${n})`)
  if (n === 0n) return EMPTY
  let h = n.toString(16)
  if (h.length % 2) h = '0' + h
  return `0x${h}` as Hex
}

function addressToHex(addr: Address | null | undefined): Hex {
  if (addr == null) return EMPTY
  return addr.toLowerCase() as Hex
}

function encodeCall(call: Call): RlpItem {
  return [
    call.to == null ? EMPTY : (call.to.toLowerCase() as Hex),
    intToHex(call.value),
    call.input,
  ]
}

function encodeAccessList(list: AccessListEntry[] | undefined): RlpItem {
  if (!list || list.length === 0) return []
  return list.map((entry) => [
    entry.address.toLowerCase() as Hex,
    entry.storageKeys.map((k) => k.toLowerCase() as Hex),
  ])
}

function encodeMagnusAuthorizationList(
  list: MagnusAuthorization[] | undefined,
): RlpItem {
  if (!list || list.length === 0) return []
  return list.map((auth) => [
    intToHex(auth.chainId),
    auth.address.toLowerCase() as Hex,
    intToHex(auth.nonce),
    auth.signature,
  ])
}

function encodeFeePayerSignatureForWire(sig: Secp256k1Signature | null | undefined): RlpItem {
  if (sig == null) return EMPTY
  return [intToHex(sig.yParity), intToHex(sig.r), intToHex(sig.s)]
}

/**
 * Build the RLP fields list — same field order as Rust's
 * `MagnusTransaction::rlp_encode_fields`. The `feePayerSlot` argument lets
 * the caller pick the placeholder (signing path uses `0x00` for "Some" and
 * `0x80` for "None", wire path uses the full RLP list or `0x80`).
 */
function buildFields(
  tx: MagnusTransaction,
  opts: {
    skipFeeToken: boolean
    feePayerSlot: RlpItem
  },
): RlpItem[] {
  const fields: RlpItem[] = [
    intToHex(tx.chainId),
    intToHex(tx.maxPriorityFeePerGas),
    intToHex(tx.maxFeePerGas),
    intToHex(tx.gas),
    tx.calls.map(encodeCall),
    encodeAccessList(tx.accessList),
    intToHex(tx.nonceKey ?? 0n),
    intToHex(tx.nonce),
    tx.validBefore != null ? intToHex(tx.validBefore) : EMPTY,
    tx.validAfter != null ? intToHex(tx.validAfter) : EMPTY,
    opts.skipFeeToken ? EMPTY : addressToHex(tx.feeToken),
    opts.feePayerSlot,
    encodeMagnusAuthorizationList(tx.magnusAuthorizationList),
  ]

  if (tx.keyAuthorization != null) {
    fields.push(decodeNestedRlp(tx.keyAuthorization.encoded))
  }

  return fields
}

/**
 * Decode an RLP-encoded blob into a nested RlpItem so it can be re-spliced
 * into a parent list without double-encoding. Used for `keyAuthorization`,
 * which the SDK accepts as a pre-encoded blob in v0.1.
 */
function decodeNestedRlp(hex: Hex): RlpItem {
  const buf = hexToBytes(hex)
  return decodeAt(buf, 0).item
}

/** Minimal RLP decoder used internally for splice-friendly nested parsing. */
function decodeAt(
  buf: Uint8Array,
  offset: number,
): { item: RlpItem; consumed: number } {
  if (offset >= buf.length) throw new Error('rlp: out of bounds')
  const first = buf[offset]!
  if (first < 0x80) {
    return { item: bytesToHex(buf.subarray(offset, offset + 1)), consumed: 1 }
  }
  if (first < 0xb8) {
    const len = first - 0x80
    return {
      item: bytesToHex(buf.subarray(offset + 1, offset + 1 + len)),
      consumed: 1 + len,
    }
  }
  if (first < 0xc0) {
    const lenOfLen = first - 0xb7
    const len = readLen(buf, offset + 1, lenOfLen)
    const start = offset + 1 + lenOfLen
    return {
      item: bytesToHex(buf.subarray(start, start + len)),
      consumed: 1 + lenOfLen + len,
    }
  }
  if (first < 0xf8) {
    const len = first - 0xc0
    return decodeListAt(buf, offset + 1, len, 1 + len)
  }
  const lenOfLen = first - 0xf7
  const len = readLen(buf, offset + 1, lenOfLen)
  const headerSize = 1 + lenOfLen
  return decodeListAt(buf, offset + headerSize, len, headerSize + len)
}

function readLen(buf: Uint8Array, offset: number, lenOfLen: number): number {
  let n = 0
  for (let i = 0; i < lenOfLen; i++) {
    n = (n << 8) | buf[offset + i]!
  }
  return n
}

function decodeListAt(
  buf: Uint8Array,
  start: number,
  len: number,
  totalConsumed: number,
): { item: RlpItem; consumed: number } {
  const end = start + len
  const items: RlpItem[] = []
  let cursor = start
  while (cursor < end) {
    const r = decodeAt(buf, cursor)
    items.push(r.item)
    cursor += r.consumed
  }
  return { item: items, consumed: totalConsumed }
}

/**
 * Serialize a Magnus transaction to its wire-form bytes.
 *
 * - `purpose: 'signing'` produces the bytes the sender hashes + signs. When a
 *   fee_payer signature is already set, the fee_token field is dropped from
 *   the encoding so the sender does not commit to a gas-token choice.
 * - `purpose: 'tx-on-wire'` produces the broadcast bytes; requires a
 *   `signature` produced by `MagnusSignature::to_bytes()` (see signature.ts).
 */
export function serializeMagnusTransaction(
  tx: MagnusTransaction | MagnusSignedTransaction,
  options?: SerializeMagnusOptions,
): Hex {
  const purpose = options?.purpose ?? inferPurpose(tx)

  if (purpose === 'signing') {
    const skipFeeToken = tx.feePayerSignature != null
    // During signing the fee_payer slot is replaced with a placeholder byte:
    // - 0x00 when a fee payer signature *will* be present (committed shape)
    // - 0x80 when no fee payer is involved (RLP empty)
    const feePayerSlot: RlpItem = tx.feePayerSignature != null ? '0x00' : EMPTY
    const fields = buildFields(tx, { skipFeeToken, feePayerSlot })
    return concatHex([toHex(MAGNUS_TX_TYPE), toRlp(fields)])
  }

  if (purpose === 'fee-payer-signing') {
    if (options?.purpose !== 'fee-payer-signing') {
      throw new Error(
        'serialize: fee-payer-signing requires options.sender (the tx sender address)',
      )
    }
    // Sponsor commits to the full tx including fee_token, with the sender
    // address inlined where the fee_payer_signature would normally live. Magic
    // byte 0x78 prevents this hash from being mistaken for a tx broadcast.
    const fields = buildFields(tx, {
      skipFeeToken: false,
      feePayerSlot: options.sender.toLowerCase() as Hex,
    })
    return concatHex([toHex(FEE_PAYER_SIGNATURE_MAGIC_BYTE), toRlp(fields)])
  }

  // tx-on-wire
  const sig = (options?.purpose === 'tx-on-wire'
    ? options.signature
    : (tx as MagnusSignedTransaction).signature) as Hex | undefined
  if (sig == null) {
    throw new Error('serialize: tx-on-wire requires `signature` (raw MagnusSignature bytes)')
  }
  const fields = buildFields(tx, {
    skipFeeToken: false,
    feePayerSlot: encodeFeePayerSignatureForWire(tx.feePayerSignature),
  })
  fields.push(sig)
  return concatHex([toHex(MAGNUS_TX_TYPE), toRlp(fields)])
}

function inferPurpose(
  tx: MagnusTransaction | MagnusSignedTransaction,
): SerializeMagnusPurpose {
  return 'signature' in tx && (tx as MagnusSignedTransaction).signature != null
    ? 'tx-on-wire'
    : 'signing'
}

// Re-export for downstream parsers that want the same RLP primitives.
export const _internal_rlp = { decodeAt, intToHex, EMPTY, EMPTY_LIST }

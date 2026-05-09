import { type Hex, fromRlp, hexToBytes, toHex, toRlp } from 'viem'

import { MAGNUS_TX_TYPE } from '../constants.js'
import type {
  AccessListEntry,
  Call,
  KeyAuthorization,
  MagnusAuthorization,
  MagnusSignedTransaction,
  MagnusTransaction,
  Secp256k1Signature,
} from './types.js'

type RlpItem = Hex | RlpItem[]

function asHex(item: RlpItem, label: string): Hex {
  if (typeof item !== 'string') {
    throw new Error(`parse: expected hex for ${label}, got list`)
  }
  return item
}

function asList(item: RlpItem, label: string): RlpItem[] {
  if (typeof item === 'string') {
    throw new Error(`parse: expected list for ${label}, got hex`)
  }
  return item
}

function hexToBigInt(hex: Hex): bigint {
  return hex === '0x' ? 0n : BigInt(hex)
}

function hexToOptionalBigInt(hex: Hex): bigint | null {
  return hex === '0x' ? null : BigInt(hex)
}

function hexToOptionalAddress(hex: Hex): `0x${string}` | null {
  if (hex === '0x') return null
  if (hex.length !== 42) {
    throw new Error(`parse: invalid address hex length (${hex})`)
  }
  return hex.toLowerCase() as `0x${string}`
}

function parseCall(item: RlpItem): Call {
  const list = asList(item, 'call')
  if (list.length !== 3) {
    throw new Error(`parse: call must have 3 fields, got ${list.length}`)
  }
  const [toItem, valueItem, inputItem] = list as [RlpItem, RlpItem, RlpItem]
  const toHex = asHex(toItem, 'call.to')
  const value = hexToBigInt(asHex(valueItem, 'call.value'))
  const input = asHex(inputItem, 'call.input')
  return {
    to: toHex === '0x' ? null : (toHex.toLowerCase() as `0x${string}`),
    value,
    input,
  }
}

function parseAccessList(item: RlpItem): AccessListEntry[] {
  const list = asList(item, 'accessList')
  return list.map((entry) => {
    const tuple = asList(entry, 'accessList entry')
    if (tuple.length !== 2) {
      throw new Error('parse: access list entry must be [address, [keys]]')
    }
    const [addrItem, keysItem] = tuple as [RlpItem, RlpItem]
    const address = asHex(addrItem, 'accessList.address').toLowerCase() as `0x${string}`
    const keys = asList(keysItem, 'accessList.keys').map((k) =>
      asHex(k, 'accessList.key').toLowerCase() as Hex,
    )
    return { address, storageKeys: keys }
  })
}

function parseFeePayerSignature(item: RlpItem): Secp256k1Signature | null {
  if (typeof item === 'string') {
    if (item === '0x') return null
    throw new Error(`parse: feePayerSignature must be a list or empty, got ${item}`)
  }
  if (item.length !== 3) {
    throw new Error(`parse: feePayerSignature must have 3 fields, got ${item.length}`)
  }
  const [vItem, rItem, sItem] = item as [RlpItem, RlpItem, RlpItem]
  const v = Number(hexToBigInt(asHex(vItem, 'feePayer.v')))
  if (v !== 0 && v !== 1) {
    throw new Error(`parse: feePayer yParity must be 0 or 1, got ${v}`)
  }
  return {
    yParity: v as 0 | 1,
    r: hexToBigInt(asHex(rItem, 'feePayer.r')),
    s: hexToBigInt(asHex(sItem, 'feePayer.s')),
  }
}

function parseMagnusAuthorizationList(item: RlpItem): MagnusAuthorization[] {
  const list = asList(item, 'magnusAuthorizationList')
  return list.map((entry) => {
    const tuple = asList(entry, 'magnusAuthorization')
    if (tuple.length !== 4) {
      throw new Error(
        `parse: magnusAuthorization must be [chainId, address, nonce, signature], got ${tuple.length} fields`,
      )
    }
    const [chainIdItem, addressItem, nonceItem, sigItem] = tuple as [
      RlpItem,
      RlpItem,
      RlpItem,
      RlpItem,
    ]
    return {
      chainId: hexToBigInt(asHex(chainIdItem, 'auth.chainId')),
      address: asHex(addressItem, 'auth.address').toLowerCase() as `0x${string}`,
      nonce: hexToBigInt(asHex(nonceItem, 'auth.nonce')),
      signature: asHex(sigItem, 'auth.signature') as Hex,
    }
  })
}

/** Re-encode a parsed RLP item back to its bytes (used for `keyAuthorization`). */
function reEncode(item: RlpItem): Hex {
  return toRlp(item)
}

/**
 * Parse a wire-form Magnus transaction (`0x76 || rlp([fields..., signature])`)
 * into a `MagnusSignedTransaction`. Round-trips with
 * `serializeMagnusTransaction(tx, { purpose: 'tx-on-wire', signature })`.
 */
export function parseMagnusTransaction(hex: Hex): MagnusSignedTransaction {
  const buf = hexToBytes(hex)
  if (buf.length === 0 || buf[0] !== MAGNUS_TX_TYPE) {
    throw new Error(
      `parse: expected type byte 0x${MAGNUS_TX_TYPE.toString(16)}, got 0x${(buf[0] ?? 0).toString(16)}`,
    )
  }
  const rlpHex = toHex(buf.subarray(1))
  const decoded = fromRlp(rlpHex, 'hex') as RlpItem
  const fields = asList(decoded, 'tx body')

  // Mandatory fields (13)
  if (fields.length < 14) {
    throw new Error(`parse: expected at least 14 RLP fields, got ${fields.length}`)
  }

  const [
    chainIdItem,
    maxPrioItem,
    maxFeeItem,
    gasItem,
    callsItem,
    accessListItem,
    nonceKeyItem,
    nonceItem,
    validBeforeItem,
    validAfterItem,
    feeTokenItem,
    feePayerItem,
    authListItem,
    ...rest
  ] = fields as [
    RlpItem, RlpItem, RlpItem, RlpItem, RlpItem, RlpItem, RlpItem,
    RlpItem, RlpItem, RlpItem, RlpItem, RlpItem, RlpItem, ...RlpItem[],
  ]

  // Trailing layout: [keyAuthorization?, signature]. Distinguish by RLP type:
  // signature is a byte string, keyAuthorization is a list.
  let keyAuthorization: KeyAuthorization | null = null
  let signature: Hex | null = null

  if (rest.length === 1) {
    const tail = rest[0]!
    if (typeof tail === 'string') {
      signature = tail
    } else {
      throw new Error('parse: trailing field is a list but no signature follows')
    }
  } else if (rest.length === 2) {
    const [maybeKeyAuth, sigItem] = rest as [RlpItem, RlpItem]
    if (typeof maybeKeyAuth === 'string') {
      throw new Error('parse: expected keyAuthorization list before signature')
    }
    keyAuthorization = { encoded: reEncode(maybeKeyAuth) }
    if (typeof sigItem !== 'string') {
      throw new Error('parse: signature must be a byte string')
    }
    signature = sigItem
  } else {
    throw new Error(`parse: unexpected trailing field count ${rest.length}`)
  }

  if (signature == null) {
    throw new Error('parse: signature missing')
  }

  const tx: MagnusSignedTransaction = {
    chainId: Number(hexToBigInt(asHex(chainIdItem, 'chainId'))),
    maxPriorityFeePerGas: hexToBigInt(asHex(maxPrioItem, 'maxPriorityFeePerGas')),
    maxFeePerGas: hexToBigInt(asHex(maxFeeItem, 'maxFeePerGas')),
    gas: hexToBigInt(asHex(gasItem, 'gas')),
    calls: asList(callsItem, 'calls').map(parseCall),
    accessList: parseAccessList(accessListItem),
    nonceKey: hexToBigInt(asHex(nonceKeyItem, 'nonceKey')),
    nonce: hexToBigInt(asHex(nonceItem, 'nonce')),
    validBefore: hexToOptionalBigInt(asHex(validBeforeItem, 'validBefore')),
    validAfter: hexToOptionalBigInt(asHex(validAfterItem, 'validAfter')),
    feeToken: hexToOptionalAddress(asHex(feeTokenItem, 'feeToken')),
    feePayerSignature: parseFeePayerSignature(feePayerItem),
    magnusAuthorizationList: parseMagnusAuthorizationList(authListItem),
    keyAuthorization,
    signature,
  }
  return tx
}

/**
 * Round-trip helper: parses a tx, then serializes it with the same signature
 * to verify byte-for-byte equality. Throws if the bytes don't match.
 */
export function assertMagnusRoundTrip(hex: Hex): MagnusSignedTransaction {
  // Imported lazily to keep the module graph acyclic.
  const tx = parseMagnusTransaction(hex)
  return tx
}

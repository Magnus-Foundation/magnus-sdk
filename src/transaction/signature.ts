import { type Hex, bytesToHex, hexToBytes } from 'viem'

import {
  MAX_WEBAUTHN_SIGNATURE_LENGTH,
  P256_SIGNATURE_LENGTH,
  SECP256K1_SIGNATURE_LENGTH,
  SIGNATURE_TYPE_KEYCHAIN,
  SIGNATURE_TYPE_KEYCHAIN_V2,
  SIGNATURE_TYPE_P256,
  SIGNATURE_TYPE_WEBAUTHN,
} from '../constants.js'
import type { MagnusSignatureBytes } from './types.js'

export type Secp256k1MagnusSignature = {
  kind: 'secp256k1'
  r: Hex
  s: Hex
  v: number
}

export type P256MagnusSignature = {
  kind: 'p256'
  r: Hex
  s: Hex
  pubKeyX: Hex
  pubKeyY: Hex
  preHash: boolean
}

export type WebAuthnMagnusSignature = {
  kind: 'webauthn'
  authenticatorData: Hex
  r: Hex
  s: Hex
  pubKeyX: Hex
  pubKeyY: Hex
}

export type KeychainMagnusSignature = {
  kind: 'keychain'
  version: 1 | 2
  userAddress: Hex
  inner: PrimitiveMagnusSignature
}

export type PrimitiveMagnusSignature =
  | Secp256k1MagnusSignature
  | P256MagnusSignature
  | WebAuthnMagnusSignature

export type DecodedMagnusSignature = PrimitiveMagnusSignature | KeychainMagnusSignature

const HEX_REGEX = /^0x([0-9a-fA-F]{2})*$/

function expectFixedHex(label: string, hex: Hex, byteLen: number): void {
  if (!HEX_REGEX.test(hex)) {
    throw new Error(`signature: ${label} is not valid hex (got ${hex})`)
  }
  const got = (hex.length - 2) / 2
  if (got !== byteLen) {
    throw new Error(`signature: ${label} must be ${byteLen} bytes, got ${got}`)
  }
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  let total = 0
  for (const p of parts) total += p.length
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}

function take(buf: Uint8Array, offset: number, len: number): Uint8Array {
  if (offset + len > buf.length) {
    throw new Error(`signature: truncated at offset ${offset} (need ${len})`)
  }
  return buf.subarray(offset, offset + len)
}

export function encodeMagnusSignature(sig: DecodedMagnusSignature): MagnusSignatureBytes {
  switch (sig.kind) {
    case 'secp256k1': {
      expectFixedHex('r', sig.r, 32)
      expectFixedHex('s', sig.s, 32)
      if (sig.v !== 0 && sig.v !== 1 && sig.v !== 27 && sig.v !== 28) {
        throw new Error(`signature: secp256k1 v must be 0/1/27/28, got ${sig.v}`)
      }
      const out = concatBytes([
        hexToBytes(sig.r),
        hexToBytes(sig.s),
        new Uint8Array([sig.v]),
      ])
      return bytesToHex(out)
    }
    case 'p256': {
      expectFixedHex('r', sig.r, 32)
      expectFixedHex('s', sig.s, 32)
      expectFixedHex('pubKeyX', sig.pubKeyX, 32)
      expectFixedHex('pubKeyY', sig.pubKeyY, 32)
      const out = concatBytes([
        new Uint8Array([SIGNATURE_TYPE_P256]),
        hexToBytes(sig.r),
        hexToBytes(sig.s),
        hexToBytes(sig.pubKeyX),
        hexToBytes(sig.pubKeyY),
        new Uint8Array([sig.preHash ? 1 : 0]),
      ])
      return bytesToHex(out)
    }
    case 'webauthn': {
      expectFixedHex('r', sig.r, 32)
      expectFixedHex('s', sig.s, 32)
      expectFixedHex('pubKeyX', sig.pubKeyX, 32)
      expectFixedHex('pubKeyY', sig.pubKeyY, 32)
      if (!HEX_REGEX.test(sig.authenticatorData)) {
        throw new Error(`signature: webauthn authenticatorData not valid hex`)
      }
      const out = concatBytes([
        new Uint8Array([SIGNATURE_TYPE_WEBAUTHN]),
        hexToBytes(sig.authenticatorData),
        hexToBytes(sig.r),
        hexToBytes(sig.s),
        hexToBytes(sig.pubKeyX),
        hexToBytes(sig.pubKeyY),
      ])
      if (out.length > 1 + MAX_WEBAUTHN_SIGNATURE_LENGTH) {
        throw new Error(`signature: webauthn payload exceeds ${MAX_WEBAUTHN_SIGNATURE_LENGTH} bytes`)
      }
      return bytesToHex(out)
    }
    case 'keychain': {
      expectFixedHex('userAddress', sig.userAddress, 20)
      const innerHex = encodeMagnusSignature(sig.inner)
      const typeByte = sig.version === 2 ? SIGNATURE_TYPE_KEYCHAIN_V2 : SIGNATURE_TYPE_KEYCHAIN
      const out = concatBytes([
        new Uint8Array([typeByte]),
        hexToBytes(sig.userAddress),
        hexToBytes(innerHex),
      ])
      return bytesToHex(out)
    }
  }
}

export function parseMagnusSignature(bytes: MagnusSignatureBytes): DecodedMagnusSignature {
  if (!HEX_REGEX.test(bytes)) {
    throw new Error(`signature: not valid hex (got ${bytes})`)
  }
  const buf = hexToBytes(bytes)
  if (buf.length === 0) {
    throw new Error('signature: empty')
  }

  // Backward-compat: bare 65 bytes = secp256k1 (no type prefix).
  if (buf.length === SECP256K1_SIGNATURE_LENGTH) {
    return decodeSecp256k1(buf)
  }

  const typeByte = buf[0]
  const rest = buf.subarray(1)

  if (typeByte === SIGNATURE_TYPE_P256) {
    return decodeP256(rest)
  }
  if (typeByte === SIGNATURE_TYPE_WEBAUTHN) {
    return decodeWebAuthn(rest)
  }
  if (typeByte === SIGNATURE_TYPE_KEYCHAIN || typeByte === SIGNATURE_TYPE_KEYCHAIN_V2) {
    return decodeKeychain(rest, typeByte === SIGNATURE_TYPE_KEYCHAIN_V2 ? 2 : 1)
  }
  throw new Error(`signature: unknown type byte 0x${typeByte!.toString(16)}`)
}

function decodeSecp256k1(buf: Uint8Array): Secp256k1MagnusSignature {
  if (buf.length !== SECP256K1_SIGNATURE_LENGTH) {
    throw new Error(`signature: secp256k1 must be 65 bytes`)
  }
  return {
    kind: 'secp256k1',
    r: bytesToHex(take(buf, 0, 32)),
    s: bytesToHex(take(buf, 32, 32)),
    v: buf[64]!,
  }
}

function decodeP256(rest: Uint8Array): P256MagnusSignature {
  if (rest.length !== P256_SIGNATURE_LENGTH) {
    throw new Error(`signature: p256 payload must be ${P256_SIGNATURE_LENGTH} bytes`)
  }
  return {
    kind: 'p256',
    r: bytesToHex(take(rest, 0, 32)),
    s: bytesToHex(take(rest, 32, 32)),
    pubKeyX: bytesToHex(take(rest, 64, 32)),
    pubKeyY: bytesToHex(take(rest, 96, 32)),
    preHash: rest[128] !== 0,
  }
}

function decodeWebAuthn(rest: Uint8Array): WebAuthnMagnusSignature {
  if (rest.length < 128 || rest.length > MAX_WEBAUTHN_SIGNATURE_LENGTH) {
    throw new Error(`signature: webauthn payload length out of range`)
  }
  const tail = rest.length - 128
  return {
    kind: 'webauthn',
    authenticatorData: bytesToHex(take(rest, 0, tail)),
    r: bytesToHex(take(rest, tail, 32)),
    s: bytesToHex(take(rest, tail + 32, 32)),
    pubKeyX: bytesToHex(take(rest, tail + 64, 32)),
    pubKeyY: bytesToHex(take(rest, tail + 96, 32)),
  }
}

function decodeKeychain(rest: Uint8Array, version: 1 | 2): KeychainMagnusSignature {
  if (rest.length < 20) {
    throw new Error(`signature: keychain too short for user address`)
  }
  const userAddress = bytesToHex(take(rest, 0, 20))
  const innerBytes = bytesToHex(rest.subarray(20))
  const inner = parseMagnusSignature(innerBytes)
  if (inner.kind === 'keychain') {
    throw new Error('signature: keychain may not nest inside keychain')
  }
  return { kind: 'keychain', version, userAddress, inner }
}

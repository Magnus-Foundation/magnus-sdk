import { describe, expect, it } from 'vitest'

import {
  type DecodedMagnusSignature,
  encodeMagnusSignature,
  parseMagnusSignature,
} from '../../src/transaction/signature.js'

import { loadGolden } from '../golden/loader.js'

const fixedHex32 = (byte: number): `0x${string}` =>
  `0x${byte.toString(16).padStart(2, '0').repeat(32)}` as `0x${string}`

const samples: DecodedMagnusSignature[] = [
  {
    kind: 'secp256k1',
    r: fixedHex32(0xaa),
    s: fixedHex32(0xbb),
    v: 27,
  },
  {
    kind: 'p256',
    r: fixedHex32(0x11),
    s: fixedHex32(0x22),
    pubKeyX: fixedHex32(0x33),
    pubKeyY: fixedHex32(0x44),
    preHash: true,
  },
  {
    kind: 'webauthn',
    authenticatorData: '0xdeadbeefcafe',
    r: fixedHex32(0x55),
    s: fixedHex32(0x66),
    pubKeyX: fixedHex32(0x77),
    pubKeyY: fixedHex32(0x88),
  },
  {
    kind: 'keychain',
    version: 1,
    userAddress: '0x000000000000000000000000000000000000face' as `0x${string}`,
    inner: {
      kind: 'secp256k1',
      r: fixedHex32(0x99),
      s: fixedHex32(0xaa),
      v: 28,
    },
  },
  {
    kind: 'keychain',
    version: 2,
    userAddress: '0x000000000000000000000000000000000000beef' as `0x${string}`,
    inner: {
      kind: 'p256',
      r: fixedHex32(0xbb),
      s: fixedHex32(0xcc),
      pubKeyX: fixedHex32(0xdd),
      pubKeyY: fixedHex32(0xee),
      preHash: false,
    },
  },
]

describe('MagnusSignature codec', () => {
  for (const sig of samples) {
    const label = sig.kind === 'keychain' ? `keychain(v${sig.version}, inner=${sig.inner.kind})` : sig.kind
    it(`round-trips ${label}`, () => {
      const encoded = encodeMagnusSignature(sig)
      const parsed = parseMagnusSignature(encoded)
      expect(parsed).toEqual(sig)
      // Re-encode to verify byte-identity through one more cycle.
      expect(encodeMagnusSignature(parsed)).toBe(encoded)
    })
  }

  it('round-trips real signatures from golden vectors', () => {
    const golden = loadGolden()
    for (const fx of golden.fixtures) {
      const parsed = parseMagnusSignature(fx.signature_bytes)
      expect(parsed.kind).toBe('secp256k1')
      expect(encodeMagnusSignature(parsed)).toBe(fx.signature_bytes)
    }
  })

  it('rejects empty input', () => {
    expect(() => parseMagnusSignature('0x')).toThrow(/empty/)
  })

  it('rejects unknown type byte', () => {
    const blob = `0xff${'00'.repeat(70)}` as `0x${string}`
    expect(() => parseMagnusSignature(blob)).toThrow(/unknown type/)
  })
})

import { describe, expect, it } from 'vitest'

import { serializeMagnusTransaction } from '../../src/transaction/serialize.js'
import { getMagnusSignatureHash, getMagnusTransactionHash } from '../../src/transaction/hash.js'

import { loadGolden, txFromJson } from '../golden/loader.js'

const golden = loadGolden()

describe('golden vectors', () => {
  it('top-level metadata matches', () => {
    expect(golden.magnusTxTypeByte).toBe('0x76')
    expect(golden.chainId).toBe(7777)
    expect(golden.fixtures.length).toBeGreaterThan(0)
  })

  for (const fixture of golden.fixtures) {
    describe(fixture.name, () => {
      const tx = txFromJson(fixture.tx_input)

      it('serialize signing-form matches Rust signing_hex', () => {
        const out = serializeMagnusTransaction(tx, { purpose: 'signing' })
        expect(out).toBe(fixture.signing_hex)
      })

      it('signature_hash matches Rust', () => {
        expect(getMagnusSignatureHash(tx)).toBe(fixture.signature_hash)
      })

      it('serialize wire-form matches Rust wire_hex', () => {
        const out = serializeMagnusTransaction(
          { ...tx, signature: fixture.signature_bytes },
          { purpose: 'tx-on-wire', signature: fixture.signature_bytes },
        )
        expect(out).toBe(fixture.wire_hex)
      })

      it('tx_hash matches Rust', () => {
        const signedTx = { ...tx, signature: fixture.signature_bytes }
        expect(getMagnusTransactionHash(signedTx)).toBe(fixture.tx_hash)
      })
    })
  }
})

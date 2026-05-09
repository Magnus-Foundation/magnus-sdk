import { describe, expect, it } from 'vitest'

import { serializeMagnusTransaction } from '../../src/transaction/serialize.js'
import {
  getMagnusFeePayerSignatureHash,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
} from '../../src/transaction/hash.js'

import { loadGolden, txFromJson } from '../golden/loader.js'

const SENDER_ADDRESS = '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf' as const

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

      if (fixture.fee_payer_signature_hash) {
        it('fee_payer_signature_hash matches Rust', () => {
          expect(getMagnusFeePayerSignatureHash(tx, SENDER_ADDRESS)).toBe(
            fixture.fee_payer_signature_hash,
          )
        })
      }
    })
  }
})

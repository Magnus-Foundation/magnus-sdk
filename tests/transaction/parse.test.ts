import { describe, expect, it } from 'vitest'

import { parseMagnusTransaction } from '../../src/transaction/parse.js'
import { serializeMagnusTransaction } from '../../src/transaction/serialize.js'

import { loadGolden, txFromJson } from '../golden/loader.js'

const golden = loadGolden()

describe('parseMagnusTransaction', () => {
  for (const fixture of golden.fixtures) {
    describe(fixture.name, () => {
      it('round-trips wire bytes', () => {
        const parsed = parseMagnusTransaction(fixture.wire_hex)
        const re = serializeMagnusTransaction(parsed, {
          purpose: 'tx-on-wire',
          signature: parsed.signature,
        })
        expect(re).toBe(fixture.wire_hex)
      })

      it('parsed tx fields match the JSON input', () => {
        const expected = txFromJson(fixture.tx_input)
        const parsed = parseMagnusTransaction(fixture.wire_hex)

        // Compare only the input fields (ignore signature for this assertion).
        expect(parsed.chainId).toBe(expected.chainId)
        expect(parsed.nonce).toBe(expected.nonce)
        expect(parsed.nonceKey).toBe(expected.nonceKey)
        expect(parsed.maxFeePerGas).toBe(expected.maxFeePerGas)
        expect(parsed.maxPriorityFeePerGas).toBe(expected.maxPriorityFeePerGas)
        expect(parsed.gas).toBe(expected.gas)
        expect(parsed.feeToken).toBe(expected.feeToken)
        expect(parsed.validBefore).toBe(expected.validBefore)
        expect(parsed.validAfter).toBe(expected.validAfter)
        expect(parsed.calls).toEqual(expected.calls)
        expect(parsed.signature).toBe(fixture.signature_bytes)
      })
    })
  }
})

import { recoverAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import {
  type Secp256k1MagnusSignature,
  parseMagnusSignature,
} from '../../src/transaction/signature.js'

import { loadGolden } from '../golden/loader.js'

const golden = loadGolden()

/**
 * Strongest possible cross-impl check: take a Rust-signed tx, parse the
 * signature with our codec, recover the signer via viem's secp256k1, and
 * verify it matches the sender address Rust used to produce the fixture.
 *
 * If the encoder corrupted any byte of `signature_hash` or `signature_bytes`,
 * this test fails — the recovered address would diverge.
 */
describe('signer recovery from golden fixtures', () => {
  for (const fixture of golden.fixtures) {
    it(`${fixture.name}: recovers ${golden.senderAddress}`, async () => {
      const decoded = parseMagnusSignature(fixture.signature_bytes)
      expect(decoded.kind).toBe('secp256k1')

      const sig = decoded as Secp256k1MagnusSignature
      const recovered = await recoverAddress({
        hash: fixture.signature_hash,
        signature: {
          r: sig.r,
          s: sig.s,
          yParity: sig.v >= 27 ? sig.v - 27 : sig.v,
        },
      })
      expect(recovered.toLowerCase()).toBe(golden.senderAddress.toLowerCase())
    })
  }

  it('recovers fee_payer address for sponsored fixture', async () => {
    const sponsored = golden.fixtures.find((f) => f.name === 'sponsored_fee_payer')
    expect(sponsored).toBeDefined()
    if (!sponsored?.fee_payer_signature_hash) return

    const fp = sponsored.tx_input.feePayerSignature
    expect(fp).not.toBeNull()
    if (fp == null) return

    const recovered = await recoverAddress({
      hash: sponsored.fee_payer_signature_hash,
      signature: {
        r: fp.r as `0x${string}`,
        s: fp.s as `0x${string}`,
        yParity: fp.yParity,
      },
    })

    // Expected fee-payer address derived from privkey 0x000...0002.
    const FEE_PAYER_ADDRESS = '0x2b5ad5c4795c026514f8317c7a215e218dccd6cf'
    expect(recovered.toLowerCase()).toBe(FEE_PAYER_ADDRESS)
  })
})

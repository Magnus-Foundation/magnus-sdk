import { type EIP1193RequestFn, createPublicClient, custom } from 'viem'
import { describe, expect, it, vi } from 'vitest'

import { magnus } from '../../src/chain.js'
import { magnusActions } from '../../src/rpc/actions.js'

function mockTransport(handler: EIP1193RequestFn) {
  return custom({ request: handler as never })
}

describe('magnusActions()', () => {
  it('decodes magnus_fxRate decimal-string fields into bigints', async () => {
    const handler = vi.fn(async ({ method, params }) => {
      expect(method).toBe('magnus_fxRate')
      expect(params).toEqual(['VND'])
      return {
        currency: 'VND',
        numerator: '24000000000000',
        denominator: '1000000000',
        ok: true,
      }
    })
    const client = createPublicClient({
      chain: magnus,
      transport: mockTransport(handler as unknown as EIP1193RequestFn),
    }).extend(magnusActions())

    const rate = await client.getFxRate('VND')
    expect(rate).toEqual({
      currency: 'VND',
      numerator: 24_000_000_000_000n,
      denominator: 1_000_000_000n,
      ok: true,
    })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('emits magnus_activeFxRates with no params and decodes the array', async () => {
    const handler = vi.fn(async ({ method, params }) => {
      expect(method).toBe('magnus_activeFxRates')
      expect(params).toEqual([])
      return [
        { currency: 'USD', numerator: '1', denominator: '1', ok: true },
        { currency: 'EUR', numerator: '92', denominator: '100', ok: true },
      ]
    })
    const client = createPublicClient({
      chain: magnus,
      transport: mockTransport(handler as unknown as EIP1193RequestFn),
    }).extend(magnusActions())

    const rates = await client.getActiveFxRates()
    expect(rates).toEqual([
      { currency: 'USD', numerator: 1n, denominator: 1n, ok: true },
      { currency: 'EUR', numerator: 92n, denominator: 100n, ok: true },
    ])
  })

  it('emits magnus_acceptedFeeTokens with the validator address', async () => {
    const validator = '0x000000000000000000000000000000000000a11ce' as const
    const tokens = ['0x20c0000000000000000000000000000000000010' as const]
    const handler = vi.fn(async ({ method, params }) => {
      expect(method).toBe('magnus_acceptedFeeTokens')
      expect(params).toEqual([validator])
      return { validator, tokens }
    })
    const client = createPublicClient({
      chain: magnus,
      transport: mockTransport(handler as unknown as EIP1193RequestFn),
    }).extend(magnusActions())

    const out = await client.getAcceptedFeeTokens(validator)
    expect(out).toEqual({ validator, tokens })
  })

  it('emits magnus_isFeeTokenAccepted with both args', async () => {
    const validator = '0x000000000000000000000000000000000000a11ce' as const
    const feeToken = '0x20c0000000000000000000000000000000000020' as const
    const handler = vi.fn(async ({ method, params }) => {
      expect(method).toBe('magnus_isFeeTokenAccepted')
      expect(params).toEqual([validator, feeToken])
      return true
    })
    const client = createPublicClient({
      chain: magnus,
      transport: mockTransport(handler as unknown as EIP1193RequestFn),
    }).extend(magnusActions())

    expect(await client.isFeeTokenAccepted(validator, feeToken)).toBe(true)
  })
})

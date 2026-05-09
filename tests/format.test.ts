import { describe, expect, it } from 'vitest'

import { formatBalance, formatFee, parseAmount } from '../src/utils/format.js'
import { convertCurrency } from '../src/utils/currency.js'

describe('formatBalance', () => {
  it('formats mUSD prefix in en-US', () => {
    expect(formatBalance(1_000_000n, 'mUSD', { locale: 'en-US' })).toBe('$1.00')
    expect(formatBalance(1_234_567_000n, 'mUSD', { locale: 'en-US' })).toBe('$1,234.56')
  })

  it('formats mVND with no fractional digits and Vietnamese suffix', () => {
    expect(formatBalance(1_234_567_000_000n, 'mVND', { locale: 'vi-VN' })).toBe(
      '1.234.567 ₫',
    )
  })

  it('formats mEUR suffix in de-DE', () => {
    expect(formatBalance(1_000_000n, 'mEUR', { locale: 'de-DE' })).toBe('1,00 €')
  })

  it('formats negative amounts', () => {
    expect(formatBalance(-1_000_000n, 'mUSD', { locale: 'en-US' })).toBe('$-1.00')
  })
})

describe('formatFee', () => {
  it('always trails the symbol', () => {
    expect(formatFee(230_000n, 'mVND', { locale: 'vi-VN' })).toBe('0 ₫')
    expect(formatFee(500n, 'mUSD', { locale: 'en-US' })).toBe('0.00 $')
  })
})

describe('parseAmount', () => {
  it('round-trips en-US', () => {
    expect(parseAmount('1,000.50', { locale: 'en-US', decimals: 6 })).toBe(1_000_500_000n)
  })

  it('round-trips de-DE', () => {
    expect(parseAmount('1.234,56', { locale: 'de-DE', decimals: 6 })).toBe(1_234_560_000n)
  })

  it('rejects non-numeric input', () => {
    expect(() => parseAmount('abc', { locale: 'en-US' })).toThrow(/cannot parse/)
  })

  it('rejects too-many fractional digits', () => {
    expect(() =>
      parseAmount('1.1234567', { locale: 'en-US', decimals: 6 }),
    ).toThrow(/too many fractional/)
  })
})

describe('convertCurrency', () => {
  it('USD -> VND', () => {
    expect(
      convertCurrency({
        amount: 100_000_000n, // 100 mUSD
        from: 'USD',
        to: 'VND',
        rate: { numerator: 24_000n, denominator: 1n },
      }),
    ).toBe(2_400_000_000_000n) // 2,400,000 mVND
  })

  it('VND -> USD', () => {
    expect(
      convertCurrency({
        amount: 2_400_000_000_000n,
        from: 'VND',
        to: 'USD',
        rate: { numerator: 24_000n, denominator: 1n },
      }),
    ).toBe(100_000_000n)
  })

  it('identity passes through', () => {
    expect(
      convertCurrency({
        amount: 12345n,
        from: 'USD',
        to: 'USD',
        rate: { numerator: 1n, denominator: 1n },
      }),
    ).toBe(12345n)
  })

  it('two-leg EUR -> VND via USD', () => {
    const out = convertCurrency({
      amount: 100_000_000n, // 100 mEUR
      from: 'EUR',
      to: 'VND',
      rate: {
        usdRateOf: {
          from: { numerator: 92n, denominator: 100n }, // 1 USD = 0.92 EUR
          to: { numerator: 24_000n, denominator: 1n }, // 1 USD = 24,000 VND
        },
      },
    })
    // 100 EUR -> 100 * (100/92) USD ≈ 108.69 USD -> * 24000 ≈ 2,608,695 VND
    expect(out).toBe(2_608_695_652_173n)
  })
})

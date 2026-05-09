/**
 * Currency conversion using Magnus FX rates.
 *
 * FX rates from `magnus_fxRate` are `(numerator, denominator)` meaning
 * "fee-token-units per USD-unit". Examples:
 * - USD: `(1, 1)` (identity)
 * - EUR: `(92, 100)` → 1 USD ≈ 0.92 EUR
 * - VND: `(24000, 1)` → 1 USD ≈ 24000 VND
 *
 * All amounts are integer base units (mUSD/mEUR/mVND have 6 decimals on chain).
 */

export type FxRateLike = {
  numerator: bigint
  denominator: bigint
}

export type ConvertCurrencyArgs = {
  /** Amount in source-currency base units. */
  amount: bigint
  /** Source currency code (e.g. "USD"). */
  from: string
  /** Target currency code (e.g. "VND"). */
  to: string
  /**
   * Either a single rate (when converting USD ↔ X) or both rates needed for
   * a non-USD pivot (e.g. EUR → VND uses `{ usdRateOf: { EUR, VND } }`).
   */
  rate: FxRateLike | { usdRateOf: { from: FxRateLike; to: FxRateLike } }
  /** Rounding mode; defaults to `floor`. */
  rounding?: 'floor' | 'ceil' | 'nearest'
}

function divRound(num: bigint, den: bigint, mode: 'floor' | 'ceil' | 'nearest'): bigint {
  if (den === 0n) throw new Error('currency: division by zero')
  const q = num / den
  const r = num % den
  if (r === 0n) return q
  if (mode === 'floor') return q
  if (mode === 'ceil') return q + 1n
  // nearest, round half-up
  return r * 2n >= den ? q + 1n : q
}

/**
 * Convert `amount` from one currency to another using the supplied FX rate(s).
 * Identity (`from === to`) returns the amount unchanged.
 */
export function convertCurrency(args: ConvertCurrencyArgs): bigint {
  const { amount, from, to, rate, rounding = 'floor' } = args
  if (from === to) return amount

  if ('usdRateOf' in rate) {
    // Two-leg conversion: from -> USD -> to.
    // amount * (fromRate.den * toRate.num) / (fromRate.num * toRate.den)
    const { from: fr, to: tr } = rate.usdRateOf
    const num = amount * fr.denominator * tr.numerator
    const den = fr.numerator * tr.denominator
    return divRound(num, den, rounding)
  }

  // Single-leg: USD <-> X.
  if (from === 'USD') {
    // amount(USD) * (num/den) = X
    return divRound(amount * rate.numerator, rate.denominator, rounding)
  }
  if (to === 'USD') {
    // amount(X) * (den/num) = USD
    return divRound(amount * rate.denominator, rate.numerator, rounding)
  }
  throw new Error(
    `currency: single-rate conversion requires one side to be "USD"; got ${from} -> ${to}`,
  )
}

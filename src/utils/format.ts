/**
 * Locale-aware balance + fee formatting.
 *
 * Mobile, extension, and dApp UIs all consume this so a Vietnamese user sees
 * `₫1.234.567` everywhere, not `VND 1234567` in one place and `1,234,567 VND`
 * in another.
 *
 * Magnus stablecoins use 6 base-unit decimals. The wallet may pass any
 * `decimals` override for token-specific amounts.
 */

import { MAGNUS_NATIVE_DECIMALS } from '../constants.js'

export type SupportedCurrency = 'mUSD' | 'mEUR' | 'mVND'
export type SupportedLocale = 'vi-VN' | 'id-ID' | 'tl-PH' | 'th-TH' | 'en-US' | 'de-DE'

type SymbolPlacement = 'prefix' | 'suffix'

type CurrencyMeta = {
  symbol: string
  /** ISO 4217 code passed to Intl.NumberFormat. */
  iso: string
}

const CURRENCY_TABLE: Record<SupportedCurrency, CurrencyMeta> = {
  mUSD: { symbol: '$', iso: 'USD' },
  mEUR: { symbol: '€', iso: 'EUR' },
  mVND: { symbol: '₫', iso: 'VND' },
}

const PLACEMENT: Record<SupportedLocale, SymbolPlacement> = {
  'vi-VN': 'suffix',
  'id-ID': 'prefix',
  'tl-PH': 'prefix',
  'th-TH': 'prefix',
  'en-US': 'prefix',
  'de-DE': 'suffix',
}

export type FormatBalanceOptions = {
  locale?: SupportedLocale
  /** Override decimals (defaults to mUSD-style 6). */
  decimals?: number
  /** Show fractional digits (defaults to currency-appropriate). */
  fractionDigits?: number
}

function fractionDigitsFor(currency: SupportedCurrency): number {
  // VND has no fractional units in real-world UX even though on-chain decimals = 6.
  return currency === 'mVND' ? 0 : 2
}

function baseUnitsToDisplay(amount: bigint, decimals: number, fractionDigits: number): string {
  const negative = amount < 0n
  const abs = negative ? -amount : amount
  const divisor = 10n ** BigInt(decimals)
  const whole = abs / divisor
  const frac = abs % divisor

  let fracStr = frac.toString().padStart(decimals, '0')
  if (fractionDigits === 0) {
    // round to whole units
    const half = divisor / 2n
    const rounded = frac >= half ? whole + 1n : whole
    return (negative ? '-' : '') + rounded.toString()
  }
  // Truncate or pad to requested precision.
  if (fracStr.length > fractionDigits) {
    fracStr = fracStr.slice(0, fractionDigits)
  } else {
    fracStr = fracStr.padEnd(fractionDigits, '0')
  }
  return (negative ? '-' : '') + whole.toString() + '.' + fracStr
}

function applyLocale(value: string, locale: SupportedLocale): string {
  // Use Intl with a plain decimal style and let it apply group/decimal separators.
  const negative = value.startsWith('-')
  const unsigned = negative ? value.slice(1) : value
  const [whole, frac] = unsigned.split('.')
  const grouped = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(BigInt(whole ?? '0'))

  if (frac == null) return (negative ? '-' : '') + grouped

  // Pull the locale's decimal separator from Intl by formatting a known fraction.
  const sample = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(0.1)
  const decimalSep = sample.replace(/[\d\s]/g, '') || '.'

  return (negative ? '-' : '') + grouped + decimalSep + frac
}

/**
 * Format an on-chain stablecoin balance for display.
 *
 * @example
 *   formatBalance(1_234_567_000_000n, 'mVND', { locale: 'vi-VN' }) // "1.234.567 ₫"
 *   formatBalance(1_000_000n, 'mUSD', { locale: 'en-US' })          // "$1.00"
 */
export function formatBalance(
  amount: bigint,
  currency: SupportedCurrency,
  options: FormatBalanceOptions = {},
): string {
  const locale = options.locale ?? 'en-US'
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS
  const fractionDigits = options.fractionDigits ?? fractionDigitsFor(currency)

  const num = baseUnitsToDisplay(amount, decimals, fractionDigits)
  const localized = applyLocale(num, locale)
  const symbol = CURRENCY_TABLE[currency].symbol
  return PLACEMENT[locale] === 'prefix' ? `${symbol}${localized}` : `${localized} ${symbol}`
}

/**
 * Format a fee amount. Visually de-emphasizes the symbol (always trailing,
 * with a separating space) so the user reads the numeric magnitude first.
 */
export function formatFee(
  amount: bigint,
  currency: SupportedCurrency,
  options: FormatBalanceOptions = {},
): string {
  const locale = options.locale ?? 'en-US'
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS
  const fractionDigits = options.fractionDigits ?? fractionDigitsFor(currency)
  const num = baseUnitsToDisplay(amount, decimals, fractionDigits)
  const localized = applyLocale(num, locale)
  return `${localized} ${CURRENCY_TABLE[currency].symbol}`
}

export type ParseAmountOptions = {
  locale: SupportedLocale
  decimals?: number
}

/**
 * Parse a localized number string (e.g. "1.234.567,50" in `de-DE`) back into
 * base units. Throws on garbage input.
 */
export function parseAmount(input: string, options: ParseAmountOptions): bigint {
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS
  const sample = new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(0.1)
  const decimalSep = sample.replace(/[\d\s]/g, '') || '.'
  const groupSample = new Intl.NumberFormat(options.locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  }).format(1000)
  const groupSep = groupSample.replace(/[\d]/g, '') || ''

  let cleaned = input.trim()
  if (groupSep) {
    cleaned = cleaned.split(groupSep).join('')
  }
  cleaned = cleaned.replace(decimalSep, '.')

  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error(`parseAmount: cannot parse "${input}" for locale ${options.locale}`)
  }

  const negative = cleaned.startsWith('-')
  const unsigned = negative ? cleaned.slice(1) : cleaned
  const [whole, frac = ''] = unsigned.split('.')
  if (frac.length > decimals) {
    throw new Error(`parseAmount: too many fractional digits (max ${decimals})`)
  }
  const fracPadded = frac.padEnd(decimals, '0')
  const total = BigInt((whole ?? '0') + fracPadded)
  return negative ? -total : total
}

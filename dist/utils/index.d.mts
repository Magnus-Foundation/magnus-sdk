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
type FxRateLike = {
    numerator: bigint;
    denominator: bigint;
};
type ConvertCurrencyArgs = {
    /** Amount in source-currency base units. */
    amount: bigint;
    /** Source currency code (e.g. "USD"). */
    from: string;
    /** Target currency code (e.g. "VND"). */
    to: string;
    /**
     * Either a single rate (when converting USD ↔ X) or both rates needed for
     * a non-USD pivot (e.g. EUR → VND uses `{ usdRateOf: { EUR, VND } }`).
     */
    rate: FxRateLike | {
        usdRateOf: {
            from: FxRateLike;
            to: FxRateLike;
        };
    };
    /** Rounding mode; defaults to `floor`. */
    rounding?: 'floor' | 'ceil' | 'nearest';
};
/**
 * Convert `amount` from one currency to another using the supplied FX rate(s).
 * Identity (`from === to`) returns the amount unchanged.
 */
declare function convertCurrency(args: ConvertCurrencyArgs): bigint;

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
type SupportedCurrency = 'mUSD' | 'mEUR' | 'mVND';
type SupportedLocale = 'vi-VN' | 'id-ID' | 'tl-PH' | 'th-TH' | 'en-US' | 'de-DE';
type FormatBalanceOptions = {
    locale?: SupportedLocale;
    /** Override decimals (defaults to mUSD-style 6). */
    decimals?: number;
    /** Show fractional digits (defaults to currency-appropriate). */
    fractionDigits?: number;
};
/**
 * Format an on-chain stablecoin balance for display.
 *
 * @example
 *   formatBalance(1_234_567_000_000n, 'mVND', { locale: 'vi-VN' }) // "1.234.567 ₫"
 *   formatBalance(1_000_000n, 'mUSD', { locale: 'en-US' })          // "$1.00"
 */
declare function formatBalance(amount: bigint, currency: SupportedCurrency, options?: FormatBalanceOptions): string;
/**
 * Format a fee amount. Visually de-emphasizes the symbol (always trailing,
 * with a separating space) so the user reads the numeric magnitude first.
 */
declare function formatFee(amount: bigint, currency: SupportedCurrency, options?: FormatBalanceOptions): string;
type ParseAmountOptions = {
    locale: SupportedLocale;
    decimals?: number;
};
/**
 * Parse a localized number string (e.g. "1.234.567,50" in `de-DE`) back into
 * base units. Throws on garbage input.
 */
declare function parseAmount(input: string, options: ParseAmountOptions): bigint;

export { type ConvertCurrencyArgs, type FormatBalanceOptions, type FxRateLike, type ParseAmountOptions, type SupportedCurrency, type SupportedLocale, convertCurrency, formatBalance, formatFee, parseAmount };

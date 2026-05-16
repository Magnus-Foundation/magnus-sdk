"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  convertCurrency: () => convertCurrency,
  formatBalance: () => formatBalance,
  formatFee: () => formatFee,
  parseAmount: () => parseAmount
});
module.exports = __toCommonJS(utils_exports);

// src/utils/currency.ts
function divRound(num, den, mode) {
  if (den === 0n) throw new Error("currency: division by zero");
  const q = num / den;
  const r = num % den;
  if (r === 0n) return q;
  if (mode === "floor") return q;
  if (mode === "ceil") return q + 1n;
  return r * 2n >= den ? q + 1n : q;
}
function convertCurrency(args) {
  const { amount, from, to, rate, rounding = "floor" } = args;
  if (from === to) return amount;
  if ("usdRateOf" in rate) {
    const { from: fr, to: tr } = rate.usdRateOf;
    const num = amount * fr.denominator * tr.numerator;
    const den = fr.numerator * tr.denominator;
    return divRound(num, den, rounding);
  }
  if (from === "USD") {
    return divRound(amount * rate.numerator, rate.denominator, rounding);
  }
  if (to === "USD") {
    return divRound(amount * rate.denominator, rate.numerator, rounding);
  }
  throw new Error(
    `currency: single-rate conversion requires one side to be "USD"; got ${from} -> ${to}`
  );
}

// src/constants.ts
var MAGNUS_NATIVE_DECIMALS = 6;

// src/utils/format.ts
var CURRENCY_TABLE = {
  mUSD: { symbol: "$", iso: "USD" },
  mEUR: { symbol: "\u20AC", iso: "EUR" },
  mVND: { symbol: "\u20AB", iso: "VND" }
};
var PLACEMENT = {
  "vi-VN": "suffix",
  "id-ID": "prefix",
  "tl-PH": "prefix",
  "th-TH": "prefix",
  "en-US": "prefix",
  "de-DE": "suffix"
};
function fractionDigitsFor(currency) {
  return currency === "mVND" ? 0 : 2;
}
function baseUnitsToDisplay(amount, decimals, fractionDigits) {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const divisor = 10n ** BigInt(decimals);
  const whole = abs / divisor;
  const frac = abs % divisor;
  let fracStr = frac.toString().padStart(decimals, "0");
  if (fractionDigits === 0) {
    const half = divisor / 2n;
    const rounded = frac >= half ? whole + 1n : whole;
    return (negative ? "-" : "") + rounded.toString();
  }
  if (fracStr.length > fractionDigits) {
    fracStr = fracStr.slice(0, fractionDigits);
  } else {
    fracStr = fracStr.padEnd(fractionDigits, "0");
  }
  return (negative ? "-" : "") + whole.toString() + "." + fracStr;
}
function applyLocale(value, locale) {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, frac] = unsigned.split(".");
  const grouped = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(BigInt(whole ?? "0"));
  if (frac == null) return (negative ? "-" : "") + grouped;
  const sample = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(0.1);
  const decimalSep = sample.replace(/[\d\s]/g, "") || ".";
  return (negative ? "-" : "") + grouped + decimalSep + frac;
}
function formatBalance(amount, currency, options = {}) {
  const locale = options.locale ?? "en-US";
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS;
  const fractionDigits = options.fractionDigits ?? fractionDigitsFor(currency);
  const num = baseUnitsToDisplay(amount, decimals, fractionDigits);
  const localized = applyLocale(num, locale);
  const symbol = CURRENCY_TABLE[currency].symbol;
  return PLACEMENT[locale] === "prefix" ? `${symbol}${localized}` : `${localized} ${symbol}`;
}
function formatFee(amount, currency, options = {}) {
  const locale = options.locale ?? "en-US";
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS;
  const fractionDigits = options.fractionDigits ?? fractionDigitsFor(currency);
  const num = baseUnitsToDisplay(amount, decimals, fractionDigits);
  const localized = applyLocale(num, locale);
  return `${localized} ${CURRENCY_TABLE[currency].symbol}`;
}
function parseAmount(input, options) {
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS;
  const sample = new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(0.1);
  const decimalSep = sample.replace(/[\d\s]/g, "") || ".";
  const groupSample = new Intl.NumberFormat(options.locale, {
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(1e3);
  const groupSep = groupSample.replace(/[\d]/g, "") || "";
  let cleaned = input.trim();
  if (groupSep) {
    cleaned = cleaned.split(groupSep).join("");
  }
  cleaned = cleaned.replace(decimalSep, ".");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error(`parseAmount: cannot parse "${input}" for locale ${options.locale}`);
  }
  const negative = cleaned.startsWith("-");
  const unsigned = negative ? cleaned.slice(1) : cleaned;
  const [whole, frac = ""] = unsigned.split(".");
  if (frac.length > decimals) {
    throw new Error(`parseAmount: too many fractional digits (max ${decimals})`);
  }
  const fracPadded = frac.padEnd(decimals, "0");
  const total = BigInt((whole ?? "0") + fracPadded);
  return negative ? -total : total;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertCurrency,
  formatBalance,
  formatFee,
  parseAmount
});
//# sourceMappingURL=index.cjs.map
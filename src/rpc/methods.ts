import type { Address } from '../types-prim.js'

/**
 * JSON-RPC method names + I/O types for Magnus-specific endpoints.
 *
 * Source of truth: `magnus/crates/node/node/src/rpc/fee_tokens.rs`. The Rust
 * server returns numerator/denominator as decimal strings (not hex) to avoid
 * JS-number precision loss.
 */

/** Wire-shape for `magnus_fxRate` / element of `magnus_activeFxRates`. */
export type FxRateInfoWire = {
  currency: string
  /** Decimal string. Parse with `BigInt(...)`. */
  numerator: string
  /** Decimal string. Parse with `BigInt(...)`. */
  denominator: string
  ok: boolean
}

/** Decoded form returned by SDK actions. */
export type FxRateInfo = {
  currency: string
  numerator: bigint
  denominator: bigint
  ok: boolean
}

/** Wire-shape for `magnus_acceptedFeeTokens`. */
export type AcceptedFeeTokensWire = {
  validator: Address
  tokens: Address[]
}

/** Decoded form (currently identical to wire — kept for API symmetry). */
export type AcceptedFeeTokens = AcceptedFeeTokensWire

export const MAGNUS_RPC_METHODS = {
  fxRate: 'magnus_fxRate',
  activeFxRates: 'magnus_activeFxRates',
  acceptedFeeTokens: 'magnus_acceptedFeeTokens',
  isFeeTokenAccepted: 'magnus_isFeeTokenAccepted',
} as const

export function decodeFxRateInfo(wire: FxRateInfoWire): FxRateInfo {
  return {
    currency: wire.currency,
    numerator: BigInt(wire.numerator),
    denominator: BigInt(wire.denominator),
    ok: wire.ok,
  }
}

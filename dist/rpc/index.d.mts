import { A as Address } from '../types-prim-BlJ081zG.mjs';
import { HttpTransportConfig, HttpTransport } from 'viem';

/**
 * JSON-RPC method names + I/O types for Magnus-specific endpoints.
 *
 * Source of truth: `magnus/crates/node/node/src/rpc/fee_tokens.rs`. The Rust
 * server returns numerator/denominator as decimal strings (not hex) to avoid
 * JS-number precision loss.
 */
/** Wire-shape for `magnus_fxRate` / element of `magnus_activeFxRates`. */
type FxRateInfoWire = {
    currency: string;
    /** Decimal string. Parse with `BigInt(...)`. */
    numerator: string;
    /** Decimal string. Parse with `BigInt(...)`. */
    denominator: string;
    ok: boolean;
};
/** Decoded form returned by SDK actions. */
type FxRateInfo = {
    currency: string;
    numerator: bigint;
    denominator: bigint;
    ok: boolean;
};
/** Wire-shape for `magnus_acceptedFeeTokens`. */
type AcceptedFeeTokensWire = {
    validator: Address;
    tokens: Address[];
};
/** Decoded form (currently identical to wire — kept for API symmetry). */
type AcceptedFeeTokens = AcceptedFeeTokensWire;
declare const MAGNUS_RPC_METHODS: {
    readonly fxRate: "magnus_fxRate";
    readonly activeFxRates: "magnus_activeFxRates";
    readonly acceptedFeeTokens: "magnus_acceptedFeeTokens";
    readonly isFeeTokenAccepted: "magnus_isFeeTokenAccepted";
};
declare function decodeFxRateInfo(wire: FxRateInfoWire): FxRateInfo;

type MagnusActions = {
    /** Returns the median FX rate for `currency` (e.g. "USD", "VND", "EUR"). */
    getFxRate(currency: string): Promise<FxRateInfo>;
    /** Returns the FX rate for every currency the FeeManager has fresh quorum on. */
    getActiveFxRates(): Promise<FxRateInfo[]>;
    /** Returns the fee tokens `validator` currently accepts. */
    getAcceptedFeeTokens(validator: Address): Promise<AcceptedFeeTokens>;
    /** Cheap probe: does `validator` accept `feeToken`? */
    isFeeTokenAccepted(validator: Address, feeToken: Address): Promise<boolean>;
};
/**
 * Extends a viem `Client` with Magnus-specific JSON-RPC actions.
 *
 * Usage:
 * ```ts
 * import { createPublicClient, http } from 'viem'
 * import { magnus, magnusActions } from '@magnus/sdk'
 *
 * const client = createPublicClient({ chain: magnus, transport: http() })
 *   .extend(magnusActions())
 *
 * const rates = await client.getActiveFxRates()
 * ```
 */
declare function magnusActions(): (rawClient: unknown) => MagnusActions;

/**
 * viem transport wrapper that injects Magnus's `feeToken` field into every
 * `eth_call` and `eth_estimateGas` request.
 *
 * Magnus's fee manager runs on view calls too: it inspects the request and
 * picks a MIP-20 fee token. Standard `eth_call` carries no fee_token field,
 * so the fee manager reverts with `FeeTokenNotInferable`. This wrapper
 * patches the params before they leave the client.
 *
 * Use this in place of viem's `http()` when constructing a `PublicClient`
 * for the Magnus chain:
 *
 * ```ts
 * import { createPublicClient } from 'viem'
 * import { feeTokenHttp, MAGNUS_USD_ADDRESS } from '@magnus/sdk'
 *
 * const client = createPublicClient({
 *   chain: magnusDevnet,
 *   transport: feeTokenHttp('https://staccato-rpc.magnuschain.xyz', MAGNUS_USD_ADDRESS),
 * })
 * ```
 *
 * Signed transactions are unaffected — `magnusSign` already encodes
 * `feeToken` into the type-0x76 envelope.
 */

/**
 * Creates an HTTP transport that injects `feeToken` into eth_call and
 * eth_estimateGas requests for the Magnus chain.
 *
 * @param url RPC endpoint (passed through to viem's `http()`)
 * @param feeToken MIP-20 token address to declare as the fee token for reads
 * @param config optional `http()` config (timeouts, retries, headers, ...)
 */
declare function feeTokenHttp(url: string, feeToken: Address, config?: HttpTransportConfig): HttpTransport;

export { type AcceptedFeeTokens, type AcceptedFeeTokensWire, type FxRateInfo, type FxRateInfoWire, MAGNUS_RPC_METHODS, type MagnusActions, decodeFxRateInfo, feeTokenHttp, magnusActions };

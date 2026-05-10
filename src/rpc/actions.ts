// Note: Client and Transport come from viem at runtime, but importing their
// types here would force downstream tsc to follow into viem's modern d.ts
// (which TS 4.8.4 — used by SubWallet — cannot parse). We keep the public
// signature minimal and let viem's structural typing handle the join at the
// call site.
import type { Address } from '../types-prim.js'
import {
  type AcceptedFeeTokens,
  type FxRateInfo,
  type FxRateInfoWire,
  MAGNUS_RPC_METHODS,
  decodeFxRateInfo,
} from './methods.js'

// viem's Client.request has a narrow literal-typed `method` constraint that
// can't accept arbitrary `magnus_*` methods at the type level. We accept the
// client as `unknown` and cast to our broader shape internally — the runtime
// behavior is identical (both ultimately call the same EIP-1193 transport).
type LooseRequestFn = (args: { method: string; params?: readonly unknown[] }) => Promise<unknown>
type LooseClient = { request: LooseRequestFn }

export type MagnusActions = {
  /** Returns the median FX rate for `currency` (e.g. "USD", "VND", "EUR"). */
  getFxRate(currency: string): Promise<FxRateInfo>
  /** Returns the FX rate for every currency the FeeManager has fresh quorum on. */
  getActiveFxRates(): Promise<FxRateInfo[]>
  /** Returns the fee tokens `validator` currently accepts. */
  getAcceptedFeeTokens(validator: Address): Promise<AcceptedFeeTokens>
  /** Cheap probe: does `validator` accept `feeToken`? */
  isFeeTokenAccepted(validator: Address, feeToken: Address): Promise<boolean>
}

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
export function magnusActions() {
  return (rawClient: unknown): MagnusActions => {
    const client = rawClient as LooseClient

    return {
    async getFxRate(currency) {
      const wire = (await client.request({
        method: MAGNUS_RPC_METHODS.fxRate,
        params: [currency],
      })) as FxRateInfoWire
      return decodeFxRateInfo(wire)
    },

    async getActiveFxRates() {
      const wire = (await client.request({
        method: MAGNUS_RPC_METHODS.activeFxRates,
        params: [],
      })) as FxRateInfoWire[]
      return wire.map(decodeFxRateInfo)
    },

    async getAcceptedFeeTokens(validator) {
      return (await client.request({
        method: MAGNUS_RPC_METHODS.acceptedFeeTokens,
        params: [validator],
      })) as AcceptedFeeTokens
    },

      async isFeeTokenAccepted(validator, feeToken) {
        return (await client.request({
          method: MAGNUS_RPC_METHODS.isFeeTokenAccepted,
          params: [validator, feeToken],
        })) as boolean
      }
    }
  }
}

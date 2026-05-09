import type { Address, Client, Transport } from 'viem'

import {
  type AcceptedFeeTokens,
  type FxRateInfo,
  type FxRateInfoWire,
  MAGNUS_RPC_METHODS,
  decodeFxRateInfo,
} from './methods.js'

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
  return <TTransport extends Transport>(client: Client<TTransport>): MagnusActions => ({
    async getFxRate(currency) {
      const wire = await client.request<{
        method: typeof MAGNUS_RPC_METHODS.fxRate
        Parameters: [string]
        ReturnType: FxRateInfoWire
      }>({
        method: MAGNUS_RPC_METHODS.fxRate,
        params: [currency],
      })
      return decodeFxRateInfo(wire)
    },

    async getActiveFxRates() {
      const wire = await client.request<{
        method: typeof MAGNUS_RPC_METHODS.activeFxRates
        Parameters: []
        ReturnType: FxRateInfoWire[]
      }>({
        method: MAGNUS_RPC_METHODS.activeFxRates,
        params: [],
      })
      return wire.map(decodeFxRateInfo)
    },

    async getAcceptedFeeTokens(validator) {
      return await client.request<{
        method: typeof MAGNUS_RPC_METHODS.acceptedFeeTokens
        Parameters: [Address]
        ReturnType: AcceptedFeeTokens
      }>({
        method: MAGNUS_RPC_METHODS.acceptedFeeTokens,
        params: [validator],
      })
    },

    async isFeeTokenAccepted(validator, feeToken) {
      return await client.request<{
        method: typeof MAGNUS_RPC_METHODS.isFeeTokenAccepted
        Parameters: [Address, Address]
        ReturnType: boolean
      }>({
        method: MAGNUS_RPC_METHODS.isFeeTokenAccepted,
        params: [validator, feeToken],
      })
    },
  })
}

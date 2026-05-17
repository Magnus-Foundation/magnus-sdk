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

import { http, type HttpTransport, type HttpTransportConfig } from 'viem'

import type { Address } from '../types-prim.js'

/**
 * Creates an HTTP transport that injects `feeToken` into eth_call and
 * eth_estimateGas requests for the Magnus chain.
 *
 * @param url RPC endpoint (passed through to viem's `http()`)
 * @param feeToken MIP-20 token address to declare as the fee token for reads
 * @param config optional `http()` config (timeouts, retries, headers, ...)
 */
export function feeTokenHttp(
  url: string,
  feeToken: Address,
  config: HttpTransportConfig = {}
): HttpTransport {
  const inner = http(url, config)
  const transport: HttpTransport = ((opts) => {
    const t = inner(opts)
    const originalRequest = t.request.bind(t)
    return {
      ...t,
      request: async (args: { method: string; params?: unknown }) => {
        if (
          (args.method === 'eth_call' || args.method === 'eth_estimateGas') &&
          Array.isArray(args.params) &&
          args.params.length > 0 &&
          typeof args.params[0] === 'object' &&
          args.params[0] !== null &&
          // Don't overwrite an explicitly-set feeToken.
          !('feeToken' in (args.params[0] as Record<string, unknown>))
        ) {
          const patched = [...(args.params as unknown[])]
          patched[0] = { ...(args.params[0] as object), feeToken }
          return originalRequest({ ...args, params: patched })
        }
        return originalRequest(args)
      },
    }
  }) as HttpTransport
  return transport
}

// src/rpc/methods.ts
var MAGNUS_RPC_METHODS = {
  fxRate: "magnus_fxRate",
  activeFxRates: "magnus_activeFxRates",
  acceptedFeeTokens: "magnus_acceptedFeeTokens",
  isFeeTokenAccepted: "magnus_isFeeTokenAccepted"
};
function decodeFxRateInfo(wire) {
  return {
    currency: wire.currency,
    numerator: BigInt(wire.numerator),
    denominator: BigInt(wire.denominator),
    ok: wire.ok
  };
}

// src/rpc/actions.ts
function magnusActions() {
  return (rawClient) => {
    const client = rawClient;
    return {
      async getFxRate(currency) {
        const wire = await client.request({
          method: MAGNUS_RPC_METHODS.fxRate,
          params: [currency]
        });
        return decodeFxRateInfo(wire);
      },
      async getActiveFxRates() {
        const wire = await client.request({
          method: MAGNUS_RPC_METHODS.activeFxRates,
          params: []
        });
        return wire.map(decodeFxRateInfo);
      },
      async getAcceptedFeeTokens(validator) {
        return await client.request({
          method: MAGNUS_RPC_METHODS.acceptedFeeTokens,
          params: [validator]
        });
      },
      async isFeeTokenAccepted(validator, feeToken) {
        return await client.request({
          method: MAGNUS_RPC_METHODS.isFeeTokenAccepted,
          params: [validator, feeToken]
        });
      }
    };
  };
}

// src/rpc/feeTokenTransport.ts
import { http } from "viem";
function feeTokenHttp(url, feeToken, config = {}) {
  const inner = http(url, config);
  const transport = ((opts) => {
    const t = inner(opts);
    const originalRequest = t.request.bind(t);
    return {
      ...t,
      request: async (args) => {
        if ((args.method === "eth_call" || args.method === "eth_estimateGas") && Array.isArray(args.params) && args.params.length > 0 && typeof args.params[0] === "object" && args.params[0] !== null && // Don't overwrite an explicitly-set feeToken.
        !("feeToken" in args.params[0])) {
          const patched = [...args.params];
          patched[0] = { ...args.params[0], feeToken };
          return originalRequest({ ...args, params: patched });
        }
        return originalRequest(args);
      }
    };
  });
  return transport;
}
export {
  MAGNUS_RPC_METHODS,
  decodeFxRateInfo,
  feeTokenHttp,
  magnusActions
};
//# sourceMappingURL=index.mjs.map
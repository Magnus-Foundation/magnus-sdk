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
export {
  MAGNUS_RPC_METHODS,
  decodeFxRateInfo,
  magnusActions
};
//# sourceMappingURL=index.mjs.map
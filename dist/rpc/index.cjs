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

// src/rpc/index.ts
var rpc_exports = {};
__export(rpc_exports, {
  MAGNUS_RPC_METHODS: () => MAGNUS_RPC_METHODS,
  decodeFxRateInfo: () => decodeFxRateInfo,
  magnusActions: () => magnusActions
});
module.exports = __toCommonJS(rpc_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAGNUS_RPC_METHODS,
  decodeFxRateInfo,
  magnusActions
});
//# sourceMappingURL=index.cjs.map
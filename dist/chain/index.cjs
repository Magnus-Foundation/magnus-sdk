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

// src/chain/index.ts
var chain_exports = {};
__export(chain_exports, {
  magnus: () => magnus,
  magnusDevnet: () => magnusDevnet,
  magnusTestnet: () => magnusTestnet
});
module.exports = __toCommonJS(chain_exports);

// src/chain.ts
var import_viem = require("viem");
var nativeCurrency = {
  name: "MagnusUSD",
  symbol: "mUSD",
  decimals: 6
};
var magnus = (0, import_viem.defineChain)({
  id: 7777,
  name: "Magnus",
  nativeCurrency,
  rpcUrls: {
    default: { http: ["https://rpc.magnus.example/"] }
  },
  blockExplorers: {
    default: { name: "Magnus Explorer", url: "https://explorer.magnus.example/" }
  }
});
var magnusTestnet = (0, import_viem.defineChain)({
  id: 7776,
  name: "Magnus Testnet",
  nativeCurrency,
  rpcUrls: {
    default: { http: ["https://rpc.testnet.magnus.example/"] }
  },
  blockExplorers: {
    default: {
      name: "Magnus Testnet Explorer",
      url: "https://explorer.testnet.magnus.example/"
    }
  },
  testnet: true
});
var magnusDevnet = (0, import_viem.defineChain)({
  id: 73730,
  name: "Magnus Devnet (Staccato)",
  nativeCurrency,
  rpcUrls: {
    default: { http: ["https://staccato-rpc.magnuschain.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Magnus Devnet Explorer",
      url: "https://devnet.magnuschain.xyz"
    }
  },
  testnet: true
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  magnus,
  magnusDevnet,
  magnusTestnet
});
//# sourceMappingURL=index.cjs.map
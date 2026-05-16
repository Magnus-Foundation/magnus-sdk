// src/chain.ts
import { defineChain } from "viem";
var nativeCurrency = {
  name: "MagnusUSD",
  symbol: "mUSD",
  decimals: 6
};
var magnus = defineChain({
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
var magnusTestnet = defineChain({
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
var magnusDevnet = defineChain({
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
export {
  magnus,
  magnusDevnet,
  magnusTestnet
};
//# sourceMappingURL=index.mjs.map
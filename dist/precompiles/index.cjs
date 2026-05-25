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

// src/precompiles/index.ts
var precompiles_exports = {};
__export(precompiles_exports, {
  ACCOUNT_KEYCHAIN_ADDRESS: () => ACCOUNT_KEYCHAIN_ADDRESS,
  ADDRESS_REGISTRY_ADDRESS: () => ADDRESS_REGISTRY_ADDRESS,
  CROSS_FX_PSM_ADDRESS: () => CROSS_FX_PSM_ADDRESS,
  MAGNUS_BRIDGE_ADDRESS: () => MAGNUS_BRIDGE_ADDRESS,
  MAGNUS_USD_ADDRESS: () => MAGNUS_USD_ADDRESS,
  MIP20_FACTORY_ADDRESS: () => MIP20_FACTORY_ADDRESS,
  MIP20_ISSUER_REGISTRY_ADDRESS: () => MIP20_ISSUER_REGISTRY_ADDRESS,
  MIP403_REGISTRY_ADDRESS: () => MIP403_REGISTRY_ADDRESS,
  MIP_FEE_MANAGER_ADDRESS: () => MIP_FEE_MANAGER_ADDRESS,
  NONCE_PRECOMPILE_ADDRESS: () => NONCE_PRECOMPILE_ADDRESS,
  SIGNATURE_VERIFIER_ADDRESS: () => SIGNATURE_VERIFIER_ADDRESS,
  STABLECOIN_DEX_ADDRESS: () => STABLECOIN_DEX_ADDRESS,
  VALIDATOR_CONFIG_ADDRESS: () => VALIDATOR_CONFIG_ADDRESS,
  VALIDATOR_CONFIG_V2_ADDRESS: () => VALIDATOR_CONFIG_V2_ADDRESS,
  crossFxPSMAbi: () => crossFxPSMAbi,
  feeManagerAbi: () => feeManagerAbi,
  magnusBridgeAbi: () => magnusBridgeAbi,
  mip20Abi: () => mip20Abi
});
module.exports = __toCommonJS(precompiles_exports);

// src/precompiles/addresses.ts
var MIP_FEE_MANAGER_ADDRESS = "0xfeec000000000000000000000000000000000000";
var MAGNUS_USD_ADDRESS = "0x20c0000000000000000000000000000000000010";
var MIP20_FACTORY_ADDRESS = "0x20fc000000000000000000000000000000000000";
var MIP20_ISSUER_REGISTRY_ADDRESS = "0x20fa000000000000000000000000000000000000";
var MIP403_REGISTRY_ADDRESS = "0x403c000000000000000000000000000000000000";
var STABLECOIN_DEX_ADDRESS = "0xdec0000000000000000000000000000000000000";
var CROSS_FX_PSM_ADDRESS = "0xfecc000000000000000000000000000000000000";
var MAGNUS_BRIDGE_ADDRESS = "0xb12d000000000000000000000000000000000000";
var NONCE_PRECOMPILE_ADDRESS = "0x4e4f4e4345000000000000000000000000000000";
var VALIDATOR_CONFIG_ADDRESS = "0xcccccccc00000000000000000000000000000000";
var VALIDATOR_CONFIG_V2_ADDRESS = "0xcccccccc00000000000000000000000000000001";
var ACCOUNT_KEYCHAIN_ADDRESS = "0xaaaaaaaa00000000000000000000000000000000";
var ADDRESS_REGISTRY_ADDRESS = "0xfdc0000000000000000000000000000000000000";
var SIGNATURE_VERIFIER_ADDRESS = "0x5165300000000000000000000000000000000000";

// src/precompiles/crossFxPSM.ts
var crossFxPSMAbi = [
  // ── Views ──────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "quoteExactIn",
    stateMutability: "view",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountIn" }
    ],
    outputs: [{ type: "uint128", name: "amountOut" }]
  },
  {
    type: "function",
    name: "quoteExactOut",
    stateMutability: "view",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountOut" }
    ],
    outputs: [{ type: "uint128", name: "amountIn" }]
  },
  {
    type: "function",
    name: "getPairConfig",
    stateMutability: "view",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ],
    outputs: [
      {
        type: "tuple",
        name: "",
        components: [
          { type: "bool", name: "registered" },
          { type: "bool", name: "enabled" },
          { type: "bool", name: "paused" },
          { type: "uint16", name: "spreadBps" },
          { type: "address", name: "baseToken" },
          { type: "address", name: "quoteToken" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "isStableTokenRegistered",
    stateMutability: "view",
    inputs: [{ type: "address", name: "token" }],
    outputs: [{ type: "bool", name: "" }]
  },
  // ── Swap ───────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "swapExactIn",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountIn" },
      { type: "uint128", name: "minAmountOut" }
    ],
    outputs: [{ type: "uint128", name: "amountOut" }]
  },
  {
    type: "function",
    name: "swapExactOut",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountOut" },
      { type: "uint128", name: "maxAmountIn" }
    ],
    outputs: [{ type: "uint128", name: "amountIn" }]
  },
  // ── Swap event ─────────────────────────────────────────────────────────
  {
    type: "event",
    name: "Swap",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "string", name: "baseIn", indexed: false },
      { type: "string", name: "quoteOut", indexed: false },
      { type: "uint128", name: "amountIn", indexed: false },
      { type: "uint128", name: "amountOut", indexed: false },
      { type: "uint128", name: "rateNum", indexed: false },
      { type: "uint128", name: "rateDen", indexed: false },
      { type: "uint16", name: "spreadBps", indexed: false }
    ]
  },
  // ── User-facing errors a swap UI decodes ───────────────────────────────
  {
    type: "error",
    name: "SlippageExceeded",
    inputs: [
      { type: "uint128", name: "expected" },
      { type: "uint128", name: "actual" }
    ]
  },
  {
    type: "error",
    name: "PairNotRegistered",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ]
  },
  {
    type: "error",
    name: "PairCurrentlyDisabled",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ]
  },
  {
    type: "error",
    name: "PairCurrentlyPaused",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ]
  },
  {
    type: "error",
    name: "OracleUnavailable",
    inputs: [{ type: "string", name: "code" }]
  },
  {
    type: "error",
    name: "L0LimitExceeded",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "address", name: "token" }
    ]
  },
  {
    type: "error",
    name: "L1LimitExceeded",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "address", name: "token" }
    ]
  },
  {
    type: "error",
    name: "InsufficientReserveBacking",
    inputs: [
      { type: "uint256", name: "backingUsd" },
      { type: "uint256", name: "liabilitiesUsd" }
    ]
  },
  { type: "error", name: "MathOverflow", inputs: [] }
];

// src/precompiles/feeManager.ts
var feeManagerAbi = [
  // FX oracle reads — used to populate fee preview UI
  {
    type: "function",
    name: "medianFxRate",
    stateMutability: "view",
    inputs: [{ type: "string", name: "code" }],
    outputs: [
      { type: "uint128", name: "numerator" },
      { type: "uint128", name: "denominator" },
      { type: "bool", name: "ok" }
    ]
  },
  // Validator accept-set reads — used to know which fee tokens a validator takes
  {
    type: "function",
    name: "getAcceptedTokens",
    stateMutability: "view",
    inputs: [{ type: "address", name: "validator" }],
    outputs: [{ type: "address[]", name: "" }]
  },
  {
    type: "function",
    name: "acceptsToken",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "validator" },
      { type: "address", name: "token" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "isAcceptedByAnyValidator",
    stateMutability: "view",
    inputs: [{ type: "address", name: "token" }],
    outputs: [{ type: "bool", name: "" }]
  },
  // Currency registry reads
  {
    type: "function",
    name: "isCurrencyEnabled",
    stateMutability: "view",
    inputs: [{ type: "string", name: "code" }],
    outputs: [{ type: "bool", name: "" }]
  },
  // Selected events the wallet may want to surface
  {
    type: "event",
    name: "FxRateReported",
    inputs: [
      { type: "string", name: "code", indexed: false },
      { type: "address", name: "reporter", indexed: true },
      { type: "uint128", name: "numerator", indexed: false },
      { type: "uint128", name: "denominator", indexed: false }
    ]
  },
  {
    type: "event",
    name: "AcceptedTokenAdded",
    inputs: [
      { type: "address", name: "validator", indexed: true },
      { type: "address", name: "token", indexed: true }
    ]
  },
  {
    type: "event",
    name: "AcceptedTokenRemoved",
    inputs: [
      { type: "address", name: "validator", indexed: true },
      { type: "address", name: "token", indexed: true }
    ]
  }
];

// src/precompiles/magnusBridge.ts
var magnusBridgeAbi = [
  {
    type: "event",
    name: "DepositFinalized",
    inputs: [
      { type: "uint64", name: "srcChainId", indexed: true },
      { type: "bytes32", name: "intentHash", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "depositor", indexed: false },
      { type: "address", name: "dstAccount", indexed: false },
      { type: "uint256", name: "amount", indexed: false }
    ]
  },
  // Outbound: user calls withdraw on the precompile to escrow rUSDT for
  // claim on the destination chain. The Magnus burn + escrow happens in
  // the same tx; cross-chain claim is asynchronous (validator attest +
  // relayer claim on Hoodi).
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "intent",
        components: [
          { type: "address", name: "token" },
          { type: "uint256", name: "amount" },
          { type: "uint64", name: "dstChainId" },
          { type: "address", name: "dstAddress" },
          { type: "uint256", name: "maxFee" },
          { type: "uint64", name: "deadline" }
        ]
      }
    ],
    outputs: [{ type: "bytes32", name: "intentHash" }]
  },
  // Validators ack a completed claim on the destination chain; precompile
  // burns the routed token. The wallet subscribes to this to flip the
  // outbound pending stage 3.
  {
    type: "event",
    name: "PayoutAck",
    inputs: [
      { type: "uint64", name: "dstChainId", indexed: true },
      { type: "bytes32", name: "intentHash", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "dstAddress", indexed: false },
      { type: "uint256", name: "amount", indexed: false },
      { type: "bytes32", name: "claimTxHash", indexed: false }
    ]
  }
];

// src/precompiles/mip20.ts
var mip20Abi = [
  // ERC-20 surface
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string", name: "" }]
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string", name: "" }]
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8", name: "" }]
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256", name: "" }]
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" }
    ],
    outputs: [{ type: "uint256", name: "" }]
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  // MIP-20 extensions
  {
    type: "function",
    name: "currency",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string", name: "" }]
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "transferWithMemo",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "transferFromWithMemo",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  // Standard events
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false }
    ]
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "value", indexed: false }
    ]
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ACCOUNT_KEYCHAIN_ADDRESS,
  ADDRESS_REGISTRY_ADDRESS,
  CROSS_FX_PSM_ADDRESS,
  MAGNUS_BRIDGE_ADDRESS,
  MAGNUS_USD_ADDRESS,
  MIP20_FACTORY_ADDRESS,
  MIP20_ISSUER_REGISTRY_ADDRESS,
  MIP403_REGISTRY_ADDRESS,
  MIP_FEE_MANAGER_ADDRESS,
  NONCE_PRECOMPILE_ADDRESS,
  SIGNATURE_VERIFIER_ADDRESS,
  STABLECOIN_DEX_ADDRESS,
  VALIDATOR_CONFIG_ADDRESS,
  VALIDATOR_CONFIG_V2_ADDRESS,
  crossFxPSMAbi,
  feeManagerAbi,
  magnusBridgeAbi,
  mip20Abi
});
//# sourceMappingURL=index.cjs.map
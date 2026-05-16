// src/precompiles/addresses.ts
var MIP_FEE_MANAGER_ADDRESS = "0xfeec000000000000000000000000000000000000";
var MAGNUS_USD_ADDRESS = "0x20c0000000000000000000000000000000000010";
var MIP20_FACTORY_ADDRESS = "0x20fc000000000000000000000000000000000000";
var MIP20_ISSUER_REGISTRY_ADDRESS = "0x20fa000000000000000000000000000000000000";
var MIP403_REGISTRY_ADDRESS = "0x403c000000000000000000000000000000000000";
var STABLECOIN_DEX_ADDRESS = "0xdec0000000000000000000000000000000000000";
var NONCE_PRECOMPILE_ADDRESS = "0x4e4f4e4345000000000000000000000000000000";
var VALIDATOR_CONFIG_ADDRESS = "0xcccccccc00000000000000000000000000000000";
var VALIDATOR_CONFIG_V2_ADDRESS = "0xcccccccc00000000000000000000000000000001";
var ACCOUNT_KEYCHAIN_ADDRESS = "0xaaaaaaaa00000000000000000000000000000000";
var ADDRESS_REGISTRY_ADDRESS = "0xfdc0000000000000000000000000000000000000";
var SIGNATURE_VERIFIER_ADDRESS = "0x5165300000000000000000000000000000000000";

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
export {
  ACCOUNT_KEYCHAIN_ADDRESS,
  ADDRESS_REGISTRY_ADDRESS,
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
  feeManagerAbi,
  mip20Abi
};
//# sourceMappingURL=index.mjs.map
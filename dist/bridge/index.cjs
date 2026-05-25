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

// src/bridge/index.ts
var bridge_exports = {};
__export(bridge_exports, {
  DEPOSIT_INTENT_FIELDS: () => DEPOSIT_INTENT_FIELDS,
  buildErc2612TypedData: () => buildErc2612TypedData,
  buildIntentTypedData: () => buildIntentTypedData,
  encodeErc2612PermitData: () => encodeErc2612PermitData,
  magnusBridgeSolAbi: () => magnusBridgeSolAbi,
  recoverIntentSigner: () => recoverIntentSigner
});
module.exports = __toCommonJS(bridge_exports);

// src/bridge/magnusBridgeSol.ts
var magnusBridgeSolAbi = [
  {
    type: "function",
    name: "lockWithPermit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "magnusRecipient", type: "bytes20" },
      { name: "relayerFee", type: "uint256" },
      {
        name: "permit",
        type: "tuple",
        components: [
          { name: "isPermit2", type: "bool" },
          { name: "payload", type: "bytes" }
        ]
      },
      { name: "userIntentSig", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "lock",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "magnusRecipient", type: "bytes20" }
    ],
    outputs: []
  },
  {
    type: "event",
    name: "Locked",
    inputs: [
      { name: "intentHash", type: "bytes32", indexed: true },
      { name: "depositor", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "magnusRecipient", type: "bytes20", indexed: false }
    ],
    anonymous: false
  }
];

// src/bridge/permit/erc2612TypedData.ts
var PERMIT_FIELDS = [
  { name: "owner", type: "address" },
  { name: "spender", type: "address" },
  { name: "value", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "deadline", type: "uint256" }
];
var DOMAIN_FIELDS = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];
function buildErc2612TypedData(args) {
  return {
    primaryType: "Permit",
    domain: {
      name: args.tokenName,
      version: args.tokenVersion,
      chainId: args.chainId,
      verifyingContract: args.tokenAddress
    },
    types: {
      EIP712Domain: DOMAIN_FIELDS,
      Permit: PERMIT_FIELDS
    },
    message: {
      owner: args.owner,
      spender: args.spender,
      value: args.value.toString(10),
      nonce: args.nonce.toString(10),
      deadline: args.deadline.toString(10)
    }
  };
}

// src/bridge/permit/intentTypedData.ts
var DEPOSIT_INTENT_FIELDS = [
  { name: "token", type: "address" },
  { name: "amount", type: "uint256" },
  { name: "magnusRecipient", type: "bytes20" },
  { name: "relayerFee", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "deadline", type: "uint256" }
];
var DOMAIN_FIELDS2 = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];
function buildIntentTypedData(args) {
  const { intent } = args;
  return {
    primaryType: "DepositIntent",
    domain: {
      name: "MagnusBridge",
      version: "1",
      chainId: args.chainId,
      verifyingContract: args.bridgeAddress
    },
    types: {
      EIP712Domain: DOMAIN_FIELDS2,
      DepositIntent: DEPOSIT_INTENT_FIELDS
    },
    message: {
      token: intent.token,
      amount: intent.amount.toString(10),
      magnusRecipient: intent.magnusRecipient,
      relayerFee: intent.relayerFee.toString(10),
      nonce: intent.nonce.toString(10),
      deadline: intent.deadline.toString(10)
    }
  };
}

// src/bridge/permit/encodePermitData.ts
var import_viem = require("viem");
function encodeErc2612PermitData(fields) {
  const head = (0, import_viem.encodeAbiParameters)(
    [
      { name: "depositor", type: "address" },
      { name: "intentNonce", type: "uint256" },
      { name: "intentDeadline", type: "uint256" }
    ],
    [fields.depositor, fields.intentNonce, fields.intentDeadline]
  );
  const tail = (0, import_viem.encodeAbiParameters)(
    [
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
      { name: "permitDeadline", type: "uint256" }
    ],
    [fields.v, fields.r, fields.s, fields.permitDeadline]
  );
  return {
    isPermit2: false,
    payload: "0x" + head.slice(2) + tail.slice(2)
  };
}

// src/bridge/permit/recoverIntentSigner.ts
var import_viem2 = require("viem");
async function recoverIntentSigner(args) {
  return (0, import_viem2.recoverTypedDataAddress)({
    domain: {
      name: "MagnusBridge",
      version: "1",
      chainId: args.chainId,
      verifyingContract: args.bridgeAddress
    },
    types: { DepositIntent: [...DEPOSIT_INTENT_FIELDS] },
    primaryType: "DepositIntent",
    message: args.intent,
    signature: args.sig
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEPOSIT_INTENT_FIELDS,
  buildErc2612TypedData,
  buildIntentTypedData,
  encodeErc2612PermitData,
  magnusBridgeSolAbi,
  recoverIntentSigner
});
//# sourceMappingURL=index.cjs.map
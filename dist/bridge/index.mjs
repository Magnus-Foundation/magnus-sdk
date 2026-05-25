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
import { encodeAbiParameters } from "viem";
function encodeErc2612PermitData(fields) {
  const head = encodeAbiParameters(
    [
      { name: "depositor", type: "address" },
      { name: "intentNonce", type: "uint256" },
      { name: "intentDeadline", type: "uint256" }
    ],
    [fields.depositor, fields.intentNonce, fields.intentDeadline]
  );
  const tail = encodeAbiParameters(
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
import { recoverTypedDataAddress } from "viem";
async function recoverIntentSigner(args) {
  return recoverTypedDataAddress({
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
export {
  DEPOSIT_INTENT_FIELDS,
  buildErc2612TypedData,
  buildIntentTypedData,
  encodeErc2612PermitData,
  magnusBridgeSolAbi,
  recoverIntentSigner
};
//# sourceMappingURL=index.mjs.map
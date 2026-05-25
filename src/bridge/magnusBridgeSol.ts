// ABI for the on-spoke-chain MagnusBridge.sol (deployed on Hoodi at
// 0xca43a541f7a9512b4cb9334f09713e6de9a53a14). DISTINCT from
// src/precompiles/magnusBridge.ts which is the on-Magnus precompile ABI
// (DepositFinalized, withdraw, PayoutAck). Same brand name, different
// codepath: this file is what spoke-chain interactions go through.
//
// Mirrors mips/ref-impls/src/bridge/MagnusBridge.sol.

export const magnusBridgeSolAbi = [
  {
    type: 'function',
    name: 'lockWithPermit',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'magnusRecipient', type: 'bytes20' },
      { name: 'relayerFee', type: 'uint256' },
      {
        name: 'permit',
        type: 'tuple',
        components: [
          { name: 'isPermit2', type: 'bool' },
          { name: 'payload', type: 'bytes' },
        ],
      },
      { name: 'userIntentSig', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'lock',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'magnusRecipient', type: 'bytes20' },
    ],
    outputs: [],
  },
  {
    type: 'event',
    name: 'Locked',
    inputs: [
      { name: 'intentHash', type: 'bytes32', indexed: true },
      { name: 'depositor', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'magnusRecipient', type: 'bytes20', indexed: false },
    ],
    anonymous: false,
  },
] as const

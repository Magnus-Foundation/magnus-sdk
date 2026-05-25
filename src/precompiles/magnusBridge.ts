/**
 * Magnus Bridge (MBS) precompile, the wallet's read window into bridge state.
 *
 * The wallet only needs to observe the inbound-finalize event in v1. Outbound,
 * relayer, sentinel, and rotation surfaces are intentionally omitted: they are
 * called from validator sidecars and the bridge contracts on spoke chains, not
 * from consumer wallets.
 *
 * Source: `magnus/crates/evm/precompiles/src/mbs/dispatch.rs` and
 * `magnus/crates/bridge/src/types.rs` (event payload).
 */
export const magnusBridgeAbi = [
  {
    type: 'event',
    name: 'DepositFinalized',
    inputs: [
      { type: 'uint64', name: 'srcChainId', indexed: true },
      { type: 'bytes32', name: 'intentHash', indexed: true },
      { type: 'address', name: 'token', indexed: true },
      { type: 'address', name: 'depositor', indexed: false },
      { type: 'address', name: 'dstAccount', indexed: false },
      { type: 'uint256', name: 'amount', indexed: false },
    ],
  },
  // Outbound: user calls withdraw on the precompile to escrow rUSDT for
  // claim on the destination chain. The Magnus burn + escrow happens in
  // the same tx; cross-chain claim is asynchronous (validator attest +
  // relayer claim on Hoodi).
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      {
        type: 'tuple',
        name: 'intent',
        components: [
          { type: 'address', name: 'token' },
          { type: 'uint256', name: 'amount' },
          { type: 'uint64', name: 'dstChainId' },
          { type: 'address', name: 'dstAddress' },
          { type: 'uint256', name: 'maxFee' },
          { type: 'uint64', name: 'deadline' },
        ],
      },
    ],
    outputs: [{ type: 'bytes32', name: 'intentHash' }],
  },
  // Validators ack a completed claim on the destination chain; precompile
  // burns the routed token. The wallet subscribes to this to flip the
  // outbound pending stage 3.
  {
    type: 'event',
    name: 'PayoutAck',
    inputs: [
      { type: 'uint64', name: 'dstChainId', indexed: true },
      { type: 'bytes32', name: 'intentHash', indexed: true },
      { type: 'address', name: 'token', indexed: true },
      { type: 'address', name: 'dstAddress', indexed: false },
      { type: 'uint256', name: 'amount', indexed: false },
      { type: 'bytes32', name: 'claimTxHash', indexed: false },
    ],
  },
] as const

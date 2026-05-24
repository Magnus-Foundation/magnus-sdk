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
] as const

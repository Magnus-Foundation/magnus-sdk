/**
 * Cross-FX PSM precompile — oracle-priced stable↔stable swaps between
 * MIP-20 fiat tokens (mUSD ↔ mEUR ↔ mVND). v0.1 SDK surface for wallets and
 * dApps: quote, swap, and the user-facing errors a swap UI needs to decode.
 *
 * Governance/admin surface (addPair, registerStableToken, setSolvencyDisabled,
 * ...) is intentionally omitted — only the Foundation calls those.
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/cross_fx_psm.rs`.
 */
export const crossFxPSMAbi = [
  // ── Views ──────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'quoteExactIn',
    stateMutability: 'view',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
      { type: 'uint128', name: 'amountIn' },
    ],
    outputs: [{ type: 'uint128', name: 'amountOut' }],
  },
  {
    type: 'function',
    name: 'quoteExactOut',
    stateMutability: 'view',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
      { type: 'uint128', name: 'amountOut' },
    ],
    outputs: [{ type: 'uint128', name: 'amountIn' }],
  },
  {
    type: 'function',
    name: 'getPairConfig',
    stateMutability: 'view',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          { type: 'bool', name: 'registered' },
          { type: 'bool', name: 'enabled' },
          { type: 'bool', name: 'paused' },
          { type: 'uint16', name: 'spreadBps' },
          { type: 'address', name: 'baseToken' },
          { type: 'address', name: 'quoteToken' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'isStableTokenRegistered',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'token' }],
    outputs: [{ type: 'bool', name: '' }],
  },
  // ── Swap ───────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'swapExactIn',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
      { type: 'uint128', name: 'amountIn' },
      { type: 'uint128', name: 'minAmountOut' },
    ],
    outputs: [{ type: 'uint128', name: 'amountOut' }],
  },
  {
    type: 'function',
    name: 'swapExactOut',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
      { type: 'uint128', name: 'amountOut' },
      { type: 'uint128', name: 'maxAmountIn' },
    ],
    outputs: [{ type: 'uint128', name: 'amountIn' }],
  },
  // ── Swap event ─────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'Swap',
    inputs: [
      { type: 'address', name: 'from', indexed: true },
      { type: 'string', name: 'baseIn', indexed: false },
      { type: 'string', name: 'quoteOut', indexed: false },
      { type: 'uint128', name: 'amountIn', indexed: false },
      { type: 'uint128', name: 'amountOut', indexed: false },
      { type: 'uint128', name: 'rateNum', indexed: false },
      { type: 'uint128', name: 'rateDen', indexed: false },
      { type: 'uint16', name: 'spreadBps', indexed: false },
    ],
  },
  // ── User-facing errors a swap UI decodes ───────────────────────────────
  {
    type: 'error',
    name: 'SlippageExceeded',
    inputs: [
      { type: 'uint128', name: 'expected' },
      { type: 'uint128', name: 'actual' },
    ],
  },
  {
    type: 'error',
    name: 'PairNotRegistered',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
    ],
  },
  {
    type: 'error',
    name: 'PairCurrentlyDisabled',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
    ],
  },
  {
    type: 'error',
    name: 'PairCurrentlyPaused',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
    ],
  },
  {
    type: 'error',
    name: 'OracleUnavailable',
    inputs: [{ type: 'string', name: 'code' }],
  },
  {
    type: 'error',
    name: 'L0LimitExceeded',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
      { type: 'address', name: 'token' },
    ],
  },
  {
    type: 'error',
    name: 'L1LimitExceeded',
    inputs: [
      { type: 'string', name: 'baseIn' },
      { type: 'string', name: 'quoteOut' },
      { type: 'address', name: 'token' },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientReserveBacking',
    inputs: [
      { type: 'uint256', name: 'backingUsd' },
      { type: 'uint256', name: 'liabilitiesUsd' },
    ],
  },
  { type: 'error', name: 'MathOverflow', inputs: [] },
] as const

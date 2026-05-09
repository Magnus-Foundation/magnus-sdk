/**
 * MIP-FeeManager precompile — the read-only views dApps and wallets need.
 *
 * Mutating functions (governance, validator registration, fee distribution)
 * are intentionally omitted from this v0.1 SDK ABI; they're not in the
 * wallet/dApp use case. Add them later if a tool needs to call them.
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/mip_fee_manager.rs`.
 */
export const feeManagerAbi = [
  // FX oracle reads — used to populate fee preview UI
  {
    type: 'function',
    name: 'medianFxRate',
    stateMutability: 'view',
    inputs: [{ type: 'string', name: 'code' }],
    outputs: [
      { type: 'uint128', name: 'numerator' },
      { type: 'uint128', name: 'denominator' },
      { type: 'bool', name: 'ok' },
    ],
  },
  // Validator accept-set reads — used to know which fee tokens a validator takes
  {
    type: 'function',
    name: 'getAcceptedTokens',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'validator' }],
    outputs: [{ type: 'address[]', name: '' }],
  },
  {
    type: 'function',
    name: 'acceptsToken',
    stateMutability: 'view',
    inputs: [
      { type: 'address', name: 'validator' },
      { type: 'address', name: 'token' },
    ],
    outputs: [{ type: 'bool', name: '' }],
  },
  {
    type: 'function',
    name: 'isAcceptedByAnyValidator',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'token' }],
    outputs: [{ type: 'bool', name: '' }],
  },
  // Currency registry reads
  {
    type: 'function',
    name: 'isCurrencyEnabled',
    stateMutability: 'view',
    inputs: [{ type: 'string', name: 'code' }],
    outputs: [{ type: 'bool', name: '' }],
  },
  // Selected events the wallet may want to surface
  {
    type: 'event',
    name: 'FxRateReported',
    inputs: [
      { type: 'string', name: 'code', indexed: false },
      { type: 'address', name: 'reporter', indexed: true },
      { type: 'uint128', name: 'numerator', indexed: false },
      { type: 'uint128', name: 'denominator', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AcceptedTokenAdded',
    inputs: [
      { type: 'address', name: 'validator', indexed: true },
      { type: 'address', name: 'token', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'AcceptedTokenRemoved',
    inputs: [
      { type: 'address', name: 'validator', indexed: true },
      { type: 'address', name: 'token', indexed: true },
    ],
  },
] as const

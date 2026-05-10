import type { Address } from '../types-prim.js'

/**
 * Canonical Magnus precompile addresses.
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/mod.rs`. These are
 * fixed-address precompiles wired into the EVM at chain genesis.
 */

export const MIP_FEE_MANAGER_ADDRESS: Address =
  '0xfeec000000000000000000000000000000000000'

export const MAGNUS_USD_ADDRESS: Address =
  '0x20c0000000000000000000000000000000000010'

export const MIP20_FACTORY_ADDRESS: Address =
  '0x20fc000000000000000000000000000000000000'

export const MIP20_ISSUER_REGISTRY_ADDRESS: Address =
  '0x20fa000000000000000000000000000000000000'

export const MIP403_REGISTRY_ADDRESS: Address =
  '0x403c000000000000000000000000000000000000'

export const STABLECOIN_DEX_ADDRESS: Address =
  '0xdec0000000000000000000000000000000000000'

export const NONCE_PRECOMPILE_ADDRESS: Address =
  '0x4e4f4e4345000000000000000000000000000000'

export const VALIDATOR_CONFIG_ADDRESS: Address =
  '0xcccccccc00000000000000000000000000000000'

export const VALIDATOR_CONFIG_V2_ADDRESS: Address =
  '0xcccccccc00000000000000000000000000000001'

export const ACCOUNT_KEYCHAIN_ADDRESS: Address =
  '0xaaaaaaaa00000000000000000000000000000000'

export const ADDRESS_REGISTRY_ADDRESS: Address =
  '0xfdc0000000000000000000000000000000000000'

export const SIGNATURE_VERIFIER_ADDRESS: Address =
  '0x5165300000000000000000000000000000000000'

/**
 * Non-canonical: mEUR/mVND tokens are deployed via the MIP-20 factory rather
 * than reserved at fixed precompile addresses. Resolve at runtime via the
 * `MIP403_REGISTRY` (currency-code lookup) or the FeeManager. We do NOT export
 * placeholder constants for them here — using a wrong address would silently
 * burn user funds. dApps that need them must look them up on the live chain.
 */

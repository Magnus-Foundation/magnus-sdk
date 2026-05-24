// Constants
export {
  FEE_PAYER_SIGNATURE_MAGIC_BYTE,
  MAGNUS_EXPIRING_NONCE_KEY,
  MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS,
  MAGNUS_NATIVE_DECIMALS,
  MAGNUS_TX_TYPE,
  MAX_WEBAUTHN_SIGNATURE_LENGTH,
  P256_SIGNATURE_LENGTH,
  SECP256K1_SIGNATURE_LENGTH,
  SIGNATURE_TYPE_KEYCHAIN,
  SIGNATURE_TYPE_KEYCHAIN_V2,
  SIGNATURE_TYPE_P256,
  SIGNATURE_TYPE_WEBAUTHN,
} from './constants.js'

// Chains
export { magnus, magnusDevnet, magnusTestnet } from './chain.js'

// Transaction types
export type {
  AccessListEntry,
  Call,
  KeyAuthorization,
  MagnusAuthorization,
  MagnusSignatureBytes,
  MagnusSignedTransaction,
  MagnusTransaction,
  MagnusTransactionSerializable,
  Secp256k1Signature,
} from './transaction/types.js'

// Transaction codec
export {
  serializeMagnusTransaction,
  type SerializeMagnusOptions,
  type SerializeMagnusPurpose,
} from './transaction/serialize.js'
export { parseMagnusTransaction } from './transaction/parse.js'
export {
  getMagnusFeePayerSignatureHash,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
} from './transaction/hash.js'

// Signature codec
export {
  encodeMagnusSignature,
  parseMagnusSignature,
  type DecodedMagnusSignature,
  type KeychainMagnusSignature,
  type P256MagnusSignature,
  type PrimitiveMagnusSignature,
  type Secp256k1MagnusSignature,
  type WebAuthnMagnusSignature,
} from './transaction/signature.js'

// Precompile addresses + ABIs
export {
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
} from './precompiles/addresses.js'
export { crossFxPSMAbi } from './precompiles/crossFxPSM.js'
export { feeManagerAbi } from './precompiles/feeManager.js'
export { magnusBridgeAbi } from './precompiles/magnusBridge.js'
export { mip20Abi } from './precompiles/mip20.js'

// RPC
export {
  MAGNUS_RPC_METHODS,
  decodeFxRateInfo,
  type AcceptedFeeTokens,
  type AcceptedFeeTokensWire,
  type FxRateInfo,
  type FxRateInfoWire,
} from './rpc/methods.js'
export { magnusActions, type MagnusActions } from './rpc/actions.js'

// Utilities
export {
  convertCurrency,
  type ConvertCurrencyArgs,
  type FxRateLike,
} from './utils/currency.js'
export {
  formatBalance,
  formatFee,
  parseAmount,
  type FormatBalanceOptions,
  type ParseAmountOptions,
  type SupportedCurrency,
  type SupportedLocale,
} from './utils/format.js'

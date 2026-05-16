export { magnus, magnusDevnet, magnusTestnet } from './chain/index.mjs';
export { AccessListEntry, Call, DecodedMagnusSignature, KeyAuthorization, KeychainMagnusSignature, MagnusAuthorization, MagnusSignatureBytes, MagnusSignedTransaction, MagnusTransaction, MagnusTransactionSerializable, P256MagnusSignature, PrimitiveMagnusSignature, Secp256k1MagnusSignature, Secp256k1Signature, SerializeMagnusOptions, SerializeMagnusPurpose, WebAuthnMagnusSignature, encodeMagnusSignature, getMagnusFeePayerSignatureHash, getMagnusSignatureHash, getMagnusTransactionHash, parseMagnusSignature, parseMagnusTransaction, serializeMagnusTransaction } from './transaction/index.mjs';
export { ACCOUNT_KEYCHAIN_ADDRESS, ADDRESS_REGISTRY_ADDRESS, MAGNUS_USD_ADDRESS, MIP20_FACTORY_ADDRESS, MIP20_ISSUER_REGISTRY_ADDRESS, MIP403_REGISTRY_ADDRESS, MIP_FEE_MANAGER_ADDRESS, NONCE_PRECOMPILE_ADDRESS, SIGNATURE_VERIFIER_ADDRESS, STABLECOIN_DEX_ADDRESS, VALIDATOR_CONFIG_ADDRESS, VALIDATOR_CONFIG_V2_ADDRESS, feeManagerAbi, mip20Abi } from './precompiles/index.mjs';
export { AcceptedFeeTokens, AcceptedFeeTokensWire, FxRateInfo, FxRateInfoWire, MAGNUS_RPC_METHODS, MagnusActions, decodeFxRateInfo, magnusActions } from './rpc/index.mjs';
export { ConvertCurrencyArgs, FormatBalanceOptions, FxRateLike, ParseAmountOptions, SupportedCurrency, SupportedLocale, convertCurrency, formatBalance, formatFee, parseAmount } from './utils/index.mjs';
import './types-prim-BlJ081zG.mjs';

/** EIP-2718 type byte for Magnus transactions. */
declare const MAGNUS_TX_TYPE: 118;
/** Magic byte mixed into the fee-payer signature hash to prevent cross-domain reuse. */
declare const FEE_PAYER_SIGNATURE_MAGIC_BYTE: 120;
/** Magnus native unit (mUSD) decimals. */
declare const MAGNUS_NATIVE_DECIMALS: 6;
/** Nonce key marking an expiring-nonce transaction. Hash is used for replay protection. */
declare const MAGNUS_EXPIRING_NONCE_KEY = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
/** Maximum allowed expiry window for expiring-nonce transactions (seconds). */
declare const MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS: 30;
/** Length of a raw secp256k1 signature in bytes (r || s || v). */
declare const SECP256K1_SIGNATURE_LENGTH: 65;
/** Length of a P256 signature payload (excluding the 1-byte type prefix). */
declare const P256_SIGNATURE_LENGTH: 129;
/** Maximum WebAuthn signature length (excluding the 1-byte type prefix). */
declare const MAX_WEBAUTHN_SIGNATURE_LENGTH: 2048;
/** Discriminator bytes for non-secp256k1 signature variants. */
declare const SIGNATURE_TYPE_P256: 1;
declare const SIGNATURE_TYPE_WEBAUTHN: 2;
declare const SIGNATURE_TYPE_KEYCHAIN: 3;
declare const SIGNATURE_TYPE_KEYCHAIN_V2: 4;

export { FEE_PAYER_SIGNATURE_MAGIC_BYTE, MAGNUS_EXPIRING_NONCE_KEY, MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS, MAGNUS_NATIVE_DECIMALS, MAGNUS_TX_TYPE, MAX_WEBAUTHN_SIGNATURE_LENGTH, P256_SIGNATURE_LENGTH, SECP256K1_SIGNATURE_LENGTH, SIGNATURE_TYPE_KEYCHAIN, SIGNATURE_TYPE_KEYCHAIN_V2, SIGNATURE_TYPE_P256, SIGNATURE_TYPE_WEBAUTHN };

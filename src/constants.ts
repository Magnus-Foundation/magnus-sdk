/** EIP-2718 type byte for Magnus transactions. */
export const MAGNUS_TX_TYPE = 0x76 as const

/** Magic byte mixed into the fee-payer signature hash to prevent cross-domain reuse. */
export const FEE_PAYER_SIGNATURE_MAGIC_BYTE = 0x78 as const

/** Magnus native unit (mUSD) decimals. */
export const MAGNUS_NATIVE_DECIMALS = 6 as const

/** Nonce key marking an expiring-nonce transaction. Hash is used for replay protection. */
export const MAGNUS_EXPIRING_NONCE_KEY =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn

/** Maximum allowed expiry window for expiring-nonce transactions (seconds). */
export const MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS = 30 as const

/** Length of a raw secp256k1 signature in bytes (r || s || v). */
export const SECP256K1_SIGNATURE_LENGTH = 65 as const

/** Length of a P256 signature payload (excluding the 1-byte type prefix). */
export const P256_SIGNATURE_LENGTH = 129 as const

/** Maximum WebAuthn signature length (excluding the 1-byte type prefix). */
export const MAX_WEBAUTHN_SIGNATURE_LENGTH = 2048 as const

/** Discriminator bytes for non-secp256k1 signature variants. */
export const SIGNATURE_TYPE_P256 = 0x01 as const
export const SIGNATURE_TYPE_WEBAUTHN = 0x02 as const
export const SIGNATURE_TYPE_KEYCHAIN = 0x03 as const
export const SIGNATURE_TYPE_KEYCHAIN_V2 = 0x04 as const

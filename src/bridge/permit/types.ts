// Universal wire + signing types for the MBS Path B (gasless permit) flow.
// Imported by both the wallet (builds, signs, POSTs) and the relayer
// (validates, submits). Matches:
//   mips/ref-impls/src/bridge/interfaces/IMagnusBridge.sol (PermitData)
//   mips/ref-impls/test/bridge/LockWithPermit.t.sol       (payload encoding)
// Any drift between wallet and relayer would surface here as a TS error.

import type { Address, Hex } from 'viem'

/** Matches IMagnusBridge.PermitData. v1 emits isPermit2=false. */
export interface PermitEnvelope {
  isPermit2: boolean
  /** ABI-encoded payload. ERC-2612 layout:
   *  abi.encode(depositor, intentNonce, intentDeadline) || abi.encode(v, r, s, permitDeadline) */
  payload: Hex
}

/** Intent fields the user signs (EIP-712 Intent type). Must match the
 *  bridge's on-chain Intent struct one-for-one or ecrecover fails. */
export interface MbsIntent {
  depositor: Address
  token: Address
  amount: bigint
  /** 20-byte hex (0x-prefixed). The Magnus recipient address. */
  magnusRecipient: Hex
  relayerFee: bigint
  nonce: bigint
  deadline: bigint
}

/** POST /v1/inbound/permit request body. */
export interface RelayerSubmission {
  srcChainId: number
  token: Address
  /** Decimal string in token base units (avoids JSON precision loss). */
  amount: string
  magnusRecipient: Hex
  relayerFee: string
  permit: PermitEnvelope
  /** 65-byte ECDSA signature (r || s || v). */
  userIntentSig: Hex
}

/** 200 OK. */
export interface RelayerAccepted {
  intentHash: Hex
  submittedTxHash: Hex
}

/** 4xx / 5xx envelope. */
export interface RelayerError {
  error:
    | 'INSUFFICIENT_BALANCE'
    | 'BAD_PERMIT_SIG'
    | 'BAD_INTENT_SIG'
    | 'STALE_DEADLINE'
    | 'RELAYER_DOWN'
    | 'HOODI_RPC_ERROR'
  message: string
}

/** GET /v1/inbound/permit/:intentHash response. */
export type IntentStatus =
  | { status: 'submitted'; lockTxHash: Hex }
  | { status: 'locked'; lockTxHash: Hex }
  | { status: 'finalized'; lockTxHash: Hex; finalizeTxHash: Hex }
  | { status: 'failed'; error: string }

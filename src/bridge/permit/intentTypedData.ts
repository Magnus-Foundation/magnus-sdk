// Builds the EIP-712 typed-data for the MBS Intent signature. The user signs
// this; the bridge's intentDigest(...) re-hashes the same fields and
// ecrecover-checks against the sig in lockWithPermit(). Matches
// mips/ref-impls/test/bridge/LockWithPermit.t.sol::_signIntent.

import type { Address } from 'viem'
import type { MbsIntent } from './types'

export interface IntentTypedData {
  primaryType: 'Intent'
  domain: {
    name: 'MagnusBridge'
    version: '1'
    chainId: number
    verifyingContract: Address
  }
  types: {
    EIP712Domain: Array<{ name: string; type: string }>
    Intent: Array<{ name: string; type: string }>
  }
  message: {
    depositor: Address
    token: Address
    amount: string
    magnusRecipient: string
    relayerFee: string
    nonce: string
    deadline: string
  }
}

export const INTENT_FIELDS = [
  { name: 'depositor', type: 'address' },
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint256' },
  { name: 'magnusRecipient', type: 'bytes20' },
  { name: 'relayerFee', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
] as const

const DOMAIN_FIELDS = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

export function buildIntentTypedData(args: {
  bridgeAddress: Address
  chainId: number
  intent: MbsIntent
}): IntentTypedData {
  const { intent } = args
  return {
    primaryType: 'Intent',
    domain: {
      name: 'MagnusBridge',
      version: '1',
      chainId: args.chainId,
      verifyingContract: args.bridgeAddress,
    },
    types: {
      EIP712Domain: DOMAIN_FIELDS,
      Intent: INTENT_FIELDS as unknown as Array<{ name: string; type: string }>,
    },
    message: {
      depositor: intent.depositor,
      token: intent.token,
      amount: intent.amount.toString(10),
      magnusRecipient: intent.magnusRecipient,
      relayerFee: intent.relayerFee.toString(10),
      nonce: intent.nonce.toString(10),
      deadline: intent.deadline.toString(10),
    },
  }
}

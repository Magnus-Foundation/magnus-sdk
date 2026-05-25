// Builds the EIP-712 typed-data for the MBS deposit intent signature. The user
// signs this; the bridge re-hashes the same struct and ecrecover-checks the
// recovered signer against the separately-supplied depositor in lockWithPermit().
//
// MUST match MagnusBridge.sol::INTENT_TYPEHASH exactly:
//   DepositIntent(address token,uint256 amount,bytes20 magnusRecipient,uint256 relayerFee,uint256 nonce,uint256 deadline)
// Two things that are easy to get wrong and both cause InvalidIntentSignature():
//   1. The primary type is "DepositIntent", not "Intent".
//   2. `depositor` is NOT a signed field. The contract decodes depositor from
//      the permit payload head and checks ecrecover(digest) == depositor; the
//      digest itself never includes depositor.

import type { Address } from 'viem'
import type { MbsIntent } from './types'

export interface IntentTypedData {
  primaryType: 'DepositIntent'
  domain: {
    name: 'MagnusBridge'
    version: '1'
    chainId: number
    verifyingContract: Address
  }
  types: {
    EIP712Domain: Array<{ name: string; type: string }>
    DepositIntent: Array<{ name: string; type: string }>
  }
  message: {
    token: Address
    amount: string
    magnusRecipient: string
    relayerFee: string
    nonce: string
    deadline: string
  }
}

export const DEPOSIT_INTENT_FIELDS = [
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
    primaryType: 'DepositIntent',
    domain: {
      name: 'MagnusBridge',
      version: '1',
      chainId: args.chainId,
      verifyingContract: args.bridgeAddress,
    },
    types: {
      EIP712Domain: DOMAIN_FIELDS,
      DepositIntent: DEPOSIT_INTENT_FIELDS as unknown as Array<{ name: string; type: string }>,
    },
    message: {
      token: intent.token,
      amount: intent.amount.toString(10),
      magnusRecipient: intent.magnusRecipient,
      relayerFee: intent.relayerFee.toString(10),
      nonce: intent.nonce.toString(10),
      deadline: intent.deadline.toString(10),
    },
  }
}

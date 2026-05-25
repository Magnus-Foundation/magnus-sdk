// EIP-712 signer recovery for the MBS intent. Must produce the same digest
// as bridge.intentDigest(...) on chain. Uses the SAME INTENT_FIELDS array
// exported by intentTypedData.ts so the type definition cannot drift.

import { recoverTypedDataAddress, type Address, type Hex } from 'viem'
import type { MbsIntent } from './types'
import { INTENT_FIELDS } from './intentTypedData'

export async function recoverIntentSigner(args: {
  bridgeAddress: Address
  chainId: number
  intent: MbsIntent
  sig: Hex
}): Promise<Address> {
  return recoverTypedDataAddress({
    domain: {
      name: 'MagnusBridge',
      version: '1',
      chainId: args.chainId,
      verifyingContract: args.bridgeAddress,
    },
    types: { Intent: [...INTENT_FIELDS] },
    primaryType: 'Intent',
    message: args.intent,
    signature: args.sig,
  })
}

// EIP-712 signer recovery for the MBS deposit intent. Must produce the same
// digest the bridge computes on chain (MagnusBridge.sol::_intentDigest). Uses
// the SAME DEPOSIT_INTENT_FIELDS array exported by intentTypedData.ts so the
// type definition cannot drift. The struct has 6 fields and no depositor; viem
// encodes only the fields declared in `types.DepositIntent`, so passing the
// full MbsIntent (which carries depositor for the caller's convenience) is fine.

import { recoverTypedDataAddress, type Address, type Hex } from 'viem'
import type { MbsIntent } from './types'
import { DEPOSIT_INTENT_FIELDS } from './intentTypedData'

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
    types: { DepositIntent: [...DEPOSIT_INTENT_FIELDS] },
    primaryType: 'DepositIntent',
    message: args.intent,
    signature: args.sig,
  })
}

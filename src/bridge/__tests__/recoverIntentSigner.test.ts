import { describe, it, expect } from 'vitest'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
import type { Address, Hex } from 'viem'
import { recoverIntentSigner } from '../permit/recoverIntentSigner'
import { buildIntentTypedData } from '../permit/intentTypedData'
import type { MbsIntent } from '../permit/types'

describe('recoverIntentSigner', () => {
  it('recovers the depositor address from a viem-signed intent', async () => {
    const pk = generatePrivateKey()
    const account = privateKeyToAccount(pk)

    const intent: MbsIntent = {
      depositor: account.address,
      token: '0x09117a173a6e08f5bab5c751577825d9065414a6',
      amount: 1_000_000n,
      magnusRecipient: '0x4db40bbe78971f285cba9afd9f156c315850c8f3',
      relayerFee: 10_000n,
      nonce: 1n,
      deadline: 9999999999n,
    }
    const bridgeAddress = '0xca43a541f7a9512b4cb9334f09713e6de9a53a14' as Address
    const chainId = 560048

    const td = buildIntentTypedData({ bridgeAddress, chainId, intent })
    const sig = (await account.signTypedData({
      domain: td.domain,
      types: { Intent: [...td.types.Intent] },
      primaryType: 'Intent',
      message: { ...intent } as any,
    })) as Hex

    const recovered = await recoverIntentSigner({ bridgeAddress, chainId, intent, sig })
    expect(recovered.toLowerCase()).toBe(account.address.toLowerCase())
  })
})

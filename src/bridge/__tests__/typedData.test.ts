import { describe, it, expect } from 'vitest'
import { buildErc2612TypedData } from '../permit/erc2612TypedData'
import { buildIntentTypedData } from '../permit/intentTypedData'
import type { MbsIntent } from '../permit/types'

describe('buildErc2612TypedData', () => {
  const args = {
    tokenName: 'Magnus USD',
    tokenVersion: '1',
    chainId: 560048,
    tokenAddress: '0x09117a173a6e08f5bab5c751577825d9065414a6' as const,
    owner: '0x4db40bbe78971f285cba9afd9f156c315850c8f3' as const,
    spender: '0xca43a541f7a9512b4cb9334f09713e6de9a53a14' as const,
    value: 1_000_000n,
    nonce: 0n,
    deadline: 1716643200n,
  }

  it('produces the canonical ERC-2612 typed-data structure', () => {
    const td = buildErc2612TypedData(args)
    expect(td.primaryType).toBe('Permit')
    expect(td.domain).toEqual({
      name: 'Magnus USD',
      version: '1',
      chainId: 560048,
      verifyingContract: args.tokenAddress,
    })
    expect(td.types.Permit).toEqual([
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ])
    expect(td.message.value).toBe('1000000')
    expect(td.message.nonce).toBe('0')
    expect(td.message.deadline).toBe('1716643200')
  })

  it('serialises huge bigints as decimal strings (RPC JSON requirement)', () => {
    const td = buildErc2612TypedData({ ...args, value: 999_999_999_999_999_999_999_999n })
    expect(td.message.value).toBe('999999999999999999999999')
  })
})

describe('buildIntentTypedData', () => {
  const intent: MbsIntent = {
    depositor: '0x4db40bbe78971f285cba9afd9f156c315850c8f3',
    token: '0x09117a173a6e08f5bab5c751577825d9065414a6',
    amount: 1_000_000n,
    magnusRecipient: '0x4db40bbe78971f285cba9afd9f156c315850c8f3',
    relayerFee: 10_000n,
    nonce: 1n,
    deadline: 1716643200n,
  }

  it('produces the canonical Magnus Bridge DepositIntent typed-data structure', () => {
    const td = buildIntentTypedData({
      bridgeAddress: '0xca43a541f7a9512b4cb9334f09713e6de9a53a14',
      chainId: 560048,
      intent,
    })
    // Must match MagnusBridge.sol::INTENT_TYPEHASH exactly: primary type
    // "DepositIntent", 6 fields, no depositor (the contract recovers + compares
    // depositor separately). Any drift here reverts with InvalidIntentSignature().
    expect(td.primaryType).toBe('DepositIntent')
    expect(td.domain).toEqual({
      name: 'MagnusBridge',
      version: '1',
      chainId: 560048,
      verifyingContract: '0xca43a541f7a9512b4cb9334f09713e6de9a53a14',
    })
    expect(td.types.DepositIntent).toEqual([
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'magnusRecipient', type: 'bytes20' },
      { name: 'relayerFee', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ])
    expect(td.message).toEqual({
      token: intent.token,
      amount: '1000000',
      magnusRecipient: intent.magnusRecipient,
      relayerFee: '10000',
      nonce: '1',
      deadline: '1716643200',
    })
  })
})

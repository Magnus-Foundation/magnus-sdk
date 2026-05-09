import { describe, expect, it } from 'vitest'
import { magnus, magnusDevnet, magnusTestnet } from '../src/chain.js'

describe('magnus chain', () => {
  it('has mainnet chain id 7777', () => {
    expect(magnus.id).toBe(7777)
  })

  it('uses mUSD as native currency with 6 decimals', () => {
    expect(magnus.nativeCurrency).toEqual({
      name: 'MagnusUSD',
      symbol: 'mUSD',
      decimals: 6,
    })
  })

  it('is not flagged testnet', () => {
    expect(magnus.testnet).toBeFalsy()
  })
})

describe('magnusTestnet chain', () => {
  it('has testnet chain id 7776', () => {
    expect(magnusTestnet.id).toBe(7776)
  })

  it('is flagged testnet', () => {
    expect(magnusTestnet.testnet).toBe(true)
  })
})

describe('magnusDevnet chain', () => {
  it('has devnet chain id 73730', () => {
    expect(magnusDevnet.id).toBe(73730)
  })

  it('is flagged testnet', () => {
    expect(magnusDevnet.testnet).toBe(true)
  })

  it('points at the staccato RPC endpoint', () => {
    expect(magnusDevnet.rpcUrls.default.http[0]).toBe(
      'http://rpc.staccato.magnuschain.xyz:8545',
    )
  })
})

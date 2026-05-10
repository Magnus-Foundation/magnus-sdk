import { defineChain } from 'viem'

/**
 * Minimal Magnus chain shape exported in the SDK's public API.
 *
 * Annotated explicitly (rather than inferred from viem's `Chain` type) so the
 * emitted d.ts has no `import * as viem from 'viem'`. That keeps consumers
 * whose toolchain predates viem's TS 5.x type syntax (notably SubWallet's
 * pinned TS 4.8.4) from choking on viem's d.ts files.
 */
export type MagnusChain = {
  readonly id: number
  readonly name: string
  readonly nativeCurrency: {
    readonly name: string
    readonly symbol: string
    readonly decimals: number
  }
  readonly rpcUrls: {
    readonly default: { readonly http: readonly string[] }
  }
  readonly blockExplorers: {
    readonly default: { readonly name: string; readonly url: string }
  }
  readonly testnet?: boolean | undefined
}

const nativeCurrency = {
  name: 'MagnusUSD',
  symbol: 'mUSD',
  decimals: 6
} as const

// Note: viem's defineChain expects serializers.transaction to match its standard
// TransactionSerializable union (legacy / EIP-1559 / EIP-2930 / EIP-7702). Magnus
// transactions are shape-incompatible (calls[] in place of single to/data, plus
// fee_token / nonce_key / valid_before-after / key_authorization fields). Until we
// ship a viem-shaped adapter (v0.2), consumers call `serializeMagnusTransaction`
// directly — see DESIGN.md §13 "Defer to v0.2".

export const magnus: MagnusChain = defineChain({
  id: 7777,
  name: 'Magnus',
  nativeCurrency,
  rpcUrls: {
    default: { http: ['https://rpc.magnus.example/'] }
  },
  blockExplorers: {
    default: { name: 'Magnus Explorer', url: 'https://explorer.magnus.example/' }
  }
})

export const magnusTestnet: MagnusChain = defineChain({
  id: 7776,
  name: 'Magnus Testnet',
  nativeCurrency,
  rpcUrls: {
    default: { http: ['https://rpc.testnet.magnus.example/'] }
  },
  blockExplorers: {
    default: {
      name: 'Magnus Testnet Explorer',
      url: 'https://explorer.testnet.magnus.example/'
    }
  },
  testnet: true
})

export const magnusDevnet: MagnusChain = defineChain({
  id: 73730,
  name: 'Magnus Devnet (Staccato)',
  nativeCurrency,
  rpcUrls: {
    default: { http: ['https://staccato-rpc.magnuschain.xyz'] }
  },
  blockExplorers: {
    default: {
      name: 'Magnus Devnet Explorer',
      url: 'https://devnet.magnuschain.xyz'
    }
  },
  testnet: true
})

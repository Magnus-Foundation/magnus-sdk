import { defineChain } from 'viem'

const nativeCurrency = {
  name: 'MagnusUSD',
  symbol: 'mUSD',
  decimals: 6,
} as const

// Note: viem's defineChain expects serializers.transaction to match its standard
// TransactionSerializable union (legacy / EIP-1559 / EIP-2930 / EIP-7702). Magnus
// transactions are shape-incompatible (calls[] in place of single to/data, plus
// fee_token / nonce_key / valid_before-after / key_authorization fields). Until we
// ship a viem-shaped adapter (v0.2), consumers call `serializeMagnusTransaction`
// directly — see DESIGN.md §13 "Defer to v0.2".

export const magnus = defineChain({
  id: 7777,
  name: 'Magnus',
  nativeCurrency,
  rpcUrls: {
    default: { http: ['https://rpc.magnus.example/'] },
  },
  blockExplorers: {
    default: { name: 'Magnus Explorer', url: 'https://explorer.magnus.example/' },
  },
})

export const magnusTestnet = defineChain({
  id: 7776,
  name: 'Magnus Testnet',
  nativeCurrency,
  rpcUrls: {
    default: { http: ['https://rpc.testnet.magnus.example/'] },
  },
  blockExplorers: {
    default: {
      name: 'Magnus Testnet Explorer',
      url: 'https://explorer.testnet.magnus.example/',
    },
  },
  testnet: true,
})

export const magnusDevnet = defineChain({
  id: 73730,
  name: 'Magnus Devnet (Staccato)',
  nativeCurrency,
  rpcUrls: {
    default: { http: ['http://rpc.staccato.magnuschain.xyz:8545'] },
  },
  blockExplorers: {
    default: {
      name: 'Magnus Devnet Explorer',
      url: 'https://devnet.magnuschain.xyz',
    },
  },
  testnet: true,
})

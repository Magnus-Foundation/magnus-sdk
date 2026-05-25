// Builds the EIP-712 typed-data for an ERC-2612 Permit signature. Output is
// shaped for `eth_signTypedData_v4` (bigints become decimal strings, no
// native viem types in the wire payload). Matches the digest computed in
// mips/ref-impls/test/bridge/LockWithPermit.t.sol::_signERC2612Permit so
// the resulting (v, r, s) satisfies the token's permit() check.

import type { Address } from 'viem'

export interface Erc2612Args {
  tokenName: string
  tokenVersion: string
  chainId: number
  tokenAddress: Address
  owner: Address
  spender: Address
  value: bigint
  nonce: bigint
  deadline: bigint
}

export interface Erc2612TypedData {
  primaryType: 'Permit'
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: Address
  }
  types: {
    EIP712Domain: Array<{ name: string; type: string }>
    Permit: Array<{ name: string; type: string }>
  }
  message: {
    owner: Address
    spender: Address
    value: string
    nonce: string
    deadline: string
  }
}

const PERMIT_FIELDS = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

const DOMAIN_FIELDS = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

export function buildErc2612TypedData(args: Erc2612Args): Erc2612TypedData {
  return {
    primaryType: 'Permit',
    domain: {
      name: args.tokenName,
      version: args.tokenVersion,
      chainId: args.chainId,
      verifyingContract: args.tokenAddress,
    },
    types: {
      EIP712Domain: DOMAIN_FIELDS,
      Permit: PERMIT_FIELDS,
    },
    message: {
      owner: args.owner,
      spender: args.spender,
      value: args.value.toString(10),
      nonce: args.nonce.toString(10),
      deadline: args.deadline.toString(10),
    },
  }
}

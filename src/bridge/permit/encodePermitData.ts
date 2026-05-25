// Encodes the PermitData envelope the bridge contract expects. ERC-2612
// flavor: payload = abi.encode(depositor, nonce, deadline) concatenated
// with abi.encode(v, r, s, permitDeadline). Matches the Solidity reference
// mips/ref-impls/test/bridge/LockWithPermit.t.sol::_makePermitData and the
// rust sidecar example bin/magnus-sidecar/examples/deposit_lock_with_permit.rs.

import { encodeAbiParameters, type Address, type Hex } from 'viem'
import type { PermitEnvelope } from './types'

export interface Erc2612PermitFields {
  depositor: Address
  intentNonce: bigint
  intentDeadline: bigint
  v: number
  r: Hex
  s: Hex
  permitDeadline: bigint
}

export function encodeErc2612PermitData(fields: Erc2612PermitFields): PermitEnvelope {
  const head = encodeAbiParameters(
    [
      { name: 'depositor', type: 'address' },
      { name: 'intentNonce', type: 'uint256' },
      { name: 'intentDeadline', type: 'uint256' },
    ],
    [fields.depositor, fields.intentNonce, fields.intentDeadline]
  )
  const tail = encodeAbiParameters(
    [
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
      { name: 'permitDeadline', type: 'uint256' },
    ],
    [fields.v, fields.r, fields.s, fields.permitDeadline]
  )
  return {
    isPermit2: false,
    payload: ('0x' + head.slice(2) + tail.slice(2)) as Hex,
  }
}

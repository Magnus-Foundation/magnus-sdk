import { describe, it, expect } from 'vitest'
import { encodeErc2612PermitData } from '../permit/encodePermitData'

describe('encodeErc2612PermitData', () => {
  it('produces { isPermit2: false, payload = head(48 bytes head selector + 96 data) }', () => {
    const out = encodeErc2612PermitData({
      depositor: '0x4db40bbe78971f285cba9afd9f156c315850c8f3',
      intentNonce: 1n,
      intentDeadline: 1716643200n,
      v: 27,
      r: '0x1111111111111111111111111111111111111111111111111111111111111111',
      s: '0x2222222222222222222222222222222222222222222222222222222222222222',
      permitDeadline: 1716643200n,
    })
    expect(out.isPermit2).toBe(false)
    expect(out.payload.length).toBe(2 + 224 * 2)
    expect(out.payload.startsWith('0x')).toBe(true)
  })

  it('encodes the intent head with the depositor in the low 20 bytes of a 32-byte word', () => {
    const out = encodeErc2612PermitData({
      depositor: '0x4db40bbe78971f285cba9afd9f156c315850c8f3',
      intentNonce: 1n,
      intentDeadline: 0n,
      v: 0,
      r: '0x0000000000000000000000000000000000000000000000000000000000000000',
      s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      permitDeadline: 0n,
    })
    expect(out.payload.slice(2, 2 + 64)).toBe(
      '000000000000000000000000' + '4db40bbe78971f285cba9afd9f156c315850c8f3'
    )
  })
})

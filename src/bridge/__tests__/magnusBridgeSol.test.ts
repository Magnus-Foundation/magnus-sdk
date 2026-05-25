import { describe, it, expect } from 'vitest'
import { magnusBridgeSolAbi } from '../magnusBridgeSol'

describe('magnusBridgeSolAbi', () => {
  it('exposes lockWithPermit with the canonical tuple input shape', () => {
    const fn = magnusBridgeSolAbi.find(
      (item: any) => item.type === 'function' && item.name === 'lockWithPermit'
    ) as any
    expect(fn).toBeDefined()
    expect(fn.inputs.map((i: any) => i.name)).toEqual([
      'token',
      'amount',
      'magnusRecipient',
      'relayerFee',
      'permit',
      'userIntentSig',
    ])
    const permit = fn.inputs[4]
    expect(permit.type).toBe('tuple')
    expect(permit.components.map((c: any) => c.name)).toEqual(['isPermit2', 'payload'])
  })

  it('exposes lock for users paying their own Hoodi gas (Path A on-chain variant)', () => {
    const fn = magnusBridgeSolAbi.find(
      (item: any) => item.type === 'function' && item.name === 'lock'
    ) as any
    expect(fn).toBeDefined()
    expect(fn.inputs.map((i: any) => i.name)).toEqual(['token', 'amount', 'magnusRecipient'])
  })

  it('exposes the Locked event for validator + saga reconciliation', () => {
    const ev = magnusBridgeSolAbi.find(
      (item: any) => item.type === 'event' && item.name === 'Locked'
    ) as any
    expect(ev).toBeDefined()
    expect(ev.inputs.map((i: any) => i.name)).toEqual([
      'intentHash',
      'depositor',
      'token',
      'amount',
      'magnusRecipient',
    ])
  })
})

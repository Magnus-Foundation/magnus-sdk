import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import type { Hex } from 'viem'

import type { Call, MagnusTransaction } from '../../src/transaction/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export type GoldenCallJson = {
  to: string | null
  value: string
  input: string
}

export type GoldenTxInputJson = {
  chainId: number
  maxPriorityFeePerGas: string
  maxFeePerGas: string
  gas: string
  calls: GoldenCallJson[]
  accessList: unknown[]
  nonceKey: string
  nonce: string
  validBefore: string | null
  validAfter: string | null
  feeToken: string | null
  magnusAuthorizationList: unknown[]
}

export type GoldenFixture = {
  name: string
  description: string
  tx_input: GoldenTxInputJson
  signing_hex: Hex
  signature_hash: Hex
  wire_hex: Hex
  tx_hash: Hex
  signature_bytes: Hex
}

export type GoldenFile = {
  version: number
  chainId: number
  magnusTxTypeByte: Hex
  senderAddress: Hex
  fixtures: GoldenFixture[]
}

export function loadGolden(): GoldenFile {
  const path = resolve(__dirname, 'vectors.json')
  const raw = readFileSync(path, 'utf8')
  return JSON.parse(raw) as GoldenFile
}

export function callsFromJson(calls: GoldenCallJson[]): Call[] {
  return calls.map((c) => ({
    to: c.to == null ? null : (c.to.toLowerCase() as `0x${string}`),
    value: BigInt(c.value),
    input: c.input as Hex,
  }))
}

export function txFromJson(input: GoldenTxInputJson): MagnusTransaction {
  return {
    chainId: input.chainId,
    maxPriorityFeePerGas: BigInt(input.maxPriorityFeePerGas),
    maxFeePerGas: BigInt(input.maxFeePerGas),
    gas: BigInt(input.gas),
    calls: callsFromJson(input.calls),
    accessList: [],
    nonceKey: BigInt(input.nonceKey),
    nonce: BigInt(input.nonce),
    validBefore: input.validBefore == null ? null : BigInt(input.validBefore),
    validAfter: input.validAfter == null ? null : BigInt(input.validAfter),
    feeToken: input.feeToken == null ? null : (input.feeToken.toLowerCase() as `0x${string}`),
    feePayerSignature: null,
    magnusAuthorizationList: [],
    keyAuthorization: null,
  }
}

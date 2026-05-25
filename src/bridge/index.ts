// src/bridge/index.ts
export { magnusBridgeSolAbi } from './magnusBridgeSol'
export type {
  PermitEnvelope,
  MbsIntent,
  RelayerSubmission,
  RelayerAccepted,
  RelayerError,
  IntentStatus,
} from './permit/types'
export { buildErc2612TypedData } from './permit/erc2612TypedData'
export type { Erc2612Args, Erc2612TypedData } from './permit/erc2612TypedData'
export { buildIntentTypedData, INTENT_FIELDS } from './permit/intentTypedData'
export type { IntentTypedData } from './permit/intentTypedData'
export { encodeErc2612PermitData } from './permit/encodePermitData'
export type { Erc2612PermitFields } from './permit/encodePermitData'
export { recoverIntentSigner } from './permit/recoverIntentSigner'

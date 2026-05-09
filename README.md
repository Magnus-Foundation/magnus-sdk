# `@magnus/sdk`

JavaScript SDK for the **Magnus** stablecoin chain. Chain definitions,
type-`0x76` transaction serializer, custom JSON-RPC actions, precompile ABIs,
and locale-aware formatting — everything a wallet, dApp, or backend needs to
talk to Magnus.

> Apache-2.0 · Built on top of [viem](https://viem.sh) · Byte-compatible with
> the Rust source of truth (`magnus-primitives`).

---

## Why this package

Magnus introduces a custom EIP-2718 transaction type (`0x76`) with fields no
standard library encodes correctly:

- `calls[]` — a multi-call atomic batch in place of single `to`/`data`.
- `feeToken` — pay gas in any MIP-20 stablecoin (mUSD, mEUR, mVND, …).
- `nonceKey` — 2-D nonces for parallel transaction submission.
- `validBefore` / `validAfter` — scheduled expiry windows.
- `keyAuthorization` — provision a P256 / WebAuthn key in the same tx.
- `magnusAuthorizationList` — EIP-7702-style delegations with Magnus signatures.

Without this SDK, every wallet would silently miss `feeToken` and gas would
default to mUSD via the fallback cascade. With it, one import gives any
viem-based wallet correct Magnus support.

## Install

```bash
pnpm add @magnus/sdk viem
```

`viem ^2.20.0` is a peer dependency.

## Quick start

### 1. Read state from a chain definition

```ts
import { createPublicClient, http } from 'viem'
import { magnus, magnusDevnet } from '@magnus/sdk'

const client = createPublicClient({
  chain: magnusDevnet,         // or `magnus` / `magnusTestnet`
  transport: http(),
})

const block = await client.getBlock()
```

### 2. Build, sign, and broadcast a Magnus transaction

```ts
import { createPublicClient, http, keccak256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  MAGNUS_USD_ADDRESS,
  encodeMagnusSignature,
  getMagnusSignatureHash,
  magnus,
  serializeMagnusTransaction,
} from '@magnus/sdk'
import { encodeFunctionData, parseEther } from 'viem'
import { mip20Abi } from '@magnus/sdk'

const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY_HEX')
const recipient = '0x000000000000000000000000000000000000beef'

const tx = {
  chainId: magnus.id,
  maxPriorityFeePerGas: 1_000_000_000n,
  maxFeePerGas: 40_000_000_000n,
  gas: 100_000n,
  nonce: 0n,
  calls: [{
    to: MAGNUS_USD_ADDRESS,
    value: 0n,
    input: encodeFunctionData({
      abi: mip20Abi,
      functionName: 'transfer',
      args: [recipient, 100_000_000n],   // 100 mUSD (6 decimals)
    }),
  }],
}

// 1. Hash the transaction the same way the chain does
const sigHash = getMagnusSignatureHash(tx)

// 2. Sign with secp256k1 (any signer that produces { r, s, v } works)
const sig = await account.sign({ hash: sigHash })

// 3. Encode the signature into Magnus's byte layout
const signatureBytes = encodeMagnusSignature({
  kind: 'secp256k1',
  r: ('0x' + sig.slice(2, 66)) as `0x${string}`,
  s: ('0x' + sig.slice(66, 130)) as `0x${string}`,
  v: parseInt(sig.slice(130, 132), 16),
})

// 4. Produce the broadcast bytes
const wire = serializeMagnusTransaction(
  { ...tx, signature: signatureBytes },
  { purpose: 'tx-on-wire', signature: signatureBytes },
)

const client = createPublicClient({ chain: magnus, transport: http() })
const txHash = await client.request({ method: 'eth_sendRawTransaction', params: [wire] })
```

### 3. Pay gas in mVND while sending mUSD

The SDK's `feeToken` field is the only addition over a plain transfer:

```ts
const VND_TOKEN = '0x...' // looked up on-chain via MIP403_REGISTRY

const tx = {
  // ...same fields as above
  feeToken: VND_TOKEN,
}
```

The serializer emits a type-`0x76` payload with `fee_token` in the right RLP
slot. The chain charges gas in mVND using the FX rate from the FeeManager
precompile.

### 4. Read live FX rates

```ts
import { createPublicClient, http } from 'viem'
import { magnus, magnusActions } from '@magnus/sdk'

const client = createPublicClient({ chain: magnus, transport: http() })
  .extend(magnusActions())

const vnd = await client.getFxRate('VND')
// → { currency: 'VND', numerator: 24000000000000n, denominator: 1000000000n, ok: true }

const all = await client.getActiveFxRates()
// → [{ currency: 'USD', ... }, { currency: 'EUR', ... }, { currency: 'VND', ... }]
```

`numerator` / `denominator` are returned as `bigint` to avoid JS-number
precision loss (the underlying RPC sends decimal strings).

### 5. Format balances per locale

```ts
import { formatBalance, formatFee, parseAmount } from '@magnus/sdk'

formatBalance(1_000_000n, 'mUSD', { locale: 'en-US' })           // "$1.00"
formatBalance(1_234_567_000_000n, 'mVND', { locale: 'vi-VN' })   // "1.234.567 ₫"
formatBalance(1_000_000n, 'mEUR', { locale: 'de-DE' })           // "1,00 €"

formatFee(230_000n, 'mVND', { locale: 'vi-VN' })                 // "0 ₫"

parseAmount('1.234,56', { locale: 'de-DE', decimals: 6 })        // 1_234_560_000n
```

Supported locales: `vi-VN`, `id-ID`, `tl-PH`, `th-TH`, `en-US`, `de-DE`.

## Public API

```ts
import {
  // Chains
  magnus, magnusTestnet, magnusDevnet,

  // Transaction codec
  serializeMagnusTransaction, parseMagnusTransaction,
  getMagnusSignatureHash, getMagnusTransactionHash,
  type MagnusTransaction, type MagnusSignedTransaction, type Call,

  // Signature codec
  encodeMagnusSignature, parseMagnusSignature,
  type DecodedMagnusSignature,

  // Precompiles
  MIP_FEE_MANAGER_ADDRESS, MAGNUS_USD_ADDRESS,
  feeManagerAbi, mip20Abi,

  // RPC
  magnusActions, type MagnusActions, type FxRateInfo,

  // Formatting
  formatBalance, formatFee, parseAmount, convertCurrency,

  // Constants
  MAGNUS_TX_TYPE,            // 0x76
  MAGNUS_NATIVE_DECIMALS,    // 6
} from '@magnus/sdk'
```

See [`DESIGN.md`](./DESIGN.md) for the authoritative module layout, wire-format
spec, and v0.2 roadmap.

## Compatibility

| Aspect | Value |
|---|---|
| Wire format | Magnus type-`0x76`, byte-identical to `magnus-primitives` Rust crate |
| Test oracle | 4 golden vectors generated by `cargo run -p magnus-primitives --example dump_golden` |
| Bundles | ESM + CJS via tsup. `~30 KB` minified-equivalent surface |
| Tree-shakable | Per-field re-exports under `index.ts`; sub-path exports planned for v0.2 |
| Min Node | 18 LTS (matches React Native and modern wallets) |

## Out of scope (deferred to v0.2)

- React hooks (`@magnus/react` — separate package)
- `fee-payer-signing` hash variant (sponsorship UX)
- Native iOS/Android bindings (RN consumes JS directly)
- WebAuthn + Keychain *signing* helpers (v0.1 only encodes/decodes them)

## Development

```bash
pnpm install
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest — 58 tests across 6 files
pnpm build        # tsup → dist/{esm,cjs,dts}
```

To regenerate golden vectors after a wire-format change, in the Magnus chain
repo:

```bash
cargo run -p magnus-primitives --example dump_golden \
  -- --out /path/to/magnus-sdk/tests/golden/vectors.json
```

Then re-run `pnpm test` here.

## License

Apache-2.0

/**
 * Primitive type aliases that the SDK re-exports through its public API.
 *
 * Defined locally (not re-exported from viem) so consumers whose toolchain
 * predates viem's TS 5.x type syntax (notably SubWallet's pinned TS 4.8.4)
 * can use `@magnus/sdk` without their tsc choking on viem's d.ts files.
 *
 * These match viem's `Address` and `Hex` shape exactly — `0x`-prefixed hex
 * template literal strings — so a project that does use viem can interop
 * without casts (TypeScript treats structurally-equivalent template literal
 * types as interchangeable).
 */

export type Address = `0x${string}`
export type Hex = `0x${string}`

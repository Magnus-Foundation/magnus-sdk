/**
 * Minimal Magnus chain shape exported in the SDK's public API.
 *
 * Annotated explicitly (rather than inferred from viem's `Chain` type) so the
 * emitted d.ts has no `import * as viem from 'viem'`. That keeps consumers
 * whose toolchain predates viem's TS 5.x type syntax (notably SubWallet's
 * pinned TS 4.8.4) from choking on viem's d.ts files.
 */
type MagnusChain = {
    readonly id: number;
    readonly name: string;
    readonly nativeCurrency: {
        readonly name: string;
        readonly symbol: string;
        readonly decimals: number;
    };
    readonly rpcUrls: {
        readonly default: {
            readonly http: readonly string[];
        };
    };
    readonly blockExplorers: {
        readonly default: {
            readonly name: string;
            readonly url: string;
        };
    };
    readonly testnet?: boolean | undefined;
};
declare const magnus: MagnusChain;
declare const magnusTestnet: MagnusChain;
declare const magnusDevnet: MagnusChain;

export { magnus, magnusDevnet, magnusTestnet };

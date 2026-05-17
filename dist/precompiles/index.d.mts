export { A as ACCOUNT_KEYCHAIN_ADDRESS, a as ADDRESS_REGISTRY_ADDRESS, C as CROSS_FX_PSM_ADDRESS, M as MAGNUS_USD_ADDRESS, b as MIP20_FACTORY_ADDRESS, c as MIP20_ISSUER_REGISTRY_ADDRESS, d as MIP403_REGISTRY_ADDRESS, e as MIP_FEE_MANAGER_ADDRESS, N as NONCE_PRECOMPILE_ADDRESS, S as SIGNATURE_VERIFIER_ADDRESS, f as STABLECOIN_DEX_ADDRESS, V as VALIDATOR_CONFIG_ADDRESS, g as VALIDATOR_CONFIG_V2_ADDRESS, h as feeManagerAbi, m as mip20Abi } from '../mip20-D6nnaXty.mjs';
import '../types-prim-BlJ081zG.mjs';

/**
 * Cross-FX PSM precompile — oracle-priced stable↔stable swaps between
 * MIP-20 fiat tokens (mUSD ↔ mEUR ↔ mVND). v0.1 SDK surface for wallets and
 * dApps: quote, swap, and the user-facing errors a swap UI needs to decode.
 *
 * Governance/admin surface (addPair, registerStableToken, setSolvencyDisabled,
 * ...) is intentionally omitted — only the Foundation calls those.
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/cross_fx_psm.rs`.
 */
declare const crossFxPSMAbi: readonly [{
    readonly type: "function";
    readonly name: "quoteExactIn";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }, {
        readonly type: "uint128";
        readonly name: "amountIn";
    }];
    readonly outputs: readonly [{
        readonly type: "uint128";
        readonly name: "amountOut";
    }];
}, {
    readonly type: "function";
    readonly name: "quoteExactOut";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }, {
        readonly type: "uint128";
        readonly name: "amountOut";
    }];
    readonly outputs: readonly [{
        readonly type: "uint128";
        readonly name: "amountIn";
    }];
}, {
    readonly type: "function";
    readonly name: "getPairConfig";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly name: "";
        readonly components: readonly [{
            readonly type: "bool";
            readonly name: "registered";
        }, {
            readonly type: "bool";
            readonly name: "enabled";
        }, {
            readonly type: "bool";
            readonly name: "paused";
        }, {
            readonly type: "uint16";
            readonly name: "spreadBps";
        }, {
            readonly type: "address";
            readonly name: "baseToken";
        }, {
            readonly type: "address";
            readonly name: "quoteToken";
        }];
    }];
}, {
    readonly type: "function";
    readonly name: "isStableTokenRegistered";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "swapExactIn";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }, {
        readonly type: "uint128";
        readonly name: "amountIn";
    }, {
        readonly type: "uint128";
        readonly name: "minAmountOut";
    }];
    readonly outputs: readonly [{
        readonly type: "uint128";
        readonly name: "amountOut";
    }];
}, {
    readonly type: "function";
    readonly name: "swapExactOut";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }, {
        readonly type: "uint128";
        readonly name: "amountOut";
    }, {
        readonly type: "uint128";
        readonly name: "maxAmountIn";
    }];
    readonly outputs: readonly [{
        readonly type: "uint128";
        readonly name: "amountIn";
    }];
}, {
    readonly type: "event";
    readonly name: "Swap";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "from";
        readonly indexed: true;
    }, {
        readonly type: "string";
        readonly name: "baseIn";
        readonly indexed: false;
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
        readonly indexed: false;
    }, {
        readonly type: "uint128";
        readonly name: "amountIn";
        readonly indexed: false;
    }, {
        readonly type: "uint128";
        readonly name: "amountOut";
        readonly indexed: false;
    }, {
        readonly type: "uint128";
        readonly name: "rateNum";
        readonly indexed: false;
    }, {
        readonly type: "uint128";
        readonly name: "rateDen";
        readonly indexed: false;
    }, {
        readonly type: "uint16";
        readonly name: "spreadBps";
        readonly indexed: false;
    }];
}, {
    readonly type: "error";
    readonly name: "SlippageExceeded";
    readonly inputs: readonly [{
        readonly type: "uint128";
        readonly name: "expected";
    }, {
        readonly type: "uint128";
        readonly name: "actual";
    }];
}, {
    readonly type: "error";
    readonly name: "PairNotRegistered";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }];
}, {
    readonly type: "error";
    readonly name: "PairCurrentlyDisabled";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }];
}, {
    readonly type: "error";
    readonly name: "PairCurrentlyPaused";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }];
}, {
    readonly type: "error";
    readonly name: "OracleUnavailable";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "code";
    }];
}, {
    readonly type: "error";
    readonly name: "L0LimitExceeded";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }, {
        readonly type: "address";
        readonly name: "token";
    }];
}, {
    readonly type: "error";
    readonly name: "L1LimitExceeded";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "baseIn";
    }, {
        readonly type: "string";
        readonly name: "quoteOut";
    }, {
        readonly type: "address";
        readonly name: "token";
    }];
}, {
    readonly type: "error";
    readonly name: "InsufficientReserveBacking";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "backingUsd";
    }, {
        readonly type: "uint256";
        readonly name: "liabilitiesUsd";
    }];
}, {
    readonly type: "error";
    readonly name: "MathOverflow";
    readonly inputs: readonly [];
}];

export { crossFxPSMAbi };

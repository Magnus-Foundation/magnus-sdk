import { A as Address } from '../types-prim-BlJ081zG.mjs';

/**
 * Canonical Magnus precompile addresses.
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/mod.rs`. These are
 * fixed-address precompiles wired into the EVM at chain genesis.
 */
declare const MIP_FEE_MANAGER_ADDRESS: Address;
declare const MAGNUS_USD_ADDRESS: Address;
declare const MIP20_FACTORY_ADDRESS: Address;
declare const MIP20_ISSUER_REGISTRY_ADDRESS: Address;
declare const MIP403_REGISTRY_ADDRESS: Address;
declare const STABLECOIN_DEX_ADDRESS: Address;
declare const CROSS_FX_PSM_ADDRESS: Address;
declare const NONCE_PRECOMPILE_ADDRESS: Address;
declare const VALIDATOR_CONFIG_ADDRESS: Address;
declare const VALIDATOR_CONFIG_V2_ADDRESS: Address;
declare const ACCOUNT_KEYCHAIN_ADDRESS: Address;
declare const ADDRESS_REGISTRY_ADDRESS: Address;
declare const SIGNATURE_VERIFIER_ADDRESS: Address;

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

/**
 * MIP-FeeManager precompile — the read-only views dApps and wallets need.
 *
 * Mutating functions (governance, validator registration, fee distribution)
 * are intentionally omitted from this v0.1 SDK ABI; they're not in the
 * wallet/dApp use case. Add them later if a tool needs to call them.
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/mip_fee_manager.rs`.
 */
declare const feeManagerAbi: readonly [{
    readonly type: "function";
    readonly name: "medianFxRate";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "code";
    }];
    readonly outputs: readonly [{
        readonly type: "uint128";
        readonly name: "numerator";
    }, {
        readonly type: "uint128";
        readonly name: "denominator";
    }, {
        readonly type: "bool";
        readonly name: "ok";
    }];
}, {
    readonly type: "function";
    readonly name: "getAcceptedTokens";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "validator";
    }];
    readonly outputs: readonly [{
        readonly type: "address[]";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "acceptsToken";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "validator";
    }, {
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "isAcceptedByAnyValidator";
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
    readonly name: "isCurrencyEnabled";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "code";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "event";
    readonly name: "FxRateReported";
    readonly inputs: readonly [{
        readonly type: "string";
        readonly name: "code";
        readonly indexed: false;
    }, {
        readonly type: "address";
        readonly name: "reporter";
        readonly indexed: true;
    }, {
        readonly type: "uint128";
        readonly name: "numerator";
        readonly indexed: false;
    }, {
        readonly type: "uint128";
        readonly name: "denominator";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "AcceptedTokenAdded";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "validator";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }];
}, {
    readonly type: "event";
    readonly name: "AcceptedTokenRemoved";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "validator";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }];
}];

/**
 * MIP-20 token ABI — superset of ERC-20 with Magnus-specific metadata + memo
 * variants. Use this for any stablecoin issued via the MIP-20 factory
 * (mUSD, mEUR, mVND, ...).
 *
 * Source: `magnus/crates/evm/contracts/src/precompiles/mip20.rs`.
 */
declare const mip20Abi: readonly [{
    readonly type: "function";
    readonly name: "name";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "symbol";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "decimals";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "totalSupply";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "balanceOf";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "account";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "transfer";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "approve";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "transferFrom";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "from";
    }, {
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "currency";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "paused";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "function";
    readonly name: "transferWithMemo";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }, {
        readonly type: "bytes32";
        readonly name: "memo";
    }];
    readonly outputs: readonly [];
}, {
    readonly type: "function";
    readonly name: "transferFromWithMemo";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "from";
    }, {
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }, {
        readonly type: "bytes32";
        readonly name: "memo";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
        readonly name: "";
    }];
}, {
    readonly type: "event";
    readonly name: "Transfer";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "from";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "to";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "value";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "Approval";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "spender";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "value";
        readonly indexed: false;
    }];
}];

export { ACCOUNT_KEYCHAIN_ADDRESS, ADDRESS_REGISTRY_ADDRESS, CROSS_FX_PSM_ADDRESS, MAGNUS_USD_ADDRESS, MIP20_FACTORY_ADDRESS, MIP20_ISSUER_REGISTRY_ADDRESS, MIP403_REGISTRY_ADDRESS, MIP_FEE_MANAGER_ADDRESS, NONCE_PRECOMPILE_ADDRESS, SIGNATURE_VERIFIER_ADDRESS, STABLECOIN_DEX_ADDRESS, VALIDATOR_CONFIG_ADDRESS, VALIDATOR_CONFIG_V2_ADDRESS, crossFxPSMAbi, feeManagerAbi, mip20Abi };

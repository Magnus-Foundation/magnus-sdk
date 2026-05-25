import { Hex, Address } from 'viem';

declare const magnusBridgeSolAbi: readonly [{
    readonly type: "function";
    readonly name: "lockWithPermit";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "magnusRecipient";
        readonly type: "bytes20";
    }, {
        readonly name: "relayerFee";
        readonly type: "uint256";
    }, {
        readonly name: "permit";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "isPermit2";
            readonly type: "bool";
        }, {
            readonly name: "payload";
            readonly type: "bytes";
        }];
    }, {
        readonly name: "userIntentSig";
        readonly type: "bytes";
    }];
    readonly outputs: readonly [];
}, {
    readonly type: "function";
    readonly name: "lock";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "magnusRecipient";
        readonly type: "bytes20";
    }];
    readonly outputs: readonly [];
}, {
    readonly type: "event";
    readonly name: "Locked";
    readonly inputs: readonly [{
        readonly name: "intentHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "depositor";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "magnusRecipient";
        readonly type: "bytes20";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}];

/** Matches IMagnusBridge.PermitData. v1 emits isPermit2=false. */
interface PermitEnvelope {
    isPermit2: boolean;
    /** ABI-encoded payload. ERC-2612 layout:
     *  abi.encode(depositor, intentNonce, intentDeadline) || abi.encode(v, r, s, permitDeadline) */
    payload: Hex;
}
/** Intent fields the user signs (EIP-712 Intent type). Must match the
 *  bridge's on-chain Intent struct one-for-one or ecrecover fails. */
interface MbsIntent {
    depositor: Address;
    token: Address;
    amount: bigint;
    /** 20-byte hex (0x-prefixed). The Magnus recipient address. */
    magnusRecipient: Hex;
    relayerFee: bigint;
    nonce: bigint;
    deadline: bigint;
}
/** POST /v1/inbound/permit request body. */
interface RelayerSubmission {
    srcChainId: number;
    token: Address;
    /** Decimal string in token base units (avoids JSON precision loss). */
    amount: string;
    magnusRecipient: Hex;
    relayerFee: string;
    permit: PermitEnvelope;
    /** 65-byte ECDSA signature (r || s || v). */
    userIntentSig: Hex;
}
/** 200 OK. */
interface RelayerAccepted {
    intentHash: Hex;
    submittedTxHash: Hex;
}
/** 4xx / 5xx envelope. */
interface RelayerError {
    error: 'INSUFFICIENT_BALANCE' | 'BAD_PERMIT_SIG' | 'BAD_INTENT_SIG' | 'STALE_DEADLINE' | 'RELAYER_DOWN' | 'HOODI_RPC_ERROR';
    message: string;
}
/** GET /v1/inbound/permit/:intentHash response. */
type IntentStatus = {
    status: 'submitted';
    lockTxHash: Hex;
} | {
    status: 'locked';
    lockTxHash: Hex;
} | {
    status: 'finalized';
    lockTxHash: Hex;
    finalizeTxHash: Hex;
} | {
    status: 'failed';
    error: string;
};

interface Erc2612Args {
    tokenName: string;
    tokenVersion: string;
    chainId: number;
    tokenAddress: Address;
    owner: Address;
    spender: Address;
    value: bigint;
    nonce: bigint;
    deadline: bigint;
}
interface Erc2612TypedData {
    primaryType: 'Permit';
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: Address;
    };
    types: {
        EIP712Domain: Array<{
            name: string;
            type: string;
        }>;
        Permit: Array<{
            name: string;
            type: string;
        }>;
    };
    message: {
        owner: Address;
        spender: Address;
        value: string;
        nonce: string;
        deadline: string;
    };
}
declare function buildErc2612TypedData(args: Erc2612Args): Erc2612TypedData;

interface IntentTypedData {
    primaryType: 'Intent';
    domain: {
        name: 'MagnusBridge';
        version: '1';
        chainId: number;
        verifyingContract: Address;
    };
    types: {
        EIP712Domain: Array<{
            name: string;
            type: string;
        }>;
        Intent: Array<{
            name: string;
            type: string;
        }>;
    };
    message: {
        depositor: Address;
        token: Address;
        amount: string;
        magnusRecipient: string;
        relayerFee: string;
        nonce: string;
        deadline: string;
    };
}
declare const INTENT_FIELDS: readonly [{
    readonly name: "depositor";
    readonly type: "address";
}, {
    readonly name: "token";
    readonly type: "address";
}, {
    readonly name: "amount";
    readonly type: "uint256";
}, {
    readonly name: "magnusRecipient";
    readonly type: "bytes20";
}, {
    readonly name: "relayerFee";
    readonly type: "uint256";
}, {
    readonly name: "nonce";
    readonly type: "uint256";
}, {
    readonly name: "deadline";
    readonly type: "uint256";
}];
declare function buildIntentTypedData(args: {
    bridgeAddress: Address;
    chainId: number;
    intent: MbsIntent;
}): IntentTypedData;

interface Erc2612PermitFields {
    depositor: Address;
    intentNonce: bigint;
    intentDeadline: bigint;
    v: number;
    r: Hex;
    s: Hex;
    permitDeadline: bigint;
}
declare function encodeErc2612PermitData(fields: Erc2612PermitFields): PermitEnvelope;

declare function recoverIntentSigner(args: {
    bridgeAddress: Address;
    chainId: number;
    intent: MbsIntent;
    sig: Hex;
}): Promise<Address>;

export { type Erc2612Args, type Erc2612PermitFields, type Erc2612TypedData, INTENT_FIELDS, type IntentStatus, type IntentTypedData, type MbsIntent, type PermitEnvelope, type RelayerAccepted, type RelayerError, type RelayerSubmission, buildErc2612TypedData, buildIntentTypedData, encodeErc2612PermitData, magnusBridgeSolAbi, recoverIntentSigner };

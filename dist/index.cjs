"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ACCOUNT_KEYCHAIN_ADDRESS: () => ACCOUNT_KEYCHAIN_ADDRESS,
  ADDRESS_REGISTRY_ADDRESS: () => ADDRESS_REGISTRY_ADDRESS,
  CROSS_FX_PSM_ADDRESS: () => CROSS_FX_PSM_ADDRESS,
  FEE_PAYER_SIGNATURE_MAGIC_BYTE: () => FEE_PAYER_SIGNATURE_MAGIC_BYTE,
  MAGNUS_BRIDGE_ADDRESS: () => MAGNUS_BRIDGE_ADDRESS,
  MAGNUS_EXPIRING_NONCE_KEY: () => MAGNUS_EXPIRING_NONCE_KEY,
  MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS: () => MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS,
  MAGNUS_NATIVE_DECIMALS: () => MAGNUS_NATIVE_DECIMALS,
  MAGNUS_RPC_METHODS: () => MAGNUS_RPC_METHODS,
  MAGNUS_TX_TYPE: () => MAGNUS_TX_TYPE,
  MAGNUS_USD_ADDRESS: () => MAGNUS_USD_ADDRESS,
  MAX_WEBAUTHN_SIGNATURE_LENGTH: () => MAX_WEBAUTHN_SIGNATURE_LENGTH,
  MIP20_FACTORY_ADDRESS: () => MIP20_FACTORY_ADDRESS,
  MIP20_ISSUER_REGISTRY_ADDRESS: () => MIP20_ISSUER_REGISTRY_ADDRESS,
  MIP403_REGISTRY_ADDRESS: () => MIP403_REGISTRY_ADDRESS,
  MIP_FEE_MANAGER_ADDRESS: () => MIP_FEE_MANAGER_ADDRESS,
  NONCE_PRECOMPILE_ADDRESS: () => NONCE_PRECOMPILE_ADDRESS,
  P256_SIGNATURE_LENGTH: () => P256_SIGNATURE_LENGTH,
  SECP256K1_SIGNATURE_LENGTH: () => SECP256K1_SIGNATURE_LENGTH,
  SIGNATURE_TYPE_KEYCHAIN: () => SIGNATURE_TYPE_KEYCHAIN,
  SIGNATURE_TYPE_KEYCHAIN_V2: () => SIGNATURE_TYPE_KEYCHAIN_V2,
  SIGNATURE_TYPE_P256: () => SIGNATURE_TYPE_P256,
  SIGNATURE_TYPE_WEBAUTHN: () => SIGNATURE_TYPE_WEBAUTHN,
  SIGNATURE_VERIFIER_ADDRESS: () => SIGNATURE_VERIFIER_ADDRESS,
  STABLECOIN_DEX_ADDRESS: () => STABLECOIN_DEX_ADDRESS,
  VALIDATOR_CONFIG_ADDRESS: () => VALIDATOR_CONFIG_ADDRESS,
  VALIDATOR_CONFIG_V2_ADDRESS: () => VALIDATOR_CONFIG_V2_ADDRESS,
  convertCurrency: () => convertCurrency,
  crossFxPSMAbi: () => crossFxPSMAbi,
  decodeFxRateInfo: () => decodeFxRateInfo,
  encodeMagnusSignature: () => encodeMagnusSignature,
  feeManagerAbi: () => feeManagerAbi,
  formatBalance: () => formatBalance,
  formatFee: () => formatFee,
  getMagnusFeePayerSignatureHash: () => getMagnusFeePayerSignatureHash,
  getMagnusSignatureHash: () => getMagnusSignatureHash,
  getMagnusTransactionHash: () => getMagnusTransactionHash,
  magnus: () => magnus,
  magnusActions: () => magnusActions,
  magnusBridgeAbi: () => magnusBridgeAbi,
  magnusDevnet: () => magnusDevnet,
  magnusTestnet: () => magnusTestnet,
  mip20Abi: () => mip20Abi,
  parseAmount: () => parseAmount,
  parseMagnusSignature: () => parseMagnusSignature,
  parseMagnusTransaction: () => parseMagnusTransaction,
  serializeMagnusTransaction: () => serializeMagnusTransaction
});
module.exports = __toCommonJS(src_exports);

// src/constants.ts
var MAGNUS_TX_TYPE = 118;
var FEE_PAYER_SIGNATURE_MAGIC_BYTE = 120;
var MAGNUS_NATIVE_DECIMALS = 6;
var MAGNUS_EXPIRING_NONCE_KEY = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
var MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS = 30;
var SECP256K1_SIGNATURE_LENGTH = 65;
var P256_SIGNATURE_LENGTH = 129;
var MAX_WEBAUTHN_SIGNATURE_LENGTH = 2048;
var SIGNATURE_TYPE_P256 = 1;
var SIGNATURE_TYPE_WEBAUTHN = 2;
var SIGNATURE_TYPE_KEYCHAIN = 3;
var SIGNATURE_TYPE_KEYCHAIN_V2 = 4;

// src/chain.ts
var import_viem = require("viem");
var nativeCurrency = {
  name: "MagnusUSD",
  symbol: "mUSD",
  decimals: 6
};
var magnus = (0, import_viem.defineChain)({
  id: 7777,
  name: "Magnus",
  nativeCurrency,
  rpcUrls: {
    default: { http: ["https://rpc.magnus.example/"] }
  },
  blockExplorers: {
    default: { name: "Magnus Explorer", url: "https://explorer.magnus.example/" }
  }
});
var magnusTestnet = (0, import_viem.defineChain)({
  id: 7776,
  name: "Magnus Testnet",
  nativeCurrency,
  rpcUrls: {
    default: { http: ["https://rpc.testnet.magnus.example/"] }
  },
  blockExplorers: {
    default: {
      name: "Magnus Testnet Explorer",
      url: "https://explorer.testnet.magnus.example/"
    }
  },
  testnet: true
});
var magnusDevnet = (0, import_viem.defineChain)({
  id: 73730,
  name: "Magnus Devnet (Staccato)",
  nativeCurrency,
  rpcUrls: {
    default: { http: ["https://staccato-rpc.magnuschain.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Magnus Devnet Explorer",
      url: "https://devnet.magnuschain.xyz"
    }
  },
  testnet: true
});

// src/transaction/serialize.ts
var import_viem2 = require("viem");
var EMPTY = "0x";
function intToHex(value) {
  const n = typeof value === "bigint" ? value : BigInt(value);
  if (n < 0n) throw new Error(`serialize: negative integer not allowed (${n})`);
  if (n === 0n) return EMPTY;
  let h = n.toString(16);
  if (h.length % 2) h = "0" + h;
  return `0x${h}`;
}
function addressToHex(addr) {
  if (addr == null) return EMPTY;
  return addr.toLowerCase();
}
function encodeCall(call) {
  return [
    call.to == null ? EMPTY : call.to.toLowerCase(),
    intToHex(call.value),
    call.input
  ];
}
function encodeAccessList(list) {
  if (!list || list.length === 0) return [];
  return list.map((entry) => [
    entry.address.toLowerCase(),
    entry.storageKeys.map((k) => k.toLowerCase())
  ]);
}
function encodeMagnusAuthorizationList(list) {
  if (!list || list.length === 0) return [];
  return list.map((auth) => [
    intToHex(auth.chainId),
    auth.address.toLowerCase(),
    intToHex(auth.nonce),
    auth.signature
  ]);
}
function encodeFeePayerSignatureForWire(sig) {
  if (sig == null) return EMPTY;
  return [intToHex(sig.yParity), intToHex(sig.r), intToHex(sig.s)];
}
function buildFields(tx, opts) {
  const fields = [
    intToHex(tx.chainId),
    intToHex(tx.maxPriorityFeePerGas),
    intToHex(tx.maxFeePerGas),
    intToHex(tx.gas),
    tx.calls.map(encodeCall),
    encodeAccessList(tx.accessList),
    intToHex(tx.nonceKey ?? 0n),
    intToHex(tx.nonce),
    tx.validBefore != null ? intToHex(tx.validBefore) : EMPTY,
    tx.validAfter != null ? intToHex(tx.validAfter) : EMPTY,
    opts.skipFeeToken ? EMPTY : addressToHex(tx.feeToken),
    opts.feePayerSlot,
    encodeMagnusAuthorizationList(tx.magnusAuthorizationList)
  ];
  if (tx.keyAuthorization != null) {
    fields.push(decodeNestedRlp(tx.keyAuthorization.encoded));
  }
  return fields;
}
function decodeNestedRlp(hex) {
  const buf = (0, import_viem2.hexToBytes)(hex);
  return decodeAt(buf, 0).item;
}
function decodeAt(buf, offset) {
  if (offset >= buf.length) throw new Error("rlp: out of bounds");
  const first = buf[offset];
  if (first < 128) {
    return { item: (0, import_viem2.bytesToHex)(buf.subarray(offset, offset + 1)), consumed: 1 };
  }
  if (first < 184) {
    const len2 = first - 128;
    return {
      item: (0, import_viem2.bytesToHex)(buf.subarray(offset + 1, offset + 1 + len2)),
      consumed: 1 + len2
    };
  }
  if (first < 192) {
    const lenOfLen2 = first - 183;
    const len2 = readLen(buf, offset + 1, lenOfLen2);
    const start = offset + 1 + lenOfLen2;
    return {
      item: (0, import_viem2.bytesToHex)(buf.subarray(start, start + len2)),
      consumed: 1 + lenOfLen2 + len2
    };
  }
  if (first < 248) {
    const len2 = first - 192;
    return decodeListAt(buf, offset + 1, len2, 1 + len2);
  }
  const lenOfLen = first - 247;
  const len = readLen(buf, offset + 1, lenOfLen);
  const headerSize = 1 + lenOfLen;
  return decodeListAt(buf, offset + headerSize, len, headerSize + len);
}
function readLen(buf, offset, lenOfLen) {
  let n = 0;
  for (let i = 0; i < lenOfLen; i++) {
    n = n << 8 | buf[offset + i];
  }
  return n;
}
function decodeListAt(buf, start, len, totalConsumed) {
  const end = start + len;
  const items = [];
  let cursor = start;
  while (cursor < end) {
    const r = decodeAt(buf, cursor);
    items.push(r.item);
    cursor += r.consumed;
  }
  return { item: items, consumed: totalConsumed };
}
function serializeMagnusTransaction(tx, options) {
  const purpose = options?.purpose ?? inferPurpose(tx);
  if (purpose === "signing") {
    const skipFeeToken = tx.feePayerSignature != null;
    const feePayerSlot = tx.feePayerSignature != null ? "0x00" : EMPTY;
    const fields2 = buildFields(tx, { skipFeeToken, feePayerSlot });
    return (0, import_viem2.concatHex)([(0, import_viem2.toHex)(MAGNUS_TX_TYPE), (0, import_viem2.toRlp)(fields2)]);
  }
  if (purpose === "fee-payer-signing") {
    if (options?.purpose !== "fee-payer-signing") {
      throw new Error(
        "serialize: fee-payer-signing requires options.sender (the tx sender address)"
      );
    }
    const fields2 = buildFields(tx, {
      skipFeeToken: false,
      feePayerSlot: options.sender.toLowerCase()
    });
    return (0, import_viem2.concatHex)([(0, import_viem2.toHex)(FEE_PAYER_SIGNATURE_MAGIC_BYTE), (0, import_viem2.toRlp)(fields2)]);
  }
  const sig = options?.purpose === "tx-on-wire" ? options.signature : tx.signature;
  if (sig == null) {
    throw new Error("serialize: tx-on-wire requires `signature` (raw MagnusSignature bytes)");
  }
  const fields = buildFields(tx, {
    skipFeeToken: false,
    feePayerSlot: encodeFeePayerSignatureForWire(tx.feePayerSignature)
  });
  fields.push(sig);
  return (0, import_viem2.concatHex)([(0, import_viem2.toHex)(MAGNUS_TX_TYPE), (0, import_viem2.toRlp)(fields)]);
}
function inferPurpose(tx) {
  return "signature" in tx && tx.signature != null ? "tx-on-wire" : "signing";
}

// src/transaction/parse.ts
var import_viem3 = require("viem");
function asHex(item, label) {
  if (typeof item !== "string") {
    throw new Error(`parse: expected hex for ${label}, got list`);
  }
  return item;
}
function asList(item, label) {
  if (typeof item === "string") {
    throw new Error(`parse: expected list for ${label}, got hex`);
  }
  return item;
}
function hexToBigInt(hex) {
  return hex === "0x" ? 0n : BigInt(hex);
}
function hexToOptionalBigInt(hex) {
  return hex === "0x" ? null : BigInt(hex);
}
function hexToOptionalAddress(hex) {
  if (hex === "0x") return null;
  if (hex.length !== 42) {
    throw new Error(`parse: invalid address hex length (${hex})`);
  }
  return hex.toLowerCase();
}
function parseCall(item) {
  const list = asList(item, "call");
  if (list.length !== 3) {
    throw new Error(`parse: call must have 3 fields, got ${list.length}`);
  }
  const [toItem, valueItem, inputItem] = list;
  const toHex3 = asHex(toItem, "call.to");
  const value = hexToBigInt(asHex(valueItem, "call.value"));
  const input = asHex(inputItem, "call.input");
  return {
    to: toHex3 === "0x" ? null : toHex3.toLowerCase(),
    value,
    input
  };
}
function parseAccessList(item) {
  const list = asList(item, "accessList");
  return list.map((entry) => {
    const tuple = asList(entry, "accessList entry");
    if (tuple.length !== 2) {
      throw new Error("parse: access list entry must be [address, [keys]]");
    }
    const [addrItem, keysItem] = tuple;
    const address = asHex(addrItem, "accessList.address").toLowerCase();
    const keys = asList(keysItem, "accessList.keys").map(
      (k) => asHex(k, "accessList.key").toLowerCase()
    );
    return { address, storageKeys: keys };
  });
}
function parseFeePayerSignature(item) {
  if (typeof item === "string") {
    if (item === "0x") return null;
    throw new Error(`parse: feePayerSignature must be a list or empty, got ${item}`);
  }
  if (item.length !== 3) {
    throw new Error(`parse: feePayerSignature must have 3 fields, got ${item.length}`);
  }
  const [vItem, rItem, sItem] = item;
  const v = Number(hexToBigInt(asHex(vItem, "feePayer.v")));
  if (v !== 0 && v !== 1) {
    throw new Error(`parse: feePayer yParity must be 0 or 1, got ${v}`);
  }
  return {
    yParity: v,
    r: hexToBigInt(asHex(rItem, "feePayer.r")),
    s: hexToBigInt(asHex(sItem, "feePayer.s"))
  };
}
function parseMagnusAuthorizationList(item) {
  const list = asList(item, "magnusAuthorizationList");
  return list.map((entry) => {
    const tuple = asList(entry, "magnusAuthorization");
    if (tuple.length !== 4) {
      throw new Error(
        `parse: magnusAuthorization must be [chainId, address, nonce, signature], got ${tuple.length} fields`
      );
    }
    const [chainIdItem, addressItem, nonceItem, sigItem] = tuple;
    return {
      chainId: hexToBigInt(asHex(chainIdItem, "auth.chainId")),
      address: asHex(addressItem, "auth.address").toLowerCase(),
      nonce: hexToBigInt(asHex(nonceItem, "auth.nonce")),
      signature: asHex(sigItem, "auth.signature")
    };
  });
}
function reEncode(item) {
  return (0, import_viem3.toRlp)(item);
}
function parseMagnusTransaction(hex) {
  const buf = (0, import_viem3.hexToBytes)(hex);
  if (buf.length === 0 || buf[0] !== MAGNUS_TX_TYPE) {
    throw new Error(
      `parse: expected type byte 0x${MAGNUS_TX_TYPE.toString(16)}, got 0x${(buf[0] ?? 0).toString(16)}`
    );
  }
  const rlpHex = (0, import_viem3.toHex)(buf.subarray(1));
  const decoded = (0, import_viem3.fromRlp)(rlpHex, "hex");
  const fields = asList(decoded, "tx body");
  if (fields.length < 14) {
    throw new Error(`parse: expected at least 14 RLP fields, got ${fields.length}`);
  }
  const [
    chainIdItem,
    maxPrioItem,
    maxFeeItem,
    gasItem,
    callsItem,
    accessListItem,
    nonceKeyItem,
    nonceItem,
    validBeforeItem,
    validAfterItem,
    feeTokenItem,
    feePayerItem,
    authListItem,
    ...rest
  ] = fields;
  let keyAuthorization = null;
  let signature = null;
  if (rest.length === 1) {
    const tail = rest[0];
    if (typeof tail === "string") {
      signature = tail;
    } else {
      throw new Error("parse: trailing field is a list but no signature follows");
    }
  } else if (rest.length === 2) {
    const [maybeKeyAuth, sigItem] = rest;
    if (typeof maybeKeyAuth === "string") {
      throw new Error("parse: expected keyAuthorization list before signature");
    }
    keyAuthorization = { encoded: reEncode(maybeKeyAuth) };
    if (typeof sigItem !== "string") {
      throw new Error("parse: signature must be a byte string");
    }
    signature = sigItem;
  } else {
    throw new Error(`parse: unexpected trailing field count ${rest.length}`);
  }
  if (signature == null) {
    throw new Error("parse: signature missing");
  }
  const tx = {
    chainId: Number(hexToBigInt(asHex(chainIdItem, "chainId"))),
    maxPriorityFeePerGas: hexToBigInt(asHex(maxPrioItem, "maxPriorityFeePerGas")),
    maxFeePerGas: hexToBigInt(asHex(maxFeeItem, "maxFeePerGas")),
    gas: hexToBigInt(asHex(gasItem, "gas")),
    calls: asList(callsItem, "calls").map(parseCall),
    accessList: parseAccessList(accessListItem),
    nonceKey: hexToBigInt(asHex(nonceKeyItem, "nonceKey")),
    nonce: hexToBigInt(asHex(nonceItem, "nonce")),
    validBefore: hexToOptionalBigInt(asHex(validBeforeItem, "validBefore")),
    validAfter: hexToOptionalBigInt(asHex(validAfterItem, "validAfter")),
    feeToken: hexToOptionalAddress(asHex(feeTokenItem, "feeToken")),
    feePayerSignature: parseFeePayerSignature(feePayerItem),
    magnusAuthorizationList: parseMagnusAuthorizationList(authListItem),
    keyAuthorization,
    signature
  };
  return tx;
}

// src/transaction/hash.ts
var import_viem4 = require("viem");
function getMagnusSignatureHash(tx) {
  return (0, import_viem4.keccak256)(serializeMagnusTransaction(tx, { purpose: "signing" }));
}
function getMagnusFeePayerSignatureHash(tx, sender) {
  return (0, import_viem4.keccak256)(
    serializeMagnusTransaction(tx, { purpose: "fee-payer-signing", sender })
  );
}
function getMagnusTransactionHash(tx) {
  return (0, import_viem4.keccak256)(
    serializeMagnusTransaction(tx, { purpose: "tx-on-wire", signature: tx.signature })
  );
}

// src/transaction/signature.ts
var import_viem5 = require("viem");
var HEX_REGEX = /^0x([0-9a-fA-F]{2})*$/;
function expectFixedHex(label, hex, byteLen) {
  if (!HEX_REGEX.test(hex)) {
    throw new Error(`signature: ${label} is not valid hex (got ${hex})`);
  }
  const got = (hex.length - 2) / 2;
  if (got !== byteLen) {
    throw new Error(`signature: ${label} must be ${byteLen} bytes, got ${got}`);
  }
}
function concatBytes(parts) {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}
function take(buf, offset, len) {
  if (offset + len > buf.length) {
    throw new Error(`signature: truncated at offset ${offset} (need ${len})`);
  }
  return buf.subarray(offset, offset + len);
}
function encodeMagnusSignature(sig) {
  switch (sig.kind) {
    case "secp256k1": {
      expectFixedHex("r", sig.r, 32);
      expectFixedHex("s", sig.s, 32);
      if (sig.v !== 0 && sig.v !== 1 && sig.v !== 27 && sig.v !== 28) {
        throw new Error(`signature: secp256k1 v must be 0/1/27/28, got ${sig.v}`);
      }
      const out = concatBytes([
        (0, import_viem5.hexToBytes)(sig.r),
        (0, import_viem5.hexToBytes)(sig.s),
        new Uint8Array([sig.v])
      ]);
      return (0, import_viem5.bytesToHex)(out);
    }
    case "p256": {
      expectFixedHex("r", sig.r, 32);
      expectFixedHex("s", sig.s, 32);
      expectFixedHex("pubKeyX", sig.pubKeyX, 32);
      expectFixedHex("pubKeyY", sig.pubKeyY, 32);
      const out = concatBytes([
        new Uint8Array([SIGNATURE_TYPE_P256]),
        (0, import_viem5.hexToBytes)(sig.r),
        (0, import_viem5.hexToBytes)(sig.s),
        (0, import_viem5.hexToBytes)(sig.pubKeyX),
        (0, import_viem5.hexToBytes)(sig.pubKeyY),
        new Uint8Array([sig.preHash ? 1 : 0])
      ]);
      return (0, import_viem5.bytesToHex)(out);
    }
    case "webauthn": {
      expectFixedHex("r", sig.r, 32);
      expectFixedHex("s", sig.s, 32);
      expectFixedHex("pubKeyX", sig.pubKeyX, 32);
      expectFixedHex("pubKeyY", sig.pubKeyY, 32);
      if (!HEX_REGEX.test(sig.authenticatorData)) {
        throw new Error(`signature: webauthn authenticatorData not valid hex`);
      }
      const out = concatBytes([
        new Uint8Array([SIGNATURE_TYPE_WEBAUTHN]),
        (0, import_viem5.hexToBytes)(sig.authenticatorData),
        (0, import_viem5.hexToBytes)(sig.r),
        (0, import_viem5.hexToBytes)(sig.s),
        (0, import_viem5.hexToBytes)(sig.pubKeyX),
        (0, import_viem5.hexToBytes)(sig.pubKeyY)
      ]);
      if (out.length > 1 + MAX_WEBAUTHN_SIGNATURE_LENGTH) {
        throw new Error(`signature: webauthn payload exceeds ${MAX_WEBAUTHN_SIGNATURE_LENGTH} bytes`);
      }
      return (0, import_viem5.bytesToHex)(out);
    }
    case "keychain": {
      expectFixedHex("userAddress", sig.userAddress, 20);
      const innerHex = encodeMagnusSignature(sig.inner);
      const typeByte = sig.version === 2 ? SIGNATURE_TYPE_KEYCHAIN_V2 : SIGNATURE_TYPE_KEYCHAIN;
      const out = concatBytes([
        new Uint8Array([typeByte]),
        (0, import_viem5.hexToBytes)(sig.userAddress),
        (0, import_viem5.hexToBytes)(innerHex)
      ]);
      return (0, import_viem5.bytesToHex)(out);
    }
  }
}
function parseMagnusSignature(bytes) {
  if (!HEX_REGEX.test(bytes)) {
    throw new Error(`signature: not valid hex (got ${bytes})`);
  }
  const buf = (0, import_viem5.hexToBytes)(bytes);
  if (buf.length === 0) {
    throw new Error("signature: empty");
  }
  if (buf.length === SECP256K1_SIGNATURE_LENGTH) {
    return decodeSecp256k1(buf);
  }
  const typeByte = buf[0];
  const rest = buf.subarray(1);
  if (typeByte === SIGNATURE_TYPE_P256) {
    return decodeP256(rest);
  }
  if (typeByte === SIGNATURE_TYPE_WEBAUTHN) {
    return decodeWebAuthn(rest);
  }
  if (typeByte === SIGNATURE_TYPE_KEYCHAIN || typeByte === SIGNATURE_TYPE_KEYCHAIN_V2) {
    return decodeKeychain(rest, typeByte === SIGNATURE_TYPE_KEYCHAIN_V2 ? 2 : 1);
  }
  throw new Error(`signature: unknown type byte 0x${typeByte.toString(16)}`);
}
function decodeSecp256k1(buf) {
  if (buf.length !== SECP256K1_SIGNATURE_LENGTH) {
    throw new Error(`signature: secp256k1 must be 65 bytes`);
  }
  return {
    kind: "secp256k1",
    r: (0, import_viem5.bytesToHex)(take(buf, 0, 32)),
    s: (0, import_viem5.bytesToHex)(take(buf, 32, 32)),
    v: buf[64]
  };
}
function decodeP256(rest) {
  if (rest.length !== P256_SIGNATURE_LENGTH) {
    throw new Error(`signature: p256 payload must be ${P256_SIGNATURE_LENGTH} bytes`);
  }
  return {
    kind: "p256",
    r: (0, import_viem5.bytesToHex)(take(rest, 0, 32)),
    s: (0, import_viem5.bytesToHex)(take(rest, 32, 32)),
    pubKeyX: (0, import_viem5.bytesToHex)(take(rest, 64, 32)),
    pubKeyY: (0, import_viem5.bytesToHex)(take(rest, 96, 32)),
    preHash: rest[128] !== 0
  };
}
function decodeWebAuthn(rest) {
  if (rest.length < 128 || rest.length > MAX_WEBAUTHN_SIGNATURE_LENGTH) {
    throw new Error(`signature: webauthn payload length out of range`);
  }
  const tail = rest.length - 128;
  return {
    kind: "webauthn",
    authenticatorData: (0, import_viem5.bytesToHex)(take(rest, 0, tail)),
    r: (0, import_viem5.bytesToHex)(take(rest, tail, 32)),
    s: (0, import_viem5.bytesToHex)(take(rest, tail + 32, 32)),
    pubKeyX: (0, import_viem5.bytesToHex)(take(rest, tail + 64, 32)),
    pubKeyY: (0, import_viem5.bytesToHex)(take(rest, tail + 96, 32))
  };
}
function decodeKeychain(rest, version) {
  if (rest.length < 20) {
    throw new Error(`signature: keychain too short for user address`);
  }
  const userAddress = (0, import_viem5.bytesToHex)(take(rest, 0, 20));
  const innerBytes = (0, import_viem5.bytesToHex)(rest.subarray(20));
  const inner = parseMagnusSignature(innerBytes);
  if (inner.kind === "keychain") {
    throw new Error("signature: keychain may not nest inside keychain");
  }
  return { kind: "keychain", version, userAddress, inner };
}

// src/precompiles/addresses.ts
var MIP_FEE_MANAGER_ADDRESS = "0xfeec000000000000000000000000000000000000";
var MAGNUS_USD_ADDRESS = "0x20c0000000000000000000000000000000000010";
var MIP20_FACTORY_ADDRESS = "0x20fc000000000000000000000000000000000000";
var MIP20_ISSUER_REGISTRY_ADDRESS = "0x20fa000000000000000000000000000000000000";
var MIP403_REGISTRY_ADDRESS = "0x403c000000000000000000000000000000000000";
var STABLECOIN_DEX_ADDRESS = "0xdec0000000000000000000000000000000000000";
var CROSS_FX_PSM_ADDRESS = "0xfecc000000000000000000000000000000000000";
var MAGNUS_BRIDGE_ADDRESS = "0xb12d000000000000000000000000000000000000";
var NONCE_PRECOMPILE_ADDRESS = "0x4e4f4e4345000000000000000000000000000000";
var VALIDATOR_CONFIG_ADDRESS = "0xcccccccc00000000000000000000000000000000";
var VALIDATOR_CONFIG_V2_ADDRESS = "0xcccccccc00000000000000000000000000000001";
var ACCOUNT_KEYCHAIN_ADDRESS = "0xaaaaaaaa00000000000000000000000000000000";
var ADDRESS_REGISTRY_ADDRESS = "0xfdc0000000000000000000000000000000000000";
var SIGNATURE_VERIFIER_ADDRESS = "0x5165300000000000000000000000000000000000";

// src/precompiles/crossFxPSM.ts
var crossFxPSMAbi = [
  // ── Views ──────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "quoteExactIn",
    stateMutability: "view",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountIn" }
    ],
    outputs: [{ type: "uint128", name: "amountOut" }]
  },
  {
    type: "function",
    name: "quoteExactOut",
    stateMutability: "view",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountOut" }
    ],
    outputs: [{ type: "uint128", name: "amountIn" }]
  },
  {
    type: "function",
    name: "getPairConfig",
    stateMutability: "view",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ],
    outputs: [
      {
        type: "tuple",
        name: "",
        components: [
          { type: "bool", name: "registered" },
          { type: "bool", name: "enabled" },
          { type: "bool", name: "paused" },
          { type: "uint16", name: "spreadBps" },
          { type: "address", name: "baseToken" },
          { type: "address", name: "quoteToken" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "isStableTokenRegistered",
    stateMutability: "view",
    inputs: [{ type: "address", name: "token" }],
    outputs: [{ type: "bool", name: "" }]
  },
  // ── Swap ───────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "swapExactIn",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountIn" },
      { type: "uint128", name: "minAmountOut" }
    ],
    outputs: [{ type: "uint128", name: "amountOut" }]
  },
  {
    type: "function",
    name: "swapExactOut",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "uint128", name: "amountOut" },
      { type: "uint128", name: "maxAmountIn" }
    ],
    outputs: [{ type: "uint128", name: "amountIn" }]
  },
  // ── Swap event ─────────────────────────────────────────────────────────
  {
    type: "event",
    name: "Swap",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "string", name: "baseIn", indexed: false },
      { type: "string", name: "quoteOut", indexed: false },
      { type: "uint128", name: "amountIn", indexed: false },
      { type: "uint128", name: "amountOut", indexed: false },
      { type: "uint128", name: "rateNum", indexed: false },
      { type: "uint128", name: "rateDen", indexed: false },
      { type: "uint16", name: "spreadBps", indexed: false }
    ]
  },
  // ── User-facing errors a swap UI decodes ───────────────────────────────
  {
    type: "error",
    name: "SlippageExceeded",
    inputs: [
      { type: "uint128", name: "expected" },
      { type: "uint128", name: "actual" }
    ]
  },
  {
    type: "error",
    name: "PairNotRegistered",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ]
  },
  {
    type: "error",
    name: "PairCurrentlyDisabled",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ]
  },
  {
    type: "error",
    name: "PairCurrentlyPaused",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" }
    ]
  },
  {
    type: "error",
    name: "OracleUnavailable",
    inputs: [{ type: "string", name: "code" }]
  },
  {
    type: "error",
    name: "L0LimitExceeded",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "address", name: "token" }
    ]
  },
  {
    type: "error",
    name: "L1LimitExceeded",
    inputs: [
      { type: "string", name: "baseIn" },
      { type: "string", name: "quoteOut" },
      { type: "address", name: "token" }
    ]
  },
  {
    type: "error",
    name: "InsufficientReserveBacking",
    inputs: [
      { type: "uint256", name: "backingUsd" },
      { type: "uint256", name: "liabilitiesUsd" }
    ]
  },
  { type: "error", name: "MathOverflow", inputs: [] }
];

// src/precompiles/feeManager.ts
var feeManagerAbi = [
  // FX oracle reads — used to populate fee preview UI
  {
    type: "function",
    name: "medianFxRate",
    stateMutability: "view",
    inputs: [{ type: "string", name: "code" }],
    outputs: [
      { type: "uint128", name: "numerator" },
      { type: "uint128", name: "denominator" },
      { type: "bool", name: "ok" }
    ]
  },
  // Validator accept-set reads — used to know which fee tokens a validator takes
  {
    type: "function",
    name: "getAcceptedTokens",
    stateMutability: "view",
    inputs: [{ type: "address", name: "validator" }],
    outputs: [{ type: "address[]", name: "" }]
  },
  {
    type: "function",
    name: "acceptsToken",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "validator" },
      { type: "address", name: "token" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "isAcceptedByAnyValidator",
    stateMutability: "view",
    inputs: [{ type: "address", name: "token" }],
    outputs: [{ type: "bool", name: "" }]
  },
  // Currency registry reads
  {
    type: "function",
    name: "isCurrencyEnabled",
    stateMutability: "view",
    inputs: [{ type: "string", name: "code" }],
    outputs: [{ type: "bool", name: "" }]
  },
  // Selected events the wallet may want to surface
  {
    type: "event",
    name: "FxRateReported",
    inputs: [
      { type: "string", name: "code", indexed: false },
      { type: "address", name: "reporter", indexed: true },
      { type: "uint128", name: "numerator", indexed: false },
      { type: "uint128", name: "denominator", indexed: false }
    ]
  },
  {
    type: "event",
    name: "AcceptedTokenAdded",
    inputs: [
      { type: "address", name: "validator", indexed: true },
      { type: "address", name: "token", indexed: true }
    ]
  },
  {
    type: "event",
    name: "AcceptedTokenRemoved",
    inputs: [
      { type: "address", name: "validator", indexed: true },
      { type: "address", name: "token", indexed: true }
    ]
  }
];

// src/precompiles/magnusBridge.ts
var magnusBridgeAbi = [
  {
    type: "event",
    name: "DepositFinalized",
    inputs: [
      { type: "uint64", name: "srcChainId", indexed: true },
      { type: "bytes32", name: "intentHash", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "depositor", indexed: false },
      { type: "address", name: "dstAccount", indexed: false },
      { type: "uint256", name: "amount", indexed: false }
    ]
  },
  // Outbound: user calls withdraw on the precompile to escrow rUSDT for
  // claim on the destination chain. The Magnus burn + escrow happens in
  // the same tx; cross-chain claim is asynchronous (validator attest +
  // relayer claim on Hoodi).
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "intent",
        components: [
          { type: "address", name: "token" },
          { type: "uint256", name: "amount" },
          { type: "uint64", name: "dstChainId" },
          { type: "address", name: "dstAddress" },
          { type: "uint256", name: "maxFee" },
          { type: "uint64", name: "deadline" }
        ]
      }
    ],
    outputs: [{ type: "bytes32", name: "intentHash" }]
  },
  // Validators ack a completed claim on the destination chain; precompile
  // burns the routed token. The wallet subscribes to this to flip the
  // outbound pending stage 3.
  {
    type: "event",
    name: "PayoutAck",
    inputs: [
      { type: "uint64", name: "dstChainId", indexed: true },
      { type: "bytes32", name: "intentHash", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "dstAddress", indexed: false },
      { type: "uint256", name: "amount", indexed: false },
      { type: "bytes32", name: "claimTxHash", indexed: false }
    ]
  }
];

// src/precompiles/mip20.ts
var mip20Abi = [
  // ERC-20 surface
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string", name: "" }]
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string", name: "" }]
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8", name: "" }]
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256", name: "" }]
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" }
    ],
    outputs: [{ type: "uint256", name: "" }]
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  // MIP-20 extensions
  {
    type: "function",
    name: "currency",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string", name: "" }]
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool", name: "" }]
  },
  {
    type: "function",
    name: "transferWithMemo",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "transferFromWithMemo",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: [{ type: "bool", name: "" }]
  },
  // Standard events
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false }
    ]
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "value", indexed: false }
    ]
  }
];

// src/rpc/methods.ts
var MAGNUS_RPC_METHODS = {
  fxRate: "magnus_fxRate",
  activeFxRates: "magnus_activeFxRates",
  acceptedFeeTokens: "magnus_acceptedFeeTokens",
  isFeeTokenAccepted: "magnus_isFeeTokenAccepted"
};
function decodeFxRateInfo(wire) {
  return {
    currency: wire.currency,
    numerator: BigInt(wire.numerator),
    denominator: BigInt(wire.denominator),
    ok: wire.ok
  };
}

// src/rpc/actions.ts
function magnusActions() {
  return (rawClient) => {
    const client = rawClient;
    return {
      async getFxRate(currency) {
        const wire = await client.request({
          method: MAGNUS_RPC_METHODS.fxRate,
          params: [currency]
        });
        return decodeFxRateInfo(wire);
      },
      async getActiveFxRates() {
        const wire = await client.request({
          method: MAGNUS_RPC_METHODS.activeFxRates,
          params: []
        });
        return wire.map(decodeFxRateInfo);
      },
      async getAcceptedFeeTokens(validator) {
        return await client.request({
          method: MAGNUS_RPC_METHODS.acceptedFeeTokens,
          params: [validator]
        });
      },
      async isFeeTokenAccepted(validator, feeToken) {
        return await client.request({
          method: MAGNUS_RPC_METHODS.isFeeTokenAccepted,
          params: [validator, feeToken]
        });
      }
    };
  };
}

// src/utils/currency.ts
function divRound(num, den, mode) {
  if (den === 0n) throw new Error("currency: division by zero");
  const q = num / den;
  const r = num % den;
  if (r === 0n) return q;
  if (mode === "floor") return q;
  if (mode === "ceil") return q + 1n;
  return r * 2n >= den ? q + 1n : q;
}
function convertCurrency(args) {
  const { amount, from, to, rate, rounding = "floor" } = args;
  if (from === to) return amount;
  if ("usdRateOf" in rate) {
    const { from: fr, to: tr } = rate.usdRateOf;
    const num = amount * fr.denominator * tr.numerator;
    const den = fr.numerator * tr.denominator;
    return divRound(num, den, rounding);
  }
  if (from === "USD") {
    return divRound(amount * rate.numerator, rate.denominator, rounding);
  }
  if (to === "USD") {
    return divRound(amount * rate.denominator, rate.numerator, rounding);
  }
  throw new Error(
    `currency: single-rate conversion requires one side to be "USD"; got ${from} -> ${to}`
  );
}

// src/utils/format.ts
var CURRENCY_TABLE = {
  mUSD: { symbol: "$", iso: "USD" },
  mEUR: { symbol: "\u20AC", iso: "EUR" },
  mVND: { symbol: "\u20AB", iso: "VND" }
};
var PLACEMENT = {
  "vi-VN": "suffix",
  "id-ID": "prefix",
  "tl-PH": "prefix",
  "th-TH": "prefix",
  "en-US": "prefix",
  "de-DE": "suffix"
};
function fractionDigitsFor(currency) {
  return currency === "mVND" ? 0 : 2;
}
function baseUnitsToDisplay(amount, decimals, fractionDigits) {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const divisor = 10n ** BigInt(decimals);
  const whole = abs / divisor;
  const frac = abs % divisor;
  let fracStr = frac.toString().padStart(decimals, "0");
  if (fractionDigits === 0) {
    const half = divisor / 2n;
    const rounded = frac >= half ? whole + 1n : whole;
    return (negative ? "-" : "") + rounded.toString();
  }
  if (fracStr.length > fractionDigits) {
    fracStr = fracStr.slice(0, fractionDigits);
  } else {
    fracStr = fracStr.padEnd(fractionDigits, "0");
  }
  return (negative ? "-" : "") + whole.toString() + "." + fracStr;
}
function applyLocale(value, locale) {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, frac] = unsigned.split(".");
  const grouped = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(BigInt(whole ?? "0"));
  if (frac == null) return (negative ? "-" : "") + grouped;
  const sample = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(0.1);
  const decimalSep = sample.replace(/[\d\s]/g, "") || ".";
  return (negative ? "-" : "") + grouped + decimalSep + frac;
}
function formatBalance(amount, currency, options = {}) {
  const locale = options.locale ?? "en-US";
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS;
  const fractionDigits = options.fractionDigits ?? fractionDigitsFor(currency);
  const num = baseUnitsToDisplay(amount, decimals, fractionDigits);
  const localized = applyLocale(num, locale);
  const symbol = CURRENCY_TABLE[currency].symbol;
  return PLACEMENT[locale] === "prefix" ? `${symbol}${localized}` : `${localized} ${symbol}`;
}
function formatFee(amount, currency, options = {}) {
  const locale = options.locale ?? "en-US";
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS;
  const fractionDigits = options.fractionDigits ?? fractionDigitsFor(currency);
  const num = baseUnitsToDisplay(amount, decimals, fractionDigits);
  const localized = applyLocale(num, locale);
  return `${localized} ${CURRENCY_TABLE[currency].symbol}`;
}
function parseAmount(input, options) {
  const decimals = options.decimals ?? MAGNUS_NATIVE_DECIMALS;
  const sample = new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(0.1);
  const decimalSep = sample.replace(/[\d\s]/g, "") || ".";
  const groupSample = new Intl.NumberFormat(options.locale, {
    useGrouping: true,
    maximumFractionDigits: 0
  }).format(1e3);
  const groupSep = groupSample.replace(/[\d]/g, "") || "";
  let cleaned = input.trim();
  if (groupSep) {
    cleaned = cleaned.split(groupSep).join("");
  }
  cleaned = cleaned.replace(decimalSep, ".");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error(`parseAmount: cannot parse "${input}" for locale ${options.locale}`);
  }
  const negative = cleaned.startsWith("-");
  const unsigned = negative ? cleaned.slice(1) : cleaned;
  const [whole, frac = ""] = unsigned.split(".");
  if (frac.length > decimals) {
    throw new Error(`parseAmount: too many fractional digits (max ${decimals})`);
  }
  const fracPadded = frac.padEnd(decimals, "0");
  const total = BigInt((whole ?? "0") + fracPadded);
  return negative ? -total : total;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ACCOUNT_KEYCHAIN_ADDRESS,
  ADDRESS_REGISTRY_ADDRESS,
  CROSS_FX_PSM_ADDRESS,
  FEE_PAYER_SIGNATURE_MAGIC_BYTE,
  MAGNUS_BRIDGE_ADDRESS,
  MAGNUS_EXPIRING_NONCE_KEY,
  MAGNUS_EXPIRING_NONCE_MAX_EXPIRY_SECS,
  MAGNUS_NATIVE_DECIMALS,
  MAGNUS_RPC_METHODS,
  MAGNUS_TX_TYPE,
  MAGNUS_USD_ADDRESS,
  MAX_WEBAUTHN_SIGNATURE_LENGTH,
  MIP20_FACTORY_ADDRESS,
  MIP20_ISSUER_REGISTRY_ADDRESS,
  MIP403_REGISTRY_ADDRESS,
  MIP_FEE_MANAGER_ADDRESS,
  NONCE_PRECOMPILE_ADDRESS,
  P256_SIGNATURE_LENGTH,
  SECP256K1_SIGNATURE_LENGTH,
  SIGNATURE_TYPE_KEYCHAIN,
  SIGNATURE_TYPE_KEYCHAIN_V2,
  SIGNATURE_TYPE_P256,
  SIGNATURE_TYPE_WEBAUTHN,
  SIGNATURE_VERIFIER_ADDRESS,
  STABLECOIN_DEX_ADDRESS,
  VALIDATOR_CONFIG_ADDRESS,
  VALIDATOR_CONFIG_V2_ADDRESS,
  convertCurrency,
  crossFxPSMAbi,
  decodeFxRateInfo,
  encodeMagnusSignature,
  feeManagerAbi,
  formatBalance,
  formatFee,
  getMagnusFeePayerSignatureHash,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
  magnus,
  magnusActions,
  magnusBridgeAbi,
  magnusDevnet,
  magnusTestnet,
  mip20Abi,
  parseAmount,
  parseMagnusSignature,
  parseMagnusTransaction,
  serializeMagnusTransaction
});
//# sourceMappingURL=index.cjs.map
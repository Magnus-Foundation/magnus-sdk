// src/transaction/serialize.ts
import { bytesToHex, concatHex, hexToBytes, toHex, toRlp } from "viem";

// src/constants.ts
var MAGNUS_TX_TYPE = 118;
var FEE_PAYER_SIGNATURE_MAGIC_BYTE = 120;
var SECP256K1_SIGNATURE_LENGTH = 65;
var P256_SIGNATURE_LENGTH = 129;
var MAX_WEBAUTHN_SIGNATURE_LENGTH = 2048;
var SIGNATURE_TYPE_P256 = 1;
var SIGNATURE_TYPE_WEBAUTHN = 2;
var SIGNATURE_TYPE_KEYCHAIN = 3;
var SIGNATURE_TYPE_KEYCHAIN_V2 = 4;

// src/transaction/serialize.ts
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
  const buf = hexToBytes(hex);
  return decodeAt(buf, 0).item;
}
function decodeAt(buf, offset) {
  if (offset >= buf.length) throw new Error("rlp: out of bounds");
  const first = buf[offset];
  if (first < 128) {
    return { item: bytesToHex(buf.subarray(offset, offset + 1)), consumed: 1 };
  }
  if (first < 184) {
    const len2 = first - 128;
    return {
      item: bytesToHex(buf.subarray(offset + 1, offset + 1 + len2)),
      consumed: 1 + len2
    };
  }
  if (first < 192) {
    const lenOfLen2 = first - 183;
    const len2 = readLen(buf, offset + 1, lenOfLen2);
    const start = offset + 1 + lenOfLen2;
    return {
      item: bytesToHex(buf.subarray(start, start + len2)),
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
    return concatHex([toHex(MAGNUS_TX_TYPE), toRlp(fields2)]);
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
    return concatHex([toHex(FEE_PAYER_SIGNATURE_MAGIC_BYTE), toRlp(fields2)]);
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
  return concatHex([toHex(MAGNUS_TX_TYPE), toRlp(fields)]);
}
function inferPurpose(tx) {
  return "signature" in tx && tx.signature != null ? "tx-on-wire" : "signing";
}

// src/transaction/parse.ts
import { fromRlp, hexToBytes as hexToBytes2, toHex as toHex2, toRlp as toRlp2 } from "viem";
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
  return toRlp2(item);
}
function parseMagnusTransaction(hex) {
  const buf = hexToBytes2(hex);
  if (buf.length === 0 || buf[0] !== MAGNUS_TX_TYPE) {
    throw new Error(
      `parse: expected type byte 0x${MAGNUS_TX_TYPE.toString(16)}, got 0x${(buf[0] ?? 0).toString(16)}`
    );
  }
  const rlpHex = toHex2(buf.subarray(1));
  const decoded = fromRlp(rlpHex, "hex");
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
import { keccak256 } from "viem";
function getMagnusSignatureHash(tx) {
  return keccak256(serializeMagnusTransaction(tx, { purpose: "signing" }));
}
function getMagnusFeePayerSignatureHash(tx, sender) {
  return keccak256(
    serializeMagnusTransaction(tx, { purpose: "fee-payer-signing", sender })
  );
}
function getMagnusTransactionHash(tx) {
  return keccak256(
    serializeMagnusTransaction(tx, { purpose: "tx-on-wire", signature: tx.signature })
  );
}

// src/transaction/signature.ts
import { bytesToHex as bytesToHex2, hexToBytes as hexToBytes3 } from "viem";
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
        hexToBytes3(sig.r),
        hexToBytes3(sig.s),
        new Uint8Array([sig.v])
      ]);
      return bytesToHex2(out);
    }
    case "p256": {
      expectFixedHex("r", sig.r, 32);
      expectFixedHex("s", sig.s, 32);
      expectFixedHex("pubKeyX", sig.pubKeyX, 32);
      expectFixedHex("pubKeyY", sig.pubKeyY, 32);
      const out = concatBytes([
        new Uint8Array([SIGNATURE_TYPE_P256]),
        hexToBytes3(sig.r),
        hexToBytes3(sig.s),
        hexToBytes3(sig.pubKeyX),
        hexToBytes3(sig.pubKeyY),
        new Uint8Array([sig.preHash ? 1 : 0])
      ]);
      return bytesToHex2(out);
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
        hexToBytes3(sig.authenticatorData),
        hexToBytes3(sig.r),
        hexToBytes3(sig.s),
        hexToBytes3(sig.pubKeyX),
        hexToBytes3(sig.pubKeyY)
      ]);
      if (out.length > 1 + MAX_WEBAUTHN_SIGNATURE_LENGTH) {
        throw new Error(`signature: webauthn payload exceeds ${MAX_WEBAUTHN_SIGNATURE_LENGTH} bytes`);
      }
      return bytesToHex2(out);
    }
    case "keychain": {
      expectFixedHex("userAddress", sig.userAddress, 20);
      const innerHex = encodeMagnusSignature(sig.inner);
      const typeByte = sig.version === 2 ? SIGNATURE_TYPE_KEYCHAIN_V2 : SIGNATURE_TYPE_KEYCHAIN;
      const out = concatBytes([
        new Uint8Array([typeByte]),
        hexToBytes3(sig.userAddress),
        hexToBytes3(innerHex)
      ]);
      return bytesToHex2(out);
    }
  }
}
function parseMagnusSignature(bytes) {
  if (!HEX_REGEX.test(bytes)) {
    throw new Error(`signature: not valid hex (got ${bytes})`);
  }
  const buf = hexToBytes3(bytes);
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
    r: bytesToHex2(take(buf, 0, 32)),
    s: bytesToHex2(take(buf, 32, 32)),
    v: buf[64]
  };
}
function decodeP256(rest) {
  if (rest.length !== P256_SIGNATURE_LENGTH) {
    throw new Error(`signature: p256 payload must be ${P256_SIGNATURE_LENGTH} bytes`);
  }
  return {
    kind: "p256",
    r: bytesToHex2(take(rest, 0, 32)),
    s: bytesToHex2(take(rest, 32, 32)),
    pubKeyX: bytesToHex2(take(rest, 64, 32)),
    pubKeyY: bytesToHex2(take(rest, 96, 32)),
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
    authenticatorData: bytesToHex2(take(rest, 0, tail)),
    r: bytesToHex2(take(rest, tail, 32)),
    s: bytesToHex2(take(rest, tail + 32, 32)),
    pubKeyX: bytesToHex2(take(rest, tail + 64, 32)),
    pubKeyY: bytesToHex2(take(rest, tail + 96, 32))
  };
}
function decodeKeychain(rest, version) {
  if (rest.length < 20) {
    throw new Error(`signature: keychain too short for user address`);
  }
  const userAddress = bytesToHex2(take(rest, 0, 20));
  const innerBytes = bytesToHex2(rest.subarray(20));
  const inner = parseMagnusSignature(innerBytes);
  if (inner.kind === "keychain") {
    throw new Error("signature: keychain may not nest inside keychain");
  }
  return { kind: "keychain", version, userAddress, inner };
}
export {
  encodeMagnusSignature,
  getMagnusFeePayerSignatureHash,
  getMagnusSignatureHash,
  getMagnusTransactionHash,
  parseMagnusSignature,
  parseMagnusTransaction,
  serializeMagnusTransaction
};
//# sourceMappingURL=index.mjs.map
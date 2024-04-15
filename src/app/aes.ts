export async function aesEncrypt(
  data: string,
  password: string,
  difficulty = 20
) {
  const hashKey = await grindKey(password, difficulty);
  const iv = await getIv(password, data);

  const key = await window.crypto.subtle.importKey(
    "raw",
    hashKey,
    {
      name: "AES-GCM",
    },
    false,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    new TextEncoder().encode(data)
  );

  const result = Array.from(iv).concat(Array.from(new Uint8Array(encrypted)));

  return base64Encode(new Uint8Array(result));
}

export async function aesDecrypt(
  ciphertext: string,
  password: string,
  difficulty = 20
) {
  const ciphertextBuffer = Array.from(base64Decode(ciphertext));
  const hashKey = await grindKey(password, difficulty);

  const key = await window.crypto.subtle.importKey(
    "raw",
    hashKey,
    {
      name: "AES-GCM",
    },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(ciphertextBuffer.slice(0, 12)),
      tagLength: 128,
    },
    key,
    new Uint8Array(ciphertextBuffer.slice(12))
  );

  return new TextDecoder("utf-8").decode(new Uint8Array(decrypted));
}

function base64Encode(u8: any) {
  return btoa(String.fromCharCode.apply(null, u8));
}

function base64Decode(str: string) {
  return new Uint8Array(
    atob(str)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
}

function grindKey(password: string, difficulty: number) {
  return pbkdf2(
    password,
    password + password,
    Math.pow(2, difficulty),
    32,
    "SHA-256"
  );
}

function getIv(password: string, data: string) {
  const randomData = base64Encode(
    window.crypto.getRandomValues(new Uint8Array(12))
  );
  return pbkdf2(
    password + randomData,
    data + new Date().getTime().toString(),
    1,
    12,
    "SHA-256"
  );
}

async function pbkdf2(
  message: string,
  salt: string,
  iterations: number,
  keyLen: number,
  algorithm: string
) {
  const msgBuffer = new TextEncoder().encode(message);
  const msgUint8Array = new Uint8Array(msgBuffer);
  const saltBuffer = new TextEncoder().encode(salt);
  const saltUint8Array = new Uint8Array(saltBuffer);

  const key = await crypto.subtle.importKey(
    "raw",
    msgUint8Array,
    {
      name: "PBKDF2",
    },
    false,
    ["deriveBits"]
  );

  const buffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltUint8Array,
      iterations: iterations,
      hash: algorithm,
    },
    key,
    keyLen * 8
  );

  return new Uint8Array(buffer);
}

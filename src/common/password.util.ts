import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';

function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt);
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }
  const derived = await scrypt(password, salt);
  const hashBuffer = Buffer.from(hash, 'hex');

  if (derived.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, hashBuffer);
}

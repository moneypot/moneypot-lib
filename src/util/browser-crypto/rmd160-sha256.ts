import RIPEMD160 from './ripemd160';
import sha256 from './sha256';

export default async function(data: Uint8Array): Promise<Uint8Array> {
  const rmd = new RIPEMD160();

  rmd.update(await sha256(data));

  return rmd.digest();
}

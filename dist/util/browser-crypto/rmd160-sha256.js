import RIPEMD160 from './ripemd160';
import sha256 from './sha256';
export default async function (data) {
    const rmd = new RIPEMD160();
    rmd.update(await sha256(data));
    return rmd.digest();
}
//# sourceMappingURL=rmd160-sha256.js.map
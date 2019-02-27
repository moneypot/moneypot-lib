import { randomFillSync } from 'crypto';
export default function random(size) {
    const buff = new Uint8Array(size);
    randomFillSync(buff);
    return buff;
}
//# sourceMappingURL=random.js.map
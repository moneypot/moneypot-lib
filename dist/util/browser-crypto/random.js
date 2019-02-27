export default function random(size) {
    const buff = new Uint8Array(size);
    window.crypto.getRandomValues(buff);
    return buff;
}
//# sourceMappingURL=random.js.map
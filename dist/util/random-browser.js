export default function randomBrowser(size) {
    const buff = new Uint8Array(size);
    window.crypto.getRandomValues(buff);
    return buff;
}
//# sourceMappingURL=random-browser.js.map
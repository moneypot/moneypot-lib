"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const assert_1 = require("../assert");
const P = util_1.secp256k1.p;
exports.Scalar = {
    fromBytes(buf) {
        if (buf.length !== 32) {
            return new TypeError('EXPECTED_32_BYTES');
        }
        const s = util_1.bufferToBigInt(buf);
        if (s === BigInt(0) || s >= util_1.secp256k1.n) {
            return new TypeError('Private key not in range [1, n)');
        }
        return s;
    },
    toBytes(n) {
        return util_1.bufferFromBigInt(n);
    },
};
exports.Point = {
    fromPrivKey(privkey) {
        return pointMultiply(util_1.secp256k1.g, privkey);
    },
    fromBytes(buf) {
        return util_1.pointFromBuffer(buf);
    },
    fromHex(hex) {
        return exports.Point.fromBytes(util_1.bufferFromHex(hex));
    },
    toBytes(point) {
        return util_1.pointToBuffer(point);
    },
};
exports.INFINITE_POINT = new class {
    get x() {
        throw new Error("infinite point doesn't have an x");
    }
    get y() {
        throw new Error("infinite point doesn't have a y");
    }
}();
// SCALAR MATH
function scalarAdd(a, b) {
    return (a + b) % util_1.secp256k1.n;
}
exports.scalarAdd = scalarAdd;
function scalarMultiply(a, b) {
    return (a * b) % util_1.secp256k1.n;
}
exports.scalarMultiply = scalarMultiply;
// export function add(a: Point, b: Point): Point {
//     return fastAdd(a, b)
// }
function pointAdd(...points) {
    assert_1.default(points.length > 1);
    let point = points[0];
    for (let i = 1; i < points.length; i++) {
        point = fastAdd(point, points[i]);
    }
    return point;
}
exports.pointAdd = pointAdd;
function pointSubtract(a, b) {
    b = { x: b.x, y: (util_1.secp256k1.p - b.y) % util_1.secp256k1.p };
    return pointAdd(a, b);
}
exports.pointSubtract = pointSubtract;
function pointMultiply(point, scalar) {
    scalar = scalar % util_1.secp256k1.n;
    return fastMultiply(point, scalar);
}
exports.pointMultiply = pointMultiply;
// NAIVE IMPL
function naiveAdd(a, b) {
    if (a === exports.INFINITE_POINT) {
        return b;
    }
    if (b === exports.INFINITE_POINT) {
        return a;
    }
    if (a.x === b.x && a.y !== b.y) {
        return exports.INFINITE_POINT;
    }
    const lam = a.x === b.x && a.y === b.y
        ? ((BigInt(3) * a.x * a.x + util_1.secp256k1.a) * util_1.powmod(BigInt(2) * a.y, util_1.secp256k1.p - BigInt(2), util_1.secp256k1.p)) % util_1.secp256k1.p
        : ((b.y - a.y) * util_1.powmod(b.x - a.x, util_1.secp256k1.p - BigInt(2), util_1.secp256k1.p)) % util_1.secp256k1.p;
    const x3 = (lam * lam - a.x - b.x) % util_1.secp256k1.p;
    const y = util_1.mod(lam * (a.x - x3) - a.y, util_1.secp256k1.p);
    return { x: x3, y };
}
function naiveMultiply(point, scalar) {
    scalar = scalar % util_1.secp256k1.n;
    let r = exports.INFINITE_POINT;
    for (let i = BigInt(0); i < BigInt(256); i++) {
        if ((scalar >> i) & BigInt(1)) {
            r = naiveAdd(r, point);
        }
        point = naiveAdd(point, point);
    }
    return r;
}
exports.naiveMultiply = naiveMultiply;
// Rewritten util.modInverse
function inv(a, n) {
    if (a === BigInt(0)) {
        return BigInt(0);
    }
    let [lm, hm, low, high] = [BigInt(1), BigInt(0), util_1.mod(a, n), n];
    while (low > 1) {
        const r = high / low;
        const [nm, _new] = [hm - lm * r, high - low * r];
        [lm, low, hm, high] = [nm, _new, lm, low];
    }
    return lm % n;
}
function fromJacobian(j) {
    if (j[0] === BigInt(0) && j[1] === BigInt(0)) {
        return exports.INFINITE_POINT;
    }
    const z = inv(j[2], util_1.secp256k1.p);
    const x = (j[0] * z ** BigInt(2)) % util_1.secp256k1.p;
    const y = util_1.mod(j[1] * z ** BigInt(3), util_1.secp256k1.p);
    return { x, y };
}
function toJacobian(point) {
    return [point.x, point.y, BigInt(1)];
}
function jacobianDouble(p) {
    if (p[1] === BigInt(0)) {
        return [BigInt(0), BigInt(0), BigInt(0)];
    }
    const ysq = p[1] ** BigInt(2) % util_1.secp256k1.p;
    const S = (BigInt(4) * p[0] * ysq) % util_1.secp256k1.p;
    const M = (BigInt(3) * p[0] ** BigInt(2) + util_1.secp256k1.a * p[2] ** BigInt(4)) % util_1.secp256k1.p;
    const nx = (M ** BigInt(2) - BigInt(2) * S) % util_1.secp256k1.p;
    const ny = (M * (S - nx) - BigInt(8) * ysq ** BigInt(2)) % util_1.secp256k1.p;
    const nz = (BigInt(2) * p[1] * p[2]) % util_1.secp256k1.p;
    return [nx, ny, nz];
}
function jacobianAdd(p, q) {
    if (p[1] === BigInt(0)) {
        return q;
    }
    if (q[1] === BigInt(0)) {
        return p;
    }
    const U1 = (p[0] * q[2] ** BigInt(2)) % P;
    const U2 = (q[0] * p[2] ** BigInt(2)) % P;
    const S1 = (p[1] * q[2] ** BigInt(3)) % P;
    const S2 = (q[1] * p[2] ** BigInt(3)) % P;
    if (U1 === U2) {
        return S1 === S2 ? jacobianDouble(p) : [BigInt(0), BigInt(0), BigInt(1)];
    }
    const H = U2 - U1;
    const R = S2 - S1;
    const H2 = (H * H) % P;
    const H3 = (H * H2) % P;
    const U1H2 = (U1 * H2) % P;
    const nx = (R ** BigInt(2) - H3 - BigInt(2) * U1H2) % P;
    const ny = (R * (U1H2 - nx) - S1 * H3) % P;
    const nz = (H * p[2] * q[2]) % P;
    return [nx, ny, nz];
}
function jacobianMultiply(a, n) {
    if (a[1] === BigInt(0) || n === BigInt(0)) {
        return [BigInt(0), BigInt(0), BigInt(1)];
    }
    if (n === BigInt(1)) {
        return a;
    }
    if (n < BigInt(0) || n >= util_1.secp256k1.n) {
        return jacobianMultiply(a, n % util_1.secp256k1.n);
    }
    if (n % BigInt(2) === BigInt(0)) {
        return jacobianDouble(jacobianMultiply(a, n / BigInt(2)));
    }
    else {
        // n % 2n === 1n
        return jacobianAdd(jacobianDouble(jacobianMultiply(a, n / BigInt(2))), a);
    }
}
function fastMultiply(point, scalar) {
    return fromJacobian(jacobianMultiply(toJacobian(point), scalar));
}
function fastAdd(a, b) {
    return fromJacobian(jacobianAdd(toJacobian(a), toJacobian(b)));
}
//# sourceMappingURL=elliptic.js.map
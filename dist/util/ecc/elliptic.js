"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const check = require("./check");
const util_1 = require("./util");
exports.Scalar = {
    fromBytes(buf) {
        const priv = util_1.bufferToBigInt(buf);
        if (!check.isValidPrivkey(priv)) {
            return new Error('scalar was not valid private key');
        }
        return priv;
    },
    fromHex(hex) {
        const buff = util_1.bufferFromHex(hex);
        if (buff instanceof Error) {
            return buff;
        }
        const priv = util_1.bufferToBigInt(buff);
        if (!check.isValidPrivkey(priv)) {
            return new Error('scalar was not valid private key');
        }
        return priv;
    },
    toBytes(n) {
        return util_1.bufferFromBigInt(n);
    },
    toHex(n) {
        return util_1.bufferToHex(util_1.bufferFromBigInt(n));
    },
};
exports.Point = {
    fromPrivKey(privkey) {
        if (!check.isValidPrivkey(privkey)) {
            throw new Error('scalar was not valid private key');
        }
        return pointMultiply(util_1.curve.g, privkey);
    },
    fromBytes(buf) {
        return util_1.pointFromBuffer(buf);
    },
    fromHex(hex) {
        const buff = util_1.bufferFromHex(hex);
        if (buff instanceof Error) {
            throw buff;
        }
        return exports.Point.fromBytes(buff);
    },
    toHex(point) {
        return util_1.bufferToHex(util_1.pointToBuffer(point));
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
    return (a + b) % util_1.curve.n;
}
exports.scalarAdd = scalarAdd;
function scalarMultiply(a, b) {
    return (a * b) % util_1.curve.n;
}
exports.scalarMultiply = scalarMultiply;
function scalarNegate(a) {
    return (util_1.curve.n - a) % util_1.curve.n;
}
exports.scalarNegate = scalarNegate;
// scalar^-1 mod N
function scalarInverse(a) {
    return util_1.modInverse(a, util_1.curve.n);
}
exports.scalarInverse = scalarInverse;
// POINT MATH
//
// TODO: Should point functions propagate INFINITY_POINT
// instead of failing on x/y access so that callsite can perceive INFINITY_POINT?
function pointEq(a, b) {
    return a.x === b.x && a.y === b.y;
}
exports.pointEq = pointEq;
function pointAdd(...points) {
    check.check(points.length > 1, 'can only add 1 or more points');
    let point = points[0];
    for (let i = 1; i < points.length; i++) {
        point = fastAdd(point, points[i]);
    }
    return point;
}
exports.pointAdd = pointAdd;
function pointSubtract(a, b) {
    b = { x: b.x, y: (util_1.curve.p - b.y) % util_1.curve.p };
    return pointAdd(a, b);
}
exports.pointSubtract = pointSubtract;
function pointMultiply(point, scalar) {
    scalar = scalar % util_1.curve.n;
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
        ? ((3n * a.x * a.x + util_1.curve.a) * util_1.powmod(2n * a.y, util_1.curve.p - 2n, util_1.curve.p)) % util_1.curve.p
        : ((b.y - a.y) * util_1.powmod(b.x - a.x, util_1.curve.p - 2n, util_1.curve.p)) % util_1.curve.p;
    const x3 = (lam * lam - a.x - b.x) % util_1.curve.p;
    const y = util_1.mod(lam * (a.x - x3) - a.y, util_1.curve.p);
    return { x: x3, y };
}
function naiveMultiply(point, scalar) {
    scalar = scalar % util_1.curve.n;
    let r = exports.INFINITE_POINT;
    for (let i = 0n; i < 256n; i++) {
        if ((scalar >> i) & 1n) {
            r = naiveAdd(r, point);
        }
        point = naiveAdd(point, point);
    }
    return r;
}
exports.naiveMultiply = naiveMultiply;
// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
function inv(a, n) {
    if (a === 0n) {
        return 0n;
    }
    let [lm, hm, low, high] = [1n, 0n, util_1.mod(a, n), n];
    while (low > 1) {
        const r = high / low;
        const [nm, _new] = [hm - lm * r, high - low * r];
        [lm, low, hm, high] = [nm, _new, lm, low];
    }
    return lm % n;
}
function fromJacobian(j) {
    if (j[0] === 0n && j[1] === 0n) {
        return exports.INFINITE_POINT;
    }
    const z = inv(j[2], util_1.curve.p);
    const x = (j[0] * z ** 2n) % util_1.curve.p;
    const y = util_1.mod(j[1] * z ** 3n, util_1.curve.p);
    return { x, y };
}
function toJacobian(point) {
    return [point.x, point.y, 1n];
}
function jacobianDouble(p) {
    if (p[1] === 0n) {
        return [0n, 0n, 0n];
    }
    const ysq = p[1] ** 2n % util_1.curve.p;
    const S = (4n * p[0] * ysq) % util_1.curve.p;
    const M = (3n * p[0] ** 2n + util_1.curve.a * p[2] ** 4n) % util_1.curve.p;
    const nx = (M ** 2n - 2n * S) % util_1.curve.p;
    const ny = (M * (S - nx) - 8n * ysq ** 2n) % util_1.curve.p;
    const nz = (2n * p[1] * p[2]) % util_1.curve.p;
    return [nx, ny, nz];
}
function jacobianAdd(p, q) {
    const P = util_1.curve.p;
    if (p[1] === 0n) {
        return q;
    }
    if (q[1] === 0n) {
        return p;
    }
    const U1 = (p[0] * q[2] ** 2n) % P;
    const U2 = (q[0] * p[2] ** 2n) % P;
    const S1 = (p[1] * q[2] ** 3n) % P;
    const S2 = (q[1] * p[2] ** 3n) % P;
    if (U1 === U2) {
        return S1 === S2 ? jacobianDouble(p) : [0n, 0n, 1n];
    }
    const H = U2 - U1;
    const R = S2 - S1;
    const H2 = (H * H) % P;
    const H3 = (H * H2) % P;
    const U1H2 = (U1 * H2) % P;
    const nx = (R ** 2n - H3 - 2n * U1H2) % P;
    const ny = (R * (U1H2 - nx) - S1 * H3) % P;
    const nz = (H * p[2] * q[2]) % P;
    return [nx, ny, nz];
}
function jacobianMultiply(a, n) {
    if (a[1] === 0n || n === 0n) {
        return [0n, 0n, 1n];
    }
    if (n === 1n) {
        return a;
    }
    if (n < 0n || n >= util_1.curve.n) {
        return jacobianMultiply(a, n % util_1.curve.n);
    }
    if (n % 2n === 0n) {
        return jacobianDouble(jacobianMultiply(a, n / 2n));
    }
    else {
        // n % 2n === 1n
        return jacobianAdd(jacobianDouble(jacobianMultiply(a, n / 2n)), a);
    }
}
function fastMultiply(point, scalar) {
    return fromJacobian(jacobianMultiply(toJacobian(point), scalar));
}
function fastAdd(a, b) {
    return fromJacobian(jacobianAdd(toJacobian(a), toJacobian(b)));
}
//# sourceMappingURL=elliptic.js.map
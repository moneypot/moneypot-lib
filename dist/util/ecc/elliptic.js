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
        return util_1.buffer32FromBigInt(n);
    },
    toHex(n) {
        return util_1.bufferToHex(util_1.buffer32FromBigInt(n));
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
exports.INFINITE_POINT = new (class {
    get x() {
        throw new Error("infinite point doesn't have an x");
    }
    get y() {
        throw new Error("infinite point doesn't have a y");
    }
})();
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
        ? ((BigInt(3) * a.x * a.x + util_1.curve.a) * util_1.powmod(BigInt(2) * a.y, util_1.curve.p - BigInt(2), util_1.curve.p)) % util_1.curve.p
        : ((b.y - a.y) * util_1.powmod(b.x - a.x, util_1.curve.p - BigInt(2), util_1.curve.p)) % util_1.curve.p;
    const x3 = (lam * lam - a.x - b.x) % util_1.curve.p;
    const y = util_1.mod(lam * (a.x - x3) - a.y, util_1.curve.p);
    return { x: x3, y };
}
function naiveMultiply(point, scalar) {
    scalar = scalar % util_1.curve.n;
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
// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
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
    const z = inv(j[2], util_1.curve.p);
    const x = (j[0] * z ** BigInt(2)) % util_1.curve.p;
    const y = util_1.mod(j[1] * z ** BigInt(3), util_1.curve.p);
    return { x, y };
}
function toJacobian(point) {
    return [point.x, point.y, BigInt(1)];
}
function jacobianDouble(p) {
    if (p[1] === BigInt(0)) {
        return [BigInt(0), BigInt(0), BigInt(0)];
    }
    const ysq = p[1] ** BigInt(2) % util_1.curve.p;
    const S = (BigInt(4) * p[0] * ysq) % util_1.curve.p;
    const M = (BigInt(3) * p[0] ** BigInt(2) + util_1.curve.a * p[2] ** BigInt(4)) % util_1.curve.p;
    const nx = (M ** BigInt(2) - BigInt(2) * S) % util_1.curve.p;
    const ny = (M * (S - nx) - BigInt(8) * ysq ** BigInt(2)) % util_1.curve.p;
    const nz = (BigInt(2) * p[1] * p[2]) % util_1.curve.p;
    return [nx, ny, nz];
}
function jacobianAdd(p, q) {
    const P = util_1.curve.p;
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
    if (n < BigInt(0) || n >= util_1.curve.n) {
        return jacobianMultiply(a, n % util_1.curve.n);
    }
    if (n % BigInt(2) === BigInt(0)) {
        return jacobianDouble(jacobianMultiply(a, n / BigInt(2)));
    }
    else {
        // n % BigInt(2)  === BigInt(1)
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
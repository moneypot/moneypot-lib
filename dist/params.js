import PrivateKey from './private-key';
import PublicKey from './public-key';
function notError(t) {
    if (t instanceof Error) {
        throw t;
    }
    return t;
}
export default {
    acknowledgementPrivateKey: notError(PrivateKey.fromBech('privhi1md85cpl8n87h7aw599hpgdfaqa52rvm84fxh5jeexgvc6gpvmcxq0f9v3f')),
    acknowledgementPublicKey: notError(PublicKey.fromBech('pubhi1q0uxh43waf75mjxle0wsygm6em590kula0agetmx6rhcuvsfnrqv7kxa5dv')),
    basicTransferFee: 200,
    blindingCoinPrivateKeys: [
        notError(PrivateKey.fromBech('privhi1kfrhyxmkaakmcw7kkcvjekmv9kq7gvkgastz48tud3y439tf3zqqy05tap')),
        notError(PrivateKey.fromBech('privhi1l3clpzy4q2fm27tcv56sqcc8auer95se0cv6pwrdkmr767n28whsk4qmwl')),
        notError(PrivateKey.fromBech('privhi1r3qf7mm30dx38yyu0k460rhntnrt3wmug4x453jrm3fhfuhg5cpse6rgq8')),
        notError(PrivateKey.fromBech('privhi1j2g34mfmzsrpwyuj2gg5pkkzyfua9kf3r4aek02jfpy96wkrj3ns99mxz5')),
        notError(PrivateKey.fromBech('privhi1pal8dwaall9hev58ek5pu4tjsvapwnqgx7yqd0r8g0547nxjkfes6jl8sc')),
        notError(PrivateKey.fromBech('privhi19wys77mnylcc8y8txaqm43qpjc54p8585fue79p8w2vmk7nnet4qpxgqc5')),
        notError(PrivateKey.fromBech('privhi18y0hd0pq7xjq5q7k5rl0vgrgk2y9h24en5sl9m2hp62j3ff6eg8q4wuzm6')),
        notError(PrivateKey.fromBech('privhi18v0wgemn7qmpm9hvahgq3gu059gwejayw0a3yrlqefun68adnfnqsej0ht')),
        notError(PrivateKey.fromBech('privhi16fspujqg5w4ke85culxvywcfvm4v265ltqnze3jg3lk8ahxkkf6q35v4mq')),
        notError(PrivateKey.fromBech('privhi1j2n6pjnpd885d482n9u9vf0dz4u7c6erxva9sp6tm52lpxnl5hsqqfrfq7')),
        notError(PrivateKey.fromBech('privhi1ykhlz4tdudaylj2el6xc40rnvaf0tj45nkz35axmqgj4zt8q063svyfq5t')),
        notError(PrivateKey.fromBech('privhi15kl6u92gwt5fk5se0spg73cx6dmfqj6khjtuu662cssyg9kjwarsf9d2n6')),
        notError(PrivateKey.fromBech('privhi1gw8m925773r0l0uckvwwahzpu2jfugttqrrx8r66zppgjpguxusshzqk3n')),
        notError(PrivateKey.fromBech('privhi1dmvnsgr783mlp2rcpc3rl9xwe4e993mk2ctdp86plcjnptcnwxvsmza9w6')),
        notError(PrivateKey.fromBech('privhi1chwsmj5h723gmpvnwf77edw3748r73th20cksleed9fnxf9nts9qdg76vl')),
        notError(PrivateKey.fromBech('privhi1k7xqv7f5ydp0tsk0jn2g97n9wdsey2snak6astdfjv86gw3ux4ps5xyqqw')),
        notError(PrivateKey.fromBech('privhi1qlha0pt25u332guvgukqz9q9k4x6eqsafauvkx93d35tjthpzy8qg2ttt2')),
        notError(PrivateKey.fromBech('privhi1l7hfllajvan3wdkym8prxhhjnllnc5vt4mf9qg6up4gkas8cnuyq2zmdfd')),
        notError(PrivateKey.fromBech('privhi17z7yt4ndg5s5wxv94yqemdqd8ypcvzerwege5a7ml4960kf9hmvqz0thvd')),
        notError(PrivateKey.fromBech('privhi13xcrdzmgxzp57gfj03xhw7pyapg75a2s8drs4wt2trpr8a8uz2eqqh0ann')),
        notError(PrivateKey.fromBech('privhi1jyud0sqqju0czncx6mdk7fszfkjpr24f56vq7maanmd5sfxhd6jq7y4d02')),
        notError(PrivateKey.fromBech('privhi15ff2gstja4reqtd0mjkf0ny0p2cgl6zwqdyrgqc3eq3sdmqkcp6sk0cj6d')),
        notError(PrivateKey.fromBech('privhi1g2asqhuahy9sy05mn9s6jlxcmahspnw5jsazyeqh7vkf37rlvz4s8wsxsh')),
        notError(PrivateKey.fromBech('privhi1tptrnwcsls9vkm4jc7pppjjmv4pmpkqhgklqvewj7gwwxgj5sq2q2gqepp')),
        notError(PrivateKey.fromBech('privhi1vkwcu6rangzgwmyeqe74vd8w636ml3hr2ad9g6zsffu0hl3jluxqp2upqf')),
        notError(PrivateKey.fromBech('privhi1s935enq504egw37spnpdcdmy3kfz593swsx7zc2zfqnk0jdnv4jq9lfhvn')),
        notError(PrivateKey.fromBech('privhi17293wppfnndeul02hnpsjpyjap02y22wmz99g8qz35gyvjhdudusm3k6ac')),
        notError(PrivateKey.fromBech('privhi1xfjjqf2gd792l7fzalledw3zcqqjjd9tzmepawqxqrv9sy6vtu2qvahfcw')),
        notError(PrivateKey.fromBech('privhi15jge47gm9uk005lhupqdxnt3m4elzkvl9u62y9xdjdm3kx3l9m2q3cw5yc')),
        notError(PrivateKey.fromBech('privhi1pkt8wjmd9c2h5pj78ukchcnayjc7afjvvlzmyrt6fgpd22d2hgmsxq59ta')),
        notError(PrivateKey.fromBech('privhi1pxreys4qudjjsmlzhzcrk63x9377ryavs8pchknc0ayuvn2sr4gsxkh47q')),
    ],
    blindingCoinPublicKeys: [
        notError(PublicKey.fromBech('pubhi1q2l7qwddj8vsd5u6kfldlmkwn57zj4ju459jl6v00540mnlp594cxf73cwy')),
        notError(PublicKey.fromBech('pubhi1q2lz7tgxm252zqymqrcu88sz2wxzrjgqfwx9n6fxh93dxhhyr5ug5q59gsl')),
        notError(PublicKey.fromBech('pubhi1qd7xs4wur2ls3mp03js8wnrkqeesrthhdga30rqpr23dgcp2h63kuwqphls')),
        notError(PublicKey.fromBech('pubhi1qfqg70k66daugzzatdemgded5gkz3wdjwa6kcf6nn3qehvnv4q69zlesw7r')),
        notError(PublicKey.fromBech('pubhi1qvgs8ypdcrqqt3jnnnv053yj2n40stl75cguj9pcy89hqdnttp577xnwmtl')),
        notError(PublicKey.fromBech('pubhi1qggwkxsx65de633nprcg552kx6nmd3z9wv84az9xct02k3ue8pyejls6lk8')),
        notError(PublicKey.fromBech('pubhi1qgvk6rfzua58czd4j5n98vhj4x4ycepvcedrklyltgqvhhhgcme0vdnqkte')),
        notError(PublicKey.fromBech('pubhi1qtu43wr0qrv6c3vulrky2ur69urwryswz94qu65luvll39yf7nrh5cpz2y0')),
        notError(PublicKey.fromBech('pubhi1qdz3jvgljvhufnzv45dskzpdkut8x68w9n9h28g5j89dsdhsafku7vw58jz')),
        notError(PublicKey.fromBech('pubhi1qwc3uzjj3qylpudqljc5f7n0l0njdvvhgq8v3fs7xzur69y92stsk703fyg')),
        notError(PublicKey.fromBech('pubhi1qw4aa902e8pygceupkl2wfmg4xrez7frufhd9lramzdyrmnpd5kt5xwht53')),
        notError(PublicKey.fromBech('pubhi1q2zy8ln7ce50uz7rfnua0npmap6gd3cwgul3g5fmgwz7fxy34ysnw7z3peu')),
        notError(PublicKey.fromBech('pubhi1qdkwj8xwe7gx9kq436agz2aqfaveh8kl8hjmemctwdfvf365zu8m6l6485u')),
        notError(PublicKey.fromBech('pubhi1q2evytc7kaucn7r78dd2zlmjfnwgk228yy0286zhrd9km64yfdkv6k2sujm')),
        notError(PublicKey.fromBech('pubhi1qd6uqeuthd9amy5cqgd8nptwg03mcgzr0xmtmmgndp8j2rvp6chhckkgch4')),
        notError(PublicKey.fromBech('pubhi1qfhhf96z63gfafrysncf7l4nt92xfalangjagxhln5lfwuj3575xke9lddj')),
        notError(PublicKey.fromBech('pubhi1qdrjqcqxws87728tz0qzv9jw73mqdgw7jc878435kkr7vd5w83ufypwlkwp')),
        notError(PublicKey.fromBech('pubhi1q2rn4shy8dtwru86d70ezdqhj3q4kvpv3j694vdcqsa6qykvteu2j6ztw9h')),
        notError(PublicKey.fromBech('pubhi1qwj4vc7lcdaugsae9wt6fdkvgdydrmlef5d48ar89xht9lrw67nrumcyce8')),
        notError(PublicKey.fromBech('pubhi1qvp2tht5gek2wu0f2gm54kkll9lx5dgt6z0mcdafu6g7av2sn3xpqheys0x')),
        notError(PublicKey.fromBech('pubhi1q067gcxntwc4ug7pf3xter20ke7fglgffsyx5x8rv8dq99eprgtvye9rta5')),
        notError(PublicKey.fromBech('pubhi1qgf3ytfv3wasg5hhnh3ngd2dsfqf8d6lzr6usgtpcyx6uyhs9skl5hudx3v')),
        notError(PublicKey.fromBech('pubhi1qdjuzz03y24cvmsj8czx0r7w68fmayjflqt8cmu8r7qqm3aggddzvl5xwzu')),
        notError(PublicKey.fromBech('pubhi1q27ced66eu7heul88005jen4x7zkpjkr9fhsv5pdhwd05ndclhr8z6040vl')),
        notError(PublicKey.fromBech('pubhi1q00at8lr28g3ej0pnuy7k955qqxgthyw4hm5arc4dvmzwyjgf69dzxjdrdz')),
        notError(PublicKey.fromBech('pubhi1qt3w6tsd8eyzmuvs5rt3962u35jyq4jnzmc8u9m6duspfwa36vav29guw3h')),
        notError(PublicKey.fromBech('pubhi1qfh0cp0wqfzx44hkzcxxrrcfslq5jpgk5jskldjq6h6ptsg4z8fqk3hsrx4')),
        notError(PublicKey.fromBech('pubhi1qvwwm2xuwzhr769fn9kaceqwgk3pt7hmpgeackx7rsaftaz6ywzuw5w5v3t')),
        notError(PublicKey.fromBech('pubhi1qtd36emp24cxsfsegz8helc3r8r5jet2v7mcl9lmuytlp7kkhjm8vajefqz')),
        notError(PublicKey.fromBech('pubhi1qf073s2fysvn4l635mlh44w8v948xqdzvzjttp3fp3lnn8zzl99d73ykexj')),
        notError(PublicKey.fromBech('pubhi1qfxnla5szd7nvdxyea00r2s99ms8m7u8qp09fl6hx70x7rc7pdrvy6c836m')),
    ],
    fundingPrivateKey: notError(PrivateKey.fromBech('privhi1my22pmqudrgqayjsu48prz56pe744scv25geytq4qymf54z2694s5f3nsp')),
    fundingPublicKey: notError(PublicKey.fromBech('pubhi1qgvq888xee50z5588tzxdnh46j7l64hc6qu9sj4h3v2gtnyasa9tc8mzlzl')),
    templateTransactionWeight: 1000,
    transactionConsolidationFee: 5000,
};
//
// import * as buffutils from './util/buffutils';
//
//
// let param: any = {};
//
//
// function toJson(x: any) {
//   if (typeof x === 'string') {
//     return x;
//   }
//   if (typeof x === 'number') {
//     return x.toString();
//   }
//
//   if (typeof x === 'bigint') {
//     return x.toString();
//   }
//
//   if (Array.isArray(x)) {
//     let buf = '[\n';
//
//     for (const k of x) {
//       buf += '\t' + toJson(k) + ', \n';
//     }
//
//     buf += ']';
//     return buf;
//   }
//
//   if (typeof x === 'object') {
//       if (x instanceof PrivateKey) {
//         return `notError( PrivateKey.fromBech("${ x.toBech() }") )`;
//       }
//       if (x instanceof PublicKey) {
//         return `notError( PublicKey.fromBech("${ x.toBech() }") )`;
//       }
//
//
//     let buf = '{\n';
//
//     for (const k of Object.keys(x)) {
//       const v = x[k];
//       buf += k + ': ' + toJson(v) + ',\n';
//     }
//
//     buf += '}\n';
//     return buf;
//   }
//
//
//   throw new Error('unknown x: ' + x.toString());
//
// }
//
//
// async function c() {
//   // obviously for dev only...
//   const masterPriv = PrivateKey.fromBech('privhi1gqfkvnju6n9qqmz4hgvq3dd8rg5lgl72tmz63pjxay3wm4rz39eqy2jtly');
//   if (masterPriv instanceof Error) {
//     throw masterPriv;
//   }
//
//   const fundingPriv = await masterPriv.derive(buffutils.fromUint8(0));
//   const ackPrivkey = await masterPriv.derive(buffutils.fromUint8(1));
//   const blindPriv = await masterPriv.derive(buffutils.fromUint8(2));
//
//   const t = {
//     acknowledgementPrivateKey: ackPrivkey, //  wont be exposed for prodnet ... ;D
//     acknowledgementPublicKey: await ackPrivkey.toPublicKey(),
//     basicTransferFee: 200, // satoshi...
//     blindingCoinPrivateKeys: new Array<PrivateKey>(31), // array of 0 to 30 (inclusive) -- dev obviously
//     blindingCoinPublicKeys: new Array<PublicKey>(31),
//     fundingPrivateKey: fundingPriv, //  wont be exposed for prodnet ... ;D
//     fundingPublicKey: await fundingPriv.toPublicKey(),
//     templateTransactionWeight: 1000, // the fake-size of a transfer when making a withdrawal
//     transactionConsolidationFee: 5000,
//   };
//
//   for (let i = 0; i < 31; i++) {
//     t.blindingCoinPrivateKeys[i] = await blindPriv.derive(buffutils.fromUint8(i));
//     t.blindingCoinPublicKeys[i] = await t.blindingCoinPrivateKeys[i].toPublicKey();
//   }
//
//   console.log('initalized param as: ', t);
//   console.log(toJson(t));
//
//
//   param = t;
// }
// c();
//
// export default param;
//
//
//# sourceMappingURL=params.js.map
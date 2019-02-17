export default function(x: boolean) {
  if (!x) {
    throw new Error('assertion failed');
  }
}

export function equal(l: any, r: any) {
  if (l !== r) {
    console.error('assertion failed: ', l, ' !=== ', r);
    throw new Error('assertion failed');
  }
}

export function is(l: any, r: any) {
  if (!(l instanceof r)) {
    console.error('assertion failed: ', l, ' is not instance of ', r);
    throw new Error('assertion failed');
  }
}

export function check<V>(f: (v: V) => boolean, x: V) {
  if (f(x) !== true) {
    console.error('assertion failed: ', x, ' didnt pass the test');
    throw new Error('assertion failed');
  }
}

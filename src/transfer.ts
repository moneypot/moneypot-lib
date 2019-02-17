import Hash from './hash';

export default class Transfer {
  public static hashOf(sourceHash: Hash, outputHash: Hash) {
    const h = Hash.newBuilder('Transfer');

    h.update(sourceHash.buffer);
    h.update(outputHash.buffer);

    return h.digest();
  }
}

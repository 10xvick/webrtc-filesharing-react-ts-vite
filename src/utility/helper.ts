export function encodefilename(name = "") {
  return encodeURIComponent(name.replace(/ /g, "_"));
}

export function concatenateUint8Arrays(
  arr1: Uint8Array,
  arr2: Uint8Array
): Uint8Array {
  const result = new Uint8Array(arr1.length + arr2.length);
  result.set(arr1, 0);
  result.set(arr2, arr1.length);
  return result;
}

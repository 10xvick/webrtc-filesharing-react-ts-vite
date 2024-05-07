export function encodefilename(name: string) {
  return encodeURIComponent(name.replace(/ /g, "_"));
}

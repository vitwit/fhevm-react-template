/**
 * Returns true if the code is running in a browser environment.
 */
export function isBrowser() {
    return typeof window !== "undefined" && typeof window.document !== "undefined";
}
/**
 * Returns true if the code is running in Node.js environment.
 */
export function isNode() {
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
}

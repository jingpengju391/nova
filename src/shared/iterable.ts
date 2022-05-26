export namespace Iterable {
  export function is<T = any>(thing: any): thing is IterableIterator<T> {
    return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function'
  }
}

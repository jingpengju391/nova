/* eslint-disable no-redeclare */
import { once } from './functional'
import { Iterable } from './iterable'
export interface ITerminable {
  terminate(): void
}

export function isTerminable<T extends object>(thing: T): thing is T & ITerminable {
  return typeof (<ITerminable>thing).terminate === 'function' && (<ITerminable>thing).terminate.length === 0
}

export class MultiDisposeError extends Error {
  constructor(
    public readonly errors: any[]
  ) {
    super(`Encountered errors while disposing of store. Errors: [${errors.join(', ')}]`)
  }
}

export function terminate<T extends ITerminable>(disposable: T): T
export function terminate<T extends ITerminable>(disposable: T | undefined): T | undefined
export function terminate<T extends ITerminable, A extends IterableIterator<T> = IterableIterator<T>>(disposables: IterableIterator<T>): A
export function terminate<T extends ITerminable>(disposables: Array<T>): Array<T>
export function terminate<T extends ITerminable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>
export function terminate<T extends ITerminable>(arg: T | IterableIterator<T> | undefined): any {
  if (Iterable.is(arg)) {
    let errors: any[] = []

    for (const terminable of arg) {
      if (terminable) {
        try {
          terminable.terminate()
        } catch (e) {
          errors.push(e)
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0]
    } else if (errors.length > 1) {
      throw new MultiDisposeError(errors)
    }

    return Array.isArray(arg) ? [] : arg
  } else if (arg) {
    arg.terminate()
    return arg
  }
}

export function toTerminable(fn: () => void): ITerminable {
  return {
    terminate: once(fn)
  }
}

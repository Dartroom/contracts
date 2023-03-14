type PromiseObject = Record<any, Promise<any>>

type AwaitedObject<T> = {
  [K in keyof T]: Awaited<T[K]>
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

/**
 * Object version of `Promise.all()`. Will convert the object to an Array, apply `Promise.all()` and return an object of the awaited promises instead.
 */
export const resolveObject = async <T extends PromiseObject> (object: T): Promise<AwaitedObject<T>> => {
  let resolvedObject = {} as AwaitedObject<T>
  const promises: Array<Promise<T>> = []

  const entries = Object.entries(object) as Entries<T>

  for (const [key, value] of entries) {
    promises.push(value)
  }

  const results = await Promise.all(promises)

  for (let [index, [key, value]] of entries.entries()) {
    const result = results[index] as Awaited<T[keyof T]>
    const property = key as keyof T

    if (!result) {
      throw new Error(result)
    }

    resolvedObject[property] = result
  }

  return resolvedObject
}

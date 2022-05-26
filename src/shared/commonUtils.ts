export async function asyncForEach<T>(array: Array<T>, callback: (element: T, index?: number, array?: Array<T>) => any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export function generateFormattedTimeString(milliSeconds: number) {
  const hours = Math.floor(milliSeconds / 1000 / 60 / 60)
  milliSeconds -= hours * 1000 * 60 * 60

  const minutes = Math.floor(milliSeconds / 1000 / 60)
  milliSeconds -= minutes * 1000 * 60

  const seconds = Math.floor(milliSeconds / 1000)
  milliSeconds -= seconds * 1000

  return `${hours}h ${minutes}m ${seconds}s ${milliSeconds}ms`
}

export function convertToNumber(s: string | number): number {
  return +s
}

export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

export const inputNameLength = 64

export const inputTextLength = 512

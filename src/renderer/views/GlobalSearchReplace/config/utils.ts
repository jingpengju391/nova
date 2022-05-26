// @ts-ignore
export function getSourceForJson(objects, filters):Array<Array<string>> {
  // @ts-ignore
  return Object.keys(objects).reduce((newObj, key) => {
    if (objects[key] && typeof objects[key] === 'object') {
      const temp = getSourceForJson(objects[key], filters)
      // @ts-ignore
      temp.length &&
      // @ts-ignore
      newObj.push(...temp.map(([l, ...objects]) => [key + ' ' + l, ...objects]))
      // @ts-ignore
      return newObj
    }
    // @ts-ignore
    filters(objects, key) &&
    // @ts-ignore
    newObj.push([key, objects[key], objects.name])
    return newObj
  }, [])
}

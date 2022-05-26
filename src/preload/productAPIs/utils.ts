import { AnchorProductDb, AnchorProduct, AnchorProductJson } from '@shared/dataModelTypes/product/products'
export function ObjectSerialize(object:any) {
  return Object.keys(object).reduce((r, k) => {
    if (typeof r[k] === 'object') r[k] = JSON.stringify(r[k])
    return r
  }, <any>object)
}

export function convertMasterQueryResultToMasterArray(masters:AnchorProductDb[]):AnchorProduct[] {
  return masters.map(master => {
    const mastersJson:AnchorProductJson = {
      ...master,
      codeIndexes: JSON.parse(master.codeIndexes),
      products: JSON.parse(master.products)
    }
    return new AnchorProduct(mastersJson)
  })
}

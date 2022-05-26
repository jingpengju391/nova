import DBClient from '../../service/db/dbClient'
import { AnchorProductJson, AnchorProductDb, AnchorProduct } from '@shared/dataModelTypes/product/products'
import { omit, clone } from '@shared/functional'
import { ObjectSerialize, convertMasterQueryResultToMasterArray } from './utils'
const productsApis = {
  username: '',
  userSpace: '',
  db: {
    async insertMastert(master: AnchorProductJson) {
      const param = omit(['id'], ObjectSerialize(master))
      return DBClient.getInstance(productsApis.username)('master').insert(param).then(([id]: any) => id)
    },
    async deleteMasterById(masterId: number) {
      const deleteMaster = await DBClient.getInstance(productsApis.username)('master')
        .where('id', masterId)
        .delete()
      const deleteBlock = await DBClient.getInstance(productsApis.username)('blocks')
        .where('productId', masterId)
        .delete()
      return {
        deleteMaster,
        deleteBlock
      }
    },
    async updateMasterById(master:Partial<AnchorProductJson>) {
      const id = master.id
      const param = omit(['id'], ObjectSerialize(master))
      return await DBClient.getInstance(productsApis.username)('master')
        .where('id', id)
        .update(param)
    },
    async queryAllMasterOfWorkspace(workspaceId: number):Promise<AnchorProduct[]> {
      const result:AnchorProductDb[] = await DBClient.getInstance(productsApis.userSpace)('master')
        .where('workspaceID', workspaceId)
        .select('*')
      return convertMasterQueryResultToMasterArray(result)
    }
  }
}
export default productsApis

import { ModuleOption } from '../definition'
import type { HelpNavList } from '@shared/dataModelTypes/helps'

interface curSelect {
  type: any,
  id: number
}

interface State {
  navLists: HelpNavList[]
}
interface Getters {

}
interface Mutations {
  changeCurrentSelect: curSelect
  addNavSerchList: any
  clearAllSerchList: any
}
interface Actions {

}
export type HelpModule = ModuleOption<State, Getters, Mutations, Actions>;
const mod: HelpModule = {
  namespaced: true,
  state: {
    // navLists: [
    //   { id: 1, name: '技术文章1', curSelect: true, type: 'technicalDoc' },
    //   { id: 2, name: '技术文章2', curSelect: false, type: 'technicalDoc' },
    //   { id: 3, name: '技术文章3', curSelect: false, type: 'technicalDoc' },
    //   { id: 1, name: '用户手册1', curSelect: false, type: 'usersManual' },
    //   { id: 2, name: '用户手册2', curSelect: true, type: 'usersManual' },
    //   { id: 3, name: '用户手册3', curSelect: false, type: 'usersManual' }
    // ] as HelpNavList[]
    navLists: [
      // { id: 1, name: '技术文章1', curSelect: true, type: 'technicalDoc' },
      // { id: 2, name: '技术文章2', curSelect: false, type: 'technicalDoc' },
      // { id: 3, name: '技术文章3', curSelect: false, type: 'technicalDoc' },
      // { id: 1, name: '用户手册1', curSelect: false, type: 'usersManual' },
      // { id: 2, name: '用户手册2', curSelect: true, type: 'usersManual' },
      // { id: 3, name: '用户手册3', curSelect: false, type: 'usersManual' }
    ]
  },
  getters: {

  },
  mutations: {
    changeCurrentSelect: (state, curSelect1: curSelect) => {
      state.navLists.map(item => {
        if (item.type === curSelect1.type) {
          if (item.id === curSelect1.id) {
            item.curSelect = true
          } else {
            item.curSelect = false
          }
        }
      })
    },
    addNavSerchList: (state, navList) => {
      state.navLists.push(navList)
    },
    clearAllSerchList: (state) => {
      state.navLists.splice(0, state.navLists.length)

      setTimeout(() => {

      }, 3000)
    }
  },
  actions: {

  }
}
export default mod

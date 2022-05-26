import { useStore } from 'vuex'

export const findRule = (rule:string) => {
  const store = useStore()
  const path = `globalSearchReplace/${rule}`
  store.commit(path)
}

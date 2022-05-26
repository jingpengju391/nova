import { ModuleOption } from '../definition'
interface ContextWorBarProps {
  value: number
  label: string
  slotName: string
  [propName:string]: any
}

interface State {
  currentNavigation: ContextWorBarProps
}
interface Getters {
  currentNavigation: ContextWorBarProps
}
interface Mutations {
  setCurrentNavigation: ContextWorBarProps
}

interface Actions {}

export type NavigationModule = ModuleOption<State, Getters, Mutations, Actions>;

const mod: NavigationModule = {
  namespaced: true,
  state: {
    currentNavigation: {} as ContextWorBarProps
  },
  getters: {
    currentNavigation: state => state.currentNavigation
  },
  mutations: {
    setCurrentNavigation: (state, currentNavigation) => {
      state.currentNavigation = currentNavigation
    }
  },
  actions: {}
}
export default mod

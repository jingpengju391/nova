export interface Runner {
  id: number
  name: string
  modelId: number | null
  inputId: number | null
  targets: number[] // array of targetIds
  outputs: number[] // array of outputIds
  blockInputId: number[]
  groupSeparators: string[]
  assumption: object
  workspaceId: number | null
}

export function createARunner(): Runner {
  return {
    id: 0,
    name: '',
    modelId: null,
    inputId: null,
    targets: [],
    outputs: [],
    blockInputId: [],
    groupSeparators: [],
    assumption: {},
    workspaceId: null
  }
}

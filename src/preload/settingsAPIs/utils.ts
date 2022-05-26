export function parseARunnerDoc(result: any): void {
  result.slidingWindow = !!result.slidingWindow
  result.rebaseDepth = !!result.rebaseDepth
  result.rebaseSwitch = !!result.rebaseSwitch
  result.allowScope = !!result.allowScope
  result.modelPointsOutput = !!result.modelPointsOutput
  result.allowIterationWhenCircularReference = !!result.allowIterationWhenCircularReference
  result.allowInnerLoopNumber = !!result.allowInnerLoopNumber
  result.allowOuterLoopNumber = !!result.allowOuterLoopNumber
  result.independentInnerLoop = !!result.independentInnerLoop
  result.independentOuterLoop = !!result.independentOuterLoop
}

export function parseTaskDoc(result: any): void {
  result.childFolderSelect = !!result.childFolderSelect
}

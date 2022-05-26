export default class CodeIndexFingerPrint {
  codeIndexId: string
  codeIndexName: string
  modelId: number
  linkExpression: string

  constructor(codeIndexId: string, codeIndexName: string, modelId: number, linkExpression?: string) {
    this.codeIndexId = codeIndexId
    this.codeIndexName = codeIndexName
    this.modelId = modelId
    this.linkExpression = linkExpression ?? 'NA'
  }
}

export const CodeIndexFPDelimiter = '@@'

export function generateCodeIndexFingerPrintString(fp: CodeIndexFingerPrint): string {
  return fp.codeIndexId + CodeIndexFPDelimiter + fp.modelId + CodeIndexFPDelimiter + fp.linkExpression
}

export function deCodeIndexFingerPrintString(fpString: string): CodeIndexFingerPrint | undefined {
  const regexp = /^(?<codeIndexId>\w+)@@(?<modelId>\d+)@@(?<linkExpression>.+)$/
  const match = fpString.match(regexp)!
  if (match && match.groups && match.groups.codeIndexId && match.groups.modelId && match.groups.linkExpression) {
    const modelId = parseInt(match.groups.modelId)
    return new CodeIndexFingerPrint(
      match.groups.codeIndexId,
      match.groups.codeIndexName,
      modelId,
      match.groups.linkExpression
    )
  }
}

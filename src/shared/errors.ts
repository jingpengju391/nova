/*
  This actually not an Error, which just indicates the user cancels a data input import
  Error type for import DataInputs, Mask JSON, Projection Setting JSON
 */
export class DataInputPreviewReachLineLimit extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileImportCancelError'
  }
}

export class InvalidFilePathError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidFilePathError'
  }
}

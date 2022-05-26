exports.outputLine = (...args) => {
  global.console.log(...args, '\n')
}
exports.outputErrLine = (...args) => {
  global.console.error(...args, '\n')
}

const fs = require('fs')
const path = require('path')
const isExist = (path:String) => { // 判断文件夹是否存在, 不存在创建一个
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

module.exports = {
  copyFile: function (sourcePath:string, targetPath:string) {
    const sourceFile = fs.readdirSync(sourcePath, { withFileTypes: true })
    sourceFile.forEach(file => {
      const newSourcePath = path.resolve(sourcePath, file.name)
      const newTargetPath = path.resolve(targetPath, file.name)
      if (file.isDirectory()) {
        isExist(newTargetPath)
        this.copyFile(newSourcePath, newTargetPath)
      } else {
        fs.copyFileSync(newSourcePath, newTargetPath)
      }
    })
  },
  deleteFolder: function (path:string) {
    let files = []
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path)
      files.forEach(function(file:any) {
        let curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          module.exports.deleteFolder(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(path)
    }
  }
}

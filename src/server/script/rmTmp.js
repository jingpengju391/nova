const rimraf = require('rimraf')
rimraf('/root/AppData/Local/Temp/com.deep-light.nova',function (err) {
  if (!err){
    console.log('删除临时文件夹完毕')
  }else {
    console.log('删除临时文件夹失败,',err)
  }
})


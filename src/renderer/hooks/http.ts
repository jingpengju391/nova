
import axios from 'axios'
import { ElMessage } from 'element-plus'
axios.defaults.withCredentials = true
// post请求
export async function httpPost(url: string, params: any, config?:any) {
  return new Promise((resolve, reject) => {
    axios.post(url, params, config).then(res => {
      // console.log(url, res.data.data)
      if (res.data.status === 200) {
        // console.log(1111)
        resolve(res.data.data)
      } else if (res.data.status === 300) {
        window.location.reload()
      } else {
        ElMessage.error({
          message: res.data.msg
        })
      }
    }).catch(err => {
      console.log(err)
      console.log('请求发生错误---')
    })
  })
}

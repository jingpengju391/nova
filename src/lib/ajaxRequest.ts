// ajaxRequest 获取

// 这是一个公共的库，很多接口都可以调用这个库

// 引入 axios
import axios from 'axios'

class AjaxRequest {
  // 构造函数里面，写一些默认的属性和方法
  // new 一下，立马就能使用
  baseURL: string
  timeout: number

  constructor(baseURL: string) {
    // 判断是开发还是上线
    // 如果是开发环境，则使用http://localhost:3000
    // 请求的路径
    this.baseURL = baseURL
    if (!this.baseURL) {
      this.baseURL = process.env.NODE_ENV === 'production' ? '/' : 'http://127.0.0.1:3000'
    }
    console.log('this.baseURL---------', this.baseURL)
    this.timeout = 3000 // 超时时间。3秒。
  }

  // 自定义一个将传进来的参数和默认参数进行融合的方法
  merge(options: any) {
    // 使用默认定义的baseURL 和 timeout参数
    return { ...options, baseURL: this.baseURL, timeout: this.timeout }
  }

  // 自定义一个拦截器
  setInterceptor(instance: any) {
    // 对请求进行拦截
    // 更改请求头
    instance.interceptors.request.use((config: any) => {
      console.log(config)
      // 可以修改请求头
      // 在请求头里面，加token
      config.headers.Authorization = '123'
      return config
    })

    // 对响应后的数据，进行拦截
    // 如果上一个promise， 返回了一个常量，会作为下一个promise的输入
    instance.interceptors.response.use((res: any) => {
      return res.data
    })
  }

  request(options: any) {
    // 创建实例的方式，来使用axios
    let instance = axios.create() // 通过axios库创建一个axios实例
    // 设置拦截器
    if (!instance) {
      console.log('instance-----error')
      return
    }
    this.setInterceptor(instance)
    // 设置参数。 将options和默认参数，进行融合。
    let config = this.merge(options)
    // axios执行后返回的是一个promise
    return instance(config)
  }
}

// 导出的是类，我们new一下，就可以直接调用类里面的方法
export default module.exports = AjaxRequest

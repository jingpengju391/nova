export default {
  port: 3000,
  compileBaseUrl: 'http://localhost:3010',
  // port:3001,
  status: {
    unLogin: 300, // 没有登录
    cantBeAcess: 301 // 没有访问权限
  },
  logoutTime: 60 * 1000 * 60 * 24
  // logoutTime:9000
}

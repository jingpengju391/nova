z### install dependencies after pulling the code
`npm install && npm run postinstall`

### (optional) install local sqlite client
[DB Browser for SQLite](https://sqlitebrowser.org/)

### [antlr doc](https://github.com/antlr/antlr4/blob/master/doc/index.md)

### BS架构前端部署方法
1.登录服务器\
2.进入/root/Nova文件夹\
3.运行npm i\
4.运行npm run build:web
   
### BS架构后端部署方法
1.登录服务器\
2.进入/root/Nova文件夹\
3.运行npm i\
4.运行npm i -g pm2\
5.运行pm2 delete all\
6.运行npm run server:prod

### BS架构给用户注册方法
1.gitlab仓库克隆instrument项目，具体使用方法阅读该项目的readme

### BS架构在服务器上更新基础workspace文件的方法
1.打开服务器/root/workspaces文件夹。\
2.把新的SampleModel.zip文件上传的上面的文件夹中覆盖原有的zip文件。\
3.删除某个用户的子工作区文件夹，当该用户下次登录的时候，新的workspace文件将自动复制到该用户的子工作区中。

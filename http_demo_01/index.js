const http = require('http')
const URL = require('url').URL
const path = require('path')
const { open } = require('fs/promises')
const routers = require('./routers/index.js')




let httpServer = http.createServer()

// 配置静态目录
routers.setStaticPath('static')

//绑定路由
httpServer.on('request', routers)



httpServer.listen(3000)
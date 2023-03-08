const { open } = require('fs/promises')
const URL = require('url').URL
const path = require('path')
const { getMimeType } = require('../utils/common')

exports.staticFile = async function (filepath, req, res) {
    let urlObj = new URL(req.url, `http://${req.headers.host}`);
    // 1.1获取path,将没有具体指向的/指向到/index.html首页
    let pathName = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;

    // 1.2获取path中路径的扩展名，根据扩展名调用自定义的getMimeType方法，来确定向请求端返回何种格式的文件
    let fileExtname = path.extname(pathName)
    let mimeType = await getMimeType(fileExtname)
    try {
        let fileHandle = await open(`./${filepath}/${pathName}`, 'r')
        let file = await fileHandle.readFile()
        fileHandle.close()

        res.writeHead(200, { "Content-Type": `${mimeType};charset='utf-8'` })
        res.write(file)
        res.end()
        // 1.3 如果获取文件失败，则返回404静态页面
    } catch (error) {
        let fileHandle = await open(`./${filepath}/404.html`, 'r')
        let file = await fileHandle.readFile()
        fileHandle.close()
        res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" })
        res.write(file)
        res.end()

    }
}
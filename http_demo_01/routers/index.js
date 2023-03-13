const { open } = require('fs/promises')
const URL = require('url').URL
const path = require('path')
const ejs = require('ejs')
const { getMimeType } = require('../utils/common')


let server = function () {

    // 全局的G对象，封装_get，_post方法
    let G = {
        _get: {},
        _post: {},
        //指定默认静态文件目录,setStaticPath方法没调用时指向默认的静态文件目录
        staticPath: 'static',
        staticFile: async (filepath, req, res) => {
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
                let fileHandle = await open(`${process.cwd()}/${filepath}/404.html`, 'r')
                let file = await fileHandle.readFile()
                fileHandle.close()
                res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" })
                res.write(file)
                res.end()

            }
        }
    }

    let app = async (req, res) => {
        let urlObj = new URL(req.url, `http://${req.headers.host}`);
        // 1.1获取path,将没有具体指向的/指向到/index.html首页
        let pathName = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
        let reqMethod = req.method.toLowerCase()
        let fileExtname = path.extname(pathName)


        if (fileExtname) {
            await G.staticFile(G.staticPath, req, res)
        } else {
            // 2.如果url的path中不带文件后缀名，则调用router模块封装的方法，根据pathName来匹配对应的路由
            // let pathstr = pathName.replace("/", "")
            // get方法，调用G._get.xxx()
            if (reqMethod === 'get') {
                G[`_${reqMethod}`][pathName](req, res)
            } else {
                // 如果是post方法，先通过req获取提交的数据
                let postData = ''
                req.on('data', (chunk) => {
                    postData += chunk
                })
                req.on('end', () => {
                    req.body = postData
                    G[`_${reqMethod}`][pathName](req, res)
                })
            }

        }


    }
    //静态文件目录指定
    app.setStaticPath = (filePath) => {
        G['staticPath'] = filePath
    }
    // 定义get， post注册方法
    app.get = function (pathstring, callback) {
        G._get[pathstring] = callback
    }

    app.post = function (pathstring, callback) {
        G._post[pathstring] = callback
    }

    app.get('/login', (req, res) => {
        let msg = "数据库里面获取的数据";
        let item = [
            {
                title: '新闻111'
            },
            {
                title: '新闻222'
            },
            {
                title: '新闻3333'
            },
            {
                title: '新闻4444'
            }, {
                title: '新闻5555'
            }
        ]
        ejs.renderFile(`${process.cwd()}/views/login.ejs`, { msg: msg, item: item }, (err, str) => {
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.write(str)
            res.end()
        })
    })

    app.post('/doLogin', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
        // req.body 是通过上面req.on data/end事件中获取的提交的数据
        res.write(req.body)
        res.write(`请求方法是：${req.method}`)
        res.end()
    })

    app.get('/news', (req, res) => {
        // /news?page=1&name=5
        let urlObj = new URL(req.url, `http://${req.headers.host}`);
        let querySearch = urlObj
        ejs.renderFile(`${process.cwd()}/views/form.ejs`, {}, (err, str) => {
            console.log(__dirname)
            console.log(__filename)
            console.log(process.cwd())
            res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' });
            res.write(str)
            // 获取/news?page=1&name=5 的get传值
            res.write(`Param1:  ${querySearch.searchParams.get('page')} `)
            res.write(`Param2:  ${querySearch.searchParams.get('name')} `)
            res.end()
        })
    })
    return app
}




module.exports = server()
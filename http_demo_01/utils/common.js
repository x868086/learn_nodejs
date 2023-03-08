
let mime = require('../data/mime.json')

exports.getMimeType = function(extname) {

    return mime[extname]
}


const express = require('express')
const crypto = require('crypto')
const bodyParser = require('body-parser')
const multer = require('multer');
const path = require('path')
const app = express()
const port = 3001


var secret = "secret3"

var uname = (username) => {
    var hash = crypto.createHash('sha256')
    hash.update(encodeURI(username))
    hash.update(encodeURI(secret))
    hash.update(encodeURI("UNAME_HASH"))
    return `/u/${username}_${hash.digest('hex').substring(0,6)}`
}

app.listen(port)
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


var storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, path.join(__dirname, '/public/images'));
    }, 
    filename: function (req, file, cb) {
        username = req.body.uname.substring(3,req.body.uname.lastIndexOf('_'))
        if(req.body.uname != uname(username)){
            cb(new Error('invalid uname'), false)
        } else {
            cb(null , req.body['uname'].substring(3) + path.extname(file.originalname))
        }
    },
 });

const upload = multer({
    storage: storage,
    limits : {fileSize : 1000000},
    fileFilter: function(req, file, cb){
        const filetypes = /jpeg|jpg|png|svg|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = filetypes.test(file.mimetype);
        if(mimetype && extname){
            return cb(null, true);
        } else {
            return cb(new Error('file is not allowed'), false);
        }
    },
});


app.get('/u/:user', (req, res) => {
    user = req.params.user
    username = user.substring(0,user.lastIndexOf('_'))
    if(`/u/${user}` != uname(username)) res.status(400).send({error: "Invalid user URL"})
    else{
        res.render('index', { username: username })
    }
})

app.post('/preview', (req, res) => {
    
    upload.single('design')(req, res, function(err){
        if(err){
            console.log(err);
            res.status(400).send({error: err.message})
        } else {
            res.render('preview')
        }
        
    })

})
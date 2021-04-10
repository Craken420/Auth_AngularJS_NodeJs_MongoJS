// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var cors = require('cors');
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var app        = express();

var port = process.env.PORT || 3001;
var User = require('./models/User');

// Connect to DB
mongoose.connect('mongodb://localhost/dbtest', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(db => console.log('Db is connected'))
.catch(e => console.error(e));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.post('/authenticate', function(req, res) {
    console.log('Back:: authenticate')
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            console.log('Back-User: ', user);
            if (user) {
               res.json({
                    type: true,
                    data: user,
                    token: user.token
                }); 
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });    
            }
        }
    });
});

app.post('/signin', function(req, res) {
    console.log('Back:: Server signin')
    console.log('Back:: Server signin - req.body.email: ', req.body.email)
    console.log('Back:: Server signin - req.body.password: ', req.body.password)
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        console.log('Back:: Server signin - findOne - user: ', user)
        console.log('Back:: Server signin - findOne - err: ', err)
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            console.log('Back:: Server signin - else of findOne')
            if (user) {
                console.log('Back:: Server signin - else of findOne - if user')
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                console.log('Back:: Server signin - else of findOne - else to create')
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function(err, user) {
                    user.token = jwt.sign(user, "SECRET");
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
});

app.get('/me', ensureAuthorized, function(req, res) {
    console.log('Back:: me')
    User.findOne({token: req.token}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

function ensureAuthorized(req, res, next) {
    console.log('Back:: ensureAuthorized')
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
});

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});
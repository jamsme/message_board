var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var path = require('path');
const flash = require('express-flash');
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

mongoose.connect('mongodb://localhost/message_board', { useNewUrlParser: true });

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    comt: {type: String, required: true, minlength: 6},
}, {timestamps: true})
mongoose.model('Comment', CommentSchema); 
var Comment = mongoose.model('Comment');  

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    msg: {type: String, required: true, minlength: 6},
    comments: [CommentSchema]
}, {timestamps: true})
mongoose.model('Message', MessageSchema); 
var Message = mongoose.model('Message');  

app.get('/', function(req, res){
    Message.find({}, function(err, messages){
        if(err) {
            console.log("what went wrong")
        } else {
            console.log("go go go!!!")
        }
        res.render('index', {mess: messages})
    }).sort({_id: -1});
});

app.post('/message', function(req, res){
    var message = new Message({name: req.body.name, msg: req.body.msg});
    message.save(function(err){
        if(err) {
            console.log('We have an error!', err);
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        } else { 
            console.log('successfully added a message!');
            console.log(req.body)
            res.redirect('/');
        }
    });
});

app.post('/comment', function(req, res){
    var comment = new Comment({name: req.body.name, comt: req.body.comt});
    comment.save(function(err){
        if(err) {
            console.log('We have an error!', err);
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message)
            }
            res.redirect('/');
        } else { 
            Message.findOneAndUpdate({_id: req.body.hide}, {$push: {comments: comment}}, function(err, data){
                if(err){
                    console.log("update isn't working")
                }
                else {
                    console.log("update is working");
                }
                console.log('successfully added a comment!');
                console.log(req.body);
                res.redirect('/');
           })
        }
    });
});

app.listen(4141, function(){
    console.log("listening on 4141")
});
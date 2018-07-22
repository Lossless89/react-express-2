var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
// Добавление mongoose:
var mongoose = require('mongoose');
var logger = require('morgan');
// Добавление Express:
var app = express();



// Движок шаблонов
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, './build'));
app.set('view engine', 'html');
app.use(express.json());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './build')));
app.use(logger('tiny'));
// // Add headers:
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type')
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

//Определение Mongoose Schema (*схемы):

var todoSchema = mongoose.Schema({
    id: Number,
    text: String,
    state: Boolean
});

var todoList = mongoose.model('todo', todoSchema);

var usersSchema = mongoose.Schema({
    name: String,
    pass: String
});

var users = mongoose.model('user', usersSchema);


//Model for add new user:

var user = new users({
    name: "admin",
    pass: "admin123"
});

user.save(function (err, user) {
    if (err) {
        console.log('USER NOT SAVED')
    }
    console.log('USER SAVED');
});


app.get('*', function(req, res) {
    res.render('index');
});
// Запросы с tоdo:

app.post('/add', function (req, res) {
    var task = new todoList({
        id: req.body.id,
        text: req.body.text,
        state: req.body.state
    });
    task.save(function (err, task) {
        if (err) {
            console.log('id:' + task.id + ', task: ' + task.text + ', state: ' + task.state + ', NOT SAVED');
            return;
        }
        console.log('id: ' + task.id + ', task: ' + task.text + ', state: ' + task.state + ', SAVED');
    });
    res.status(200).send();
});

app.post('/update', function (req, res) {
    var id = req.body.id;
    var text = req.body.text;
    var state = req.body.state;
    todoList.findOneAndUpdate({id: id}, {$set: {text: text, state: state}}, function (err) {
        if (err) return;
        console.log('id: ' + id + ' text: ' + text + ' state: ' + state + ' UPDATED');
    });
    res.status(200).send();
});

app.post('/remove', function (req, res) {
    var id = req.body.id;

    todoList.findOneAndRemove({id: +id}, function (err) {
        if (err) return;
        console.log('task: ' + id + ' DELETED');
    })
    res.status(200).send();
});

app.get('/render', function (req, res) {
    todoList.find(function (err, tasks) {
        if (err) return;
        res.status(200).send(tasks);
    });
});

app.post('/login', function (req, res) {
    var username = req.body.name;
    var password = req.body.pass;

    if (username.trim() == '' || password.trim() == '') {
        console.log('EMPTY "Username" or "Password"');
        return;
    }

    users.findOne({name: username}).exec(function (err, users) {
        console.log('Welcome!');
        console.log(users.name, users.pass);
    })
    console.log('req.body: ', req.body);
    res.status(200).send();
})

// Подключение к серверу на mongoLab:

mongoose.connect('mongodb://localhost:27017/new_todo', {useNewUrlParser: true});

mongoose.connection.on('error', (err) => {
    console.error(err);
})
;

mongoose.connection.once('open', function () {
    console.log('DB is connected!');
});

app.set('port', process.env.PORT || 4200);
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

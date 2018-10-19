var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var app = express();
var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://messages-972c8.firebaseio.com',
});

var messages = [
    { text: 'hello', sender: 'Tim' },
    { text: 'hey whats up', sender: 'Sean' },
    { text: 'hi', sender: 'Greg' },
];

var users = [
    {
        firstName: 'catherine',
        email: 'cathymarstonang@gmail.com',
        password: 'test',
        id: 0,
    },
];

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    next();
});

//routes

app.get('/messages', (req, res) => {
    res.json(messages);
});

app.get('/messages/:user', (req, res) => {
    var user = req.params.user;
    var result = messages.filter(message => message.sender == user);
    res.json(result);
});

app.post('/messages', (req, res) => {
    console.log(req.body);
    messages.push(req.body);
    res.json(req.body);
});

app.get('/users/me', checkAuthenticated, (req, res) => {
    res.json(users[req.user]);
});

app.post('/users/me', (req, res) => {
    var user = users[req.user];
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    res.json(user);
});

//auth routes
var auth = express.Router();
app.use('/auth', auth);

auth.post('/register', (req, res) => {
    var index = users.push(req.body) - 1;
    var user = users[index];
    user.id = index;
    sendToken(user, res);
});

auth.post('/login', (req, res) => {
    var user = users.find(user => user.email == req.body.email);
    if (!user) {
        sendAuthError(res);
    }
    if (user.password == req.body.password) {
        sendToken(user, res);
    } else {
        sendAuthError(res);
    }
});

function sendToken(user, res) {
    var token = jwt.sign(user.id, '123');
    res.json({ firstName: user.firstName, token });
}

function sendAuthError(res) {
    return res.json({
        success: false,
        message: 'email or password is incorrect',
    });
}

function checkAuthenticated(req, res, next) {
    if (!req.header('authorization'))
        return res.status(401).send({ message: 'Unauthorized request' });

    var token = req.header('authorization').split(' ')[1];

    var payload = jwt.decode(token, '123');

    if (!payload) return res.status(401).send({ message: 'missing payload' });

    req.user = payload;

    next();
}
app.listen(63145);

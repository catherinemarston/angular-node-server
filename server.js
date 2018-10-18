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
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
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
    var user = users.find(user => user.email === req.body.email);
    if (!user) {
        res.json({ success: false, message: 'email or password is incorrect' });
    }
    if ((user.password = req.body.password)) {
        sendToken(user, res);
    } else {
        res.json({ success: false, message: 'email or password is incorrect' });
    }
});

function sendToken(user, res) {
    var token = jwt.sign(user.id, '123');
    res.json({ firstName: user.firstName, token });
}
app.listen(63145);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.emit('message', {message: 'yolo'});
    socket.on('message', (message) => {
        console.log('User send message: ', message);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected.');
    });
});

app.all('/api/*', function (req, res, next) {
    res.header('Content-Type', 'application/json');
    req.header('Content-Type', 'application/json');
    next();
});

app.get('/isAlive', function (req, res) {
    res.sendStatus(204);
});

app.listen(3000, function () {
    console.log('App listening on port 3000');
});


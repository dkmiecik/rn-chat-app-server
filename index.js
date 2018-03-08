const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());

let clients = [];

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    const clientId = socket.client.id;
    clients.push({ clientId, socket });

    clients.forEach((client) => {
        const usersId = clients.filter(c => c.clientId !== client.clientId).map(c => c.clientId);
        client.socket.emit('users', { users: usersId });
    });

    socket.on('message', (message) => {
        const userId = message.userId;
        if (userId) {
            const client = clients.find(client => client.clientId === userId);
            client.socket.emit('message', { userId: clientId, message: message.message });
        }
    });

    socket.on('disconnect', () => {
        clients = clients.filter((client) => client.clientId !== clientId);
        console.log('User disconnected.');
        const usersId = clients.map(c => c.clientId);
        clients.forEach((client) => {
            client.socket.emit('users', { users: usersId });
        });
    });
});

app.all('/*', (req, res, next) => {
    res.header('Content-Type', 'application/json');
    req.header('Content-Type', 'application/json');
    next();
});

app.get('/isAlive', (req, res) => {
    res.sendStatus(204);
});

server.listen(process.env.PORT, () => {
    console.log('App listening on port: ' + process.env.PORT);
});


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const _ = require('lodash');

app.use(bodyParser.json());
app.use(cors());

const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('User connected.');
    const clientId = socket.client.id;
    const getTargetClients = () => _.filter(io.sockets.sockets, (socket) => socket);
    const getTargetClientsIds = (target) => target.map((socket) => socket.id);
    const sendTargetClientsIdsUpdate = (target, clients) => target.forEach((client) => {
        const usersIds = clients.filter((c) => c !== client.id);
        client.emit('users', { users: usersIds });
    });

    const targets = getTargetClients();
    const clients = getTargetClientsIds(targets);
    sendTargetClientsIdsUpdate(targets, clients);

    socket.on('message', (message) => {
        const userId = message.userId;
        const target = getTargetClients();
        const client = target.find(client => client.id === userId);
        client.emit('message', { userId: clientId, message: message.message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.');
        const target = getTargetClients();
        const clients = getTargetClientsIds(target);
        sendTargetClientsIdsUpdate(target, clients);
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


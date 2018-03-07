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

    if (clients.length > 1) {
        clients.forEach((client, index) => {
            console.log(index, client.clientId);
            console.log(index, index > 0 ? clients[--index].clientId : clients[++index].clientId);
            client.socket.emit('user', { userId: index > 0 ? clients[--index].clientId : clients[++index].clientId });
        });
    }

    socket.on('message', (message) => {
        const userId = message.userId;
        const client = clients.find(client => client.clientId !== userId);
        client.socket.emit('message', message.message);
        console.log('User send message: ', message.message);
    });
    socket.on('disconnect', () => {
        clients = clients.filter((client) => client.clientId !== clientId);
        console.log('User disconnected.');
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


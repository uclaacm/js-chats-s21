const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    console.log(`A user ${socket.id} connected`);
    socket.on('disconnect', () => {
        console.log(`A user ${socket.id} disconnected`);
    });
});

let connectedUsers = []; 

io.on('connection', socket => {
    connectedUsers.push(socket.id);
    console.log(connectedUsers);
    socket.broadcast.emit('update-user-list', { userIds: connectedUsers });
    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user !== socket.id);
        socket.broadcast.emit('update-user-list', { userIds: connectedUsers });
    });

    socket.on('mediaOffer', data => {
        console.log(data);
        socket.to(data.to).emit('mediaOffer', {
            from: data.from,
            offer: data.offer
        });
    });

    socket.on('mediaAnswer', data => {
        socket.to(data.to).emit('mediaAnswer', {
            from: data.from,
            answer: data.answer
        });
    });

    socket.on('iceCandidate', data => {
        socket.to(data.to).emit('remoteIceCandidate', {
            candidate: data.candidate
        });
    });
});

http.listen(3000, () => {
    console.log('listening on port 3000');
});


const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.use(express.static(__dirname + "/public"));

io.use((socket, next) => {
    console.log(socket)
    const username = socket.handshake.auth.userName;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;

    console.log(socket.username)
    next();
});

io.on("connection", (socket) => {
    console.log('a user is connected');
    console.log(socket.id)
    socket.on("clientToServer", (data) => {

        console.log(data)
    });

    socket.emit("messageFromServer", { data: "message from server" })
})

const doctorNamespace = io.of("/doctor");

const roomID = "room" + Date.now();

doctorNamespace.on("connection", (socket) => {

    socket.broadcast.emit("user_connected", { roomID: roomID });


    socket.on("doctor_room_joined", (data) => {
        console.log(data)
        socket.join(roomID);
    })

    socket.on("join_room", (data) => {
        console.log(data);
        socket.join(roomID)
    })

    socket.on("user_message", (data) => {
        socket.to(roomID).emit('show_user_message', data);
    })
    socket.on("doctor_message", (data) => {
        socket.to(roomID).emit('show_doctor_message', data);
    })

    // console.log(socket)
})

server.listen(5000, () => {
    console.log("server has started at http://localhost:5000");
});

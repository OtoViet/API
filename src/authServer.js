const express = require('express');
const app = express();
const morgan = require('morgan');
const route = require('./routes');
const cors = require('cors');
const db = require('./config/db');
const cookieParser = require('cookie-parser');
require('dotenv').config();

db.connect();
app.use(cors());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let serverHttp = app.listen(process.env.PORT || 5000, () => {
    console.log('server is running on port 5000');
});

//khi socket io chay tren https se bi loi hien thi khi gui hinh anh
const io = require('socket.io')(serverHttp);
io.on('connection', function (socket) {
    console.log(`...........................Welcome socket ${socket.id}...........................`);
    socket.on("disconnect", (reason) => {
        console.log(`...........................Socket ${socket.id} exit because ${reason}...........................`);
    });
    // socket.on('joinroom', (idRoom) => {
    //     socket.join(idRoom);
    //     console.log(`...........................socket ${socket.id} has joined room ${idRoom}...........................`);
    // });
    ////
    // socket.on('sendRoomSize', function (data) {
    //     console.log('nhan id room :', data)
    //     var roomSize = io.of("/").adapter.rooms.get(data);
    //     console.log('roomsize: ', roomSize.size);
    //     socket.emit('roomSize', roomSize.size);
    // });
    socket.on('send', async function (data) {
        console.log('nhan data :', data)
        io.sockets.emit('send', data);
    });
    // socket.on('sendGroup', async function (data) {
    //     console.log('nhan data :', data)
    //     var roomSize = io.of("/").adapter.rooms.get(data.idRoom);
    //     console.log('roomsize: ', roomSize.size);
    //     socket.emit('roomSize', roomSize.size);
    // });
    // socket.on('deleteMessage', function (data) {
    //     socket.broadcast.emit('deleteMessage', data);
    // });
});
route(app);
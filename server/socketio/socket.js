
module.exports = (server) => {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log(socket.id);
    console.log(socket.request.connection.remoteAddress);
  });
};

let io;

module.exports = {
    init: (server) => {
        const { Server } = require('socket.io');
        io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:3000'] : ['http://localhost:3000'],
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        
        io.on('connection', (socket) => {
            console.log('Client connected for real-time updates:', socket.id);
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};

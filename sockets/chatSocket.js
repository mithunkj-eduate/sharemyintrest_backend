const chatSocket = (io) => {
  // console.log(io)
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // -------------------------
    // JOIN (online status)
    // -------------------------connection
    socket.on("join", (userId) => {
      console.log(userId,"userID sockect")
      onlineUsers.set(userId, socket.id);

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // -------------------------
    // SEND MESSAGE
    // -------------------------
    socket.on("sendMessage", (message) => {
      const receiverSocket = onlineUsers.get(message.receiver);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", message);
      }
    });

    // -------------------------
    // TYPING
    // -------------------------
    socket.on("typing", ({ to }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing");
      }
    });

    socket.on("stopTyping", ({ to }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("stopTyping");
      }
    });

    // -------------------------
    // SEEN ✓✓
    // -------------------------
    socket.on("seen", ({ to, conversationId }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("messageSeen", conversationId);
      }
    });

    // -------------------------
    // DISCONNECT
    // -------------------------
    socket.on("disconnect", () => {
      for (let [userId, id] of onlineUsers) {
        if (id === socket.id) onlineUsers.delete(userId);
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = chatSocket;

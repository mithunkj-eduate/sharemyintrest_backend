const Message = require("../model/messageModel");

const chatSocket = (io) => {
  // console.log(io)
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // -------------------------
    // JOIN (online status)
    // -------------------------connection
    socket.on("join", (userId) => {
      console.log(userId, "userID sockect");
      onlineUsers.set(userId, socket.id);

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // -------------------------
    // SEND MESSAGE
    // -------------------------

    // socket.on("sendMessage", async (data) => {
    //   try {
    //     const { conversation, sender, receiver, text, media, messageType } =
    //       data;

    //     console.log(sender, "sender");
    //     // ✅ 1. SAVE TO DB (encrypted)
    //     const message = await Message.create({
    //       conversation: conversation,
    //       sender: sender,
    //       receiver,
    //       text: text ? encrypt(text) : "",
    //       media,
    //       messageType,
    //     });

    //     // ✅ 2. Update last message
    //     await Conversation.findByIdAndUpdate(conversation, {
    //       lastMessage: message._id,
    //     });

    //     // ✅ 3. Decrypt for sending to frontend
    //     const cleanMessage = {
    //       ...message.toObject(),
    //       text: text ? text : "",
    //     };

    //     const receiverSocket = onlineUsers.get(receiver);

    //     if (receiverSocket) {
    //       io.to(receiverSocket).emit("receiveMessage", cleanMessage);
    //     }

    //     // // ✅ 4. Send to receiver
    //     // const receiverSocket = onlineUsers.get(receiver);

    //     // if (receiverSocket) {
    //     //   io.to(receiverSocket).emit("receiveMessage", cleanMessage);
    //     // }

    //     // // ✅ 5. Send back to sender also (for UI)
    //     // socket.emit("receiveMessage", cleanMessage);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });

    // -------------------------
    socket.on("sendMessage", (message) => {
      const receiverSocket = onlineUsers.get(message.receiver);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", message);
      }
    });

    // // group send message
    // socket.on("sendMessage", (msg) => {
    //   msg.participants.forEach(id => {
    //     const sock = onlineUsers.get(id);
    //     if (sock) io.to(sock).emit("receiveMessage", msg);
    //   });
    // });

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
    // socket.on("seen", async ({ to, conversationId }) => {
    //   try {
    //     const res = await Message.updateMany(
    //       {
    //         conversation: conversationId,
    //         receiver: to,
    //         isRead: false,
    //       },
    //       { isRead: true }
    //     );
    //     console.log(res._id, "res");
    //     const s = onlineUsers.get(to);
    //     if (s) io.to(s).emit("messageSeen", conversationId);

    //     // await Message.updateMany(
    //     //   {
    //     //     conversation: conversationId,
    //     //     receiver: to,
    //     //     isRead: false,
    //     //   },
    //     //   { isRead: true }
    //     // );

    //     // console.log("seen", to, conversationId);
    //     // const receiverSocket = onlineUsers.get(to);
    //     // console.log("receiverSocket", receiverSocket);

    //     // if (receiverSocket) {

    //     //   io.to(receiverSocket).emit("messageSeen", conversationId);
    //     // }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });

    socket.on("seen", async ({ to, conversationId }) => {
      try {
        const unreadCount = await Message.countDocuments({
          conversation: conversationId,
          receiver: to,
          isRead: false,
        });
        console.log(unreadCount, "unreadCount");
        // 🔥 skip DB write if nothing unread
        if (unreadCount === 0) return;

        await Message.updateMany(
          {
            conversation: conversationId,
            receiver: to,
            isRead: false,
          },
          { isRead: true }
        );

        const s = onlineUsers.get(to);
        if (s) io.to(s).emit("messageSeen", conversationId);
      } catch (error) {
        console.log(error);
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

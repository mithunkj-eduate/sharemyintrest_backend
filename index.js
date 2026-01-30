const express = require("express");
const connectDB = require("./db/conn");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");
const requiredLogin = require("./middleware/requiredLogin");

const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 9000;
console.log(process.env.PORT, process.env.DB_URL);
// DB
connectDB();

const corsOptions = {
  origin: "https://snap.shareurinterest.com",
  // origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

// CORS (this part is FINE ✅)
app.use(cors(corsOptions));

app.options("*", cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://snap.shareurinterest.com",
    // origin: "http://localhost:3000", // replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// ✅ STATIC FIRST
app.use("/api/public", express.static(path.join(__dirname, "public")));

const authRouter = require("./routes/authRouter");
const postRouter = require("./routes/createPost");
const userRouter = require("./routes/userRouter");
const storyRouter = require("./routes/storyRouter");
const messageRouter = require("./routes/messageRouter");

const testRouter = require("./routes/testRouter");
const chatRouter = require("./routes/chatRoutes");

// ✅ ROUTES
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter);
app.use("/api/stories", storyRouter);
app.use("/api/messages", messageRouter);

app.use("/api/chat", chatRouter);

app.use("/api/test", testRouter);

// ✅ HEALTH CHECK
app.get("/api/health", async (req, res) => {
  res.json({ status: "Health Check OK" });
});

// ✅ VERIFY
app.get("/api/verify", requiredLogin, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      userName: req.user.userName,
      Photo: req.user.Photo,
    },
  });
});

// ERROR HANDLER LAST
app.use(errorHandler);

server.listen(port, () => {
  console.log(`app listen port ${port}`);
});

global.onlineUsers = new Map();

require("./sockets/chatSocket")(io);

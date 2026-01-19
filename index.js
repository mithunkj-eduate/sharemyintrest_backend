const express = require("express");
const connectDB = require("./db/conn");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");
const requiredLogin = require("./middleware/requiredLogin");
require("dotenv").config();

const port = process.env.port || 9000;
const frontend_url = process.env.frontend_url;

//port = 8000;

//connect to database
connectDB();

const app = express();
console.log("this is backend frontend url : ",frontend_url);
const corsOptions = {
  origin: [
    frontend_url,
    "http://192.168.1.3:3000",
    // "http://192.168.1.4:3000",
    "http://127.0.0.117:3000",
    "http://192.1687.1.85:3000",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions)); // <– important for preflight
app.use(express.json());

//image path link to frentend to backend
app.use("/api/public", express.static(path.join(__dirname, "public")));

//router
app.use("/api/auth", require("./routes/authRouter"));
app.use("/api/post", require("./routes/createPost"));
app.use("/api/user", require("./routes/userRouter"));
app.use("/api/stories", require("./routes/storyRouter"));
app.use("/api/messages", require("./routes/messageRouter"));

app.get("/api/verify", requiredLogin, (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({
        data: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          userName: req.user.userName,
          Photo: req.user.Photo,
        },
      });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
  res.send("api is running");
});

//using error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`app start listnening on port ${port}`);
});

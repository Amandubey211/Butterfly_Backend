//imports
const path = require("path");
const express = require("express");
const DBconnect = require("./DB/DBconnection.js");
const userRouter = require("./Routes/UserRouter.js");
const cors = require("cors");
const { config } = require("dotenv");
const { NotFound, ErrorHandler } = require("./Middlewares/ErrorMiddleware.js");
const ChatRouter = require("./Routes/ChatRouter.js");
const MessageRouter = require("./Routes/MessageRouter.js");


const App = express();
config({ path: "./config/config.env" });

//App uses
App.use(express.Router());
App.use(express.json());
App.use(express.urlencoded({ extended: false }));
App.use(cors());



//----------------------deployment----------------------------
// const __dirname1 = path.resolve()
// if (process.env.NODE_ENV === "PRODUCTION") {
//   App.use(express.static(path.join(__dirname1, "./client/build")));

//   App.use("*", function (req, res) {
//     res.sendFile(path.join(__dirname1, "client/build/index.html"))
//   })

// }
App.get('/', (req, res) => { res.send("SERVER is running") })

//------------------------------------------------------------------

//routes
// App.use(NotFound)
// App.use(ErrorHandler)
App.use("/api/user", userRouter);
App.use("/api/chat", ChatRouter);
App.use("/api/message", MessageRouter);

//DB-connection
DBconnect();

const port = process.env.PORT;
const server = App.listen(port, () => {
  console.log(`server success ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_LINK || "http://localhost:3000" , // frontend hosted link here
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket io");

  socket.on("setup", (userData) => {
    socket.join(userData.Id);

    console.log(userData.Id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room", room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecived) => {
    var chat = newMessageRecived.Chat;

    if (!chat.Users) {
      return console.log("chat.users not defined", newMessageRecived);
    }


    chat.Users.forEach((user) => {
      if (user._id == newMessageRecived.Sender._id) {
        return;
      }
      socket.in(user._id).emit("message recieved", newMessageRecived);

    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData.Id);
  });
});

const express = require("express");
const { Protect } = require("../Middlewares/AuthMiddkeware.js");
const {
  sendMessage,
  AllMessages,
} = require("../Controller/MessageController.js");

const MessageRouter = express.Router();

MessageRouter.post("/", Protect, sendMessage);
MessageRouter.get("/:chatId", Protect, AllMessages);

module.exports = MessageRouter;

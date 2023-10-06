const ChatModel = require("../Models/ChatModel");
const MessageModel = require("../Models/MessageModel");
const UserModel = require("../Models/UserModel");

const sendMessage = async (req, res) => {
  const { Content, ChatId } = req.body;

  if (!Content || !ChatId) {
    res.status(300).send({ message: "invalid data" });
  }
  var newMessage = {
    Content: Content,
    Sender: req.user._id,
    Chat: ChatId,
  };
  try {
    var message = await MessageModel.create(newMessage);
    message = await message.populate("Sender", "Name");
    message = await message.populate("Chat");
    message = await UserModel.populate(message, {
      path: "Chat.Users",
      select: "Name Email",
    });
    await ChatModel.findByIdAndUpdate(req.body.ChatId, {
      LatestMessage: message,
    });
    res.json(message);
  } catch (error) {
    console.log(error);
  }
};

const AllMessages = async (req, res) => {
  try {
    const messages = await MessageModel.find({ Chat: req.params.chatId })
      .populate("Sender", "Name Email ")
      .populate("Chat");
    res.json(messages);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { AllMessages, sendMessage };

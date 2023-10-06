const mongoose = require("mongoose")

const ChatSchema = mongoose.Schema(
  {
    ChatName: {
      type: String,
      trim: true,
    },
    IsGroupChat: {
      type: Boolean,
      default: false,
    },
    Users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    LatestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    GroupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", ChatSchema);
module.exports = ChatModel

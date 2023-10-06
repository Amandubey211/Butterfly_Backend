const ChatModel = require("../Models/ChatModel");
const UserModel = require("../Models/UserModel");

const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).send("userId not found");
  }
  var isChat = await ChatModel.find({
    IsGroupChat: false,
    $and: [
      { Users: { $elemMatch: { $eq: req.user._id } } },
      { Users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("Users", "-Password -Picture")
    .populate("LatestMessage");

  isChat = await UserModel.populate(isChat, {
    path: "LatestMessage.sender",
    select: "Name  Email ",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      ChatName: "sender",
      IsGroupChat: false,
      Users: [req.user._id, userId],
    };
    try {
      const createdChat = await ChatModel.create(chatData);
      const FullChat = await ChatModel.findOne({
        _id: createdChat._id,
      }).populate("Users", "-Password");
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

const fetchChats = async (req, res) => {
  try {
    ChatModel.find({ Users: { $elemMatch: { $eq: req.user._id } } })
      .populate("Users", "-Password -Picture")
      .populate("GroupAdmin", "-Password")
      .populate("LatestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await UserModel.populate(results, {
          path: "LatestMessage.sender",
          select: "Name  Email ",
        });
        res.send(results);
      });
  } catch (error) {
    console.log(error);
  }
};
const createGroup = async (req, res) => {
  if (!req.body.Users || !req.body.Name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }
  var Users = JSON.parse(req.body.Users);
  if (Users.length < 2) {
    return res.status(400).send({
      message: "more then 2 users are required to form a fucking group",
    });
  }
  Users.push(req.user);
  try {
    const GroupChat = await ChatModel.create({
      ChatName: req.body.Name,
      Users: Users,
      IsGroupChat: true,
      GroupAdmin: req.user,
    });
    const FullGroupChat = await ChatModel.findOne({ _id: GroupChat._id })
      .populate("Users", "-Password -Picture")
      .populate("GroupAdmin", "-Password");

    res.status(200).json(FullGroupChat);
  } catch (error) {
    res.status(401).send("error Occured");
    throw new Error(error.message);
  }
};
const renameGroup = async (req, res) => {
  const { ChatId, ChatName } = req.body;
  const updatedChat = await ChatModel.findByIdAndUpdate(
    ChatId,
    { ChatName: ChatName },
    { new: true }
  )
    .populate("Users", "-Password -Picture")
    .populate("GroupAdmin", "-Password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not Found");
  } else {
    res.json(updatedChat);
  }
};

const addToGroup = async (req, res) => {
  const { ChatId, UserId } = req.body;

  const AddedUser = await ChatModel.findByIdAndUpdate(
    ChatId,
    { $push: { Users: UserId } },
    { new: true }
  )
    .populate("Users", "-Password -Picture")
    .populate("GroupAdmin", "-Password");
  if (AddedUser) {
    return res.status(200).json(AddedUser);
  } else {
    res.status(400).send({ message: " User not added" });
  }
};

const removeFromGroup = async (req, res) => {
  const { ChatId, UserId } = req.body;

  const RemovedUser = await ChatModel.findByIdAndUpdate(
    ChatId,
    { $pull: { Users: UserId } },
    { new: true }
  )
    .populate("Users", "-Password")
    .populate("GroupAdmin", "-Password");
  if (RemovedUser) {
    return res.status(200).json(RemovedUser);
  } else {
    res.status(400).send({ message: " User not added" });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  removeFromGroup,
  addToGroup,
};

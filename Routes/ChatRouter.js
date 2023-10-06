const express = require("express");
const { accessChat,fetchChats,createGroup,renameGroup,removeFromGroup,addToGroup } = require("../Controller/ChatController");
const { Protect } = require("../Middlewares/AuthMiddkeware");

const ChatRouter = express.Router();

ChatRouter.post("/",Protect,accessChat)
ChatRouter.get("/",Protect,fetchChats)
ChatRouter.post("/group",Protect,createGroup)
ChatRouter.put("/rename",Protect,renameGroup)
ChatRouter.put("/groupremove",Protect,removeFromGroup)
ChatRouter.put("/groupadd",Protect,addToGroup)





module.exports = ChatRouter;

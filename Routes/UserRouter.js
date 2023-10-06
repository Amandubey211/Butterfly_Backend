const express = require("express");
const formidable = require("express-formidable");
const {
  RegisterUser,
  LoginUser,
  AllUser,
  UserPhototController,
} = require("../Controller/UserController.js");
const { Protect } = require("../Middlewares/AuthMiddkeware.js");

const userRouter = express.Router();

userRouter.post("/register", formidable(), RegisterUser);
userRouter.post("/login", formidable(), LoginUser);
userRouter.get("/photo/:userid", UserPhototController);

userRouter.get("/search",Protect, AllUser);

module.exports = userRouter;

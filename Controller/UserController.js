// imports
const UserModel = require("../Models/UserModel");
const sendMail = require("../Utils/NodeMailer.js");
const { comparePassword, hashPassword } = require("../Utils/AuthHelper.js");
const Jwt = require("jsonwebtoken");
const fs = require("fs");

const RegisterUser = async (req, res) => {
  try {
    const { Name, Email, Password } = req.fields;
    const { Picture } = req.files;
    console.log(req.fields);

    //validations
    if (!Name || !Email || !Password) {
      return res.status(200).send({
        success: false,
        message: "  please enter you information properly",
      });
    }
    const existingUser = await UserModel.findOne({ Email });

    if (existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "User already exist" });
    }
    const hashed = await hashPassword(Password);
    const user = await new UserModel({
      Name: Name,
      Email: Email,
      Password: hashed,
    });
    if (Picture) {
      console.log("pictured added");
      user.Picture.data = fs.readFileSync(Picture.path);
      user.Picture.contentType = Picture.type;
    } else {
      console.log("no photo added");
    }
    await user.save();
    sendMail("signup", user);
    res.status(200).send({
      success: true,
      operation: "register",
      message: `${user.Name} successfully registered`,
      user,
    });
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "server not responding", error: error });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { Email, Password } = req.fields;
    // const { Picture } = req.files;

    if (!Email || !Password) {
      return res
        .status(200)
        .send({ success: false, message: "please give the required details " });
    }
    const user = await UserModel.findOne({ Email });
    if (user) {
      const isMatch = await comparePassword(Password, user.Password);
      if (!isMatch) {
        return res.send({ success: false, message: "invalid details " });
      } else {
        const payload = {
          userId: user._id,
          Email: user.Email,
        };
        const jwttoken = Jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "7d",
        });
        res.status(200).json({
          user,
          token: jwttoken,
          success: true,
          operation: "login",
          message: ` Welcome!, ${user?.Name ? user.Name : "user"} `,
        });
      }
    } else {
      res.status(300).send({ success: false, message: "invalid details " });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ message: "server not responded", error: error });
  }
};

const AllUser = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { Name: { $regex: req.query.search, $options: "i" } },
            { Email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await UserModel.find(keyword)
      .find({
        _id: { $ne: req.user._id },
      })
      .select("-Picture");

    if (users) {
      return res.send(users);
    } else {
      res.send("no users found");
    }
  } catch (error) {
    res.status(400).send({ message: "server not responded bro", error });
    console.log(error.message);
  }
};

const UserPhototController = async (req, res) => {
  try {
    let id = req.params.userid;
    const user = await UserModel.findById(id).select("Picture");

    if (user?.Picture.data) {
      res.set("Content-type", user.Picture.contentType);
      return res.status(200).send(user.Picture.data);
    }
  } catch (error) {
    console.log("cannot get photo");
    console.log(error.message);
    res
      .status(400)
      .send({ success: false, message: "cannot get photo", error });
  }
};

module.exports = { RegisterUser, LoginUser, AllUser, UserPhototController };

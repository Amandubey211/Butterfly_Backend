const Jwt = require("jsonwebtoken");
const UserModel = require("../Models/UserModel");

const Protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await UserModel.findById(decoded.userId)
        .select("-Password")

      next();
    } catch (error) {
      res.status(401).send({ message: "no authorized || token failed" });
    }
  }
  if (!token) {
    res.status(401).send({ message: "not authorized,no token" });
  }
};

module.exports = { Protect };

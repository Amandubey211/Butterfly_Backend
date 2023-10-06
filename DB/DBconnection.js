const mongoose = require("mongoose");

const DBconnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MDBLINK);
    if (connection) {
      console.log(`DB success`);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = DBconnect;

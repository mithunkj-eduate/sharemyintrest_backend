// screept run to create users
//  node scripts/updateUserBulk.js

const mongoose = require("mongoose");
const { bulkRegisterSchema } = require("../helpers/joiValidatior");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const { creatUserName } = require("../controllers/authController");

require("dotenv").config();

// 🔥 change DB
const MONGO_URL = process.env.DB_URL;

// 🚀 BULK REGISTER
const updateUserBulk = async (req, res) => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ DB Connected");

  // update many
    // await User.updateMany(
    //   {}, // Query filter: an empty filter selects all documents
    //   { $set: { role: "TEST" } } // Update operation: adds the 'status' field with value 'active'
    // );


    // update by id
    // await User.findByIdAndUpdate(
    //   "6981a16c5a7a884803cbdc9f", // Query filter: an empty filter selects all documents
    //   { $set: { role: "USER" } } // Update operation: adds the 'status' field with value 'active'
    // );

    // find last user
    // const user = await User.find().sort({ _id: -1 }).limit(1)
    // console.log(user)

    console.log(`🎉 update users successfully`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateUserBulk();

import mongoose,{Schema} from "mongoose";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const dbConnect = async () => {
  try {
    console.log(process.env.MONGODB_URL)
    await mongoose.connect(
      process.env.MONGODB_URL
    );

    console.log("database connected successfully");
  } catch (error) {
    console.error("error occurred while connecting to the database:", error);
    process.exit(1);
  }
};

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    min: [2, "username should be at least 2 characters"],
    max: [10, "username should be at most 10 characters"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  firstname: {
    type: String,
    required: [true, "firstname is required"],
    min: [2, "firstname should be at least 2 characters"],
    max: [20, "firstname should be at most 20 characters"],
  },
  lastname: {
    type: String,
    min: [2, "lastname should be at least 2 characters"],
    max: [20, "lastname should be at most 20 characters"],
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  // balance:{type:Schema,ref:'AccountModel'}
});

const AccountSchema = new mongoose.Schema({
  userId:{
    type:Schema.Types.ObjectId,
    ref:'UserModel'
  },
  balance:{
    type: Number,
    default:0
  }
})

const UserModel = mongoose.model("User", UserSchema);
const AccountModel = mongoose.model("Account",AccountSchema)

export { UserModel, dbConnect,AccountModel };

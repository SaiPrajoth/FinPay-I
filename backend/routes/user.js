import express from "express";
import { AccountModel, UserModel } from "../db.js";
const app = express();
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";

const mainRouter = express.Router();

app.use(express.json());

mainRouter.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "chep ra",
  });
});

mainRouter.post("/sign-up", async (req, res) => {
  try {
    const { firstname, lastname, username, password, email } = req.body;
    // const validation = '';
    // if(!validation.success){
    //     res.status(400).json({message:"(sign up failed) : please provide right credentials for user registration"})
    // }
    // const userExistsByUsername = await UserModel.findOne({username,isVerified:true});

    // if(userExistsByUsername){
    //     res.status(409).json({message:"(sign up failed) : username is already taken, retry with a new one"})
    // }

    const userExistsByEmail = await UserModel.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (userExistsByEmail) {
      if (userExistsByEmail.isVerified) {
        return res
          .status(409)
          .json({ success: false, message: "user exists, please try login" });
      }

      userExistsByEmail.username = username;
      userExistsByEmail.password = hashedPassword;
      userExistsByEmail.firstname = firstname;
      if (lastname) {
        userExistsByEmail.lastname = lastname;
      }
      await userExistsByEmail.save();
    } else {
      const user = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        firstname,
        ...(lastname && { lastname }),
        isVerified: false,
      });


      const money = Math.floor(Math.random()*10000)

      const account = await AccountModel.create({
        userId:user._id,balance:money
      })

      user.balance=account;

      await user.save();
    }

    // await sendVerificationEmail(firstname,verifyCode)

    return res
      .status(200)
      .json({ success: true, message: "user registration successfull" });
  } catch (error) {
    console.error("error occured while user registration");
    return res.status(500).json({
      success: false,
      message: "error occured while user registration",
    });
  }
});

mainRouter.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    console.log("user.password", user.password);
    console.log("password", password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("passmatch", passwordMatch);

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ success: false, messsage: "incorrect password" });
    }

    const token = jwt.sign(
      { userId: user._id, firstname: user.firstname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ success: true, message: "sign-in successfull", token: token });
  } catch (error) {
    console.error("error occured while user login process", error);
    return res.status(500).json({
      success: false,
      message: "error occured while user login process",
    });
  }
});

mainRouter.put("/", authMiddleware, async (req, res) => {
  try {
    const { firstname, lastname, password } = req.body;

    if (!firstname && !lastname && !password) {
      return res.status(400).json({
        success: false,
        message: "please provide valid credentials for updating user",
      });
    }

    const userId = req.userId;

    console.log('this is the userId obtained from the middleware while updating the user : ',userId)

    const userFound = await UserModel.findById(userId);

    if (!userFound) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (firstname) {
      userFound.firstname = firstname;
    }
    if (lastname) {
      userFound.lastname = lastname;
    }
    if (password) {
      userFound.password = hashedPassword;
    }

    await userFound.save()

    return res.status(200).json({
        success: true,
        message: "user updated successfully"
      });


  } catch (error) {
    console.error("error occured while updating the user", error);
    return res.status(500).json({
      success: false,
      message: "error occured while updating the user",
    });
  }
});

mainRouter.get('/bulk',authMiddleware, async(req,res)=>{
    try {

        const data = await UserModel.find();

        const users = data.map((user)=>{return {firstname:user.firstname,lastname:user.lastname,_id:user._id}})

        return res.status(200).json({
            success:true,
            message:"task successfull",
            users:users
        })
        
    } catch (error) {
        console.error('error occured while fetching the users');
        return res.json({
            success:false,
            message:"error occured while fetching the userz"
        })
    }
})

export { mainRouter };

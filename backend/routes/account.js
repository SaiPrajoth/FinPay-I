import express from "express";
import { AccountModel, UserModel } from "../db.js";
const app = express();
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const accountRouter = express.Router();

app.use(express.json());

accountRouter.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "chep ra",
  });
});

accountRouter.get("/balance", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    console.log("this is the userId", userId);

    const balance = await AccountModel.findOne({ userId: userId });

    console.log("this is the balance ", balance);

    return res.status(200).json({
      success: true,
      message: "balance fetched successfully",
      balance: balance.balance,
    });
  } catch (error) {
    console.error("error occured while fetching the balance ", error);
    return res.status(500).json({
      success: false,
      message: "error occured while fetching the balance",
    });
  }
});

// accountRouter.post("/transfer", authMiddleware, async (req, res) => {
// //   const session = await mongoose.startSession();

// //   try {
// //     session.startTransaction();

// //     // operations inside the transaction
// //     await UserModel.create([{ name: "John" }], { session });

// //     await AccountModel.updateOne(
// //       { userId: userId },
// //       { $inc: { balance: -100 } },
// //       { session }
// //     );

// //     await session.commitTransaction(); // ✅ save everything
// //     return res.status(200).json({
// //         success:true,
// //         message:"transaction successfull"
// //     })
// //   } catch (error) {
// //     await session.abortTransaction(); // ❌ rollback everything
// //     console.error("Transaction failed", error);
// //     return res.status(500).json({
// //         success:false,
// //         message:"transaction failed"
// //     })
// //   } finally {
// //     session.endSession();
// //   }
// const session = await mongoose.startSession();
// try {

//     session.startTransaction();

//     // wite your tasks
//     await session.commitTransaction();

//     // return stattment?

// } catch (error) {
//     await session.abortTransaction();
//     console.error("transaction failed",error);
//     // return statment

// } finally{
//     session.endSession()
// }
// });

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { to, amount } = req.body;

    const userId = req.userId;

    const sender = await UserModel.findById(userId).session(session);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message:
          "we are unable to find your account in our database : transaction failed",
      });
    }

    const reciever = await UserModel.findById(to).session(session);

    if (!reciever) {
      return res.status(404).json({
        success: false,
        message:
          "we are unable to find the reciever's account in our database : transaction failed",
      });
    }

    const senderBalance = await AccountModel.findOne({userId}).session(session);



    if (senderBalance.balance < amount) {
      return res.status(400).json({
        success: false,
        message:
          "insufficient amount, please try again with sufficient funds : transaction failed",
      });
    }

    await AccountModel.updateOne(
      { userId: userId },
      { $inc: { balance: -amount } },
      { session }
    );

    await AccountModel.updateOne(
      { userId: to },
      { $inc: { balance: amount } },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "transaction successfull",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("error occured in the transaction process : ", error);
    return res.status(500).json({
      success: false,
      message: "transaction failed",
    });
  } finally {
    session.endSession();
  }
});
export { accountRouter };

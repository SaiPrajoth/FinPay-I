import express from 'express'
import { mainRouter } from './user.js';
import { accountRouter } from './account.js';


const userRouter = express.Router();

userRouter.use('/user',mainRouter);
userRouter.use('/account',accountRouter);

export {userRouter}



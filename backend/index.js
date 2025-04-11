import express from "express";
import { dbConnect } from "./db.js";
const app = express();
import { userRouter } from "./routes/index.js";
import cors from 'cors'
const PORT = process.env.PORT || 3000;
import bodyParser from "body-parser";


app.use(cors())
app.use(bodyParser.json())
app.use(express.json());
await dbConnect();

app.use('/api/v1', userRouter);

app.listen(PORT, () => {
  console.log(`listening at port ${PORT}`);
});

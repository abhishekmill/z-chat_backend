import express from "express";
import DBconnect from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import { app, server } from "./socket/socket.js";
import router from "./routes/message.routes.js";
import userRouter from "./routes/users.routes.js";
import cookieParser from "cookie-parser";

app.use(
  cors({
    origin: "*", //  Allow requests from this origin only
  })
);

dotenv.config();
const port = 4000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/", router);
app.use("/api/", userRouter);

app.use(cors());

server.listen(port, () => {
  DBconnect();
  console.log("server is listening");
});

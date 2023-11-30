import { NextFunction, Request, Response, Express } from "express";
import mongoose from "mongoose";
var env = process.env;
import path from "path";
import express from "express";
import { indexRouter } from "./routes";
import { adminApiRouter } from "./routes/api/admin";
import { userRouter } from "./routes/api/user";
import { adminRouter } from "./routes/admin";
import { eventRouter } from "./routes/api/event";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { RequestLog } from "./models/Log";
dotenv.config();
// var logger = require("morgan");
// var cors = require("cors");

var app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(async function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  try {
    req.body;
    var log = new RequestLog({
      url: req.url,
      type: req.method,
      data: JSON.stringify(req.body),
    });
    await log.save();
    res.setHeader("logID", log._id);
  } catch (err) {
    console.log("Logging error ");
    console.log(err);
  }
  next();
});

app.use("/", indexRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminApiRouter);
app.use("/api/event", eventRouter);
app.use("/admin", adminRouter);

const uri: string = env.DB_URL!;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true } as any)
  .then(() => {
    console.log("CONNECTED TO DB");
  })
  .catch((err) => {
    console.log("CANT CONNECT TO DB");
    console.log(err);
  });
app.listen(env.PORT || 8000, () => {
  console.log("Server is running ...");
  return;
});

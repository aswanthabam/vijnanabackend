"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
var env = process.env;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const admin_1 = require("./routes/api/admin");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
var userRouter = require("./routes/api/user");
var adminRouter = require("./routes/admin");
var eventRouter = require("./routes/api/event");
var app = (0, express_1.default)();
app.use(cors());
app.use(logger("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,UPDATE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    next();
});
app.use("/", routes_1.indexRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", admin_1.adminApiRouter);
app.use("/api/event", eventRouter);
app.use("/admin", adminRouter);
const uri = env.DB_URL;
mongoose_1.default
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
    console.log("CONNECTED TO DB");
})
    .catch((err) => {
    console.log("CANT CONNECT TO DB");
    console.log(err);
});
app.listen(env.PORT || 8000, "0.0.0.0");

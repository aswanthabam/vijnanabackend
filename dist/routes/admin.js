"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const env = process.env;
const express_1 = require("express");
const response_1 = require("../response");
const User_1 = require("../models/User");
const Event_1 = require("../models/Event");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/syshid/drop-events", (req, res) => {
    var { usr = null, pass = null } = req.body;
    var out = new response_1.CustomResponse(res);
    console.log("Trying to drop collection Events...");
    console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
    console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
    if (usr == env.USER && pass == env.PASS) {
        try {
            const v = Event_1.Event.collection.drop();
            out.set_data([v]);
            out.set_message("Success !");
            out.send_success_response();
        }
        catch (e) {
            out.send_500_response();
        }
    }
    else {
        out.set_message("Authentication failed");
        out.send_failiure_response();
    }
});
exports.adminRouter.post("/syshid/get-events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { usr = null, pass = null } = req.body;
    var out = new response_1.CustomResponse(res);
    console.log("Trying to get collection Events...");
    console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
    console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
    if (usr == env.USER && pass == env.PASS) {
        try {
            const v = yield Event_1.Event.find();
            out.set_data(v);
            out.set_message("Success !");
            out.send_success_response();
        }
        catch (e) {
            out.send_500_response();
        }
    }
    else {
        out.set_message("Authentication Failed!");
        out.send_failiure_response();
    }
}));
// Users
exports.adminRouter.post("/syshid/drop-users", (req, res) => {
    var { usr = null, pass = null } = req.body;
    var out = new response_1.CustomResponse(res);
    console.log("Trying to drop collection Users...");
    console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
    console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
    if (usr == env.USER && pass == env.PASS) {
        try {
            const v = User_1.User.collection.drop();
            out.set_data([v]);
            out.send_success_response();
        }
        catch (e) {
            out.send_500_response();
        }
    }
    else {
        out.send_message("Authentication Failed!", 400);
        res.status(400).json(out);
    }
});
exports.adminRouter.post("/syshid/get-users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { usr = null, pass = null } = req.body;
    var out = new response_1.CustomResponse(res);
    console.log("Trying to get collection Users...");
    console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
    console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
    if (usr == env.USER && pass == env.PASS) {
        try {
            const v = yield User_1.User.find();
            out.set_data(v);
            out.set_message("Success!");
            out.send_success_response();
        }
        catch (e) {
            out.send_500_response();
        }
    }
    else {
        out.send_message("Authentication Failed!", 400);
        res.status(400).json(out);
    }
}));

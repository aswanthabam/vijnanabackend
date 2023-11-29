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
exports.adminApiRouter = void 0;
const env = process.env;
const express_1 = require("express");
const Admin_1 = require("../../models/Admin");
const response_1 = require("../../response");
exports.adminApiRouter = (0, express_1.Router)();
exports.adminApiRouter.post("/is_admin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { token = null } = req.body;
    var out = new response_1.CustomResponse(res);
    if (token == null) {
        out.send_message("Token not found !", 400);
        return;
    }
    console.log("Admin Authentication process....");
    var date = new Date();
    console.log("Today time: " + date.toISOString());
    try {
        yield Admin_1.Admin.find({ token: token }).then((p) => {
            if (p == null) {
                out.send_message("Invalid Token", 400);
                console.log("Invalid token 1 NULL");
                return;
            }
            else if (p.length != 1) {
                out.send_message("Invalid Token", 400);
                console.log("Invalid token 2");
                return;
            }
            else {
                var p1 = p[0];
                if (date.getFullYear() >= p1.expiry.getFullYear() &&
                    date.getMonth() >= p1.expiry.getDate() &&
                    date.getDate() >= p1.expiry.getDate() &&
                    date.getHours() >= p1.expiry.getHours() &&
                    date.getMinutes() >= p1.expiry.getMinutes()) {
                    console.log("Expired token");
                    console.log(date.getFullYear() +
                        "/" +
                        date.getMonth() +
                        " | Token expiry: " +
                        p1.expiry);
                    out.send_message("Expired Token", 400);
                    return;
                }
                else {
                    console.log("Auth success");
                    out.send_response(200, "Token Valid !", {
                        expiry: p1.expiry,
                        valid: true,
                    });
                    return;
                }
            }
        });
    }
    catch (e) {
        out.send_500_response();
        return;
    }
}));
exports.adminApiRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { user = null, pass = null } = req.body;
    var out = new response_1.CustomResponse(res);
    if (user == null && pass == null) {
        if (user == null)
            out.set_data_key("user", "User not provided");
        if (pass == null)
            out.set_data_key("pass", "Password not provided");
        out.set_message("Invalid Request!");
        return;
    }
    console.log("ADMIN TOKEN GENERATION");
    console.log("USER :" + user + "|" + env.USER);
    console.log("PASS :" + pass + "|" + env.PASS);
    if (user != env.USER) {
        out.send_message("User not matched", 400);
        return;
    }
    else if (pass != env.PASS) {
        out.send_message("Password Mismatch!", 400);
        return;
    }
    var date = new Date();
    var token = null;
    // if(p.token == null || p.token == undefined || p.expiry == null || p.expiry == undefined){
    token = btoa("AdminisAswanth|D" +
        date.getDate() +
        "M" +
        date.getMonth() +
        "Y" +
        date.getFullYear() +
        "H" +
        date.getHours() +
        "M" +
        date.getMinutes() +
        "S" +
        date.getSeconds() +
        "CL").replace("=", "");
    date.setDate(date.getDate() + 14);
    var p = new Admin_1.Admin({
        token: token,
        expiry: date,
    });
    try {
        yield p.save();
        out.send_response(200, "Logged in!", {
            token: token,
            expiry: date,
        });
        return;
    }
    catch (e) {
        console.log(e);
        out.send_500_response();
        return;
    }
}));

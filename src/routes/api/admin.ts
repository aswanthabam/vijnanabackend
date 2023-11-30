const env = process.env;
import mongoose from "mongoose";
import { Router, Request, Response } from "express";
import { User } from "../../models/User";
import { Admin } from "../../models/Admin";
import { CustomResponse } from "../../response";

export const adminApiRouter = Router();

adminApiRouter.post("/is_admin", async (req: Request, res: Response) => {
  var { token = null } = req.body;
  var out = new CustomResponse(res);
  if (token == null) {
    out.send_message("Token not found !", 400);
    return;
  }

  console.log("Admin Authentication process....");
  var date = new Date();
  console.log("Today time: " + date.toISOString());
  try {
    await Admin.find({ token: token }).then((p) => {
      if (p == null) {
        out.send_message("Invalid Token", 400);
        console.log("Invalid token 1 NULL");
        return;
      } else if (p.length != 1) {
        out.send_message("Invalid Token", 400);
        console.log("Invalid token 2");
        return;
      } else {
        var p1 = p[0];
        if (
          date.getFullYear() >= p1.expiry!.getFullYear() &&
          date.getMonth() >= p1.expiry!.getDate() &&
          date.getDate() >= p1.expiry!.getDate() &&
          date.getHours() >= p1.expiry!.getHours() &&
          date.getMinutes() >= p1.expiry!.getMinutes()
        ) {
          console.log("Expired token");
          console.log(
            date.getFullYear() +
              "/" +
              date.getMonth() +
              " | Token expiry: " +
              p1.expiry!
          );
          out.send_message("Expired Token", 400);
          return;
        } else {
          console.log("Auth success");
          out.send_response(200, "Token Valid !", {
            expiry: p1.expiry,
            valid: true,
          });
          return;
        }
      }
    });
  } catch (e) {
    out.send_500_response();
    return;
  }
});

adminApiRouter.post("/login", async (req: Request, res: Response) => {
  var { user = null, pass = null } = req.body;
  var out = new CustomResponse(res);
  if (user == null && pass == null) {
    if (user == null) out.set_data_key("user", "User not provided");
    if (pass == null) out.set_data_key("pass", "Password not provided");
    out.set_message("Invalid Request!");
    return;
  }
  console.log("ADMIN TOKEN GENERATION");
  console.log("USER :" + user + "|" + env.USER);
  console.log("PASS :" + pass + "|" + env.PASS);
  if (user != env.USER) {
    out.send_message("User not matched", 400);
    return;
  } else if (pass != env.PASS) {
    out.send_message("Password Mismatch!", 400);
    return;
  }

  var date = new Date();
  var token = null;
  // if(p.token == null || p.token == undefined || p.expiry == null || p.expiry == undefined){
  token = btoa(
    "AdminisAswanth|D" +
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
      "CL"
  ).replace("=", "");

  date.setDate(date.getDate() + 14);
  var p = new Admin({
    token: token,
    expiry: date,
  });

  try {
    await p.save();
    out.send_response(200, "Logged in!", {
      token: token,
      expiry: date,
    });
    return;
  } catch (e) {
    console.log(e);
    out.send_500_response();
    return;
  }
});

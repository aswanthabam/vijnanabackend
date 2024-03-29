const env = process.env;
import { Request, Response, Router } from "express";
import { _Response } from "../types";
import { CustomResponse } from "../response";
import { User } from "../models/User";
import { Event } from "../models/Event";

export const adminRouter = Router();

adminRouter.post("/syshid/drop-events", async (req: Request, res: Response) => {
  var { usr = null, pass = null } = req.body;
  var out: CustomResponse = new CustomResponse(res);
  console.log("Trying to drop collection Events...");
  console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
  console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
  if (usr == env.USER && pass == env.PASS) {
    try {
      const v = Event.collection.drop();
      out.set_data([v]);
      out.set_message("Success !");
      await out.send_success_response();
    } catch (e) {
      await out.send_500_response();
    }
  } else {
    out.set_message("Authentication failed");
    await out.send_failiure_response();
  }
});

adminRouter.post("/syshid/get-events", async (req: Request, res: Response) => {
  var { usr = null, pass = null } = req.body;
  var out = new CustomResponse(res);
  console.log("Trying to get collection Events...");
  console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
  console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
  if (usr == env.USER && pass == env.PASS) {
    try {
      const v = await Event.find();
      out.set_data(v);
      out.set_message("Success !");
      await out.send_success_response();
    } catch (e) {
      await out.send_500_response();
    }
  } else {
    out.set_message("Authentication Failed!");
    await out.send_failiure_response();
  }
});
// Users
adminRouter.post("/syshid/drop-users", async (req: Request, res: Response) => {
  var { usr = null, pass = null } = req.body;
  var out = new CustomResponse(res);
  console.log("Trying to drop collection Users...");
  console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
  console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
  if (usr == env.USER && pass == env.PASS) {
    try {
      const v = User.collection.drop();
      out.set_data([v]);
      await out.send_success_response();
    } catch (e) {
      await out.send_500_response();
    }
  } else {
    await out.send_message("Authentication Failed!", 400);
    res.status(400).json(out);
  }
});
adminRouter.post("/syshid/get-users", async (req: Request, res: Response) => {
  var { usr = null, pass = null } = req.body;
  var out = new CustomResponse(res);
  console.log("Trying to get collection Users...");
  console.log("User " + usr + " | | " + env.USER + (usr == env.USER));
  console.log("Pass " + pass + " | | " + env.PASS + (pass == env.PASS));
  if (usr == env.USER && pass == env.PASS) {
    try {
      const v = await User.find();
      out.set_data(v);
      out.set_message("Success!");
      await out.send_success_response();
    } catch (e) {
      await out.send_500_response();
    }
  } else {
    await out.send_message("Authentication Failed!", 400);
    res.status(400).json(out);
  }
});

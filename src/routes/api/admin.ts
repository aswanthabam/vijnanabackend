const env = process.env;
import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse } from "../../response";
import { is_admin } from "../../request";
import { About } from "../../models/About";
import { User } from "../../models/User";

export const adminApiRouter = Router();

adminApiRouter.post(
  "/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var out = new CustomResponse(res);
      if (!is_admin(req)) {
        await out.send_message("Not an admin", 400);
        return;
      }
      var users = await User.find().populate("participate").exec();
      await out.send_response(200, "Success", {
        users: users.map((u) => {
          return {
            userId: u.userId,
            step: u.step,
            name: u.name,
            email: u.email,
            is_admin: u.is_admin,
            is_google: u.is_google,
            picture: u.picture,
            phone: u.phone,
            college: u.college,
            course: u.course,
            year: u.year,
            participation: u.participate.map((p) => {
              return { event: p.event };
            }),
            registered_on: u.createdAt,
          };
        }),
      });
      return;
    } catch (err) {
      next(err);
    }
  }
);

/* 
  Check if the user is an admin
*/

adminApiRouter.post(
  "/is_admin",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var out = new CustomResponse(res);
      if (!is_admin(req)) {
        await out.send_response(200, "Not an admin", { is_admin: false });
        return;
      }
      await out.send_response(200, "Admin", { is_admin: true });
      return;
    } catch (err) {
      next(err);
    }
  }
);

/*
  Set the about data of the event, this is the main infoe about the event
*/

adminApiRouter.post(
  "/set_about",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      var out = new CustomResponse(res);
      if (!is_admin(req)) {
        await out.send_message("Not an admin", 400);
        return;
      }
      var {
        name = null,
        start = null,
        end = null,
        about = null,
        contact = null,
        email = null,
      } = req.body;
      if (!name || !start || !end || !about || !contact || !email) {
        await out.send_message("Invalid data", 400);
        return;
      }
      var abouts = await About.find().exec();
      if (abouts && abouts.length < 1) {
        var ab = new About({
          name: name,
          start: start,
          end: end,
          about: about,
          contact: contact,
          email: email,
        });
      } else {
        var ab = abouts[0];
        ab.name = name;
        ab.start = start;
        ab.end = end;
        ab.about = about;
        ab.contact = contact;
        ab.email = email;
      }
      await ab.save();
      await out.send_response(200, "Success", { about: ab });
      return;
    } catch (err) {
      next(err);
    }
  }
);

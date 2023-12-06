const env = process.env;
import { NextFunction, Request, Response, Router } from "express";
import { CustomResponse } from "../../response";
import { User, UserI } from "../../models/User";
import jwt from "jsonwebtoken";
import { authenticated_user, is_authenticated } from "../../request";
import { verifyGoogleToken } from "./register";

export const userRouter = Router();

/*
  Get the details about the user only, nessesary details are fetched,
  the token is used to authenticate the user,
*/
userRouter.post("/details", async (req, res, next) => {
  var out = new CustomResponse(res);
  try {
    if (!is_authenticated(req)) {
      await out.send_message("User not logged in!", 400);
      return;
    }
    var user = authenticated_user(req);
    if (user) {
      if (user.step < 2) {
        await out.send_response(200, "Status Got - Incomplete Registration!", {
          userId: user!.userId,
          step: user!.step,
        });
        return;
      }
      var details = {
        userId: user!.userId,
        name: user!.name,
        email: user!.email,
        phone: user!.phone,
        picture: user!.picture,
        gctian: user!.gctian,
        college: user!.college,
        course: user!.course,
        year: user!.year,
        step: user!.step,
      };
      // await user.populate("participate");
      await out.send_response(200, "Status got!", details);
    } else {
      return await out.send_message("An unexpected issue occured!", 400);
    }
  } catch (e) {
    next(e);
    return;
  }
});

/*
  Get all the details about the currently logged in user,
  accept the header bearer token for authenticating
*/

userRouter.post(
  "/getMyDetails",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("user details fetch");
    var out = new CustomResponse(res);
    try {
      if (is_authenticated(req)) {
        var p1 = await authenticated_user(req)!.populate("participate");
        if (p1 == null) {
          await out.send_message("Invalid userId", 400);
          return;
        } else {
          await out.send_response(200, "User found", p1);
          return;
        }
      } else {
        await out.send_message("User not logged in!", 400);
        return;
      }
    } catch (e) {
      next(e);
    }
  }
);

/*
  Route for login in using email and password, 
  token, userId and current step of user will be given as output
*/

userRouter.post("/login", async (req, res, next) => {
  console.log("Login request");
  var { email = null, password = null } = req.body;
  var out = new CustomResponse(res);
  try {
    if (email == null) {
      await out.send_message("Email not found", 400);
      return;
    } else if (password == null) {
      await out.send_message("Aud|Pass not provided", 400);
      return;
    }
    var p: UserI | null = await User.findOne({ email: email }).exec();
    if (!p) {
      return await out.send_message(
        "Email id is not registered with any account!",
        400
      );
    }
    if (p!.is_google) {
      return await out.send_message("Please login with google", 400);
    }
    if (p!.password != password) {
      return await out.send_message("Wrong Password!", 400);
    }
    var token = jwt.sign({ userId: p!.userId, email: p!.email }, "mytokenkey", {
      expiresIn: "100h",
    });
    await out.send_response(200, "Logged in Succesfully!", {
      userId: p!.userId,
      token: token,
      step: p!.step,
    });
  } catch (e) {
    next(e);
  }
});

/*
  Edit user details endpoint, accept the details to be edited as input, and edit the details of the user
*/

userRouter.post("/editDetails", async (req, res, next) => {
  var out = new CustomResponse(res);
  try {
    if (!is_authenticated(req)) {
      await out.send_message("User not logged in!", 400);
      return;
    }
    var user = authenticated_user(req);
    if (!user) {
      await out.send_message("User not logged in!", 400);
      return;
    }
    var {
      name = null,
      phone = null,
      college = null,
      course = null,
      year = null,
      gctian = null,
    } = req.body;

    if (name != null) user.name = name;
    if (phone != null) user.phone = phone;
    if (gctian != null) {
      user.gctian = gctian;
      console.log("Gctian is " + (user.gctian == true));
      if (user.gctian == true)
        user.college =
          "Kodiyeri Balakrishnan Memorial Government College Thalassery";
    }
    if (user.gctian == false && college != null) user.college = college;
    if (course != null) user.course = course;
    if (year != null) user.year = year;
    await user.save();
    await out.send_response(200, "Details updated!", {
      userId: user.userId,
      name: user.name,
    });
  } catch (e) {
    next(e);
  }
});

/*
  Complete the registration process by entering additional details 
  phone, college, course, year and is gctian is passed as an input and the email is send back as response data
*/

userRouter.post("/createAccount/complete", async (req, res, next) => {
  var out = new CustomResponse(res);
  try {
    var {
      phone = null,
      college = null,
      course = null,
      year = null,
      gctian = false,
    } = req.body;
    if (!is_authenticated(req)) {
      await out.send_message("Please Login to continue!", 400);
      return;
    }
    var user = authenticated_user(req);
    if (!user) {
      await out.send_message("Please Login to continue!", 400);
      return;
    }
    if (
      phone == null ||
      (!gctian && college == null) ||
      course == null ||
      year == null ||
      gctian == null
    ) {
      if (phone == null) out.set_data_key("phone", "Phone number is required!");
      if (!gctian && college == null)
        out.set_data_key("college", "College is required!");
      if (course == null) out.set_data_key("course", "Course is required !");
      if (year == null) out.set_data_key("year", "Year is required!");
      out.set_message("Some of the details are not correct !");
      await out.send_failiure_response();
      return;
    }
    user.phone = phone;
    user.gctian = gctian;
    user.college = user.gctian
      ? "Kodiyeri Balakrishnan Memorial Government College Thalassery"
      : college;
    user.course = course;
    user.year = year;
    user.step = 2;
    await user.save();
    await out.send_response(200, "Successfully Completed Registration!", {
      email: user.email,
      step: 2,
    });
    return;
  } catch (err) {
    next(err);
  }
});

/*
  create an account from the google sign in method, 
  credential is given as input and access token is send as output,
  can also be used for login with google
*/

userRouter.post("/createAccount/google", async (req, res, next) => {
  console.log("Google request ");
  var { credential = null } = req.body;
  var out = new CustomResponse(res);
  try {
    if (credential == null) {
      await out.send_message("Credentials not given", 400);
      return;
    }
    var usr = await verifyGoogleToken(credential);
    var p = await User.findOne({ email: usr.email }).exec();
    if (p) {
      /* no additional check to verify the user logged in using google method was done here */
      var token = jwt.sign(
        { userId: p.userId, email: usr.email },
        "mytokenkey",
        {
          expiresIn: "100h",
        }
      );
      await out.send_response(200, "Successfuly Logged in as " + p.name + "!", {
        token: token,
        userId: p.userId,
        step: p.step,
      });
      return;
    }
    var user = new User({
      name: usr.name,
      email: usr.email,
      password: usr.password,
      picture: usr.picture,
      step: 1,
      is_google: true,
    });
    await user.save();
    var id = 0;
    var obj = await User.find().sort({ id: -1 }).limit(1);
    if (!obj) id = 1;
    else if (obj.length == 0) id = 1;
    else if (obj.length > 1) {
      console.log(
        "Error with the uniqueness of users. this may be occured in the server side. "
      );
      await out.send_message(
        "Error with the uniqueness of users. this may be occured in the server side. please contact the admin.",
        500
      );
    } else {
      id = obj[0].id + 1;
    }

    var userId = "VIJNANA24-" + (100 + id);
    var token = jwt.sign({ userId: userId, email: usr.email }, "mytokenkey", {
      expiresIn: "100h",
    });
    user.id = id;
    user.userId = userId;
    user.token = token;
    await user.save();
    await out.send_response(200, "User created successfully", {
      token: token,
      userId: userId,
      step: 1,
    });
  } catch (err) {
    next(err);
  }
});

/* 
  Create an account by receiving name, email and password
  give back the token for authentication, the registration will only complete after the next step (other details entering is complete)
*/

userRouter.post("/createAccount", async (req, res, next) => {
  var { name = null, email = null, password = null } = req.body;
  var out = new CustomResponse(res);
  try {
    if (name == null || email == null || password == null) {
      if (name == null) out.set_data_key("name", "Name not provided!");
      if (email == null) out.set_data_key("email", "Email not provided");
      if (password == null)
        out.set_data_key("password", "Password not provided");
      out.set_message("Request is not complete!");
      await out.send_failiure_response();
      return;
    }
    var p = await User.findOne({ email: email }).exec();
    if (p) {
      await out.send_message(
        "Email already registed with another account!",
        400
      );
      return;
    }
    var user = new User({
      name: name,
      email: email,
      password: password,
      step: 1,
      is_google: false,
      picture: null,
    });
    await user.save();
    var id = 0;
    var obj = await User.find().sort({ id: -1 }).limit(1);
    if (!obj) id = 1;
    else if (obj.length == 0) id = 1;
    else if (obj.length > 1) {
      console.log(
        "Error with the uniqueness of users. this may be occured in the server side. "
      );
      await out.send_message(
        "Error with the uniqueness of users. this may be occured in the server side. please contact the admin.",
        500
      );
    } else {
      id = obj[0].id + 1;
    }
    var userId = "VIJNANA24-" + (100 + id);
    var token = jwt.sign({ userId: userId, email: email }, "mytokenkey", {
      expiresIn: "100h",
    });
    user.id = id;
    user.userId = userId;
    user.token = token;
    await user.save();
    await out.send_response(200, "User created successfully", {
      token: token,
      userId: userId,
      step: 1,
    });
  } catch (err) {
    next(err);
  }
});

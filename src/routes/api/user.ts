const env = process.env;
import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { CustomResponse } from "../../response";
import { User, UserI, UserType } from "../../models/User";
import { Event } from "../../models/Event";
import jwt from "jsonwebtoken";
import { authenticated_user, is_authenticated } from "../../request";
import { verifyGoogleToken } from "./register";

export const userRouter = Router();

// COMMON FUNCTION FOR USER LOGIN (user instance,res for sending responce,password in case of non google login)
const loginAction = async (p: Array<UserI>, res: Response, password = null) => {
  var out = new CustomResponse(res);
  console.log("In loginAction function..");
  try {
    if (p == null) {
      await out.send_message("Invalid email or password !", 400);
      return false;
    }
    if (p.length < 1) {
      await out.send_message("Invalid email or password !", 400);
      return false;
    } else if (p.length > 1) {
      await out.send_message(
        "Multiple users with email. Please report to admin.",
        500
      );
      console.log("Multiple users with email");
      return true;
    } else {
      var p1: UserI = p[0];
      console.log(p);
      // IN CASE THE USER IS TRYING TO LOGIN WITH PASSWORD OF A GOOGLE SIGN IN METHOD
      if (
        !(password == null && p1.password == null) &&
        (password == null || p1.password == null || password != p1.password)
      ) {
        await out.send_message(
          "Invalid password " + (p1.password == null ? "(Google Method)" : ""),
          400
        );
        console.log("Trying to login with password. (Google method required");
        return true;
      }
      var date = new Date();
      // var token = null;
      var token = jwt.sign(
        { userId: p1.userId, email: p1.email },
        "mytokenkey",
        {
          expiresIn: "100h",
        }
      );
      p1.token = token;
      try {
        await p1.save();
      } catch (err) {
        console.log(err);
      }

      console.log("TOKEN : " + token);

      await out.send_response(200, "User Authentication Successfuly !", {
        userId: p1.userId,
        token: token,
      });
      console.log("User authentication successful. Tokens send");
      return true;
    }
  } catch (e) {
    console.log("Error occured");
    console.log(e);
    await out.send_500_response();
    return true;
  }
};

// ROUTE : /API/USEER/GETMYDETAILS

userRouter.post("/getMyDetails", async (req: Request, res: Response) => {
  console.log("user details fetch");
  var out = new CustomResponse(res);
  if (is_authenticated(req)) {
    try {
      // FETCH THE USER
      var p1 = await authenticated_user(req)!.populate("participate");
      if (p1 == null) {
        await out.send_message("Invalid userId", 400);
        return;
      } else {
        console.log("Current user : ");
        console.log(p1);
        console.log("The events the user is participating is :-");
        await out.send_response(200, "User found", p1);
        return;
      }
    } catch (e) {
      console.log("Error occured");
      console.log(e);
      await out.send_500_response();
      return;
    }
  } else {
    out.send_message("User not logged in!", 400);
    return;
  }
});

// ROUTE : /API/USER/LOGIN (POST)

userRouter.post("/login", async (req, res) => {
  console.log("Login request");
  var { email = null, is_google = false, password = null } = req.body;
  var out = new CustomResponse(res);
  if (email == null) {
    await out.send_message("Email not found", 400);
    return;
  } else if (!is_google && password == null) {
    await out.send_message("Aud|Pass not provided", 400);
    return;
  }
  if (is_google) {
    // CHECK THE CLIENT ID IS MATCHING (IN CASE OF GOOGLE LOGIN)
    await out.send_message("Invalid Request : Client Error");
    return;
  }
  var al = false;
  // FIND THE USER
  var p: Array<UserI> = await User.find({ email: email });
  console.log("Login request");
  console.log(p);
  al = await loginAction(p, res, password);
});

/*
  Complete the registration process by entering additional details 
  phone, college, course, year and is gctian is passed as an input and the email is send back as response data
*/

userRouter.post("/createAccount/complete", async (req, res) => {
  var out = new CustomResponse(res);
  var {
    phone = null,
    college = null,
    course = null,
    year = null,
    gctian = false,
  } = req.body;
  if (!is_authenticated(req)) {
    out.send_message("Please Login to continue!", 400);
    return;
  }
  var user = authenticated_user(req);
  if (!user) {
    out.send_message("Please Login to continue!", 400);
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
    out.send_failiure_response();
    return;
  }
  user.phone = phone;
  user.college = gctian
    ? "Kodiyeri Balakrishnan Memorial Government College Thalassery"
    : college;
  user.course = course;
  user.year = year;
  user.gctian = gctian;
  user.step = 2;
  try {
    await user.save();
    out.send_response(200, "Successfully Completed Registration!", {
      email: user.email,
    });
    return;
  } catch (err) {
    console.log(err);
    out.send_500_response();
    return;
  }
});

/*
  create an account from the google sign in method, 
  credential is given as input and access token is send as output
*/

userRouter.post("/createAccount/google", async (req, res) => {
  console.log("Google request ");
  var { credential = null } = req.body;
  var out = new CustomResponse(res);
  if (credential == null) {
    out.send_message("Credentials not given", 400);
    return;
  }
  try {
    var usr = await verifyGoogleToken(credential);
    var p = await User.findOne({ email: usr.email }).exec();
    if (p) {
      out.send_message("Email already registed with another account!", 400);
      return;
    }
    var user = new User({
      name: usr.name,
      email: usr.email,
      password: usr.password,
      picture: usr.password,
      step: 1,
      is_google: true,
    });
    await user.save();
    var id = 0;
    var obj = await User.find().sort({ id: -1 }).limit(1);
    try {
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
    } catch (e) {
      console.log("Error setting id when creating user");
      console.log(e);
      await out.send_500_response();
      return;
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
    });
  } catch (err) {
    console.log(err);
    out.send_500_response();
    return;
  }
});

/* 
  Create an account by receiving name, email and password
  give back the token for authentication, the registration will only complete after the next step (other details entering is complete)
*/

userRouter.post("/createAccount", async (req, res) => {
  var { name = null, email = null, password = null } = req.body;
  var out = new CustomResponse(res);
  if (name == null || email == null || password == null) {
    if (name == null) out.set_data_key("name", "Name not provided!");
    if (email == null) out.set_data_key("email", "Email not provided");
    if (password == null) out.set_data_key("password", "Password not provided");
    out.set_message("Request is not complete!");
    out.send_failiure_response();
    return;
  }
  try {
    var p = await User.findOne({ email: email }).exec();
    if (p) {
      out.send_message("Email already registed with another account!", 400);
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
    try {
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
    } catch (e) {
      console.log("Error setting id when creating user");
      console.log(e);
      await out.send_500_response();
      return;
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
    });
  } catch (err) {
    console.log("Error creating account ...");
    console.log(err);
  }
});

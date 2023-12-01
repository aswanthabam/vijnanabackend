const env = process.env;
import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { CustomResponse } from "../../response";
import { User, UserI, UserType } from "../../models/User";
import { Event } from "../../models/Event";
import jwt from "jsonwebtoken";
import { authenticated_user, is_authenticated } from "../../request";

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

// ROUTE :/API/USER/CREATE (POST)

userRouter.post("/create", async (req, res) => {
  console.log("Create user request");
  var {
    name = null,
    email = null,
    picture = null,
    phone = null,
    college = null,
    course = null,
    password = null,
    year = 1,
    gctian = false,
    is_google = false,
  } = req.body;
  var out = new CustomResponse(res);
  if (name == null || email == null) {
    if (name == null) {
      out.set_data_key("name", "Name not provided");
    }
    if (email == null) {
      out.set_data_key("email", "Email not provided");
    }
    out.set_message("Invalid Request!");
    await out.send_failiure_response();
    return;
  }
  // CHECK IF A USER ALREADY CREATED.  IF CREATED LOGIN THAAT PARTICULAR USER, IN GOOGLE METHID
  var p = await User.findOne({ email: email }).exec();
  console.log("Create user: Uniqueness check:-");
  // IF ALREADY RETURN
  if (p) {
    console.log("Aleady registered");
    out.send_message("Email Already in use!", 400);
    return;
  }
  // out.status = 400;
  if (
    course == null ||
    (!is_google && password == null) ||
    phone == null ||
    year == null ||
    college == null
  ) {
    // if (picture == null) out.set_data_key("picture", "Picture not provided");
    if (college == null) out.set_data_key("college", "College not provided");
    if (course == null) out.set_data_key("course", "Course not provided");
    if (year == null) out.set_data_key("year", "year not provided");
    if (!is_google && password == null)
      out.set_data_key("password", "Aud|Pass not provided");
    if (phone == null) out.set_data_key("phone", "Phone No not provided");
    out.set_message("Invalid Request !");
    await out.send_failiure_response();
    return;
  }

  if (is_google) {
    // CHECK THE CLIENT ID IN CASE OF GOOOGLE METHOD
    console.log("Client ID :", env.CLIENT_ID);
    console.log("Invalid client id");
    await out.send_message("Invalid CLient !");
    return;
  }
  try {
    // CREATE NEW USER
    var user = new User({
      name: name,
      email: email,
      picture: picture,
      phone: phone,
      college: college,
      course: course,
      year: year,
      password: password,
      gctian: gctian,
      is_google: is_google,
    });
    await user.save();
    // SAVE THE USER AND FETCH ALL USER FOR SETTING ID GET THE NUMBER
    var id = 0;
    var obj = await User.find().sort({ id: -1 }).limit(1);
    try {
      if (obj == null) id = 1;
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
    var userId = "VIJNANA23-" + (100 + id); // USERID IN FORM OF VIJNANA23-101
    var token = jwt.sign({ userId: userId, email: email }, "mytokenkey", {
      expiresIn: "100h",
    });
    // SET THE DATA
    user.id = id;
    user.userId = userId;
    user.token = token;
    await user.save(); // SAVE
    await out.send_response(200, "User created successfully", {
      token: token,
      userId: userId,
    });

    console.log("USer creayed");
    return;
  } catch (e) {
    // UNEXPECTED ERROR
    console.log("error occured");
    console.log(e);
    await out.send_500_response();
    return;
  }
});

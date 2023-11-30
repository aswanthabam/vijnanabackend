const env = process.env;
import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { CustomResponse } from "../../response";
import { User, UserI, UserType } from "../../models/User";
import { Event } from "../../models/Event";

export const userRouter = Router();

// COMMON FUNCTION FOR USER LOGIN (user instance,res for sending responce,password in case of non google login)
const loginAction = async (p: Array<UserI>, res: Response, password = null) => {
  var out = new CustomResponse(res);
  console.log("In loginAction function..");
  try {
    if (p == null) return false;
    if (p.length < 1) return false;
    else if (p.length > 1) {
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
      var token = null;
      // CHECK FOR THE TOKEN EXPIRY
      if (
        p1.token == null ||
        p1.token == undefined ||
        p1.expiry == null ||
        p1.expiry == undefined
      ) {
        // IF EXPIRED CREATE NEW TOKEN
        token = btoa(
          p1.email +
            "D" +
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
        p1.token = token;
        p1.expiry = date;
        await p1.save();
      } else {
        // USE THE OLD TOKEN
        token = p1.token;
        date = p1.expiry;
      }

      console.log("TOKEN : " + token);
      console.log(
        "EXPIRY : " +
          date.getDate() +
          "/" +
          date.getMonth() +
          "/" +
          date.getFullYear() +
          " @" +
          date.getHours() +
          ":" +
          date.getMinutes() +
          ":" +
          date.getSeconds()
      );
      await out.send_response(200, "User Authentication Successfuly !", {
        token: token,
        expiry: date,
        userId: p1.userId,
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
  var { userId = null, token = null } = req.body;
  var out = new CustomResponse(res);
  if (token == null || userId == null) {
    if (userId == null) out.set_data_key("userId", "UserId not provided");
    if (token == null) out.set_data_key("token", "Token not provided");
    out.set_message("Invalid Request Data !");
    await out.send_failiure_response();
    return;
  }
  // else out.status = 200;
  try {
    // FETCH THE USER
    var p = await User.find({ userId: userId }).populate("participate");
    if (p == null) {
      await out.send_message("Invalid userId", 400);
      return;
    } else if (p.length != 1) {
      await out.send_message("User not found", 400);
      return;
    } else {
      var p1 = p[0];
      console.log("Current user : ");
      console.log(p);
      console.log("TOKEN: " + p1.token + " | " + token);
      if (p1.token != token) {
        await out.send_message("Invalid Token", 400);
        return;
      } else {
        // USER IS FETCHED CORRECTLY
        // CHECK FOR THE CORRESPONDING EVENT INSTANCES FOR THE IDS
        var participate = await Event.find({
          id: { $in: p1.participate.map((eventId) => eventId) },
        });
        console.log("The events the user is participating is :-");
        console.log(participate);
        await out.send_response(200, "User found", {
          userId: p1.userId,
          name: p1.name,
          email: p1.email,
          dob: p1.dob,
          course: p1.course,
          phone: p1.phone,
          picture: p1.picture,
          participate: participate,
        });
        return;
      }
    }
  } catch (e) {
    console.log("Error occured");
    console.log(e);
    await out.send_500_response();
    return;
  }
});

// ROUTE : /API/USER/LOGIN (POST)

userRouter.post("/login", async (req, res) => {
  console.log("Login request");
  var { email = null, aud = null, password = null } = req.body;
  var out = new CustomResponse(res);
  if (email == null) {
    await out.send_message("Email not found", 400);
    return;
  } else if (aud == null && password == null) {
    await out.send_message("Aud|Pass not provided", 400);
    return;
  }
  if (aud != null && aud != env.CLIENT_ID) {
    // CHECK THE CLIENT ID IS MATCHING (IN CASE OF GOOGLE LOGIN)
    await out.send_message("Invalid Request : Client Error");
    return;
  }
  var al = false;
  // FIND THE USER
  var p: Array<UserI> = await User.find({ email: email });
  // .then(async (p: Array<UserI>) => {
  console.log("Login request");
  console.log(p);
  al = await loginAction(p, res, password);
  // });

  if (!al) {
    // invalid responce from loginaction function
    console.log("Not logged in");
    await out.send_message("User not logged in!", 400);
    return;
  }
});

// ROUTE :/API/USER/CREATE (POST)

userRouter.post("/create", async (req, res) => {
  console.log("Create user request");
  var {
    name = null,
    email = null,
    picture = null,
    phone = null,
    course = null,
    aud = null,
    password = null,
    year = 1,
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
  var al = false;
  // CHECK IF A USER ALREADY CREATED.  IF CREATED LOGIN THAAT PARTICULAR USER, IN GOOGLE METHID
  var p = await User.find({ email: email });
  // .then(async (p) => {
  console.log("Create user: Uniqueness check:-");
  console.log(p);
  al = await loginAction(p, res);
  // });
  // IF ALREADY RETURN
  if (al) {
    console.log("Aleady registered");
    return;
  }
  // out.status = 400;
  if (picture == null || course == null || (aud == null && password == null)) {
    if (picture == null) out.set_data_key("picture", "Picture not provided");
    if (course == null) out.set_data_key("course", "Course not provided");
    if (aud == null && password == null)
      out.set_data_key("password", "Aud|Pass not provided");
    out.set_message("Invalid Request !");
    await out.send_failiure_response();
    return;
  }

  if (aud != null && aud != env.CLIENT_ID) {
    // CHECK THE CLIENT ID IN CASE OF GOOOGLE METHOD
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
      course: course,
      password: password,
      year: year,
    });
    await user.save();
    console.log("User saved temp. creating id");
    // SAVE THE USER AND FETCH ALL USER FOR SETTING ID GET THE NUMBER
    var id = 0;
    var obj = await User.find().sort({ id: -1 }).limit(1);
    // .then(async (obj) => {
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
    // });
    var userId = "VIJNANA23-" + (100 + id); // USERID IN FORM OF VIJNANA23-101
    console.log("id is " + id + " userId is " + userId);
    var date = new Date();
    // GENERATE TOKEN
    var token = btoa(
      email +
        "D" +
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
    date.setDate(date.getDate() + 14); // Expiry 14 days
    console.log("TOKEN : " + token);
    console.log(
      "EXPIRY : " +
        date.getDate() +
        "/" +
        date.getMonth() +
        "/" +
        date.getFullYear() +
        " @" +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds()
    );
    // SET THE DATA
    user.id = id;
    user.userId = userId;
    user.token = token;
    user.expiry = date;
    await user.save(); // SAVE
    await out.send_response(200, "User created successfully", {
      token: token,
      expiry: date,
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

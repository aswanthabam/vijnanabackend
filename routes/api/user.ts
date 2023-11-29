const env = process.env;
import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { CustomResponse } from "../../response";
import { User, UserType } from "../../models/User";
import { Event } from "../../models/Event";

export const userRouter = Router();

// COMMON FUNCTION FOR USER LOGIN (user instance,res for sending responce,password in case of non google login)
const loginAction = async (p: UserType[], res: Response, password = null) => {
  var out = {};
  console.log("In loginAction function..");
  try {
    if (p == null) return false;
    if (p.length < 1) return false;
    else if (p.length > 1) {
      out.status = 500;
      out.description =
        "Multiple users with same email. Please report to admin. Aswanth V C";
      out.error = "uniqueness error";
      console.log("Multiple users with same email. ");
      res.json(out);
      return true;
    } else {
      p = p[0];
      console.log(p);
      // IN CASE THE USER IS TRYING TO LOGIN WITH PASSWORD OF A GOOGLE SIGN IN METHOD
      if (
        !(password == null && p.password == null) &&
        (password == null || p.password == null || password != p.password)
      ) {
        out.status = 400;
        out.description =
          "Invalid password " + (p.password == null ? "(Google Method)" : "");
        res.json(out);
        console.log("Trying to login with password. (Google method required");
        return true;
      }
      var date = new Date();
      out.status = 200;
      out.description = "User authentication successful ";
      var date = new Date();
      var token = null;
      // CHECK FOR THE TOKEN EXPIRY
      if (
        p.token == null ||
        p.token == undefined ||
        p.expiry == null ||
        p.expiry == undefined
      ) {
        // IF EXPIRED CREATE NEW TOKEN
        token = btoa(
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
        date.setDate(date.getDate() + 14);
        p.token = token;
        p.expiry = date;
        await p.save();
      } else {
        // USE THE OLD TOKEN
        token = p.token;
        date = p.expiry;
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
      out.content = {
        token: token,
        expiry: date,
        userId: p.userId,
      };
      console.log("User authentication successful. Tokens send");
      res.json(out);
      return true;
    }
  } catch (e) {
    console.log("Error occured");
    console.log(e);
    out.status = 500;
    out.description =
      "Unable to login. the user was already created but an error occured when loging in. report this issue to admin. Aswanth v C";
    out.error = e;
    res.json(out);
    return true;
  }
  return false;
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
    out.send_failiure_response();
    return;
  }
  // else out.status = 200;
  try {
    // FETCH THE USER
    var p = await User.find({ userId: userId }).populate("participate");
    if (p == null) {
      out.send_message("Invalid userId", 400);
      return;
    } else if (p.length != 1) {
      out.send_message("User not found", 400);
      return;
    } else {
      var p1 = p[0];
      console.log("Current user : ");
      console.log(p);
      console.log("TOKEN: " + p1.token + " | " + token);
      if (p1.token != token) {
        out.send_message("Invalid Token", 400);
        return;
      } else {
        // USER IS FETCHED CORRECTLY
        // CHECK FOR THE CORRESPONDING EVENT INSTANCES FOR THE IDS
        var participate = await Event.find({
          id: { $in: p1.participate.map((eventId) => eventId) },
        });
        console.log("The events the user is participating is :-");
        console.log(participate);
        out.send_response(200, "User found", {
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
    out.send_500_response();
    return;
  }
});

// ROUTE : /API/USER/LOGIN (POST)

userRouter.post("/login", async (req, res) => {
  console.log("Login request");
  var { email = null, aud = null, password = null } = req.body;
  var out = new CustomResponse(res);
  if (email == null) {
    out.send_message("Email not found", 400);
    return;
  } else if (aud == null && password == null) {
    out.send_message("Aud|Pass not provided", 400);
    return;
  }
  if (aud != null && aud != env.CLIENT_ID) {
    // CHECK THE CLIENT ID IS MATCHING (IN CASE OF GOOGLE LOGIN)
    out.send_message("Invalid Request : Client Error");
    return;
  }
  var al = false;
  // FIND THE USER
  await User.find({ email: email }).then(async (p: UserType[]) => {
    console.log("Login request");
    console.log(p);
    al = await loginAction(p, res, password);
  });

  if (!al) {
    // invalid responce from loginaction function
    console.log("Not logged in");
    out.status = 400;
    out.description = "User not logged in";
    res.json(out);
    return;
  }
});

// ROUTE :/API/USER/CREATE (POST)

router.post("/create", async (req, res) => {
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
  var out = { status: 400 };
  if (name == null) out.description = "Name not provided";
  else if (email == null) out.description = "Email not provided";
  else out.status = 200;
  var al = false;
  if (out.status != 200) {
    out.error = "Invalid Request";
    res.json(out);
    return;
  } else {
    // CHECK IF A USER ALREADY CREATED.  IF CREATED LOGIN THAAT PARTICULAR USER, IN GOOGLE METHID
    await User.find({ email: email }).then(async (p) => {
      console.log("Create user: Uniqueness check:-");
      console.log(p);
      al = await loginAction(p, res);
    });
  }
  // IF ALREADY RETURN
  if (al) {
    console.log("Aleady registered");
    return;
  }
  out.status = 400;
  if (picture == null) out.description = "Picture not provided";
  else if (course == null) out.description = "Course not provided";
  else if (aud == null && password == null)
    out.description = "Aud|Pass not provided";
  else out.status = 200;
  if (out.status != 200) {
    out.error = "Invalid Request";
    res.json(out);
    return;
  }
  if (aud != null && aud != env.CLIENT_ID) {
    // CHECK THE CLIENT ID IN CASE OF GOOOGLE METHOD
    console.log("Invalid client id");
    out.status = 400;
    out.description = "Unknown client";
    out.error = "Invalid Request";
    res.json(out);
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
    await User.find()
      .sort({ id: -1 })
      .limit(1)
      .then((obj) => {
        try {
          if (obj == null) id = 1;
          else if (obj.length == 0) id = 1;
          else if (obj.length > 1) {
            console.log(
              "Error with the uniqueness of users. this may be occured in the server side. "
            );
            out.status = 500;
            out.description =
              "Error with the uniqueness of users. this may be occured in the server side. please contact the admin. (Aswanth V C)";
            out.error = "uniqueness failed";
            res.json(out);
          } else {
            id = obj[0].id + 1;
          }
        } catch (e) {
          console.log("Error setting id when creating user");
          console.log(e);
          out.status = 500;
          out.description =
            "User saved!. but unable to complete the process. report this issue to the admin. (Aswanth V C)";
          out.error = e;
          res.json(out);
          return;
        }
      });
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
    out.status = 200;
    out.description = "User created successfully ";
    out.content = {
      token: token,
      expiry: date,
      userId: userId,
    };
    console.log("USer creayed");
    res.json(out);
    return;
  } catch (e) {
    // UNEXPECTED ERROR
    console.log("error occured");
    console.log(e);
    out.status = 500;
    out.error = "Error saving (" + e + ")";
    out.description = "Unable to save the user instance";
    res.json(out);
    return;
  }
});

module.exports = router;

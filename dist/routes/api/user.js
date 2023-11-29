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
const env = process.env;
const response_1 = require("../../response");
const User_1 = require("../../models/User");
const Event_1 = require("../../models/Event");
var router = express.Router();
// COMMON FUNCTION FOR USER LOGIN (user instance,res for sending responce,password in case of non google login)
const loginAction = (p, res, password = null) => __awaiter(void 0, void 0, void 0, function* () {
    var out = {};
    console.log("In loginAction function..");
    try {
        if (p == null)
            return false;
        if (p.length < 1)
            return false;
        else if (p.length > 1) {
            out.status = 500;
            out.description =
                "Multiple users with same email. Please report to admin. Aswanth V C";
            out.error = "uniqueness error";
            console.log("Multiple users with same email. ");
            res.json(out);
            return true;
        }
        else {
            p = p[0];
            console.log(p);
            // IN CASE THE USER IS TRYING TO LOGIN WITH PASSWORD OF A GOOGLE SIGN IN METHOD
            if (!(password == null && p.password == null) &&
                (password == null || p.password == null || password != p.password)) {
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
            if (p.token == null ||
                p.token == undefined ||
                p.expiry == null ||
                p.expiry == undefined) {
                // IF EXPIRED CREATE NEW TOKEN
                token = btoa(email +
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
                    "CL").replace("=", "");
                date.setDate(date.getDate() + 14);
                p.token = token;
                p.expiry = date;
                yield p.save();
            }
            else {
                // USE THE OLD TOKEN
                token = p.token;
                date = p.expiry;
            }
            console.log("TOKEN : " + token);
            console.log("EXPIRY : " +
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
                date.getSeconds());
            out.content = {
                token: token,
                expiry: date,
                userId: p.userId,
            };
            console.log("User authentication successful. Tokens send");
            res.json(out);
            return true;
        }
    }
    catch (e) {
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
});
// ROUTE : /API/USEER/GETMYDETAILS
router.post("/getMyDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("user details fetch");
    var { userId = null, token = null } = req.body;
    var out = new response_1.CustomResponse(res);
    if (token == null || userId == null) {
        if (userId == null)
            out.set_data_key("userId", "UserId not provided");
        if (token == null)
            out.set_data_key("token", "Token not provided");
        out.set_message("Invalid Request Data !");
        out.send_failiure_response();
        return;
    }
    // else out.status = 200;
    try {
        // FETCH THE USER
        var p = yield User_1.User.find({ userId: userId }).populate("participate");
        if (p == null)
            out.set_data_key("userId", "Invalid userId");
        else if (p.length != 1)
            out.set_data_key("userId", "User not found");
        else {
            p = p[0];
            console.log("Current user : ");
            console.log(p);
            console.log("TOKEN: " + p.token + " | " + token);
            if (p.token != token) {
                out.set_data_key("token", "Invalid token");
            }
            else {
                // USER IS FETCHED CORRECTLY
                // CHECK FOR THE CORRESPONDING EVENT INSTANCES FOR THE IDS
                var participate = yield Event_1.Event.find({
                    id: { $in: p.participate.map(({ eventId }) => eventId) },
                });
                console.log("The events the user is participating is :-");
                console.log(participate);
                out.status = 200;
                out.description = "User found";
                out.content = {
                    userId: p.userId,
                    name: p.name,
                    email: p.email,
                    dob: p.dob,
                    course: p.course,
                    phone: p.phone,
                    picture: p.picture,
                    participate: participate,
                };
            }
        }
        res.json(out);
        return;
    }
    catch (e) {
        console.log("Error occured");
        console.log(e);
        out.status = 500;
        out.description = "Error occured when getting details";
        out.error = e;
        res.json(out);
        return;
    }
}));
// ROUTE : /API/USER/LOGIN (POST)
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Login request");
    var { email = null, aud = null, password = null } = req.body;
    var out = { status: 400 };
    if (email == null)
        out.description = "Email not provided";
    else if (aud == null && password == null)
        out.description = "Aud|Pass not provided";
    else
        out.status = 200;
    if (aud != null && aud != env.CLIENT_ID) {
        // CHECK THE CLIENT ID IS MATCHING (IN CASE OF GOOGLE LOGIN)
        out.status = 400;
        out.description = "Unknown client";
        out.error = "Invalid Request";
        res.json(out);
        return;
    }
    var al = false;
    if (out.status != 200) {
        out.error = "Invalid Request";
        res.json(out);
        return;
    }
    else {
        // FIND THE USER
        yield User_1.User.find({ email: email }).then((p) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Login request");
            console.log(p);
            al = yield loginAction(p, res, password);
        }));
    }
    if (!al) {
        // invalid responce from loginaction function
        console.log("Not logged in");
        out.status = 400;
        out.description = "User not logged in";
        res.json(out);
        return;
    }
}));
// ROUTE :/API/USER/CREATE (POST)
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Create user request");
    var { name = null, email = null, picture = null, phone = null, course = null, aud = null, password = null, year = 1, } = req.body;
    var out = { status: 400 };
    if (name == null)
        out.description = "Name not provided";
    else if (email == null)
        out.description = "Email not provided";
    else
        out.status = 200;
    var al = false;
    if (out.status != 200) {
        out.error = "Invalid Request";
        res.json(out);
        return;
    }
    else {
        // CHECK IF A USER ALREADY CREATED.  IF CREATED LOGIN THAAT PARTICULAR USER, IN GOOGLE METHID
        yield User_1.User.find({ email: email }).then((p) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Create user: Uniqueness check:-");
            console.log(p);
            al = yield loginAction(p, res);
        }));
    }
    // IF ALREADY RETURN
    if (al) {
        console.log("Aleady registered");
        return;
    }
    out.status = 400;
    if (picture == null)
        out.description = "Picture not provided";
    else if (course == null)
        out.description = "Course not provided";
    else if (aud == null && password == null)
        out.description = "Aud|Pass not provided";
    else
        out.status = 200;
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
        var user = new User_1.User({
            name: name,
            email: email,
            picture: picture,
            phone: phone,
            course: course,
            password: password,
            year: year,
        });
        yield user.save();
        console.log("User saved temp. creating id");
        // SAVE THE USER AND FETCH ALL USER FOR SETTING ID GET THE NUMBER
        var id = 0;
        yield User_1.User.find()
            .sort({ id: -1 })
            .limit(1)
            .then((obj) => {
            try {
                if (obj == null)
                    id = 1;
                else if (obj.length == 0)
                    id = 1;
                else if (obj.length > 1) {
                    console.log("Error with the uniqueness of users. this may be occured in the server side. ");
                    out.status = 500;
                    out.description =
                        "Error with the uniqueness of users. this may be occured in the server side. please contact the admin. (Aswanth V C)";
                    out.error = "uniqueness failed";
                    res.json(out);
                }
                else {
                    id = obj[0].id + 1;
                }
            }
            catch (e) {
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
        var token = btoa(email +
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
            "CL").replace("=", "");
        date.setDate(date.getDate() + 14); // Expiry 14 days
        console.log("TOKEN : " + token);
        console.log("EXPIRY : " +
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
            date.getSeconds());
        // SET THE DATA
        user.id = id;
        user.userId = userId;
        user.token = token;
        user.expiry = date;
        yield user.save(); // SAVE
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
    }
    catch (e) {
        // UNEXPECTED ERROR
        console.log("error occured");
        console.log(e);
        out.status = 500;
        out.error = "Error saving (" + e + ")";
        out.description = "Unable to save the user instance";
        res.json(out);
        return;
    }
}));
module.exports = router;

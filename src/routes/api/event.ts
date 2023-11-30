const env = process.env
import { Request, Response, Router } from "express";
import mongoose, { Types } from "mongoose";
import { User, UserI, UserType } from "../../models/User";
import { Admin } from "../../models/Admin";
import { Event } from "../../models/Event";
import { EventReg, EventRegI } from "../../models/EventReg";
import { CustomResponse } from "../../response";

//
export const eventRouter = Router();

// ROUTE : /API/EVENT/REGISTER (POST)

eventRouter.post("/register",async (req: Request,res: Response) => {
  // REGISTER TO EVENT
  var {id = null, userId=null} = req.body;
  var out = new CustomResponse(res);
  if (id == null && userId == null) {
  if(id == null) out.set_data_key('id',"ID not provided");
  if(userId == null) out.set_data_key('userId',"UserID not provided");
    out.set_message("Invalid Request");
    out.send_failiure_response()
    return;
}
  
  console.log("Registeration to event "+id);
  console.log("Request is ok");
  try {
    var user = await User.find({userId:userId});
    if(user == null) {
      out.send_message("User Error",400);
      return
    }else if(user.length != 1) {
      out.send_message("User Error",400);
      return
    }else {
      // VALID USER
      var event = await Event.find({id:id});
      if(user == null) {
        out.send_message("Event not found error !",400);
      return;
      }else if(user.length != 1) {
        out.send_message("Event not found error !",400);
        return;
      }else {
        // VALID EVENT
        var user1 = user[0];
        var event1 = event[0];
        console.log("User instance:-");
        console.log(user);
        console.log("Event instance:-");
        console.log(event);
        // GETS THE EVENT REGISTRATION INSTANCE OF THE PERTICULAR EVENT AND USER
        var eventReg = await EventReg.find({userId:user1.userId,eventId:event1.id});
        var has = true;
        if(eventReg == null) has = false;
        else if(eventReg.length <= 0) has = false;
        if(has) {
          // EVENT IS ALREADY REGISTERED
          console.log("Already registered, instance:-");
          console.log(eventReg)
          out.send_message("Already Registered!");
          return;
        }else {
          // CREAETE A NEW EVENT REGISTRATION INSTANCE
          var eventReg2 = new EventReg({
            userId:user1.userId,
            eventId:event1.id,
            date:new Date()
          });
          await eventReg2.save();
          // UPDATE THE EVENT AND USER WITH THE PERTICULAR EVENT AND USER 
          event1.participants.push(eventReg2);
          await event1.save();
          user1.participate.push(eventReg2);
          await user1.save();
          console.log("Registered");
          console.log(eventReg);
          out.send_response(200,"Successfuly Registered!",{
            userId:user1.userId,
            eventId:event1.id,
            participate:user1.participate
          })
          return
        }
      }
    }
  }catch(e) {
    // UNEXPECTED ERROR IS OCCURED
    console.log("Error Occured");
    console.log(e);
    out.send_failiure_response()
    return;
  }
});

// ROUTE : /API/EVENT/DELETE (GET)

eventRouter.post("/delete",async (req: Request,res: Response) =>{
  // EVENT DELETION REQUEST FROM THE ADMIN
  var {id = null,token=null} = req.body;
  var out = new CustomResponse(res)
  var admin = false;
  if(id == null){
    out.send_message("ID not given",400)
    return;
  }
  console.log("Deletion "+id+" token "+token);
  if(token != null) {
    // ADMIN VALIDATION
    console.log("Checking admin");
    var p = await Admin.find({token:token});
    if(p == null){
      out.send_message("Invalid Token",400);
      return
    }else if(p.length != 1){
      out.send_message("Invalid Token",400);
      return
    } else {
      var p1 = p[0];
      var date = new Date();
      if(date.getFullYear() >= p1.expiry!.getFullYear() && date.getMonth() >= p1.expiry!.getDate() && date.getDate() >= p1.expiry!.getDate() && date.getHours() >= p1.expiry!.getHours() && date.getMinutes() >= p1.expiry!.getMinutes()) {
        out.send_message("Expired Token",400);
      return
      }else admin = true;
    }
    if(!admin) {
      console.log("User is admin ✔️");
      // res.json(out);
      return;
    }
    console.log("User is not admin ❌");
  }else {
    out.send_message("Token is not given",400);
    return;
  }
  try {
    // DELETE THE EVENT
    await Event.deleteOne({id:id}).then((err)=>{
      try {
        if(err.deletedCount< 1) {
          console.log("Unable to Delete")
          out.send_message("Unable to delete",400)
          return
        }else {
          console.log("Deleted successfully ")
          out.send_response(200,"Deleted Successfuly",p1)
          return
        }
      }catch(err){
        out.send_500_response()
        return
      }
    });
    // res.json(out);
    return;
  }catch(e){
    // AN UMNKNOWN ERROR OCCURED
    console.log("Error occured");
    console.log(e)
    out.send_500_response()
    return;
  }
});

// ROUTE : /API/EVENT/GET (GET)

eventRouter.get("/get",async (req,res)=>{
  var {id = null} = req.query;
  var out = new CustomResponse(res)
 // VAR ADMIN = FALSE;
  if(id == null){
    out.send_message("ID not given",400)
    return;
  }
  console.log("Event data get : "+id);
  try{
    // FIND ALL EVENTS AND LINK THE PARTICULAR EVENTS WITH EVENTREG
    var p = await Event.find({id:id}).populate("participants");
    if(p == null) {
      out.send_message("Event not found",400)
      return;
    }
    else if(p.length != 1) {
      out.send_message("Event not found",400)
      res.json(out)
      return;
    }
    console.log(p);
    console.log("Populating with user Instance");
    var participants = (await User.find({userId:{$in:p[0].participants.map((userId)=>userId)}})).map((user: UserI,i) => {
      return {...user.toJSON(),
      date:p[0].participants[i].date};
    });
    console.log("participants fetched");
    console.log(participants);
    out.send_response(200,"Success",{
      ...p[0].toJSON(),
      participants:participants
    })
    return;
  }catch(e){
    console.log("Error occured");
    console.log(e);
    out.send_500_response()
    return;
  }
})

// ROUTE : /API/EVENT/GETALL (GET)

eventRouter.get("/getAll",async (req,res) =>{
  var {token=null,count=-1} = req.query;
  var out = new CustomResponse(res);
  try{
    var admin = false;
    if(token != null) {
      // CHECK IF ADMIN
      console.log("Admin Check ");
      var p = await Admin.find({token:token});
      if(p == null){
        out.send_message("Invalid token",400)
        return
      }else if(p.length != 1){
        out.send_message("Invalid token",400)
        return
      } else {
        var p1 = p[0];
        var date = new Date();
        if(date.getFullYear() >= p1.expiry!.getFullYear() && date.getMonth() >= p1.expiry!.getDate() && date.getDate() >= p1.expiry!.getDate() && date.getHours() >= p1.expiry!.getHours() && date.getMinutes() >= p1.expiry!.getMinutes()) {
          out.send_message("Expired token",400)
          return;
        }else admin = true;
      }
      if(!admin) {
        console.log("Not an Admin ❌");
        return;
      }else console.log("Admin ✔️")
    }
    // GET THE CORRESPONDING EVENT LIST
    if(count == -1) var p2 = await Event.find().populate("participants").sort({date:1});//.then(p =>{
    else var p2 = await Event.find().populate("participants").sort({date:1}).limit(count as number);//.then(p =>{
    if(p2 == null) {
      out.send_message("no events",400);
      return;
    }
    console.log("Events:-");
    console.log(p2);
    var data = [];
    for(var i = 0;i < p2.length;i++){
      // PUSH EACH EVENT TO THE DATA AND RETURN IT AS RESPONCE
      var cur = p2[i];
      // PARTICIPANT DATA GIVING ACCOURDING TO ADMIN AND NORMAL USER
      var participants = [];
      if(!admin) {
        for(var j = 0;j < cur.participants.length;j++){
          participants.push({userId:cur.participants[j].userId});
        }
      }else participants = cur.participants;
      console.log(participants)
      data.push({
        id:cur.id,
        name:cur.name,
        description:cur.description,
        date:cur.date,
        type:cur.type,
        image:cur.image,
        docs:cur.docs,
        minPart:cur.minpart,
        maxPart:cur.maxpart,
        poster:cur.poster,
        is_team:cur.is_team,
        is_reg:cur.is_reg,
        participants:participants,
        closed:cur.closed,
        teams:admin ? cur.teams : null
      });
    }
    out.send_response(200,"Successfuly fetched!",data)
    return;
  }catch(e){
    console.log("Error occurred ");
    console.log(e);
    out.send_500_response()
  }
})

// ROUTE : /API/EVENT/EDIT (POST)

eventRouter.post("/edit",async (req,res) => {
  var {id=null,name=null, description=null,date=null,type=null,image=null,maxPart=1,minPart=1,poster=null,docs=null,is_reg=true,closed=false} = req.body;
  var out = new CustomResponse(res);
  if(id == null) {
    out.send_message("No id given",400)
    return
  }
  try{
    //FIND THE EVENT
    var ev = await Event.find({id:id});
    console.log(ev);
    if(ev == null) {
      out.send_message("NO event witht the ID",400)
      return
    }else if(ev.length != 1) {
      out.send_message("NO event witht the ID",400)
      return
    }else {
      var ev1 = ev[0]; 
      // UPDATE THE CORRESPONDING VALUES
      if(name != null) ev1.name = name;
      if(description != null) ev1.description = description;
      if(date != null) ev1.date = date;
      if(type != null) ev1.type = type;
      if(image != null) ev1.image = image;
      if(maxPart != null) ev1.maxpart = maxPart;
      if(minPart != null) ev1.minpart = minPart;
      if(poster != null) ev1.poster = poster;
      if(docs != null) ev1.docs = docs;
      ev1.is_reg = is_reg;
      ev1.closed = closed;
      await ev1.save(); //save
      out.send_response(200,"Event saved ("+name+")",ev)
      return
    }
  }catch(e){
    console.log("Error occured");
    console.log(e)
    out.send_500_response()
    return;
  }
});

// ROUTE : /API/EVENT/CREATE

eventRouter.post("/create",async (req: Request,res: Response) => {
  console.log("Create event request")
  var {name=null, description=null,date=null,type=null,image=null,maxPart=1,minPart=1,poster=null,docs=null,is_reg=true,closed=false} = req.body;
  var out = new CustomResponse(res)
  // validate data
  if (name == null || description == null || date == null || type == null || image == null){
    if(name == null) out.set_data_key('name',"Name not provided");
    if(description == null) out.set_data_key('description',"description not provided");
    if(date == null) out.set_data_key('date',"date not provided");
    if(type == null) out.set_data_key('type',"type not provided");
    if(image == null) out.set_data_key('image',"image not provided");
    out.set_message("Invalid Request");
    out.send_failiure_response();
    return;
  }

  try{
    // CREATE AN ID FPR THE EVENT
    var id = (type+"-"+name.replace(" ","").toLowerCase()+"-"+new Date(date).getDate()).replace("/","").replace("&","").replace("?","").replace("+","");//btoa("Event"+type+name+new Date()).replace("=","");
    var ev = new Event({
      id:id,
      name:name,
      description:description,
      image:image,
      docs:docs,
      date:date,
      minpart:minPart,
      maxpart:maxPart,
      is_team:minPart > 1,
      type:type,
      poster:poster,
      is_reg:is_reg,
      closed:closed
    });
    // save and validate a event
    await ev.save().catch(err => {
      console.log(err)
      out.send_message("Data validation failed! "+err.errors)
    }); // save
    out.send_response(200,"Event Created ",ev)
    console.log("Event created");
    return;
  }catch(e){
    console.log(e)
    out.send_500_response()
    return;
  }
});

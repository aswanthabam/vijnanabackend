const env = process.env
import { Request, Response, Router } from "express";
import { User, UserI } from "../../models/User";
import { Admin } from "../../models/Admin";
import { Event } from "../../models/Event";
import { EventReg } from "../../models/EventReg";
import { CustomResponse } from "../../response";
import { authenticated_user, is_authenticated } from "../../request";

export const eventRouter = Router();

/*
  Get the events the user is regsitered to. Get the user from token
  will give a list of registered events
*/

eventRouter.post('/myEvents',async (req,res)=>{
  var out = new CustomResponse(res)
  if(!is_authenticated(req)){
    await out.send_message("Please login to continue !",400);
    return
  }
  var user = authenticated_user(req)
  if(!user) {
    await out.send_message("Please login to continue !",400);
    return
  }
  var regs = await EventReg.find({userId: user.userId}).populate('event')
  if(!regs || regs.length < 1){
    await out.send_response(200,"Not Registered in any events!",{events:[]})
    return
  }else {
    var events:{}[] = []
    for(var i = 0; i< regs.length;i++){
      var reg = regs[i]
      events.push({
          id: reg.event.id,
          name: reg.event.name,
          date: reg.event.date
        })
    }
    await out.send_response(200,"Successfuly fetched!",{events:events});
    return
  }
});

/*
  Register to an event, use the token to verify user
*/

eventRouter.post("/register",async (req: Request,res: Response) => {
  // REGISTER TO EVENT
  var out = new CustomResponse(res);
  if (!is_authenticated(req)){
    await out.send_message("Please login to continue !",400);
    return 
  }
  var {eventId = null} = req.body;
  if(eventId == null){
    await out.send_message("ID not provided",400);
    return;
  }

  var user1 = authenticated_user(req);
  try {
    if(user1 == null) {
      await out.send_message("Please Login to Continue!",400);
      return
    }else {
      var event1 = await Event.findOne({id:eventId}).exec();
      if(event1 == null) {
        await out.send_message("Event not found !",400);
        return;
      }
      var eventReg = await EventReg.find({userId:user1.userId,event:event1});
      var has = true;
      if(eventReg == null) has = false;
      else if(eventReg.length <= 0) has = false;
      if(has) {
        console.log("Already registered, instance:-");
        await out.send_message("Already Registered!");
        return;
      }else {
        var eventReg2 = new EventReg({
          userId:user1.userId,
          event:event1,
          date:new Date()
        });
        await eventReg2.save();
        event1.participants.push(eventReg2);
        await event1.save();
        user1.participate.push(eventReg2);
        await user1.save();
        await out.send_response(200,"Successfuly Registered!",{
          userId:user1.userId,
          eventId:event1.id,
          participate:user1.participate
        })
        return
      }
    }
  }catch(e) {
    console.log("Error Occured");
    console.log(e);
    await out.send_500_response()
    return;
  }
});

// ROUTE : /API/EVENT/DELETE (GET)

eventRouter.post("/delete",async (req: Request,res: Response) =>{
  var {id = null,token=null} = req.body;
  var out = new CustomResponse(res)
  var admin = false;
  if(id == null){
    await out.send_message("ID not given",400)
    return;
  }
  console.log("Deletion "+id+" token "+token);
  if(token != null) {
    var p = await Admin.find({token:token});
    if(p == null){
      await out.send_message("Invalid Token",400);
      return
    }else if(p.length != 1){
      await out.send_message("Invalid Token",400);
      return
    } else {
      var p1 = p[0];
      var date = new Date();
      if(date.getFullYear() >= p1.expiry!.getFullYear() && date.getMonth() >= p1.expiry!.getDate() && date.getDate() >= p1.expiry!.getDate() && date.getHours() >= p1.expiry!.getHours() && date.getMinutes() >= p1.expiry!.getMinutes()) {
        await out.send_message("Expired Token",400);
      return
      }else admin = true;
    }
    if(!admin) {
      console.log("User is admin ✔️");
      return;
    }
    console.log("User is not admin ❌");
  }else {
    await out.send_message("Token is not given",400);
    return;
  }
  try {
    var err = await Event.deleteOne({id:id});
    try {
      if(err.deletedCount< 1) {
        await out.send_message("Unable to delete",400)
        return
      }else {
        var err2 = await EventReg.deleteMany({eventId:id});
        await out.send_response(200,"Deleted Successfuly",p1)
        return
      }
    }catch(err){
      await out.send_500_response()
      return
    }
  }catch(e){
    console.log("Error occured");
    await out.send_500_response()
    return;
  }
});

/*
  Get an event by its id, return an event
*/

eventRouter.get("/get",async (req,res)=>{
  var {id = null} = req.query;
  var out = new CustomResponse(res)
  if(id == null){
    await out.send_message("ID not given",400)
    return;
  }
  try{
    var p = await Event.find({id:id}).populate("participants");
    if(p == null) {
      await out.send_message("Event not found",400)
      return;
    }
    else if(p.length != 1) {
      await out.send_message("Event not found",400)
      return;
    }
    var participants = (await User.find({userId:{$in:p[0].participants.map((userId)=>userId)}})).map((user: UserI,i) => {
      return {...user.toJSON(),
      date:p[0].participants[i].date};
    });
    await out.send_response(200,"Success",[{
      ...p[0].toJSON(),
      participants:participants
    }])
    return;
  }catch(e){
    console.log("Error occured");
    console.log(e);
    await out.send_500_response()
    return;
  }
})

/*
  Get all the events
*/

eventRouter.get("/getAll",async (req,res) =>{
  var {token=null,count=-1} = req.query;
  var out = new CustomResponse(res);
  try{
    var admin = false;
    if(token != null) {
      var p = await Admin.find({token:token});
      if(p == null){
        await out.send_message("Invalid token",400)
        return
      }else if(p.length != 1){
        await out.send_message("Invalid token",400)
        return
      } else {
        var p1 = p[0];
        var date = new Date();
        if(date.getFullYear() >= p1.expiry!.getFullYear() && date.getMonth() >= p1.expiry!.getDate() && date.getDate() >= p1.expiry!.getDate() && date.getHours() >= p1.expiry!.getHours() && date.getMinutes() >= p1.expiry!.getMinutes()) {
          await out.send_message("Expired token",400)
          return;
        }else admin = true;
      }
      if(!admin) {
        console.log("Not an Admin ❌");
        return;
      }
      console.log("Admin ✔️")
    }
    if(count == -1) var p2 = await Event.find().populate("participants").sort({date:1});//.then(p =>{
    else var p2 = await Event.find().populate("participants").sort({date:1}).limit(count as number);//.then(p =>{
    if(p2 == null) {
      await out.send_message("no events",400);
      return;
    }
    var data = [];
    for(var i = 0;i < p2.length;i++){
      var cur = p2[i];
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
        details:cur.details,
        venue: cur.venue,
        date:cur.date,
        type:cur.type,
        image:cur.image,
        docs:cur.docs,
        minpart:cur.minpart,
        maxpart:cur.maxpart,
        poster:cur.poster,
        is_team:cur.is_team,
        is_reg:cur.is_reg,
        participants:participants,
        closed:cur.closed,
        teams:admin ? cur.teams : null,
        reg_link: cur.reg_link
      });
    }
    await out.send_response(200,"Successfuly fetched!",data)
    return;
  }catch(e){
    console.log("Error occurred ");
    console.log(e);
    await out.send_500_response()
  }
})

/*
  Edit an event, admin role required, 
*/

eventRouter.post("/edit",async (req,res) => {
  var {id=null,name=null,description=null,date=null,type=null,image=null,maxPart=1,minPart=1,poster=null,docs=null,is_reg=true,closed=false,venue=null,details = null, reg_link=null} = req.body;
  var out = new CustomResponse(res);
  if(id == null) {
    await out.send_message("No id given",400)
    return
  }
  try{
    var ev = await Event.find({id:id});
    if(ev == null) {
      await out.send_message("NO event witht the ID",400)
      return
    }else if(ev.length != 1) {
      await out.send_message("NO event witht the ID",400)
      return
    }else {
      var ev1 = ev[0]; 
      if(name != null) ev1.name = name;
      if(description != null) ev1.description = description;
      if(date != null) ev1.date = date;
      if(type != null) ev1.type = type;
      if(image != null) ev1.image = image;
      if(maxPart != null) ev1.maxpart = maxPart;
      if(minPart != null) ev1.minpart = minPart;
      if(poster != null) ev1.poster = poster;
      if(docs != null) ev1.docs = docs;
      if(venue != null) ev1.venue = venue;
      if(details != null) ev1.details = details;
      if(reg_link != null) ev1.reg_link = reg_link;
      ev1.is_reg = is_reg;
      ev1.closed = closed;
      await ev1.save(); 
      await out.send_response(200,"Event saved ("+name+")",ev)
      return
    }
  }catch(e){
    console.log("Error occured");
    console.log(e)
    await out.send_500_response()
    return;
  }
});

/*
  Create an event, admin role required.
*/

eventRouter.post("/create",async (req: Request,res: Response) => {
  var {name=null,   
    description=null,date=null,type=null,image=null,maxPart=1,minPart=1,poster=null,docs=null,is_reg=true,closed=false,
  venue=null,details = null, reg_link=null} = req.body;
  var out = new CustomResponse(res)
  if (name == null || description == null || date == null || type == null || image == null || venue == null || details == null){
    if(name == null) out.set_data_key('name',"Name not provided");
    if(description == null) out.set_data_key('description',"description not provided");
    if(date == null) out.set_data_key('date',"date not provided");
    if(type == null) out.set_data_key('type',"type not provided");
    if(image == null) out.set_data_key('image',"image not provided");
    if(venue == null) out.set_data_key('venue',"venue not provided");
    if(details == null) out.set_data_key('details',"details not provided");
    out.set_message("Invalid Request");
    await out.send_failiure_response();
    return;
  }

  try{
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
      closed:closed,
      venue: venue,
      details:details,
      reg_link:reg_link
    });
    try{
      await ev.save();
    }catch(err){
      console.log(err)
      await out.send_message("Data validation failed! "+JSON.stringify(err))
    }
    await out.send_response(200,"Event Created ",ev)
    return;
  }catch(e){
    console.log(e)
    await out.send_500_response()
    return;
  }
});

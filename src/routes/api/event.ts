const env = process.env
import { NextFunction, Request, Response, Router } from "express";
import { Event } from "../../models/Event";
import { EventReg } from "../../models/EventReg";
import { CustomResponse } from "../../response";
import { authenticated_user, is_admin, is_authenticated } from "../../request";
import { About } from "../../models/About";

export const eventRouter = Router();

eventRouter.get('/aboutVijnana', async (req, res, next) => {
  var out = new CustomResponse(res)
  try {
    var about = await About.findOne().exec()
    if (!about) {
      await out.send_message("No about data found!", 400)
      return
    }
    await out.send_response(200, "Successfuly fetched!", {
      name: about.name,
      start: about.start,
      end: about.end,
      about: about.about,
      contact: about.contact,
      email: about.email
    })
    return 
  }catch(err){
    next(err)
  }
})

/*
  Get the events the user is regsitered to. Get the user from token
  will give a list of registered events
*/

eventRouter.post('/myEvents', async (req, res, next) => {
  var out = new CustomResponse(res)
  try {
    if (!is_authenticated(req)) {
      await out.send_message("Please login to continue !", 400);
      return
    }
    var user = authenticated_user(req)
    if (!user) {
      await out.send_message("Please login to continue !", 400);
      return
    }
    var regs = await EventReg.find({ userId: user.userId }).populate('event')
    if (!regs || regs.length < 1) {
      await out.send_response(200, "Not Registered in any events!", { events: [] })
      return
    } else {
      var events: {}[] = []
      for (var i = 0; i < regs.length; i++) {
        var reg = regs[i]
        events.push({
          id: reg.event.id,
          name: reg.event.name,
          date: reg.event.date
        })
      }
      await out.send_response(200, "Successfuly fetched!", { events: events });
      return
    }
  } catch (err) {
    next(err);
  }
});

/*
  Register to an event, use the token to verify user
*/

eventRouter.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  var out = new CustomResponse(res);
  try {
    if (!is_authenticated(req)) {
      await out.send_message("Please login to continue !", 400);
      return
    }
    var { eventId = null } = req.body;
    if (eventId == null) {
      await out.send_message("ID not provided", 400);
      return;
    }

    var user1 = authenticated_user(req);
    if (user1 == null) {
      await out.send_message("Please Login to Continue!", 400);
      return
    } else if (user1.step != 2) {
      await out.send_message("Please complete registration to continue!", 400);
      return
    }
    else {
      var event1 = await Event.findOne({ id: eventId }).exec();
      if (event1 == null) {
        await out.send_message("Event not found !", 400);
        return;
      }
      if (event1.closed) {
        await out.send_message("Event is closed!", 400);
        return;
      }
      if (event1.gctian_only && !user1.gctian) {
        await out.send_message("Only KBMGCT students can register for this event!", 400);
        return;
      }
      if (event1.is_reg == false) {
        await out.send_message("This event is open to all!", 400);
        return;
      }
      var eventReg = await EventReg.find({ userId: user1.userId, event: event1 });
      var has = true;
      if (eventReg == null) has = false;
      else if (eventReg.length <= 0) has = false;
      if (has) {
        console.log("Already registered, instance:-");
        await out.send_message("Already Registered!");
        return;
      } else {
        var eventReg2 = new EventReg({
          userId: user1.userId,
          event: event1,
          date: new Date()
        });
        await eventReg2.save();
        event1.participants.push(eventReg2);
        await event1.save();
        user1.participate.push(eventReg2);
        await user1.save();
        await user1.populate('participate')
        await out.send_response(200, "Successfuly Registered!", {
          userId: user1.userId,
          eventId: event1.id,
          participate:
            user1.participate.map((par) => {
              return { eventId: par.event, userId: par.userId }
            }),
        })
        return
      }
    }
  } catch (e) {
    next(e);
  }
});

/*
  Get an event by its id, return an event
*/

eventRouter.get("/get", async (req, res, next) => {
  var { id = null } = req.query;
  var out = new CustomResponse(res)
  if (id == null) {
    await out.send_message("ID not given", 400)
    return;
  }
  try {
    var p = await Event.find({ id: id }).populate("participants");
    if (p == null || p.length != 1) {
      await out.send_message("Event not found", 400)
      return;
    }
    var admin = is_admin(req);
    await out.send_response(200, "Success", [{
      id: p[0].id,
      name: p[0].name,
      description: p[0].description,
      details: p[0].details,
      venue: p[0].venue,
      date: p[0].date,
      type: p[0].type,
      image: p[0].image,
      docs: p[0].docs,
      minpart: p[0].minpart,
      maxpart: p[0].maxpart,
      poster: p[0].poster,
      is_team: p[0].is_team,
      is_reg: p[0].is_reg,
      gcitan_only: p[0].gctian_only,
      participants: admin ? p[0].participants.map((par) => { return { userId: par.userId, date: par.date } }) : null,
      closed: p[0].closed,
      reg_link: p[0].reg_link
    }])
    return;
  } catch (e) {
    next(e);
  }
})

/*
  Get all the events
*/

eventRouter.get("/getAll", async (req, res, next) => {
  var { count = -1 } = req.query;
  var out = new CustomResponse(res);
  try {
    var admin = is_admin(req);

    if (count == -1) var p2 = await Event.find().populate("participants").sort({ date: 1 });//.then(p =>{
    else var p2 = await Event.find().populate("participants").sort({ date: 1 }).limit(count as number);//.then(p =>{
    if (p2 == null) {
      await out.send_message("No Events!", 400);
      return;
    }
    var data = [];
    for (var i = 0; i < p2.length; i++) {
      var cur = p2[i];
      var participants = cur.participants;
      var participate_in = false;
      if (is_authenticated(req)) {
        for (var i = 0; i < participants.length; i++) {
          var par = participants[i];
          if (par.userId == authenticated_user(req)?.userId) {
            participate_in = true;
            break;
          }
        }
      }
      data.push({
        id: cur.id,
        name: cur.name,
        description: cur.description,
        details: cur.details,
        venue: cur.venue,
        date: cur.date,
        type: cur.type,
        image: cur.image,
        docs: cur.docs,
        minpart: cur.minpart,
        maxpart: cur.maxpart,
        poster: cur.poster,
        is_team: cur.is_team,
        is_reg: cur.is_reg,
        gctian_only: cur.gctian_only,
        participants: admin ? participants.map(val => { return { userId: val.userId, date: val.date } }) : null,
        participate_in: participate_in,
        closed: cur.closed,
        teams: admin ? cur.teams : null,
        reg_link: cur.reg_link
      });
    }
    await out.send_response(200, "Successfuly fetched!", data)
    return;
  } catch (e) {
    next(e);
  }
})

/* ----------------- ADMIN ONLY ENDPOINTS ----------------- */

/*
  Delete an evnet, event id required, admin role required
*/

eventRouter.post("/delete", async (req: Request, res: Response, next: NextFunction) => {
  var out = new CustomResponse(res)
  if (!is_admin(req)) {
    await out.send_message("You are not an admin!", 400)
    return
  }
  var { id = null } = req.body;
  if (id == null) {
    await out.send_message("ID not given", 400)
    return;
  }
  console.log("Deletion " + id);
  try {
    var ev = await Event.findOne({ id: id }).exec()
    if (!ev) {
      await out.send_message("The event doesnt exists!");
      return
    }
    var err = await Event.deleteOne({ id: id });
    if (err.deletedCount < 1) {
      await out.send_message("Unable to delete", 400)
      return
    } else {
      var err2 = await EventReg.deleteMany({ event: ev });
      await out.send_response(200, "Deleted Successfuly", { eventId: id })
      return
    }
  } catch (e) {
    next(e);
  }
});

/*
  Edit an event, admin role required, 
*/

eventRouter.post("/edit", async (req, res, next) => {
  var {
    id = null,
    name = null,
    description = null,
    date = null,
    type = null,
    image = null,
    maxPart = 1,
    minPart = 1,
    poster = null,
    docs = null,
    is_reg = true,
    closed = false,
    venue = null,
    details = null,
    reg_link = null,
    gctian_only = null
  } = req.body;

  var out = new CustomResponse(res);
  if (!is_admin(req)) {
    await out.send_message("You are not an admin!", 400)
    return
  }
  if (id == null) {
    await out.send_message("No id given", 400)
    return
  }
  try {
    var ev = await Event.findOne({ id: id }).exec();
    if (!ev) {
      await out.send_message("NO event witht the ID", 400)
      return
    } else {
      if (name != null) ev.name = name;
      if (description != null) ev.description = description;
      if (date != null) ev.date = date;
      if (type != null) ev.type = type;
      if (image != null) ev.image = image;
      if (maxPart != null) ev.maxpart = maxPart;
      if (minPart != null) ev.minpart = minPart;
      if (poster != null) ev.poster = poster;
      if (docs != null) ev.docs = docs;
      if (venue != null) ev.venue = venue;
      if (details != null) ev.details = details;
      if (reg_link != null) ev.reg_link = reg_link;
      if (gctian_only != null) ev.gctian_only = gctian_only;
      ev.is_reg = is_reg;
      ev.closed = closed;

      await ev.save();
      await out.send_response(200, "Event saved (" + name + ")", {
        id: ev.id,
        name: ev.name,
      })
      return
    }
  } catch (e) {
    next(e);
  }
});

/*
  Create an event, admin role required.
*/

eventRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
  var {
    name = null,
    description = null,
    date = null,
    type = null,
    image = null,
    maxPart = 1,
    minPart = 1,
    poster = null,
    docs = null,
    is_reg = true,
    closed = false,
    venue = null,
    details = null,
    reg_link = null,
    gctian_only = false
  } = req.body;

  var out = new CustomResponse(res)
  if (!is_admin(req)) {
    await out.send_message("You are not an admin!", 400)
    return
  }
  if (name == null || description == null || date == null || type == null || image == null || venue == null || details == null) {
    if (name == null) out.set_data_key('name', "Name not provided");
    if (description == null) out.set_data_key('description', "description not provided");
    if (date == null) out.set_data_key('date', "date not provided");
    if (type == null) out.set_data_key('type', "type not provided");
    if (image == null) out.set_data_key('image', "image not provided");
    if (venue == null) out.set_data_key('venue', "venue not provided");
    if (details == null) out.set_data_key('details', "details not provided");
    out.set_message("Invalid Request");
    await out.send_failiure_response();
    return;
  }

  try {
    var id = type.replaceAll(' ', '').toLowerCase() + '-' + name.replaceAll(" ", "").toLowerCase();
    console.log("Creating event " + id)
    var ev = new Event({
      id: id,
      name: name,
      description: description,
      image: image,
      docs: docs,
      date: date,
      minpart: minPart,
      maxpart: maxPart,
      is_team: minPart > 1,
      type: type,
      poster: poster,
      is_reg: is_reg,
      closed: closed,
      venue: venue,
      details: details,
      reg_link: reg_link,
      gctian_only: gctian_only
    });
    await ev.save();

    await out.send_response(200, "Event Created ", {
      id: ev.id,
      name: ev.name
    })
    return;
  } catch (e) {
    next(e);
  }
});

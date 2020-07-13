const express = require("express");
const router = express.Router();
const Event = require("../models/event");

//MAIN
router.get("/", async (req, res) => {
  const event = await Event.find().sort({ date: -1 });
  res.render("admin-ejs/event-admin.ejs", { event: event });
});

//ADD
router.post(
  "/",
  async (req, res, next) => {
    req.event = new Event();
    next();
  },
  saveStoryAndRedirect("admin-ejs/add-event-admin.ejs")
);

//ADD
router.get("/add", async (req, res) => {
  res.render("admin-ejs/add-event-admin.ejs", { event: new Event() });
});

//SHOW
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event == null) res.redirect("/admin/event");
    res.render("admin-ejs/show-event-admin.ejs", { event: event });
  } catch (error) {
    res.redirect("/admin/event");
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.redirect("/admin/event");
});

//EDIT
router.get("/edit/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.render("admin-ejs/edit-event-admin.ejs", { event: event });
  } catch (error) {
    res.redirect("/admin/event/");
  }
});

//EDIT
router.put(
  "/:id",
  async (req, res, next) => {
    req.event = await Event.findById(req.params.id);
    next();
  },
  saveStoryAndRedirect("admin-ejs/edit-event-admin.ejs")
);

function saveStoryAndRedirect(path) {
  return async (req, res) => {
    let event = req.event;
    event.name = req.body.name;
    event.date = req.body.date;
    event.description = req.body.description;

    try {
      event = await event.save();
      res.redirect(`/admin/event/${event.id}`);
    } catch (e) {
      res.render(path, { event: event });
    }
  };
}

//  router.get("/stories", async (req, res) => {

//     res.send('stories')
//   });

module.exports = router;

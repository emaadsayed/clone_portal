const express = require("express");
const router = express.Router();
const Story = require("../models/story");

//MAIN
router.get("/", async (req, res) => {
  const story = await Story.find();
  const user = req.user;
  res.render("stories.ejs", { user: user, story: story });
});

//ADD
router.post(
  "/",
  async (req, res, next) => {
    req.story = new Story();
    next();
  },
  saveStoryAndRedirect("add-stories.ejs")
);

//ADD
router.get("/add", (req, res) => {
  res.render("add-stories.ejs", { story: new Story() });
});

//SHOW
router.get("/:id", async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (story == null) res.redirect("/student/story");
  res.render("show-story.ejs", { story: story });
});

//DELETE
router.delete("/:id", async (req, res) => {
  await Story.findByIdAndDelete(req.params.id);
  res.redirect("/student/story");
});

//EDIT
router.get("/edit/:id", async (req, res) => {
  const story = await Story.findById(req.params.id);
  res.render("edit-story.ejs", { story: story });
});

//EDIT
router.put(
  "/:id",
  async (req, res, next) => {
    req.story = await Story.findById(req.params.id);
    console.log(req.story);
    next();
  },
  saveStoryAndRedirect("edit-stories.ejs")
);

function saveStoryAndRedirect(path) {
  return async (req, res) => {
    let story = req.story;
    story.description = req.body.description;

    try {
      story = await story.save();
      res.redirect(`/student/story/${story.id}`);
    } catch (e) {
      res.render(path, { story: story });
    }
  };
}

module.exports = router;

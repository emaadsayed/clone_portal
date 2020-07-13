if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
  const express = require("express");
  const app = express();
  const bcrypt = require("bcrypt");
  const passport = require("passport");
  const flash = require("express-flash");
  const session = require("express-session");
  const methodOverride = require("method-override");
  
  app.use(express.static(__dirname + "/public"));
  
  //ROUTES
  const studentRouter = require("./routes/student");
  const adminRouter = require("./routes/admin");
  
  // USER MODEL
  const User = require("./models/users");
  const Event = require("./models/event");
  
  // MONGO
  const mongoose = require("mongoose");
  
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("connected"))
    .catch((err) => console.log(err));
  
  // PASSPORT
  require("./passport-config")(passport);
  
  // EJS
  app.set("view-engine", "ejs");
  
  // BODY-PARSER
  app.use(express.urlencoded({ extended: false }));
  
  // USE
  app.use(flash());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));
  
  // INDEX
  app.get("/", async (req, res) => {
    const event = await Event.find().sort({ date: -1 }).limit(6);
    res.render("index.ejs", { event: event });
  });
  
  // SIGN-IN
  app.get("/signin", checkNotAuthenticated, (req, res) => {
    res.render("signin.ejs");
  });
  
  app.post(
    "/signin",
    checkNotAuthenticated,
    passport.authenticate("local", {
      failureRedirect: "/signin",
      failureFlash: true,
    }),
    redirectUrl
  );
  
  // SIGN-UP
  app.get("/signup", checkNotAuthenticated, (req, res) => {
    res.render("signup.ejs");
  });
  
  app.post("/signup", checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      console.log(user);
      user.save();
      res.redirect("/signin");
    } catch {
      res.redirect("/signup");
    }
  });
  
  // SIGN-OUT
  app.delete("/signout", (req, res) => {
    req.logOut();
    res.redirect("/signin");
  });
  
  //ADMIN
  // app.get("/admin", checkAuthenticated, checkAdmin, (req, res) => {
  //   res.render("admin.ejs", { user: req.user });
  // });
  
  //Student
  // app.get("/student", checkAuthenticated, checkStudent, (req, res) => {
  //   res.render("student.ejs", { user: req.user });
  // });
  
  // MIDDLEWARE
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect("/signin");
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  }
  
  function redirectUrl(req, res) {
    if (!req.user) {
      return res.redirect("signin");
    } else if (req.user.role == "admin") {
      return res.redirect("/admin/event");
    } else {
      return res.redirect("/student/story");
    }
  }
  
  function checkAdmin(req, res, next) {
    if (req.user.role != "admin") {
      return res.redirect("/student");
    }
    next();
  }
  
  function checkStudent(req, res, next) {
    if (req.user.role != "student") {
      return res.redirect("/admin");
    }
    next();
  }
  
  app.use("/student/story", studentRouter);
  app.use("/admin/event", adminRouter);
  
  app.listen(3000);
  
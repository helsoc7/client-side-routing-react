const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Initialisierung von Express und SQLite-Datenbank
const app = express();
const db = new sqlite3.Database('./database.db');


// Konfiguration von express-session
app.use(session({
  secret: 'ultrageheim', // Ein Geheimnis für die Verschlüsselung der Session-ID
  resave: false, // Sollte die Session bei jedem Request neu gespeichert werden, auch wenn sie nicht geändert wurde?
  saveUninitialized: false, // Sollte eine neue, nicht geänderte Session gespeichert werden?
  cookie: {
    secure: false, // Für die Produktion auf true setzen, wenn HTTPS verwendet wird
    maxAge: 1000 * 60 * 60 * 24 // Gültigkeitsdauer des Cookies in Millisekunden
  }
}));

// Einrichtung der Cors-Options
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Create SQLite schema
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, name TEXT, googleId TEXT, secret TEXT)");
});

// Passport Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    db.get("SELECT * FROM users WHERE googleId = ?", [profile.id], (err, row) => {
      if (err) return cb(err);
      if (!row) {
        // Nutzer existiert nicht, also fügen Sie ihn hinzu
        db.run("INSERT INTO users (username, name, googleId) VALUES (?, ?, ?)", [profile.displayName, profile.displayName, profile.id], function(err) {
          if (err) return cb(err);
          // Nutzer erfolgreich hinzugefügt, rufen Sie cb mit dem neuen Nutzer auf
          return cb(null, { id: this.lastID, ...profile });
        });
      } else {
        // Nutzer existiert, rufen Sie cb mit dem vorhandenen Nutzer auf
        return cb(null, row);
      }
    });
  }
));


// Für die Session wichtig
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    done(err, row);
  });
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Google Auth Route
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

// Google Auth Callback Route
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Hier JWT für den Nutzer erstellen und senden
    const user = { id: req.user.id }; // Angenommen, req.user enthält das Nutzerobjekt
    const accessToken = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:3000/myspace?token=${accessToken}`);
  }
);

app.get("/logout", function(req, res){
  // Logout-Logik (Token im Frontend löschen)
  res.redirect("/");
});

// Geschützte Route, um Nutzerdaten zu senden
app.get("/userData", authenticateToken, (req, res) => {
  // Verwenden Sie req.user.id, um die Datenbank nach dem Nutzer zu durchsuchen
  const userId = req.user.id;

  db.get("SELECT id, username, name FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
      console.error("Fehler beim Abrufen der Nutzerdaten:", err);
      res.status(500).send("Interner Serverfehler");
    } else if (row) {
      res.json(row); // Sendet die Nutzerdaten als JSON-Response
    } else {
      res.status(404).send("Nutzer nicht gefunden");
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");

const app = express();

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);


//using bootstrap in a cool way
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// mongoose
//   .connect('mongodb://localhost/mvr-project', {useNewUrlParser: true})
//   .then(x => {
//     console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
//   })
//   .catch(err => {
//     console.error('Error connecting to mongo', err)
//   });

  mongoose
  .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });



// Middleware Setup
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENTGOOGLE_ID,
			clientSecret: process.env.CLIENTGOOGLE_SECRET,
			callbackURL: "/auth/google/callback",
		},
		(accessToken, refreshToken, profile, done) => {
			User.findOne({ googleID: profile.id })
				.then((user) => {
					if (user) {
						done(null, user);
						return;
					}
					User.create({ googleID: profile.id, username: profile.username })
						.then((newUser) => {
							done(null, newUser);
						})
						.catch((err) => done(err)); // closes User.create()
				})
				.catch((err) => done(err)); // closes User.findOne()
		}
	)
);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Setup authentication session
app.use(session( {
	secret: "mvr-project-secret",
	cookie: {max: 60000}, //cookie living on the browser
	store: new MongoStore ({
		mongooseConnection: mongoose.connection,
		resave: true,
		saveUninitialized: false,
		ttl: 24 * 60 * 60 // session living on the server -1day 
	})
}))

passport.serializeUser((user, callback) => {
	callback(null, user);
});
passport.deserializeUser((user, callback) => {
	callback(null, user);
});


// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'MVR - Music Virtual Rank';




const auth = require("./routes/auth");
app.use("/", auth);

const index = require('./routes/index');
app.use('/', index);

const profile = require("./routes/profile");
app.use("/", profile);



module.exports = app;
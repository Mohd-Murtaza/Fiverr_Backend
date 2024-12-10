const passport = require("passport");
const { UserModel } = require("./models/userModel");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://fiverr-backend-pied.vercel.app/auth/google/callback",
      passReqToCallback: true
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const email = profile._json.email;
        const userName = profile._json.name;
        let existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          return done(null, {...existingUser.toObject(), accessToken, refreshToken});
        } else {
          const newUser = new UserModel({
            userName,
            email,
            password: uuidv4(),
          });
          await newUser.save();
          return done(null, {...newUser.toObject(), accessToken, refreshToken});
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.serializeUser(function(user,done){
    done(null, user)
});
passport.deserializeUser(function(user,done){
    done(null,user)
});

module.exports={ passport };
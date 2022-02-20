// import all the things we need  
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const Account = require('../app/models/account');

module.exports = function (passport) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CILENT_SECRET = process.env.GOOGLE_CILENT_SECRET;
  const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
  const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
  passport.use(
    //google
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CILENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        //get the user data from google 
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          // firstName: profile.name.givenName,
          // lastName: profile.name.familyName,
          avatar: profile.photos[0].value,
          email: profile.emails[0].value
        }

        try {
          //find the user in our database 
          let user = await Account.findOne({ googleId: profile.id });
          if (user) {
            //If user present in our database.
            done(null, user)
          } else {
            // if user is not preset in our database save user data to database.
            user = new Account(newUser);
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  );
  // facebook
  passport.use(
    new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      // neu khong chi ro https://example.com thi se bi loi https
      callbackURL: 'https://aloapp.software/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails','name','picture.type(large)'],
    },
    
    async (accessToken, refreshToken, profile, done) => {
      //get the user data from facbook 
      const newUser1 = {
        facebookId: profile.id,
        displayName: profile.displayName,
        // firstName: profile.name.givenName,
        //lastName: profile.name.familyName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      }

      try {
        //find the user in our database 
        // console.log(profile.photos[0].value);
        let user = await Account.findOne({ facebookId: profile.id });
        if (user) {
          //If user present in our database.
          done(null, user)
        } else {
          // if user is not preset in our database save user data to database.
          user = new Account(newUser1);
          done(null, user)
        }
      } catch (err) {
        console.error(err)
      }
    }
  ));
  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    Account.findById(id, (err, user) => done(err, user))
  })
} 
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { envVars } from "./env";
import { db } from "./db";



passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: `${envVars.BACKEND_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

        const [existingUsers]: any = await db.query(
          "SELECT * FROM users WHERE email=?",
          [email]
        );

        let user;

        // Existing user
        if (existingUsers.length > 0) {
          user = existingUsers[0];

          const [providers]: any = await db.query(
            `
            SELECT *
            FROM auth_providers
            WHERE provider='GOOGLE'
            AND user_id=?
            `,
            [user.id]
          );

          if (providers.length === 0) {
            await db.query(
              `
              INSERT INTO auth_providers
              (provider, provider_id, user_id)
              VALUES (?, ?, ?)
              `,
              ["GOOGLE", profile.id, user.id]
            );
          }
        } else {
          // New User Registration

          const [result]: any = await db.query(
            `
            INSERT INTO users
            (name,email,password,role)
            VALUES(?,?,?,?)
            `,
            [
              profile.displayName,
              email,
              null,
              "CUSTOMER",
            ]
          );

          const userId = result.insertId;

          await db.query(
            `
            INSERT INTO auth_providers
            (provider, provider_id, user_id)
            VALUES(?,?,?)
            `,
            [
              "GOOGLE",
              profile.id,
              userId,
            ]
          );

          const [newUser]: any = await db.query(
            "SELECT * FROM users WHERE id=?",
            [userId]
          );

          user = newUser[0];
        }

        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error as Error);
      }
    }
  )
);

export default passport;
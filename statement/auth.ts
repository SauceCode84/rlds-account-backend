import * as passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

import { authConfig } from "./config";
import { getUserById } from "./user.service";

const params = {
  secretOrKey: authConfig.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

class Auth {

  constructor() {
    const strategy = new Strategy(params, async (payload, done) => {
      let user = await getUserById(payload.id);
  
      if (user) {
        return done(null, { id: user.id });
      } else {
        return done(new Error("User not found"));
      }
    });

    passport.use(strategy);
  }

  public initialize() {
    return passport.initialize();
  }

  public authenticate() {
    return passport.authenticate("jwt", authConfig.jwtSession);
  }

}

const auth = new Auth();

export = auth;

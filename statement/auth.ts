import * as passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

import { authConfig } from "./config";
import { UserService } from "./user.service";
import { getConnection } from "./data-access";

const params = {
  secretOrKey: authConfig.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

class Auth {

  constructor() {
    const strategy = new Strategy(params, async (payload, done) => {
      let user = await this.getUser(payload.id);

      if (user) {
        return done(null, { id: user.id, roles: user.roles });
      } else {
        return done(new Error("User not found"));
      }
    });

    passport.use(strategy);
  }

  private async getUser(userId: string) {
    let connection = await getConnection();
    let service = new UserService(connection);
    let user = await service.getUserById(userId);

    await connection.close();

    return user;
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

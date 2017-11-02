import { Request, Response, Router, NextFunction } from "express";

import * as r from "rethinkdb";
import * as auth from "./auth";
import { UserService } from "./user.service";
import { ServiceRequest } from "./service-request";
import { getConnection } from "./data-access";
import { responseFinishHandler } from "./response-finish-handler";

export const userRouter = Router();

interface AuthUser {
  id: string;
  roles: string[];
}

interface AuthRequest extends Request {
  user: AuthUser;
}

type UserServiceRequest = ServiceRequest<UserService>;

type AuthUserServiceRequest = AuthRequest & UserServiceRequest;

let req: AuthUserServiceRequest;

userRouter.use(async (req: UserServiceRequest, res: Response, next: NextFunction) => {
  const connection: r.Connection = await getConnection();
  req.service = new UserService(await getConnection());

  res.on("finish", responseFinishHandler(req));

  next();
});

userRouter
  .get("/me", auth.authenticate(), async (req: AuthRequest & UserServiceRequest, res) => {
    let { user } = req as AuthRequest;
    res.json(await req.service.getUserById(user.id));
  });

userRouter
  .get("/users", auth.authenticate(), async (req: UserServiceRequest, res: Response) => {
    res.json(await req.service.getUsers());
  });

userRouter
  .put("/users/:id", auth.authenticate(), async (req: UserServiceRequest, res: Response) => {
    let { id } = req.params;
    let userExists = await req.service.userExists(id);

    if (!userExists) {
      return res.sendStatus(400);
    }

    let { name, roles } = req.body;

    await req.service.updateUser(id, { name, roles });
    res.sendStatus(200);
  });

userRouter
  .post("/users/changePassword", auth.authenticate(), async (req: UserServiceRequest & AuthRequest, res: Response) => {
    let { password } = req.body;

    if (!password || typeof password !== "string" || password.length == 0) {
      return res.sendStatus(400);
    }

    let { user } = req.user as AuthRequest;

    await req.service.changePassword(user.id, password);

    res.sendStatus(204);
  });

userRouter
  .post("/register", async (req: UserServiceRequest, res: Response) => {
    try {
      let { email, password } = req.body;
      let id = await req.service.createUser(email, password);

      res.send({ id });
    } catch (err) {
      console.error(err);
    }
  });
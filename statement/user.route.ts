import { Request, Response, Router, NextFunction } from "express";

import * as r from "rethinkdb";
import * as auth from "./auth";
import { createUser, changePassword, updateUser, userExists, UserService } from "./user.service";
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
    let { user } = req;
    res.json(await req.service.getUserById(req.user.id));
  });

userRouter
  .get("/users", auth.authenticate(), async (req: UserServiceRequest, res: Response) => {
    res.json(await req.service.getUsers());
  });

userRouter
  .put("/users/:id", auth.authenticate(), async (req, res) => {
    let { id } = req.params;
    let userValid = await userExists(id);

    if (!userValid) {
      return res.sendStatus(400);
    }

    let { name, roles } = req.body;

    await updateUser(id, { name, roles });
    res.sendStatus(200);
  });

userRouter
  .post("/users/changePassword", auth.authenticate(), async (req, res) => {
    let { password } = req.body;

    if (!password || typeof password !== "string" || password.length == 0) {
      return res.sendStatus(400);
    }

    //let { id } = await getUserById(req.user.id);

    await changePassword(req.user.id, password);

    res.sendStatus(204);
  });

userRouter
  .post("/register", async (req, res) => {
    try {
      let { email, password } = req.body;
      let id = await createUser(email, password);

      res.send({ id });
    } catch (err) {
      console.error(err);
    }
  });
import { Request, Router } from "express";

import * as auth from "./auth";
import { createUser, getUserById, changePassword } from "./user.service";

export const userRouter = Router();

interface AuthUser {
  id: string;
  roles: string[];
}

type AuthRequest = Request & { user: AuthUser };

userRouter
  .get("/me", auth.authenticate(), async (req: AuthRequest, res) => {
    let { user } = req;
    res.json(await getUserById(req.user.id));
  });

userRouter
  .get("/users", auth.authenticate(), async (req, res) => {
    
  });

userRouter
  .post("/users/changePassword", auth.authenticate(), async (req, res) => {
    let { id } = await getUserById(req.user.id);
    let { password } = req.body;

    if (!password || typeof password !== "string" || password.length == 0) {
      return res.sendStatus(400);
    }

    await changePassword(id, password);

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
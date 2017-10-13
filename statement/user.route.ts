import { Router } from "express";

import * as auth from "./auth";
import { createUser, getUserById } from "./user.service";

export const userRouter = Router();

userRouter
  .get("/user", auth.authenticate(), async (req, res) => {
    res.json(await getUserById(req.user.id));
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
import { Router } from "express";
import * as jwt from "jsonwebtoken";

import { authConfig } from "./config";
import { UserService } from "./user.service";
import { User } from "./user.model";
import { getConnection } from "./data-access";

export const authRouter = Router();

authRouter
  .post("/token", async (req, res) => {
    let { email, password } = req.body;
    
    if (!email || !password) {
      return res.sendStatus(401);
    }
    
    let user: User;

    try {
      let service = new UserService(await getConnection());
      user = await service.validateUser(email, password);
    } catch (err) {
      return res.status(401).send(err.message);
    }

    let payload = {
      id: user.id,
      email: user.email
    };

    let token = jwt.sign(payload, authConfig.jwtSecret, { expiresIn: "1d" });

    res.json({ token });    
  });

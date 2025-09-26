import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest } from "../libs/types.js";

// import authentication middleware
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin.js";

// import database
import { users, reset_users } from "../db/db.js";

const router = Router();

// GET /api/v2/users
router.get(
  "/",
  authenticateToken,
  checkRoleAdmin,
  (req: Request, res: Response) => {
    try {
      // // get payload and token from (custom) request
      // const payload = (req as CustomRequest).user;
      // const token = (req as CustomRequest).token;

      // // find user by payload.username
      // const user = users.find((u: User) => u.username === payload?.username);

      // // check if user is admin
      // if (!user || user.role !== "ADMIN") {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Unauthorized user",
      //   });
      // }

      // // check if token exists in user.tokens
      // if (!user.tokens || typeof token !== "string" || !user.tokens.includes(token) ) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Invalid token",
      //   });
      // }

      // return all users
      return res.json({
        success: true,
        data: users,
      });
    } catch (err) {
      return res.status(200).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {
  try {
    // get username and password from body
    const { username, password } = req.body;
    const user = users.find(
      (u: User) => u.username === username && u.password === password
    );

    // if user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // create jwt token
    const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";
    const token = jwt.sign(
      {
        // create JWT Payload
        username: user.username,
        studentId: user.studentId,
        role: user.role,
      },
      jwt_secret,
      { expiresIn: "60m" }
    );

    // store the new token in user.tokens
    user.tokens = user.tokens ? [...user.tokens, token] : [token];

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/users/logout
router.post("/logout", authenticateToken, (req: Request, res: Response) => {
  try {
    const payload = (req as any).user;
    const token = (req as any).token;

    // find user by payload.username
    const user = users.find((u: User) => u.username === payload.username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // check if token exists in user.tokens
    if (!user.tokens || !user.tokens.includes(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // if token exists, remove the token from user.tokens
    user.tokens = user.tokens?.filter((t) => t !== token);
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/users/reset
router.post("/reset", (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
import { Router, type Request, type Response } from "express";
import {
  zCourseId,
  zCoursePostBody,
  zCoursePutBody,
} from "../libs/zodValidators.js";

import type { Student, Course, User } from "../libs/types.js";

// import database
import { courses, users } from "../db/db.js";
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin.js";

const router = Router();

// GET /api/v2/courses
router.get(
  "/",
  authenticateToken,
  checkRoleAdmin,
  (req: Request, res: Response) => {
    try {
      // // get payload and token from (custom) request
      // const payload = (req as any).user;
      // const token = (req as any).token;

      // // find user by payload.username
      // const user = users.find((u: User) => u.username === payload.username);

      // // check if user exists
      // if (!user) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Unauthorized user",
      //   });
      // }

      // // check if token exists in user.tokens
      // if (!user.tokens || !user.tokens.includes(token)) {
      //   return res.status(401).json({
      //     success: false,
      //     message: "Invalid token",
      //   });
      // }

      return res.json({
        success: true,
        data: courses,
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

// GET /api/v2/courses/{courseId}
router.get("/:courseId", authenticateToken,checkRoleAdmin,(req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const parseResult = zCourseId.safeParse(courseId);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (c: Course) => c.courseId === courseId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Course ${courseId} does not exists`,
      });
    }

    res.status(200).json({
      success: true,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/courses, body = {new course data}
// add a new course
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  // get payload and token from (custom) request
  const payload = (req as any).user;
  const token = (req as any).token;

  // find user by payload.username
  const user = users.find((u: User) => u.username === payload.username);

  // check if user is admin
  if (!user || user.role !== "ADMIN") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  // check if token exists in user.tokens
  if (!user.tokens || !user.tokens.includes(token)) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // read body and validate
  // check if courseId already exists
  // if not, add to courses
  // return success message

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/courses has not been implemented yet",
  });
});

// PUT /api/v2/courses, body = {courseId}
// Update specified courses
router.put("/", authenticateToken, (req: Request, res: Response) => {
  return res.status(500).json({
    success: false,
    message: "PUT /api/v2/courses has not been implemented yet",
  });
});

// DELETE /api/v2/courses, body = {coursesId}
router.delete("/", authenticateToken, (req: Request, res: Response) => {
  return res.status(500).json({
    success: false,
    message: "DELETE /api/v2/courses has not been implemented yet",
  });
});

export default router;
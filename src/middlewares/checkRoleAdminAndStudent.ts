import { type Request, type Response, type NextFunction } from "express";
import { type CustomRequest, type User } from "../libs/types.js";
import { users, reset_users } from "../db/db.js";

// interface CustomRequest extends Request {
//   user?: any; // Define the user property
//   token?: string; // Define the token property
// }

export const checkRcheckRoleAdminAndStudent= (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // get payload and token from (custom) request
  const payload = req.user;
  const token = req.token;
  const  studentId  = req.params.studentId;
  // find user by payload.username
  const user = users.find((u: User) => u.username === payload?.username);
  // if user not found
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }
    // check if token exists in user.tokens
  if (
    !user.tokens ||
    typeof token !== "string" ||
    !user.tokens.includes(token)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
  // check if user is admin
  if (user.role === "ADMIN") {
    return next(); 
  }
 // if role is STUDENT, can only access their own data
  if (user.role === "STUDENT" && user.studentId === studentId){
     return next();
  }else{
    return res.status(403).json({
      success: false,
      message: "Forbidden access"});
  }


  // Proceed to next middleware or route handler
  next();
};
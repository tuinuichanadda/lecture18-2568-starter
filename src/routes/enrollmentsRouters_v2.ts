import { Router, type Request, type Response } from "express";
import {
  zStudentId,
  zEnrollmentBody,
} from "../libs/zodValidators.js";

import type { Student, Course, User ,CustomRequest,Enrollment} from "../libs/types.js";

// import database
import { students,courses, users,reset_enrollments,enrollments } from "../db/db.js";
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdmin.js";
import { checkRoleStudent } from "../middlewares/checkRoleStudent.js";
import { checkRcheckRoleAdminAndStudent } from "../middlewares/checkRoleAdminAndStudent.js";

const router = Router();

// // GET /api/v2/enrollments 
// router.get("/",authenticateToken,checkRoleAdmin,(req: Request, res: Response) => {
//     try {
//         const result = students.map((student: Student) => {
//           const coursesDetails = courses.filter((c: Course) =>
//             student.courses?.includes(c.courseId)
//           );
//           return {
//             studentId: student.studentId,
//             courses: coursesDetails.map((course: Course) => ({
//               courseId: course.courseId,
//             })),
//           };
//         });

//       return res.json({
//         success: true,
//         message: "Enrollments Information",
//         data: result,
//       });
//     } catch (err) {
//       return res.status(500).json({
//         success: false,
//         message: "Something is wrong, please try again",
//         error: err,
//       });
//     }
//   }
// );
// GET /api/v2/enrollments (all)
router.get("/",authenticateToken,(req: Request, res: Response) => {
    try {
        const result = students.map((student: Student) => {
          const coursesDetails = courses.filter((c: Course) =>
            student.courses?.includes(c.courseId)
          );
          return {
            studentId: student.studentId,
            courses: coursesDetails.map((course: Course) => ({
              courseId: course.courseId,
            })),
          };
        });

      return res.json({
        success: true,
        message: "Enrollments Information",
        data: result,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

// POST /api/v2/enrollments/reset 
router.post("/reset",authenticateToken,checkRoleAdmin, (req: Request, res: Response) => {
  try {
    reset_enrollments();
    return res.status(200).json({
      success: true,
      message: "enrollments database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// GET /api/v2/enrollments/{studentId}
router.get("/:studentId",authenticateToken,checkRcheckRoleAdminAndStudent,(req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId;
      const result = zStudentId.safeParse(studentId);

      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues[0]?.message,
        });
      }

      const foundIndex = students.findIndex(
        (std: Student) => std.studentId === studentId
      );

      if (foundIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Student does not exists",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Student Information",
        data: students[foundIndex],
      });

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);
// POST /api/v2/enrollments/{studentId}, body = {new course data}
// add a new course
router.post("/:studentId", authenticateToken,checkRoleStudent, async (req: Request, res: Response) => {
  try {
     const body = (await req.body) as Enrollment;
 
     const result = zEnrollmentBody.safeParse(body);
     if (!result.success) {
       return res.status(400).json({
         message: "Validation failed",
         errors: result.error.issues[0]?.message,
       });
     }
 
     //check duplicate enrollments courseId
     const found = enrollments.find(
       (e) => e.studentId === body.studentId &&
        e.courseId === body.courseId
     );
     
     if (found) {
       return res.status(409).json({
         success: false,
         message: "studentId && courseId is already exists",
       });
     }

     const new_enrollments = body;
     enrollments.push(new_enrollments);
 
     // add response header 'Link'
     res.set("Link", `/enrollments/${new_enrollments.courseId}`);
 
     return res.status(201).json({
       success: true,
       message: `Student ${new_enrollments.studentId} && Course ${new_enrollments.courseId} has been added successfully`,
       data: new_enrollments,
     });
  
  } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
      });
  }
});

// DELETE /api/v2/courses, body = {coursesId}
router.delete("/:studentId", authenticateToken,checkRoleStudent, (req: Request, res: Response) => {
  try {
      const body = req.body;
      const parseResult = zEnrollmentBody.safeParse(body);
      const studentIdParams  = req.params.studentId;
      
      if (!parseResult.success) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            error: parseResult.error.issues[0]?.message,
          });
      }

      if(studentIdParams === body.studentId){
          // find index of studentId from enrollments array
            const foundIndexStd = enrollments.findIndex(
            (s: Enrollment) => s.studentId === body.studentId
            );
            console.log(foundIndexStd);
          // if student not found
          if (foundIndexStd === -1) {
            return res.status(404).json({
              success: false,
              message: `Student ${body.studentId} does not exists`,
            });
          }else{
   
              const foundIndex = enrollments.findIndex(
                (e: Enrollment) => e.studentId === body.studentId && e.courseId === body.courseId
              );  

              if (foundIndex === -1) {
                return res.status(404).json({
                  success: false,
                  message: "Enrollment does not exists",
                });
              }

              // delete found Enrollment from array
              enrollments.splice(foundIndex, 1);
            
              res.status(200).json({
                success: true,
                message: `Student ${body.studentId} && Course ${body.courseId} has been deleted successfully`,
                data: enrollments
              });
          
          }
    
      }else{

        return res.status(403).json({
        success: false,
        message: "You are not allowed to modify another student's data",
        });
      }
    
    } catch (err) {
        return res.status(500).json({
          success: false,
          message: "DELETE /api/v2/courses has not been implemented yet",
      });
    }
});

export default router;
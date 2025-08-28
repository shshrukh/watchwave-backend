import { Router } from "express";
import { registerUser,loginUser, logoutUser, changePassword} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js" 


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

router.route("/login").post( loginUser);

//secure user

router.route("/logout").post( verifyJWT, logoutUser )

router.route("/change-password").post( verifyJWT, changePassword)


export default router
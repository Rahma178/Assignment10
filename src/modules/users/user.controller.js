import { Router } from "express";

import * as US from "./user.services.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { confirmEmailSchema, refreshTokenSchema, resetPasswordSchema, shareProfileSchema, signInSchema, signUpSchema, updatePassswordSchema, updateProfileSchema } from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";

const userRouter = Router()

userRouter.post("/signUp",
   multerLocal({ 
    customTypes: ['image/jpeg', 'image/png', 'application/pdf']  
}).fields([
    { name: "attachment", maxCount: 1 },
    { name: "attachments", maxCount: 5 }
]),
validation(signUpSchema),
    US.signUp)
userRouter.post("/signup/gmail",US.signUpWithGmail)
userRouter.post("/signIn",validation(signInSchema),US.signIn)
userRouter.post("/refreshToken",validation(refreshTokenSchema),US.refreshToken)
userRouter.get("/getProfile",authentication ,authorization(Object.values(roleEnum)),US.getProfile)
userRouter.get("/shareProfile/:id",validation(shareProfileSchema),US.shareProfile)
userRouter.patch("/updateProfile",validation(updateProfileSchema), authentication,US.updateProfile)
userRouter.patch("/updatePasssword",validation(updatePassswordSchema), authentication,US.updatePassword)
userRouter.patch("/forgetPasssword",US.forgetPassword)
userRouter.patch("/resetPassword", validation(resetPasswordSchema),US.resetPassword)
userRouter.patch("/logout", authentication,US.logout)
userRouter.patch("/resend-otp",US.reSendOtp)
userRouter.post('/confirm-email',validation(confirmEmailSchema), US.confirmEmail);


export default userRouter
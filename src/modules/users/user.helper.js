import { Hash } from "../../common/security/hash.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { emailTemplate } from "../../common/utilites/email.templete.js";
import { getValue, incr, setValue, ttl } from "../../DB/models/service/redis.service.js";
import userModel from "../../DB/models/user.model.js";

export const sendOtp = async( {email , isConfirmed , subject="Confirm Email"}= {})=>{

    const isBlocked = await ttl(`otp:block:${email}`);
    if (isBlocked > 0) throw new Error(`you blocked ,you can resSend otp after ${isBlocked} seconds`);
    
    const ttlOtp = await ttl(`otp:${email}`);
    if (ttlOtp > 0) throw new Error(`you can resSend otp after ${ttlOtp} seconds`);
    
    const max_otp = await getValue(`otp:max:${email}`);
    if (max_otp >= 150) {
        await setValue({
            key: `otp:block:${email}`,
            value: "1",
            ttl: 5 * 60
        });
        throw new Error("you have exceeded the maximum number of tries");
    }

    const user = await userModel.findOne({
        email: email.toLowerCase(),
        isConfirmed: isConfirmed
    });
    
    if (!user) throw new Error("email not exist or already confirmed");

    const otp = generate_otp();
    const hashOtp = await Hash(otp);
    
    await setValue({
        key: `otp:${email}`,
        value: hashOtp,
        ttl: 2 * 60
    });

await sendEmail({
    to: email,
    subject,
    html: emailTemplate(otp)
});
    console.log(otp);
    
    await incr(`otp:max:${email}`);

    //  return res.status(201).json({ message: "Done", user })

}
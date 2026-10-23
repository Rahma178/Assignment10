
import userModel from './../../DB/models/user.model.js';
import * as dbservice from "../../DB/models/service/db.service.js"
import { Decrypt, Encrypt } from './../../common/security/encrypt.js';
import { Compare, Hash } from '../../common/security/hash.js';
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library';
import joi from 'joi'
import { model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import revokeTokenModel from '../../DB/models/revokeToken.model.js';
import { compare, compareSync, hashSync } from 'bcrypt';
import { deleteKey, getValue, incr, keys, setValue, ttl } from '../../DB/models/service/redis.service.js';
import sendEmail, { generate_otp } from '../../common/service/sendEmail.js';
import { eventEmitter } from '../../common/utilites/events.js';
import { emailTemplate } from '../../common/utilites/email.templete.js';
import { sendOtp } from './user.helper.js';

// const asyncHandler = (fn) => {
//     return (req, res, next) => {
//         fn(req, res, next).catch((error) => {
//             // res.json({ message:error.message })
//             next(error)
//         })
//     }
// }


// export const generate_otp = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };





export const signUp = async (req, res, next) => {
    const { fName, lName, email, password, age, gender, phone } = req.body;

    const paths = [];
    if (req.files && req.files.attachments) {
        for (const file of req.files.attachments) {
            paths.push(file.path);
        }
    }
    const profileImgPath = (req.files && req.files.attachment) ? req.files.attachment[0].path : "";

    const otp = generate_otp();
    console.log(otp)
    const hashOtp = await Hash(otp);

    await setValue({
        key: `otp:${email}`,
        value: hashOtp,
        ttl: 5 * 60
    });

    eventEmitter.emit("confirm_email", async () => {
        await sendEmail({
            to: email,
            subject: "Confirm Email",
            html: `<h1>otp:${otp}</h1>`
        });
    });


    await setValue({
        key: `otp:max:${email}`,
        value: 1,
        ttl: 60 * 5
    });

    const user = await dbservice.create({
        model: userModel,
        data: {
            fName,
            lName,
            email,
            password: await Hash(password),
            age,
            gender,
            phone: Encrypt(phone),
            profileImage: profileImgPath, 
            coverImages: paths 
        }
    });

    return res.status(201).json({ message: "Done", user });
}




export const signUpWithGmail = (async (req, res, next) => {

    try {
        const { idToken } = req.body
        //  console.log(idToken);
        
        const client = new OAuth2Client();

            const decoded = await client.verifyIdToken({
                idToken,
                audience: "324586917049-jej3b57kcm7ts7df4bulabm40tuhc3ea.apps.googleusercontent.com", 
            });
            const { family_name, given_name, picture, email_verified, email } = decoded.getPayload();

        let user = await userModel.findOne({ email: email.toLowerCase() })

        if (!user) {
           user= await userModel.create({
                fName: given_name,
                lName: family_name || given_name,
                email,
                profileImage: picture,
                isConfirmed: email_verified,
                provider: "google"
            })
        }
            
           
        const access_token = jwt.sign({id:user.id, email:user.email},"rahma123",{
            expiresIn:60*50,
        })

        const refresh_token = jwt.sign({id:user.id, email:user.email},"ail123")
        return res.status(200).json({message:"Done", token:{access_token, refresh_token}})
     
         
    } catch (error) {
        return res.status(500).json({message:error.message, stack:error.stack})
    }



})



export const signIn = (async (req, res, next) => {
   
        const { email, password } = req.body
        const user = await dbservice.findOne({ 
            model:userModel,
            filter:{email: email.toLowerCase(), provider: "system" }
        })
        if (!user) {
            // return res.status(404).json({ message: "email not exist or you can login on your signup " })
            throw new Error("email not exist or you can login on your signup ",{cause:404})
        }

        // if (user.isConfirmed !== true) {
        //     return res.status(400).json({ message: "email not confirmed" })
        // }

        if (!await Compare(password,user.password)) {
            // return res.status(400).json({ message: "invalid password" })
            throw new Error("invalid password" ,{cause:400})
        }

        const tokenId = randomUUID()


        const access_token = jwt.sign({id:user.id, email:user.email},"rahma123",{
            expiresIn:60*50,
            jwtid:tokenId,
            audience:"http://localhost:4000",
            issuer:"http://localhost:3000",
            // notBefore:30,
            noTimestamp:true
        })

        const refresh_token = jwt.sign({id:user.id, email:user.email},"ail123",{
            expiresIn:60*50,
            jwtid:tokenId
        })
        return res.status(200).json({message:"Done", token:{access_token, refresh_token}})

        return res.status(200).json({ message: "Done", user:{...user._doc ,phone:Decrypt(user.phone)}})

  
})




export const getProfile = async (req, res, next) => {
        

        return res.status(200).json({ message: "Done",user:req.user })

        // return res.status(500).json({ message: error.message, stack: error.stack })
        
    
}



// ----------------------shareProfile----------------------
export const shareProfile = async (req, res, next) => {
    const { id } = req.params

    let user = await dbservice.findById({
        model: userModel,
        id,
        options: { password: 0 }
    })

    if (!user) {
        throw new Error("use not exist ", { cause: 400 })
    }

    if (user.phone) {
    user.phone = Decrypt(user.phone)
}

    return res.status(200).json({ message: "Done", user })
}


// ----------------------refreshToken----------------------

export const refreshToken = async (req, res, next) => {

    const { authorization } = req.headers

    if (!authorization) {
        throw new Error("token not exist ", { cause: 404 })
    }

    const decoded = jwt.verify(authorization, "ail123")
    if (!decoded?.id) {
        throw new Error("InValid token", { cause: 400 })
    }

    const user = await dbservice.findOne({
        model: userModel,
        filter: { _id: decoded.id }
    })
    if (!user) {
        throw new Error("user not exist ", { cause: 400 })
    }

    const access_token = jwt.sign({ id: user._id }, "ail123", {
        expiresIn: 60 * 5
    })

    return res.status(200).json({ message: "Done", access_token })
}


// ----------------------updateProfile----------------------
export const updateProfile = async (req, res, next) => {
    const { fName, lName, age, gender, phone } = req.body

    let updateQuery = {}

    if (fName !== undefined) {
        updateQuery.fName = fName
    }
    if (lName !== undefined) {
        updateQuery.lName = lName
    }
    if (age !== undefined) {
        updateQuery.age = age
    }
    if (gender !== undefined) {
        updateQuery.gender = gender
    }
    if (phone !== undefined) {
        updateQuery.phone = Encrypt(phone)
    }

    let user = await dbservice.findByIdAndUpdate({ 
        model:userModel,
        id:req.user._id,
        update:updateQuery
    })

    return res.status(201).json({ message: "Done", user })
}



// ----------------- updatePassword --------------------
export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body

    console.log(!Compare(oldPassword, req.user.password));

    if (!await Compare(oldPassword, req.user.password)) {
        throw new Error("InValid old password");
    }

    req.user.password = await Hash(newPassword)
    req.user.changeCredentialAt = new Date()

    await req.user.save()

    return res.status(200).json({ message: "Done", user: req.user })
}



// ========================== logout ==========================
export const logout = async (req, res, next) => {

    const { flag } = req.query

    if (flag === "all") {
        req.user.changeCredentialAt = new Date()
        await req.user.save()
        await deleteKey(await keys(`revoke_token::${req.user._id}`))
        // await deleteMany({
        //     model: revokeTokenModel,
        //     filter: { userId: req.user._id }
        // })

    } else {
        console.log(req.decoded.exp - Math.floor((Date.now() / 1000)));

        await setValue({
            key: `revoke_token::${req.user._id}::${req.decoded.jti}`,
            value: `${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor((Date.now() / 1000))
        })

        // await dbservice.create({
        //     model: revokeTokenModel,
        //     data: {
        //         userId: req.user._id,
        //         tokenId: req.decoded.jti,
        //         expireAt: new Date(req.decoded.exp * 1000)
        //     }
        // })
    }
    return res.status(200).json({ message: "User logged out successfully" });
}




// ================ confirmEmail ================
export const confirmEmail = async (req, res, next) => {

    const { email, otp } = req.body

    const otpValue = await getValue(`otp:${email}`)
    if (!otpValue) {
        throw new Error("otp expire", { cause: 400 })
    }

    if (!compareSync(otp, otpValue)) {
        throw new Error("invalid otp", { cause: 400 })
    }

    const user = await dbservice.findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            isConfirmed: false
        },
        update: {
            isConfirmed: true
        }
    })
    if (!user) {
        throw new Error("user not exist or already confirmed", { cause: 400 })
    }

    await deleteKey(`otp:${email}`)
    return res.status(200).json({ message: "Done", user })

}




// // ---------------------- reSendOtp ------------------------
export const reSendOtp = async (req, res, next) => {
    const { email } = req.body;
    
    await sendOtp({email , isConfirmed:false})

     return res.status(201).json({ message: "Done" })
}



// // ---------------------- forgetPassword ------------------------
export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    
    await sendOtp({email , isConfirmed:true , subject: "Forget Password"})

     return res.status(200).json({ message: "Done" })
}



// // ---------------------- resetPassword ------------------------
export const resetPassword = async (req, res, next) => {
    const { email ,code , password} = req.body;
    
    const Otp = await getValue(`otp:${email}`);
     if (!Otp) throw new Error(`token expire`);

     if (!compareSync(code, Otp)) throw new Error("inValid otp")

    const user = await dbservice.findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            isConfirmed: true
        },
        update: {
            password: hashSync(password, 12),
            changeCredentialAt: new Data()
        }
    })

    if (!user) throw new Error("user not exist or already confirmed", { cause: 400 })

    await deleteKey(`otp:${email}`)
        
     return res.status(200).json({ message: "Done" })
}
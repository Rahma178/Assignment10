 
import joi from 'joi'
import { generalRules } from '../../common/utilites/generalRules.js'

export const signUpSchema = {

    body: joi.object({
        fName: joi.string().required(),
        lName: joi.string().required(),
        email: generalRules.email.required(),
        password: generalRules.password.required(),
        cPassword: joi.string().valid(joi.ref("password")).required(),
        age: joi.number().required(),
        gender:joi.string().required(),
        phone:joi.string().required()
    }).required().with("password", "cPassword"),

    query: joi.object({
        flag: joi.boolean().required(),
        
    }).required(),

    // file: generalRules.file.required()

    files: joi.object({
        attachment: joi.array().items(generalRules.file.required()).required(),
        attachments: joi.array().items(generalRules.file.required()).required()
    }).required()
}


export const updateProfileSchema = {

    body: joi.object({
        fName: joi.string(),
        lName: joi.string(),
        age: joi.number(),
        gender:joi.string(),
        phone:joi.string()
    }).required(),

}




export const signInSchema = {
    body: joi.object({
        email: generalRules.email.required(),
        password: generalRules.password.required(),
    }).required()
}


export const updatePassswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
        cPassword: joi.string().valid(joi.ref("newPassword")).required()
    }).required()
}


export const refreshTokenSchema = {
    Headers: generalRules.token.required()
}


export const shareProfileSchema = {
    params:joi.object({
        id: generalRules.id.required()
        }).required()
}



export const confirmEmailSchema = {
    body: joi.object({
        email: joi.string().required(),
        otp: joi.string().pattern(/^[0-9]{6}$/).required()
    }).required()
}


export const resetPasswordSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        code: joi.string().pattern(/^[0-9]{6}$/).required(),
        password: joi.string().min(8).required() 
    }).required()
}
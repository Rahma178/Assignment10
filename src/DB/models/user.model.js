import mongoose from "mongoose";
import { genderEnum, providerEnum, roleEnum } from "../../common/enum/user.enum.js";

 
 const userSchema = new mongoose.Schema({
    fName:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:15
    },
    lName:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:15
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:function(){
            return this.provider===providerEnum.system
       },
        unique:true,
    },
    age:{
        type:Number,
        required:function(){
            return this.provider===providerEnum.system
       },
        min:20,
        max:60
    },
    gender:{
        type:String,
        enum:Object.values(genderEnum),
        default:genderEnum.female
    },
    profileImage:String,
    phone:String,
    role:{
        type:String,
        enum:Object.values(roleEnum),
        default:roleEnum.user
    },
    provider:{
        type:String,
        enum:Object.values(providerEnum),
        default:providerEnum.system
    },
    isConfirmed:Boolean,
        // default:false
    

    changeCredentialAt: Date


 },{
    timestamps:true,
    strict:true,
    strictQuery:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
 })

 const userModel = mongoose.models.User || mongoose.model("User",userSchema)

 export default userModel
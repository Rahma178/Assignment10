
import  jwt  from 'jsonwebtoken';
import { findOne } from '../../DB/models/service/db.service.js';
import userModel from '../../DB/models/user.model.js';
import { ttl } from '../../DB/models/service/redis.service.js';
// import revokeTokenModel from '../../DB/models/revokeToken.model.js';

export const authentication = async (req,res,next)=>{

    const { authorization } = req.headers

    if(!authorization){
         throw new Error("token not exist",{cause:404})
    }

        const decoded = jwt.verify(authorization, "rahma123")

        if(!decoded.id){
             throw new Error("invalid token",{cause:400})
        }

        const user = await findOne({
            model: userModel,
            filter: {
                // email: decoded.email.toLowerCase(),
                _id:decoded.id
            }
        })
        if (!user) {
            // return res.status(400).json({ message: "user not exist" })
            throw new Error("user not exist",{cause:400})
        }

        if(user?.changeCredentialAt?.getTime()> decoded?.iat *1000){
            throw new Error("token expire you must be login again",{cause:400})
        }

    //     if (await findOne({ model: revokeTokenModel, filter: { tokenId: decoded.jti } })) {
    //     throw new Error("token expire you from this device must be login in again", { cause: 400 })
    // }

    if (await ttl(`revoke_token::${user._id}::${decoded.jti}`) > 0) {
        throw new Error("InValid revoked token, you should login again")
    }

        req.user=user
        req.decoded = decoded
        next()

}
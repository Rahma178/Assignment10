
import { Router } from "express";
import * as US from "./message.service.js"
import { multerLocal } from './../../common/middleware/multer.js';
import { Multer_Enum } from "../../common/enum/multer.enum.js";
import { validation } from './../../common/middleware/validation.js';
import * as MV from './message.validation.js';

const messageRouter = Router()

messageRouter.post("/",
    multerLocal({
        customPath: "messages",
        customTypes: Multer_Enum.images
    }).array("attachments", 3),
    validation(MV.createMessageSchema),
    US.createMessage)

export default messageRouter
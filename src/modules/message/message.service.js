
import messageModel from '../../DB/models/message.models.js';
import { create, findById } from './../../DB/models/service/db.service.js';
import userModel from './../../DB/models/user.model.js';

// =====================  createMessage  =======================
export const createMessage = async (req, res, next) => {

    const { content, userId } = req.body

    if (!content && !req.files?.length) throw new Error("content is required")

    const userExist = await findById({
        model: userModel,
        id: userId
    })
    if (!userExist) throw new Error("user not exist");

    let urls = []
    if (req?.files?.length) {
        for (const file of req?.files) {
            urls.push(file.path)
        }
    }

    const message = await create({
        model: messageModel,
        data: {
            content,
            attachments: urls,
            userId
        }
    })

    return res.status(201).json({ message: "Done", message })
}







































// ==================== getMessages ====================
// export const getMessages = async (req, res, next) => {
//     const messages = await dbService.find({
//         model: messageModel,
//         filter: { userId: req.params.userId }
//     })

//     return res.status(200).json({ message: "Donne", data: messages })
// }

// // ==================== getMessageById ====================
// export const getMessageById = async (req, res, next) => {
//     const message = await dbService.findOne({
//         model: messageModel,
//         filter: {
//             _id: req.params.id,
//             userId: req.user._id,
//         }
//     })
//     return res.status(200).json({ message: "Donne", data: message })
// }

// // ==================== deleteMessage ====================
// export const deleteMessage = async (req, res, next) => {
//     const message = await dbService.deleteOne({
//         model: messageModel,
//         filter: {
//             _id: req.params.id,
//             userId: req.user._id,
//         }
//     })

//     return res.status(200).json({ message: "Donne", data: message })
// }
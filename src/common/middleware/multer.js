
import multer from "multer";
import { randomUUID } from "node:crypto"
import fs from "node:fs"

export const multerLocal = ({ customPath = "General", customTypes = [] }) => {

    const path = `uploads/${customPath}`
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
    }
    
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path)
        },
        filename: (req, file, cb) => {
            cb(null, randomUUID() + "_" + file.originalname)
        }
    })

    function fileFilter(req, file, cb) {
        console.log({ file })
        if (!customTypes.includes(file.mimetype)) {
            cb(new Error("Invalid file!"))
        } else {
            cb(null, true)
        }
    }

    const upload = multer({ storage, fileFilter })
    return upload
}
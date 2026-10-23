
import nodemailer from 'nodemailer';
import { randomInt } from 'node:crypto';

const sendEmail = async ({ to, subject, html, attachments } = {}) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "sarhanrahma83@gmail.com",
            pass: "vmataswpnmynbldz"
        }
    })

    const info = await transporter.sendMail({
        from: '"RAHMA.." <sarhanrahma83@gmail.com>',
        to,
        subject,
        html: html || "",
        attachments: attachments || []
    });

    return info.accepted.length>0 ? true : false 

}

export const generate_otp = () => {
    return randomInt(100000, 1000000).toString()
}

export default sendEmail
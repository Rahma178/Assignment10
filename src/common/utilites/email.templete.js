
export const emailTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
    </head>

    <body style="margin:0; padding:20px; background:#f4f4f4; font-family:Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center">

                    <table width="600" cellpadding="0" cellspacing="0"
                        style="background:#ffffff; border-radius:10px;">

                        <tr>
                            <td style="background:#6C63FF; padding:20px; text-align:center; color:#ffffff;">
                                <h2 style="margin:0;">Saraha App</h2>
                                <p style="margin:5px 0 0;">Email Verification</p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:30px; color:#333; text-align:center;">

                                <h3>Hello 👋</h3>

                                <p>You requested to verify your email.</p>

                                <div style="background:#f9f9f9; padding:20px; border-left:4px solid #6C63FF;">
                                    <p style="margin:0 0 10px;">Your OTP Code:</p>

                                    <h2 style="color:#6C63FF; letter-spacing:5px; margin:0;">
                                        ${otp}
                                    </h2>
                                </div>

                                <p style="margin-top:20px; color:#666;">
                                    This code expires in 5 minutes.
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};

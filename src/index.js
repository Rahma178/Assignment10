import bootstrap from "./app.bootstrap.js";
import sendEmail from "./common/service/sendEmail.js";

bootstrap()


sendEmail({
    to: "rahmaa.elsayed2@gmail.com",
    subject:"email confirm",
    html: "<h1>hello </h1>"
})
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
const sendEmail = async (to, subject, text) =>{
    const mailOptions = {
        from : process.env.EMAIL_USER,
        to : to,
        subject : subject,
        text : text
    }
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
}
module.exports = sendEmail;
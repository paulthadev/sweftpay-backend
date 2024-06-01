const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config()

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
}

const sendEmail = async (email) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        }
    })
    const mailOptions = {
        to: email,
        from: process.env.MAIL,
        subject: 'Password Reset OTP',
        text: `Your OTP for a password reset is: ${otp}\nIt is valid for 10 minutes`
    }
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('Error Sending email', err)
        } else {
            console.log('OTP email sent successfully')
        }
    })
}

module.exports = {generateOTP, sendEmail}
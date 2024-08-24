function registrationOTPTemplate(otp) {
  const currentYear = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Verification Code</title>
      <style>
      /* Your existing styles here */
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>SweftPay Registration OTP</h1>
          </div>
          <div class="content">
              <p>Hi SweftPayer,</p>
              <p>Thank you for registering with SweftPay. To complete your registration, please use the following verification code:</p>
              <div class="code">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you did not request this registration, please ignore this email.</p>
          </div>
          <div class="footer">
              <p>Best Regards!</p>
              <p>SweftPay Team</p>
              <p>Email: help@sweftpay.com | Phone: +234 (0)7043786775</p>
              <p>&copy; ${currentYear} SweftPay. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

function verificationOTPTemplate(otp) {
  const currentYear = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Verification Code</title>
      <style>
      /* Your existing styles here */
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>SweftPay Account Verification OTP</h1>
          </div>
          <div class="content">
              <p>Hi SweftPayer,</p>
              <p>You are attempting to log in to your unverified SweftPay account. To verify your account and complete the login process, please use the following verification code:</p>
              <div class="code">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you did not attempt to log in, please secure your account and contact our support team immediately.</p>
          </div>
          <div class="footer">
              <p>Best Regards!</p>
              <p>SweftPay Team</p>
              <p>Email: help@sweftpay.com | Phone: +234 (0)7043786775</p>
              <p>&copy; ${currentYear} SweftPay. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

function passwordResetTemplate(resetUrl) {
  const currentYear = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
      /* You can use the same styles as in the OTP template or customize as needed */
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>SweftPay Password Reset</h1>
          </div>
          <div class="content">
              <p>Hi SweftPayer,</p>
              <p>You are receiving this email because you (or someone else) has requested the reset of your password.</p>
              <p>Please click the following link to reset your password:</p>
              <div class="code"><a href="${resetUrl}">${resetUrl}</a></div>
              <p>This link will expire in 10 minutes.</p>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
              <p>Best Regards!</p>
              <p>SweftPay Team</p>
              <p>Email: help@sweftpay.com | Phone: +234 (0)7043786775</p>
              <p>&copy; ${currentYear} SweftPay. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

function otpEmailTemplate(otp) {
  const currentYear = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
      /* Your existing styles here */
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>SweftPay SignUp OTP</h1>
          </div>
          <div class="content">
              <p>Hi SweftPayer,</p>
              <p>You are requesting to sign up for SweftPay. The verification code for your request is:</p>
              <div class="code">${otp}</div>
              <p>For your account security, please enter this verification code to authorize this request. The code will expire in 10 minutes.</p>
              <p>If you did not make this request, kindly ignore this and do not disclose the code to anyone.</p>
              <p>This email is automatically generated, please do not reply.</p>
          </div>
          <div class="footer">
              <p>Best Regards!</p>
              <p>SweftPay Team</p>
              <p>Email: help@sweftpay.com | Phone: +234 (0)7043786775</p>
              <p>&copy; ${currentYear} SweftPay. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

module.exports = {
  registrationOTPTemplate,
  verificationOTPTemplate,
  passwordResetTemplate,
};

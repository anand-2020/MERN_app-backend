const nodemailer = require('nodemailer');

module.exports = class Email {
   constructor(user,token) {
       this.to = user.email;
       this.name = user.username;
       //this.url = url;
       this.token = token;
       this.from = 'Anand <theanand1310@gmail.com>';
   } 
   
   newTransport() {
       if(process.env.NODE_ENV === 'production '){
           return nodemailer.createTransport({
               service: 'SendGrid',
               auth: {
                   user: process.env.SENDGRID_USERNAME,
                   pass: process.env.SENDGRID_PASSWORD
               }
           });
       }

       return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
       });
   }


    async send(subject,text) {  
    
    const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html:`<div><h2>Hi ${this.name}</h2> <p>${text}</p><p>Thank you</p> <hr/> <p>With Regards</p><p>PostPlay Team</p></div>`
  
    };

   await this.newTransport().sendMail(mailOptions);
   
   }

   async sendWelcome() {
      await this.send('Welcome',
      `Welcome to PostPlay. We are glad that you have joined the PostPlay Community. 
      Before adding any post you must verify your email. Go to the Profile section of the App for verification of E-Mail.
      If you face any difficulty in verification process or in adding posts afterwards, feel free to right back to us.`);
   }

   async emailVerified() {
       await this.send('Email Verified',
       `Your email has been verified. Now you can add your posts.`);
   }

   async sendPassswordReset() {
       await this.send(`Your password reset OTP. Valid for 10 min only!`,
       `Your password reset One Time Password (OTP) is ${this.token}. Please note that this OTP is valid only for 10 minutes`);   }

   async userBlacklisted() {
       await this.send(`Blacklisted`,
       `You have been Blacklisted! You can't make any posts! Also all your previous post has been blacklisted.
       Other users can't see and react to your previous posts`);
   }    
    
   async userWhitelisted(){
       await this.send(`Access Allowed`,
       `Congratulations! You are no more blacklisted and you can add your posts. 
       Make sure that you don't repeat your previous mistakes otherwise you might be blacklisted again.`)
   }

   async emailVerificationToken(){
    await this.send(`Your email verification OTP. Valid for 10 min only!`,
    `Your E-Mail verification One Time Password (OTP) is ${this.token}. Please note that this OTP is valid only for 10 minutes`);
   }
};


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
        text 
  
    };

   await this.newTransport().sendMail(mailOptions);
   
   }

   async sendWelcome() {
      await this.send('Welcome!!',
      `Thank you for signing up. PLease verify your email. Your email verification OTP is ${this.token}`);
   }

   async emailVerified() {
       await this.send('Email Verified',
       `Your email has been verified. Thank you!`);
   }

   async sendPassswordReset() {
       await this.send(`Your password reset OTP. Valid for 10 min only!`,
       `Your password reset OTP is ${this.token}. Please note that this OTP is valid only for 10 minutes`);   }

};


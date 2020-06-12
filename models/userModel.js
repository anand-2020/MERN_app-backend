const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength:3
    },
    email: {
       type: String,
       required: true,
       unique: true,
       lowercase: true,
       validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: { type: String, enum: ['user','admin'], default:'user' },
    blacklist: {type: Boolean },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function(pwd) {
                return pwd === this.password;
            },
            message: `Passwords don't match!!`
        }
    },
    passwordChangedAt: Date

}, {
    timestamps: true,
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();

});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  }); 
  

userSchema.methods.correctPassword = async function(enteredPassword, userPassword) {
    return  await bcrypt.compare(enteredPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if(this.passwordChangedAt) {
       const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);

       return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
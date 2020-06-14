const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError')
const globalError = require('./controllers/errorController');

const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const { header } = require('express-validator');

dotenv.config({path:'./config.env'});

const app=express();
const port = process.env.PORT || 5050;

app.use(cors({
    origin: 'http://localhost:3000', credentials:true
    }));
app.use(express.json());
app.use(cookieParser());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }
);

const connection = mongoose.connection;
connection.once('open', ()=> {
    console.log(process.env.NODE_ENV);
    console.log("MongoDB database connection established successfully!!");
});



app.use('/post',postRouter);
app.use('/user',userRouter);

app.all('*', (req,res,next) => {
    next(new AppError(`Can't reach ${req.originalUrl} on this server!!`, 404));
});

app.use(globalError);

const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!  Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
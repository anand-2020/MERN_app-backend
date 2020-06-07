const express = require('express');
const User = require('../models/userModel.js');

const router = express.Router();

router.route('/').get((req, res) => {
   User.find()
   .then(users => res.json(users))
   .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req,res) => {
    const username = req.body.username;

    const newUser = new User({username});

    User.init().then(() => {
        newUser.save()
       .then(() => res.json('user added'))
       .catch(err => res.status(400).json('Error: ' + err));
     });
    
});

module.exports = router;
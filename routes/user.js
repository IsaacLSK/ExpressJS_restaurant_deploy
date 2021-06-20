const modules_User = require('../modules/modules_User');
const express = require('express');
const router = express.Router();

//login handle
router.get('/login',(req,res)=>{
    if (req.session.authenticated){
        res.render('indexPage',{userid : req.session.userid});
    } else{
        res.render('login');
    }
})

//register page
router.get('/registerForm', (req,res)=>{
    res.render('registerForm');
})

//Register handle
router.post('/register',(req,res)=>{

    // Validation
    req.checkBody('userid', 'userid is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if(errors) {
        res.render('registerForm', {errors: errors})

    } else {
    //Create User
    modules_User.handle_CreateAcc(res, req.body);
    }

})

// login handle
router.post('/login',(req,res)=>{

        // Validation
    req.checkBody('userid', 'userid is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

    var errors = req.validationErrors();
    console.log(errors)
    if(errors) {
        res.render('login', {errors: errors})

    } else {
    //Login
    modules_User.handle_login(req, res);
    }

})

//logout handle
router.get('/logout',(req,res)=>{
    req.session = null;
    res.redirect('/');
})


module.exports  = router;
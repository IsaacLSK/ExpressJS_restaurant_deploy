const modules_CRUD = require('../modules/modules_CRUD');

const express = require('express');
const router  = express.Router();


router.get('/rateDoc', (req, res) => {

    console.log(req.query.rated);

    if (req.query.rated == 'true') {
        res.status(403).render("rateForm", {error_msg: 'you have rated', _id : req.query._id});

    } else {
        res.status(200).render("rateForm",{ _id : req.query._id});
    }
    
});

router.post('/rate', (req, res) => {
    
    modules_CRUD.handle_Rate(req, res);
});

module.exports = router; 
const modules_api = require('../modules/modules_api');

const express = require('express');
const router  = express.Router();


// api
router.get("/api/restaurant/:field/:criteria", (req, res) => {
    console.log(req.path);
    console.log(req.params);

    switch (req.params.field) {
        case 'name':
        case 'borough':
        case 'cuisine':
            modules_api.handle_api(res, req);
            break;
        default:
            res.redirect('/*');
    }

});

module.exports = router; 
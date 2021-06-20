const modules_CRUD = require('../modules/modules_CRUD');
const express = require('express');
const router  = express.Router();


router.get('/index', (req, res) => {
    
    let criteria = req.query.restau;
    modules_CRUD.indexPage(req, res, criteria);
});

router.get('/find', (req, res) => {
    modules_CRUD.handle_Find(req, res, req.query);
});

router.get('/createDoc', (req, res) => {
    res.status(200).render("createForm");
});

router.post('/create', (req, res) => {

    //Create restaurant
    let doc = {};
    modules_CRUD.getDoc(req, doc);
    modules_CRUD.handle_Create(res, doc);

});

router.get('/delete', (req, res) => {
    if (req.query.owner != req.session.userid) {
        res.status(403).render("displayNotOwnser");
    } else {
    console.log(req.query);
    modules_CRUD.handle_Delete(req, res, req.query);
    }
});


router.get('/updateDoc', (req, res) => {
    if (req.query.owner != req.session.userid) {
        res.status(403).render("displayNotOwnser");
    } else {
    modules_CRUD.updateDetails(req, res, req.query); 
    }
});

router.post('/update', (req, res) => {
    let doc = {};
    modules_CRUD.getDoc(req, doc);
    console.log(doc);
    modules_CRUD.handle_update(res, req, doc);
});


module.exports = router; 
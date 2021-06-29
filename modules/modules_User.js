require('dotenv').config();
const assert = require('assert');
const bcrypt = require('bcryptjs');
const MongoClient = require('mongodb').MongoClient;
const mongourl = process.env.DATABASE_URL;
const dbName = 'project';
const collectionAcc = 'account';

const userSchema = require('../models/userModel');

const createAcc = (db, doc, callback) => {
    db.collection(collectionAcc).
    insertOne(doc, (err, results) => {
        assert.equal(err,null);
        console.log(`Inserted document(s): ${results.insertedCount}`);
        callback();
    });
}

const handle_CreateAcc = (res, doc) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        
        let create_doc = {};
        create_doc.userid = doc.userid;
        create_doc.email = doc.email;
        create_doc.password = bcrypt.hashSync(doc.password, 10);
        
        console.log(create_doc);

        let userDoc = new userSchema(create_doc);

        userDoc.validate(function(err) {

            if (err){
                console.log(err);
                res.status(500).render("registerForm",  {errors : err.message});
            }
            else {
                console.log('validated');

                createAcc(db, userDoc, () => {
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).render("displayNewAcc",  {doc : doc});
                });
            }
        });
    });
}

const find_userDoc = (db, find_criteria , callback) => {
    const cursor = db.collection(collectionAcc).find(find_criteria);
    let therest = [];
    cursor.forEach((doc) => {
        therest.push(doc);
    }, (err) => {
      // done or error
      assert.equal(err,null);
      callback(therest);
    })
}

const handle_login = (req,res) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        
        let find_criteria = {};
        find_criteria.userid = req.body.userid;

        console.log(find_criteria);

        let userDoc = new userSchema(find_criteria);
        
        userDoc.validate(function(err) {

            if (err){
                console.log(err);
                res.render("displayError",  {error : err.message});
            }
            else{

                find_userDoc(db, find_criteria, (docs) => {
                    client.close();
                    console.log("Closed DB connection");
                    console.log(docs);

                    if (docs.length > 0) {
                       
                        if(bcrypt.compareSync(req.body.password, docs[0].password) == true){
                            console.log('login successfully');

                            req.session.authenticated = true;
                            req.session.userid = find_criteria.userid;

                            res.render('indexPage', {userid: req.session.userid});

                        } else{
                            console.log('Wrong PW');
                            req.flash('error_msg', 'Wrong password');
                            res.redirect('login');
                        }

                    } else {
                        console.log('Wrong User');
                        req.flash('error_msg', 'User does not exist');
                        res.redirect('login');
                    }
    
                });
            }
        });

    });
}


module.exports = {
    createAcc, 
    handle_CreateAcc, 
    handle_login, 
    find_userDoc
};
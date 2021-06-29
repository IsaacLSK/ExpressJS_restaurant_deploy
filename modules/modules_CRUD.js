
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const assert = require('assert');
const fs = require('fs');
const formidable = require('formidable');
const { json } = require('body-parser');

const restaurantSchema = require('../models/restaurantModel');

const mongourl = process.env.DATABASE_URL;
const dbName = 'project';
const collectionName = 'restaurants';


function getDoc(req, doc) {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {

        if (files.filetoupload && files.filetoupload.size > 0) {
            fs.readFile(files.filetoupload.path, (err, data) => {
                assert.equal(err, null);

                doc['photo'] = new Buffer.from(data).toString('base64');
                doc['photo_mimetype'] = files.filetoupload.type;
            })

        } else {

            doc['photo'] = "";
            doc['photo_mimetype'] = "";

        }

        if (req.path == '/update') {
            doc['_id'] = fields._id;
            doc['grades'] = fields.grades;

            if (doc['photo'] == "") {
                console.log(req.path);
                console.log(fields.filetoupload_backup);
                console.log(fields.mimetype_backup);
                doc['photo'] = fields.filetoupload_backup;
                doc['photo_mimetype'] = fields.mimetype_backup;
            }

        }

        if (req.path == '/create') {
            doc['score'] = fields.score;

            if (doc.score == ''){
                doc.score = 1
            }
        }

        doc['name'] = fields.name;
        doc['borough'] = fields.borough;
        doc['cuisine'] = fields.cuisine;
        doc['street'] = fields.street;
        doc['building'] = fields.building;
        doc['zipcode'] = fields.zipcode;
        doc['coord_lat'] = fields.coord_lat;
        doc['coord_lon'] = fields.coord_lon;
        doc['owner'] = req.session.userid;
        //console.log(doc);

    });
}

const create = (db, doc, callback) => {

    db.collection(collectionName).
        insertOne(doc, (err, results) => {
            assert.equal(err, null);
            console.log(`Inserted document(s): ${results.insertedCount}`);
            console.log(results);
            callback();
        });
}

const handle_Create = (res, doc) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let create_doc = {};

        create_doc.name = doc.name;
        create_doc.borough = doc.borough;
        create_doc.cuisine = doc.cuisine;
        create_doc.photo = doc.photo;
        create_doc.photo_mimetype = doc.photo_mimetype;
        create_doc.address = {
            street: doc.street,
            building: doc.building,
            zipcode: doc.zipcode,
            coord: [{
                coord_lon: doc.coord_lon,
                coord_lat: doc.coord_lat
                
            }]
        };

        create_doc.grades = [{
            user: doc.owner,
            score: doc.score
        }],
            create_doc.owner = doc.owner;

        let restaurant = new restaurantSchema(create_doc);
        restaurant.validate(function (err) {

            if (err) {
                //console.log(err);
                res.status(500).render("createForm", { error: err.message });
            }

            else {
                create(db, create_doc, () => {
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).render("displayCreate", { doc: doc });

                });
            }

        });
    });
}


const updateDetails = (req, res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let update_criteria = {};
        update_criteria['_id'] = ObjectID(criteria._id);

        find(db, update_criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            console.log(docs);

            res.status(200).render("updateForm", { docs: docs });

        });
        
    });
}

const update = (db, update_id, update_criteria, callback) => {
    db.collection(collectionName).updateOne(update_id,
        {
            $set: update_criteria
        },
        (err, results) => {
            assert.equal(err, null);
            console.log(results);
            console.log(`Updated document(s): ${results.result.nModified}`)
            callback();
        });
}

const handle_update = (res, req, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let update_id = {};
        update_id['_id'] = ObjectID(criteria._id);

        let update_criteria = {};

        update_criteria.name = criteria.name;
        update_criteria.borough = criteria.borough;
        update_criteria.cuisine = criteria.cuisine;
        update_criteria.photo = criteria.photo;
        update_criteria.photo_mimetype = criteria.photo_mimetype;
        update_criteria.address = {
            street: criteria.street,
            building: criteria.building,
            zipcode: criteria.zipcode,
            coord: [{
                coord_lon: criteria.coord_lon,
                coord_lat: criteria.coord_lat
                
            }]
        };
        update_criteria.owner = criteria.owner;

        console.log(update_criteria);

        let restaurant = new restaurantSchema(update_criteria);
 
        restaurant.validate(function (err) {

            if (err) {
                console.log(err);
                req.flash('error_msg', 'name is required!');
                res.redirect(req.get('referer')); // redirect to current page
            }

            else {
                update(db, update_id, update_criteria, () => {
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).render("displayUpdate", { criteria: criteria });
        
                });
            }

        });
    

    });
}

function indexPage(req, res, criteria) {

    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        find(db, {}, (therest) => {
            client.close();
            console.log("Closed DB connection");


            res.status(200).render("indexPage", { therest: therest, cri: criteria, userid: req.session.userid });

        });
    });
}

const find = (db, find_criteria, callback) => {
    const cursor = db.collection(collectionName).find(find_criteria);
    let therest = [];
    cursor.forEach((doc) => {
        therest.push(doc);
    }, (err) => {
        // done or error
        assert.equal(err, null);
        callback(therest);
    })
}
const handle_Find = (req, res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let find_criteria = {};
        find_criteria['_id'] = ObjectID(criteria._id);

        find(db, find_criteria, (docs) => {
            client.close();
            console.log(docs);
            console.log("Closed DB connection");
            res.status(200).render("findPage", { docs: docs, session_userid: req.session.userid});

        });
    });
}

const deleteDocument = (db, criteria, callback) => {
    db.collection(collectionName).deleteMany(criteria, (err, results) => {
        assert.equal(err, null);
        console.log(results);
        callback(results);
    })
}

const handle_Delete = (req, res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let delete_criteria = {};
        delete_criteria['_id'] = ObjectID(criteria._id);
        console.log(delete_criteria);


        deleteDocument(db, delete_criteria, (results) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render("displayDelete", { results: results });
        });



    });
}

const rate = (db, rate_id, rate_criteria, callback) => {
    db.collection(collectionName).updateOne(rate_id,
        {
            $push: rate_criteria
        },
        (err, results) => {
            assert.equal(err, null);
            console.log(results);
            console.log(`Updated document(s): ${results.result.nModified}`)
            callback();
        });
}


const handle_Rate = (req, res) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let rate_id = {};
        rate_id['_id'] = ObjectID(req.body._id);

        if (req.body.score == ''){
            req.body.score = 1
        }

        let rate_criteria = {};
        rate_criteria['name'] = 'name',
        rate_criteria['owner'] = 'owner',
        rate_criteria['grades'] = {
            user: req.session.userid,
            score: req.body.score
        };

        let restaurant = new restaurantSchema(rate_criteria);
 
        restaurant.validate(function (err) {

            if (err) {
                console.log(err);
                res.status(500).render("rateForm", { error: err.message });
            }
            else {
                delete rate_criteria["name"]
                delete rate_criteria["owner"]

                rate(db, rate_id, rate_criteria, () => {
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).render("rateForm", {success_msg:"rated successfully",
                                                        error_msg: 'you have rated',
                                                        _id: rate_id._id});
                });
            }

        });

    });
}

module.exports = {
    create,
    handle_Create,
    getDoc, update,
    updateDetails,
    handle_update,
    indexPage,
    find,
    handle_Find,
    deleteDocument,
    handle_Delete,
    handle_Rate,
    rate

};

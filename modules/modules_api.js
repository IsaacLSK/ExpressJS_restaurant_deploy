

const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const mongourl = process.env.DATABASE_URL;
  

const dbName = 'project';
const collectionName = 'restaurants';

const handle_api = (res, req) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        let find_criteria = {};
        find_criteria[`${req.params.field}`] = req.params.criteria;
        console.log(find_criteria);
        find(db, find_criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            res.json(docs); 
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
      assert.equal(err,null);
      callback(therest);
    })
  }


module.exports = {
    handle_api,
    find
};

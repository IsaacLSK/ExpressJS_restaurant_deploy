const express = require('express');
const router  = express.Router();


router.get("/leaflet", (req, res) => {
    res.render("leaflet.ejs", {
        lat: req.query.lat,
        lon: req.query.lon,
        zoom: req.query.zoom ? req.query.zoom : 15
    });
    res.end();
});

module.exports = router; 
var pool = require('../config/db')
var express = require('express')
var router = express.Router()

router.get('/', async function (req, res, next) {
    try {
        var users = await pool.query(`SELECT * from rss_user`)
        res.send(JSON.stringify({ "status": 200, "error": null, "response": users }))
    }
    catch (err) {
        throw new Error(err)
    }
});

module.exports = router;
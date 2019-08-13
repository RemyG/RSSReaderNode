var pool = require('../config/db')
var express = require('express')
var router = express.Router()

router.get('/', async function (req, res, next) {

    try {
        var feeds = await pool.query(`
            SELECT feed.id as feed_id, feed.title as feed_title, count(entry.id) as nb_entries, category.id as cat_id, category.name as cat_name
            from rss_feed feed
            join rss_category category on feed.category_id = category.id
            left outer join rss_entry entry on entry.feed_id = feed.id
            where !entry.read or entry.favourite
            group by feed.id, feed.title
        `)
        res.send(JSON.stringify({ "status": 200, "error": null, "response": feeds }));
    }
    catch (err) {
        throw new Error(err)
    }
})

router.get('/:feedId', async function (req, res, next) {

    try {
        var feed = await pool.query('SELECT * from rss_feed where id = ?', req.params.feedId)
        res.send(JSON.stringify({ "status": 200, "error": null, "response": feed }))
    }
    catch (err) {
        throw new Error(err)
    }
})

router.patch('/:feedId', async function (req, res, next) {

    if (req.body.read == "true") {
        await pool.query('UPDATE rss_entry entry set entry.read = true where entry.feed_id = ?', req.params.feedId)
    }
    if (req.body.read == "false") {
        await pool.query('UPDATE rss_entry entry set entry.read = false where entry.feed_id = ?', req.params.feedId)
    }
    res.send(JSON.stringify({ "status": 200, "error": null, "response": "OK" }));
})

router.get('/:feedId/entries', async function (req, res, next) {

    var filter = "";
    if (req.query.show != 'all') {
        filter += " and (!`read` or favourite)";
    }
    try {
        var results = await pool.query('SELECT * from rss_entry where feed_id = ?' + filter, req.params.feedId)
        let entries = results.map(e => {
            return {
                id: e.id,
                link: e.link,
                title: e.title,
                date: e.published,
                read: e.read,
                star: e.favourite
            };
        }).reduce(function (r, d) {
            if (d != null) {
                let key = d.date.toLocaleDateString();
                if (!r[key]) {
                    r[key] = { date: key, entries: [] };
                }
                r[key].entries.push(d);
            }
            return r;
        }, {});
        res.send(JSON.stringify({ "status": 200, "error": null, "response": entries }));
    }
    catch (err) {
        throw new Error(err)
    }
});

module.exports = router;
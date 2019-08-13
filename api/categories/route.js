var pool = require('../config/db')
var express = require('express')
var router = express.Router()

router.get('/', async function (req, res, next) {

    try {
        var feeds = await pool.query(`
            SELECT category.id as cat_id, category.name as cat_name, feed.id as feed_id, feed.title as feed_title, count(entry.id) as nb_entries
            from rss_feed feed
            join rss_category category on feed.category_id = category.id
            left outer join rss_entry entry on entry.feed_id = feed.id
            where (!entry.read or entry.favourite or entry.to_read)
            group by feed.id, feed.title
        `)
        let categories = feeds.reduce(function (r, d) {
            let key = d.cat_id;
            if (!r[key]) {
                r[key] = { id: d.cat_id, name: d.cat_name, feeds: [], count: 0 };
            }
            r[key].feeds.push(d);
            r[key].count += d.nb_entries;
            return r;
        }, {})
        res.send(JSON.stringify({ "status": 200, "error": null, "response": categories }));
    }
    catch (err) {
        throw new Error(err)
    }
})

module.exports = router;
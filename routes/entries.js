var express = require('express');
var router = express.Router();

var util = require('util')

router.get('/:entryId', async function (req, res, next) {
    res.locals.connection.query('SELECT * from rss_entry where id = ? order by published desc', [req.params.entryId], function (error, results, fields) {
        if (error) throw error;
        res.locals.connection.query("UPDATE rss_entry SET `read` = true WHERE id = ?", [req.params.entryId], function (updateError, updateResult, updateFields) {
            if (updateError) throw updateError;
        })
        let entry = results[0];
        res.locals.connection.query(`
            SELECT cat.id, feed.id, count(cat_entries.id) as cat_count, count(feed_entries.id) as feed_count
            FROM rss_category cat
            JOIN rss_feed cat_feeds on cat_feeds.category_id = cat.id
            JOIN rss_entry cat_entries on cat_entries.feed_id = cat_feeds.id
            JOIN rss_feed feed on feed.category_id = cat.id
            JOIN rss_entry feed_entries on feed_entries.feed_id = feed.id
            WHERE feed.id = ?
            GROUP BY cat.id, feed.id`, [results[0].feed_id], function (countError, countResult, countFields) {
                if (countError) throw countError
                console.log(countResult);
                entry['feed_count'] = countResult[0].feed_count
                res.send(JSON.stringify({ "status": 200, "error": null, "response": results[0] }));
            })
        
    });
});



module.exports = router;
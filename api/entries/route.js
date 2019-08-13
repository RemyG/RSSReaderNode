var pool = require('../config/db')
var express = require('express')
var router = express.Router()

router.get('/:entryId', async function (req, res, next) {

	try {
		var entries = await pool.query(`SELECT * from rss_entry where id = ?`, req.params.entryId)
		var entry = entries[0]
		await pool.query('UPDATE rss_entry entry SET entry.read = true WHERE id = ?', req.params.entryId)
		var feedCount = await pool.query(`
            SELECT category_id, feed.id as feed_id, count(entry.id) as feed_count
            FROM rss_feed feed
            JOIN rss_entry entry on entry.feed_id = feed.id
            WHERE feed.id = ? and (!entry.read or entry.favourite)`, entry.feed_id)
		var categoryCount = await pool.query(`
            SELECT cat.id as cat_id, count(entry.id) as cat_count
            FROM rss_category cat
            LEFT OUTER JOIN rss_feed feed on feed.category_id = cat.id
            LEFT OUTER JOIN rss_entry entry on entry.feed_id = feed.id
            WHERE cat.id = ? and (!entry.read or entry.favourite)`, feedCount[0].category_id)

		var resultEntry = {
			id: entry.id,
			read: entry.read,
			star: entry.favourite,
			date: entry.published,
			link: entry.link,
			title: entry.title,
			content: entry.content,
			category: {
				id: categoryCount[0].cat_id,
				count: categoryCount[0].cat_count
			},
			feed: {
				id: feedCount[0].feed_id,
				count: feedCount[0].feed_count
			}
		}

		res.send(JSON.stringify({ "status": 200, "error": null, "response": resultEntry }))
	}
	catch (err) {
		throw new Error(err)
	}
});

router.post('/:entryId/toggleRead', async function (req, res, next) {
	try {
		await pool.query('UPDATE rss_entry entry SET entry.read = !entry.read WHERE id = ?', req.params.entryId)
		var entries = await pool.query(`SELECT * from rss_entry where id = ?`, req.params.entryId)
		var entry = entries[0]
		var feedCount = await pool.query(`
            SELECT feed.id as feed_id, category_id, count(entry.id) as feed_count
            FROM rss_feed feed
            JOIN rss_entry entry on entry.feed_id = feed.id
            WHERE feed.id = ? and (!entry.read or entry.favourite)`, entry.feed_id)
		var categoryCount = await pool.query(`
            SELECT cat.id as cat_id, count(entry.id) as cat_count
            FROM rss_category cat
            LEFT OUTER JOIN rss_feed feed on feed.category_id = cat.id
            LEFT OUTER JOIN rss_entry entry on entry.feed_id = feed.id
            WHERE cat.id = ? and (!entry.read or entry.favourite)`, feedCount[0].category_id)

		var entryStats = {
			id: entry.id,
			read: entry.read,
			star: entry.favourite,
			category: {
				id: categoryCount[0].cat_id,
				count: categoryCount[0].cat_count
			},
			feed: {
				id: feedCount[0].feed_id,
				count: feedCount[0].feed_count
			}
		}

		res.send(JSON.stringify({ "status": 200, "error": null, "response": entryStats }))
	}
	catch (err) {
		throw new Error(err)
	}
})

router.post('/:entryId/toggleStar', async function (req, res, next) {
	try {
		await pool.query('UPDATE rss_entry entry SET entry.favourite = !entry.favourite WHERE id = ?', req.params.entryId)
		var entries = await pool.query(`SELECT * from rss_entry where id = ?`, req.params.entryId)
		var entry = entries[0]
		var feedCount = await pool.query(`
            SELECT feed.id as feed_id, category_id, count(entry.id) as feed_count
            FROM rss_feed feed
            JOIN rss_entry entry on entry.feed_id = feed.id
            WHERE feed.id = ? and (!entry.read or entry.favourite)`, entry.feed_id)
		var categoryCount = await pool.query(`
            SELECT cat.id as cat_id, count(entry.id) as cat_count
            FROM rss_category cat
            LEFT OUTER JOIN rss_feed feed on feed.category_id = cat.id
            LEFT OUTER JOIN rss_entry entry on entry.feed_id = feed.id
            WHERE cat.id = ? and (!entry.read or entry.favourite)`, feedCount[0].category_id)

		var entryStats = {
			id: entry.id,
			read: entry.read,
			star: entry.favourite,
			category: {
				id: categoryCount[0].cat_id,
				count: categoryCount[0].cat_count
			},
			feed: {
				id: feedCount[0].feed_id,
				count: feedCount[0].feed_count
			}
		}

		res.send(JSON.stringify({ "status": 200, "error": null, "response": entryStats }))
	}
	catch (err) {
		throw new Error(err)
	}
})

module.exports = router;
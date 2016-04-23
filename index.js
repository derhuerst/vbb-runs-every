'use strict'

const redis   = require('redis')
const db = redis.createClient()

const every = (where, next, when) => new Promise((yay, nay) => {
	when = when.valueOf()
	db.smembers(where + '-' + next, (err, data) => {
		if (err) return nay(err)
		data = data.map((ts) => 1000 * ts)

		console.log(data.map((x) => new Date(x)))
		const i = data.findIndex((ts) => ts > when)

	})
})

module.exports = every

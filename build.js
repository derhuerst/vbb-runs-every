'use strict'

const redis   = require('redis')
const through = require('through2')
const path    = require('path')
const data    = require('vbb-trips')



const db = redis.createClient()
db.on('error', console.error)

data.routes('all')
.on('data', (route) => {

	const set = db.multi()
	for (let i = 0; i < (route.stops.length - 1); i++) {
		const stop = route.stops[i]
		const next = route.stops[i + 1]
		for (let j = 0; i < route.when.length; i++) {
			const timestamp = route.when[i]
			set.sadd(stop.s + '-' + next.s, (stop.t + timestamp) / 1000)
		}
	}
	set.exec()

})
.on('end', () => db.save((err) => {
	if (err) console.error(err.stack)
	db.quit()
	console.log('Done.')
}))

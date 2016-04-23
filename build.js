'use strict'

const redis   = require('redis')
const data    = require('vbb-trips')
const through = require('through2')



const onError = (err) => {
	if (!err) return
	console.error(err.stack || err.message)
}

const db = redis.createClient()
db.on('error', onError)



data.routes('all')
.pipe(through.obj((route, _, cb) => {

	const set = db.multi()
	for (let i = 0; i < (route.stops.length - 1); i++) {
		const stop = route.stops[i]
		const next = route.stops[i + 1]
		for (let j = 0; j < route.when.length; j++) {
			const timestamp = route.when[j]
			set.sadd(stop.s + '-' + next.s, (stop.t + timestamp) / 1000)
		}
	}

	set.exec((err) => {if (err) return onError(err);cb()})
}))

.on('end', () => db.save((err) => {
	if (err) onError(err)
	db.quit(onError)
	console.log('Done.')
}))

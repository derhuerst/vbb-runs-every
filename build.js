'use strict'

const pipe = require('multipipe')
const data = require('vbb-trips')
const through = require('through2')
const ndjson = require('ndjson')
const zlib = require('zlib')
const fs = require('fs')



let routeI = 0

pipe(
	  data.routes('all')
	, through.obj(function (route, _, cb) {
		if (routeI % 100) process.stdout.write('.')
		for (let i = 0; i < (route.stops.length - 1); i++) {
			const stop = route.stops[i]
			const next = route.stops[i + 1]
			for (let j = 0; j < route.when.length; j++) {
				const timestamp = route.when[j]
				this.push([
					stop.s, next.s,
					route.lineId,
					(stop.t + timestamp) / 1000
				])
			}
		}
		routeI++
		cb()
	})
	, ndjson.stringify()
	, zlib.createGzip()
	, fs.createWriteStream('data.ndjson.gz')
	, (err) => {
		if (!err) return console.info('done')
		console.error('err', err.stack || err.message)
	}
)

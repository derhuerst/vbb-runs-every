'use strict'

const pipe = require('multipipe')
const data = require('vbb-trips')
const through = require('through2')
const ndjson = require('ndjson')
const fs = require('fs')



pipe(
	  data.routes('all')
	, through.obj(function (route, _, cb) {
		for (let i = 0; i < (route.stops.length - 1); i++) {
			const stop = route.stops[i]
			const next = route.stops[i + 1]
			for (let j = 0; j < route.when.length; j++) {
				const timestamp = route.when[j]
				this.push([stop.s, next.s, (stop.t + timestamp) / 1000])
			}
		}
		cb()
	})
	, ndjson.stringify()
	, fs.createWriteStream('data.ndjson')
	, (err) => {
		if (!err) return console.info('done')
		console.error('err', err.stack || err.message)
	}
)

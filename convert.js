'use strict'

const pipe = require('multipipe')
const slice = require('slice-file')
const ndjson = require('ndjson')
const through = require('through2')
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')



const src = require.resolve('vbb-trips/data/routes.ndjson')
const from = parseInt(process.argv[2])
const to = parseInt(process.argv[3])
if ('number' !== typeof from || 'number' !== typeof to) {
	console.error('invalid args')
	process.exit(1)
}



pipe(
	  slice(src).slice(from, to)
	, ndjson.parse()
	, through.obj(function (route, _, cb) {
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
		cb()
	})
	, ndjson.stringify()
	, zlib.createGzip()
	, fs.createWriteStream(path.join(__dirname, 'data', `${from}-${to}.ndjson.gz`))
	, (err) => {
		if (!err) return
		console.error(err)
		process.exit(1)
	}
)

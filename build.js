'use strict'

const process = require('process')
const child = require('child_process')
const queue = require('queue')
const os = require('os')

const convert = require.resolve('./convert')
const concurrency = os.cpus().length
console.log(`Building on ${concurrency} chains.`)

const src = require.resolve('vbb-trips/data/routes.ndjson')
const total = parseInt(child.execSync(`cat '${src}' | wc -l`).toString())
const chunk = 1000



const q = queue({concurrency})

q.on('error', (err) => {
	console.error(err)
	process.exit(1)
})



const add = (from, to) =>
	q.push((cb) => {
		console.log(`Starting job ${from}-${to}.`)
		child.execFile('node', [convert, '' + from, '' + to], (err) => {
			if (err) return cb(err)
			console.log(`Job ${from}-${to} finished.`)
			cb()
		})
	})

for (let offset = 0; offset < total; offset += chunk) {
	add(offset, Math.min(offset + chunk, total))
}

q.start()

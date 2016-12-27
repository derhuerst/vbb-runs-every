'use strict'

const process = require('process')
const child = require('child_process')
const queue = require('queue')
const os = require('os')

const convert = require.resolve('./convert')

const src = require.resolve('vbb-trips/data/routes.ndjson')
const total = parseInt(child.execSync(`cat '${src}' | wc -l`).toString())
const chunk = 1000



const q = queue({concurrency: os.cpus().length})

q.on('error', (err) => {
	console.error(err)
	process.exit(1)
})

q.on('success', (_, job) => {
	console.log('chunk', job.nr, 'finished')
})



const add = (from, to) => {
	const job = (cb) => {
		child.execFile('node', [convert, '' + from, '' + to], (err) => {
			if (err) cb(err)
			else cb()
		})
	}
	job.nr = from / chunk
	q.push(job)
}

for (let offset = 0; offset < total; offset += chunk) {
	add(offset, Math.min(offset + chunk, total))
}

q.start()

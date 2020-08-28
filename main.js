import { spider } from './spider.js'
import { TaskQueue } from './TaskQueue.js'
const url = process.argv[2] // (1)
const nesting = Number.parseInt(process.argv[3], 10) || 1
const concurrency = Number.parseInt(process.argv[4], 10) || 2
const spiderQueue = new TaskQueue(concurrency) // (2)

import clc from "cli-color"
spiderQueue.on('error', err=>console.log(clc.red(err)))
spiderQueue.on('empty', () => console.log(clc.green('Download complete')))
spider(url, nesting, spiderQueue) 
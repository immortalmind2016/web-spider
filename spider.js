
import fs from 'fs'
import path from 'path'
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { urlToFilename,getPageLinks } from './utils.js'

import clc from "cli-color"

function saveFile(filename, contents, cb) {
    mkdirp(path.dirname(filename), err => { // (3)
        if (err) {
            cb(err)
        } else {
            fs.writeFile(filename, contents, err => { // (4)
                if (err) {
                    cb(err)
                } else {
                    cb(null, filename, true)
                }
            })
        }
    })
}
function download(url, filename, cb) {
    console.log(`${clc.green('Downloading')} ${url}`)
    superagent.get(url).end((err, res) => {
        if (err) {
            return cb(err)
        }
        saveFile(filename, res.text, err => {
            if (err) {
                return cb(err)
            }
            console.log(`${clc.green('Downloaded and saved:')} ${url}`)
            cb(null, res.text)
        })
    })
}





function spiderLinks (currentUrl, body, nesting, queue) {
    if (nesting === 0) {
    return
    }
    const links = getPageLinks(currentUrl, body)
    if (links.length === 0) {
    return
    }
    links.forEach(link => spider(link, nesting - 1, queue))
   }
   
function spiderTask(url, nesting, queue, cb) { // (1) New param called queue
    const filename = urlToFilename(url)
    fs.readFile(filename, 'utf8', (err, fileContent) => {
        if (err) {
            if (err.code !== 'ENOENT') {
                return cb(err)
            }
            return download(url, filename, (err, requestContent) => {
                if (err) {
                    return cb(err)
                }
                spiderLinks(url, requestContent, nesting, queue) // (2)
                return cb()
            })
        }
        spiderLinks(url, fileContent, nesting, queue) // (3)
        return cb()
    })
}


//1. It manages the bookkeeping of the URLs already visited or in
// progress by using the spidering set.

// 2. It pushes a new task to the queue . Once executed, this task will
// invoke the spiderTask() function, effectively starting the
// crawling of the given URL.

const spidering = new Set() // (1)
export function spider (url, nesting, queue) {
 if (spidering.has(url)) {
 return
 }
 spidering.add(url)
 queue.pushTask((done) => { // (2)
 spiderTask(url, nesting, queue, done)
 })
}


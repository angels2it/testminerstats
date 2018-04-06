const fetch = require('node-fetch')
const moment = require('moment')
const path = require('path')
const fs = require('fs')

let opts = {
    wallet: '42FUchmwFoqW58T9CvKcnKWM8k3fSeuEsbGWfmKQD482fMYR116WKg8eY1pZjANUQ7RC99TV1ZsWXRPM6FhLKNsPHxVRMWV',
    interval: 5000, // 10 * 60 * 1000,
    statsUrl: 'http://localhost:2222/api.json',
    timeDiff: 'seconds'
}
let startTime = moment()

setInterval(getDataAndSaveToFile, opts.interval)

function log (...arg) {
    console.log(moment().format('YYYY-MM-DD hh:mm:ss'), arg)
}
function fetchNanoPoolData () {
    return new Promise((resolve, reject) => {
        fetch(`https://api.nanopool.org/v1/xmr/avghashrateworkers/${opts.wallet}`, {
        method: 'GET'
        })
        .then(res => res.json())
        .then(json => {
            resolve(json)
        })
        .catch(reject)
    })
}
function fetchStatsData() {
    return new Promise((resolve, reject) => {
        fetch(opts.statsUrl, {
        method: 'GET'
        })
        .then(res => res.json())
        .then(json => {
            resolve(json)
        })
        .catch(reject)
    })
}
function getDataAndSaveToFile () {
    let timeFromStart = moment().diff(startTime, opts.timeDiff)
    log(`${timeFromStart} ${opts.timeDiff} after running`)
    Promise.all([fetchStatsData(), fetchNanoPoolData()]).then((results, errors) => {
        if(errors){
            log(errors)
            return
        }
        let stats = results[0]
        let nanopool = results[1]
        fs.writeFileSync(`${moment().format('YYYY-MM-DD hh-mm-ss')}.json`, 
            JSON.stringify({
                time: timeFromStart,
                nanopool: nanopool,
                stats: stats
            }, null, 2))
    }).catch(log)
}
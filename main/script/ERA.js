import * as name from "./NAMES.js"
import { state } from "./STATE.js"
import { translate } from "./LANGUAGES.js"
import { meanings } from "./DICTIONARY.js"
import { RBH, random } from "./UTILS.js"
import { getRng } from "./SEED.js"

function getHighestRandomByFame(arr) {
    let f = arr.filter(e=>e.fame>0)
    let highest = f[0]
    for (let i in f){
        if (f[i].fame>highest.fame){
            highest = f[i]
        }
    }
    return highest
}

export function genEraV2(data){
    let date = data.calendar
    let mood = 0
    let avgMood = state.population.forEach(e=>
        {
            if (e){
                mood += e.mood
            }
        }
    )
    mood = mood/state.population.length
    let n = "stable"
    if (mood<=0.3){
        n = "depression"
    } else if (mood<=0.5){
        n = "stable"
    } else if (mood<=0.7){
        n = "great"
    } else {
        n = "golden"
    }
    n += " age of "+random(meanings)
    let lang = random(state.languages)
    return {
        name: translate(n, lang).translation,
        sub: null,
        langId: lang.id,
        translateOr: n,
        events: [],
        date: structuredClone(date)
    }
    
}

export function genEraName(data){
    let pop = data.pop
    let loc = data.loc
    let calendar = data.calendar
    let waterStatus = 0
    let foodStatus = 0
    for (const l of loc){
        waterStatus += l.resources.find(e=>e.item==="water").quantity
        foodStatus += l.resources.find(e=>e.item==="fruit").quantity
    }
    let n = "the common era"
    if (waterStatus<10000){
        n = "the droughts of "+name.GFN()
    }
    if (foodStatus<10000){
        n = "the famine of "+name.GFN()
    }
    if (foodStatus<10000&&waterStatus<10000){
        n = "the great depression of "+name.GFN()
    }
    let famous = pop.filter(e=>e&&e.fame>0)
    let mostFamous = null
    if (famous) mostFamous=getHighestRandomByFame(famous)
    if (mostFamous){
        let ad = ["great influence", "influence", "domination", "golden influence"][Math.floor(getRng()*4)]
        n = `the ${ad} of `+mostFamous.name
    }
    let sub = mostFamous?mostFamous:null
    return {
        name: n,
        subject: sub,
        date: {
            day: data.calendar.d
        }
    }
}
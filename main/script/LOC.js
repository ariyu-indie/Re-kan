import { send, format } from "./SEND.js"
import { state } from "./STATE.js"
import { place } from "./CLASSES.js"
import * as names from "./NAMES.js"
import { sleep } from "./HELPER.js"
import { random } from "./UTILS.js"
import { structId } from "./BUILDINGS.js"
import { meanings } from "./DICTIONARY.js"
import { translate } from "./LANGUAGES.js"
import { itemId } from "./ITEMS.js"
import { getRng } from "./SEED.js"

export let cache = {}

export function locId(id){
    if (cache[id]) return cache[id]
    let l = state.locations.find(e=>e&&e.id===id)
    if (l){
        cache[id] = l
        return l
    }
}

export function terrainType(x){
    if (x>0.8){
        return "mountain"
    } else if (x>0.7){
        return "jungle"
    } else if (x>0.5){
        return "forest"
    } else if (x>0.4){
        return "grassland"
    } else if (x>0.2){ 
        return "plains"
    } else {
        return "water"
    }
}

export function addRes(rpool, it, quan=0){
   let i = rpool.find(e=>e&&e.item===it)
   if (i){
       i.quantity += Math.round(quan)
   } else {
       let item = itemId(it)
       let t = item?.TYPE?item.TYPE:"unknown"
       let c = item?.CLASS?item.CLASS:"unknown"
       rpool.push({
           item: it,
           type: t,
           iClass: c,
           quantity: Math.round(quan)
       })
   }
}

export function generateResources(diff){
    let r = []
    addRes(r, "wood", (getRng()*1000000)*diff)
    addRes(r, "water", (getRng()*10000000)*diff)
    addRes(r, "strawberry", (getRng()*1000000)*diff)
    addRes(r, "apple", (getRng()*1000000)*diff)
    addRes(r, "nickel", (getRng()*1000)*diff)
    addRes(r, "iron", (getRng()*1000)*diff)
    return r
}

export async function genLoc(x){
    let mmm = send(`generating state.locations [0/${x}]`)
    let locs = []
    let dL = state.languages[Math.floor(state.GenSettings.domLang*state.languages.length)]
    for (let i=0;i<x;i++){
        let l = new place()
        l.id = Math.round(10**9+getRng()*10**10)
        //state.GLID++
        l.difficulty = getRng()
        l.resources = generateResources(l.difficulty)
        l.type = terrainType(l.difficulty)
        let semantics = l.type+" of "+random(meanings)
        if (dL){
            l.name = translate(semantics, dL).translation
        } else {
            l.name = `loc ${i}`
        }
        mmm.innerHTML = format(`generating state.locations [${i}/${x}]`)
        locs.push(l)
        cache[l.id] = l
        await sleep(0)
    }
    state.locations = locs
    mmm.innerHTML = format("done! [1/1]")
    await sleep(10)
    mmm.style.display = "none"
}

export function placePeople(){
    let lands = state.locations.filter(e=>e&&e.type!=="water")
    //console.log(lands)
    //let focus = random(lands)
    for (const i of state.STATICPOPULATION){
        let l = random(lands)
        //console.log(l)
        /*if (getRng()<0.01){
            focus = random(lands)
        }*/
        if (l){
            i.location = l.id
        }
    }
}

export async function connectLoc(){
    let mmm = send("connecting state.locations...")
    //let available = state.locations.filter(e=>e.connections.length<5)
    for (let i in state.locations){
        let a = state.locations[i]
        for (let o=0;o<10;o++){
            let b = random(state.locations)
            if (a.connections.length < 5 && b.connections.length < 5&&  !a.connections.includes(b.id) && !b.connections.includes(a.id) && a!==b){
                mmm.innerHTML = format(`connecting ${a.name} to ${b.name}... [${i}/${state.locations.length}]`)
                a.connections.push(b.id)
                b.connections.push(a.id)
            }
            //await sleep(0)
        }
        await sleep(0)
    }
    mmm.innerHTML = format("done! [1/1]")
    await sleep(10)
    mmm.style.display = "none"
}

export function dMap(x){
    send(
        `
    you are in ${x.name}, it is a region
    often classified as a ${x.type}
        `
    )
} //basically describes the location.

export function lookAround(loc, depth=1){
    if (loc.structures.length<=depth)depth=loc.structures.length
    let t = ""
    if (loc.structures.length<=0)t="no structures at all."
    for (let i=0;i<depth;i++){
        let str = structId(loc.structures[i])
        if (str){
            t += `a *${str.type}* named *${str.name}*, `
        }
    }
    t += "and so on"
    send(`
    you looked around, just nearby, there is ${t}
    `)
}
import { TextToNum } from "./SEND.js"
import { collect, useItem, hasItem, obtainItem, itemExist, itemId, consumeItem, appendItem } from "./ITEMS.js"
import { state } from "./STATE.js"
import { newJo } from "./PATHFINDING.js"
import { send, format } from "./SEND.js"
import { locId } from "./LOC.js"
import { newMem } from "./HUMANS.js"
import { structId, exitAB } from "./BUILDINGS.js"
import { random } from "./UTILS.js"
import { getRng } from "./SEED.js"

export function newGoal(x, verb, item = "", until = null, journey = null) { //UNTIL is deprecated
    let ID = ""
    if (verb) ID += TextToNum(String(verb))
    if (item) ID += TextToNum(String(item))
    if (
        x.curGoal?.ID === ID ||
        x.goals.some(g => g.ID === ID)
    ) {
        return false
    }
    const g = { verb, item, ID }
    if (journey?.A && journey?.B) {
        const path = newJo(journey.A, journey.B)
        if (!path || path.length === 0) return false
        g.journey = path
        g.step = 0
    }
    //if (until) g.until = until
    x.goals.push(g)
    return true
}

export function giveGoals(x) {
    // PANIC: hunger
    let consumables = state.itemDictv2.filter(e=>e&&e.TYPE==="organic")
    if (x.stats.saturation.val < 50) {
        x.goals.length = 0
        let f = random(consumables)
        if (f&&hasItem(x, f.NAME)) {
            consumeItem(x, f.NAME)
        } else if(f) {
            newGoal(x, "collect", f.NAME)
        }
        return
    }
    // WARNING: getting hungry
    if (x.stats.saturation.val < 55) {
        let f = random(consumables)
        if (f&&hasItem(x, f)) {
            consumeItem(x, f.NAME)
        } else if(f) {
            newGoal(x, "collect", f.NAME)
        }
    }
    // WARNING: getting thirsty, yhmm yes daddy
    if (x.stats.hydration.val < 55) {
        if (hasItem(x, "water")) {
            newGoal(x, "use", "water")
        } else {
            newGoal(x, "collect", "water")
        }
    }
    // PANIC: getting THIRSTY DEINK DIRNK NOMNOM
    if (x.stats.hydration.val < 20) {
        x.goals.length = 0
        if (hasItem(x, "water")) {
            newGoal(x, "use", "water")
        } else {
            newGoal(x, "collect", "water")
        }
    }
    // STOCKPILE if healthy
}

export function unt(x, a) {
    for (let i in a) {
        if (!(i in x.stats)) return false
        if (x.stats[i].val < a[i]) return false
    }
    return true
}

export function interpretGoals(x) {
    if (!x.curGoal) {
        if (x.goals.length > 0) {
            x.curGoal = x.goals.shift()
        }
        return
    }
    const a = x.curGoal
    if (a.verb === "enter") {
        let struct = state.structures.find(e=>e&&a.item===e.id)
        if (!struct||x.inside?.state){
            exitAB(x)
            x.curGoal = null
            return
        }
        let loc = state.locations.find(e=>e&&e.structures.find(o=>o&&o===struct.id))
        if (struct&&loc){
            if (loc.id===x.location){
                send("a building was entered")
                x.inside.state = true
                x.inside.structure = struct.id
            } else {
                newGoal(x, "enter", a.item)
                newGoal(x, "go", null, null, {A: locId(x.location), B: loc})
            }
        }
        return
    }
    if (a.verb === "use") {
        const item = x.inventory.find(e => e.item_name === a.item)
        if (!item) {
            newGoal(x, "collect", a.item)
            x.curGoal = null
            return
        }
        consumeItem(x, item.item_name)
        return
    }
    if (a.verb === "go") {
        if (x.inside.state || !a.journey || a.journey.length === 0) {
            x.curGoal = null
            return
        }
        if (a.step === undefined) a.step = 0

        if (a.step < a.journey.length) {
            const prev = locId(x.location)
            x.location = a.journey[a.step++].id
            x.areaInterest = 0
            let XLOC = locId(x.location)
            XLOC.visit++
            newMem(x, "i left "+prev.name)
            newMem(x, "i arrived at "+locId(x.location).name)
            if (state.player&& x === state.player) {
                send(`you left ${prev.name} and went to ${locId(x.location).name}`)
            }
        } else {
            x.curGoal = null
        }
        return
    }
    if (a.verb === "collect") {
        if (locId(x.location).resources.some(e => e.item === a.item && e.quantity > 0)) {
            appendItem(x, a.item, getRng()*10)
            giveGoals(x)
            if (getRng()<0.1&&x.location===state.player?.location){
                send(`*${x.name}* had gotten *${a.item}* recently.`)
            }
            x.curGoal = null
            return
        }
        const h = state.locations.find(
            e => e.resources?.some(r => r.item === a.item && r.quantity > 0)
        )
        if (h) {
            newGoal(x, "go", "", null, { A: locId(x.location), B: h })
        }
        x.curGoal = null
        return
    }
}
import { state } from "./STATE.js"
import * as names from "./NAMES.js"
import { structure } from "./CLASSES.js"
import { newMem } from "./HUMANS.js"
import { translate, langId, genText, createWord } from "./LANGUAGES.js"
import { sevenkeiwords } from "./DICTIONARY.js"
import { itemId } from "./ITEMS.js"
import { random } from "./UTILS.js"
import { getRng } from "./SEED.js"

export let buildings = []

export function structId(x){
    return state.structures.find(e=>e.id===x)
}

export function exitAB(x){
    if (x) return
    x.inside.state = false
    x.inside.structure = null
}

function newReq(it, q){
    return {
        item: it,
        quantity: q,
        met: 0
    }
}

function newBuilding(x){ //type
    let b = {}
    b.name = x
    b.requires = []
    b.resources = []
    return b
}

export function loadBuildings(){
    let house = newBuilding("house")
    house.requires.push(newReq("wood", 1))
    let library = newBuilding("library")
    library.requires.push(newReq("wood", 3))
    library.books = []
    let farm = newBuilding("farm")
    farm.requires.push(newReq("wood", 6))
    let mine = newBuilding("mine")
    mine.requires.push(newReq("wood", 5))
    let port = newBuilding("port")
    port.requires.push(newReq("wood", 10))
    let market = newBuilding("market")
    market.requires.push(newReq("wood", 2))
    market.itemsForSale = []
    buildings.push(house, library, farm, market, mine)
}

function genName(type, who){
    let nm = //random(who.languages[0].language.lexicon.filter(e=>e.meaning.length>0))
    random(sevenkeiwords)
    if (nm){
        let meaning = nm
        let txt = genText(langId(who.languages[0].language))
        /*let w = createWord(who.languages[0].language, 1)
        w.word = txt.text
        w.structure = txt.struct
        w.meaning = [meaning]
        who.languages[0].language.lexicon.push(w)*/
        return translate("the "+type+" of ", langId(who.languages[0].language)).translation+" "+txt.text
    }
}

export function build(who, type="house"){
    let t = buildings.find(e=>e&&e.name===type)
    if (t&&who&&who.languages[0]?.language){
        let s = new structure()
        s.state = "unfinished"
        s.id = Math.floor(10**9+getRng()*10**10)
        s.requires = [...t.requires]
        if (!who.pruned){
            who.stats.stamina.val -= 40
        }
        s.placedBy = who.id
        s.size = 4 //meters × meters
        s.peopleCap = 1
        s.ownedBy = who.id
        s.type = type
        s.name = genName(s.type, who)
        if (!who.pruned){
            who.adrenaline += 1
            let m1 = newMem(who, `i just built a ${type}`)
            m1.type = "building"
            m1.target = s.id
            m1.importance = 200
            m1.hp = 999
        }
        for (let i in t){
            if (!s[i]){
                s[i] = t[i]
            }
        }
        //console.log(s)
        state.structures.push(s)
        return s
    }
    return
}

export function buildFarm(who){
    if (who&&who.languages[0]?.language){
        let s = new structure()
        s.state = "unfinished"
        s.id = Math.floor(10**9+getRng()*10**10)
        s.materials = {}
        if (!who.pruned){
            who.stats.stamina.val -= 40
        }
        s.placedBy = who.id
        s.ownedBy = who.id
        s.type = "farm"
        s.name = genName(s.type, who)
        if (!who.pruned){
            who.adrenaline += 1
            let m1 = newMem(who, "i just built a farm!")
            m1.type = "building"
            m1.target = s.id
            m1.importance = 200
            m1.hp = 999
        }
        state.structures.push(s)
        return s
    }
    return
}
export function buildMarket(who){
    if (who&&who.languages[0]?.language){
        let s = new structure()
        s.state = "unfinished"
        s.id = Math.floor(10**9+getRng()*10**10)
        s.materials = {}
        s.itemsForSale = []
        if (!who.pruned){
            who.stats.stamina.val -= 30
        }
        s.placedBy = who.id
        s.ownedBy = who.id
        s.type = "market" 
        s.name = genName(s.type, who)
        if (!who.pruned){
            who.adrenaline += 1
            let m1 = newMem(who, "i just built a market!")
            m1.type = "building"
            m1.target = s.id
            m1.importance = 200
            m1.hp = 999
        }
        state.structures.push(s)
        return s
    }
    return
}
export function buildHouse(who){
    if (who&&who.languages[0]?.language){
        let s = new structure()
        s.state = "unfinished"
        s.id = Math.floor(10**9+getRng()*10**10)
        s.materials = {}
        if (!who.pruned){
            who.stats.stamina.val -= 30
        }
        s.placedBy = who.id
        s.ownedBy = who.id
        s.type = "house"
        s.name = genName(s.type, who)
        if (!who.pruned){
            who.adrenaline += 1
            let m1 = newMem(who, "i just built a house!")
            m1.type = "building"
            m1.target = s.id
            m1.importance = 200
            m1.hp = 999
        }
        state.structures.push(s)
        return s
    }
    return
}

export function buildLibrary(who){
    if (who&&who.languages[0]?.language){
        let s = new structure()
        s.state = "unfinished"
        s.id = Math.floor(10**9+getRng()*10**10)
        s.books = []
        s.materials = {}
        if (!who.pruned){
            who.stats.stamina.val -= 40
        }
        s.placedBy = who.id
        s.ownedBy = who.id
        s.type = "library"
        s.name = genName(s.type, who)
        if (!who.pruned){
            who.adrenaline += 1
            let m1 = newMem(who, "i just built a library!")
            m1.type = "building"
            m1.target = s.id
            m1.importance = 200
            m1.hp = 999
        }
        state.structures.push(s)
        return s
    }
    return
}
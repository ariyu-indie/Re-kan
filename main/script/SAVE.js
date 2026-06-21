import { state } from "./STATE.js"
import { send, format } from "./SEND.js"
import { look } from "./HUMANS.js"
import { absRand } from "./UTILS.js"

export function roughSizeOfObject(obj) {
    const seen = new Set()
    function sizeOf(obj) {
        if (obj === null) return 4
        if (typeof obj === "boolean") return 4
        if (typeof obj === "number") return 8
        if (typeof obj === "string") return obj.length * 2 // approx UTF-16
        if (typeof obj === "object") {
            if (seen.has(obj)) return 0
            seen.add(obj)
            let bytes = 0
            for (let key in obj) {
                if (Object.hasOwn(obj, key)) {
                    bytes += key.length * 2
                    bytes += sizeOf(obj[key])
                }
            }
            return bytes
        }
        return 0
    }
    return sizeOf(obj);
}

export function serialize(){
    let data = {info: null}
    data.info = {
        name: `REKAN-SAVE@${new Date().toISOString()}`,
        author: "Nico M Tinidora",
        game: {
            name: "RE'KAN",
            version: state.version
        },
        time: new Date().toISOString()
    }
    state.latest = null
    state.STATICPOPULATION.forEach(e=>e.image=null)
    for (let i in state){
        data[i] = state[i]
    }
    /*data.population = state.STATICPOPULATION
    data.structures = state.structures
    data.seedCur = state.seedCur
    data.constants = state.constants
    data.bits = state.bits
    data.MAP = state.MAP
    //data.itemDict = state.MAP
    data.languages = state.languages
    data.translations = state.translations
    data.animalPopulation = state.STATICANIMALS
    data.GameStarted = state.GameStarted
    data.GID = state.GID
    data.GLID = state.GLID
    data.HPU = state.HPU
    data.events = state.events
    data.player = state.player?state.player.id:null
    data.era = state.era
    data.locations = state.locations
    data.groups = state.groups
    data.calendar = state.cal
    data.playerTags = state.playerTags
    data.glt = state.glt
    data.globalLib = state.globalLib*/
    console.log(data)
    return data
}

function Corrupt(){
    send("*error*: checked integrity, file is [red]outdated[c] / [red]corrupted[c], try repairing it.")
}

export function download(title, bytes){
    let blob = new Blob([bytes], {type: "text/plain"})
    let url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    document.body.appendChild(a)
    a.href = url
    a.download = title
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

export function repairSave(content){
    const reqVar = Object.keys(state)/*[
        "population", "locations", "GameStarted",
        "GID", "GLID", "HPU", "events", "player",
        "era", "groups", "calendar", "glt", "globalLib",
        "animalPopulation", "languages", "translations"
    ]*/
    console.log(content)
    if (!(content.population&&content.locations)){
        send("*report*: file can't be repaired because of important missing components.")
        return false
    }
    const repair = {
        "HPU": 1,
        "player": absRand(content.population),
        "population": [],
        "animalPopulation": [],
        "GameStarted": true,
        "events": [],
        "calendar": {m: 1, d: 1, y: 1, h: 1},
        "GID": content.population,
        "GLID": content.locations.length
    }
    for (const key of reqVar){
        if (!content[key]){
            if (repair[key]){
                content[key] = repair[key]
                //n = false
            } else {
                send("*report*: file can't be repaired")
                return
            }
        }
    }
    content.info.name = "repaired-"+content.info.name
    content.info.game.version = version
    download(content.info.name, JSON.stringify(content, null, 2))
    send("*report*: file has been [green]*successfully* repaired[c]!")
    return true
}

export function checkIntegrity(content){
    const reqVar = Object.keys(state)
    /*const reqVar = [
        "population", "locations", "GameStarted",
        "GID", "GLID", "HPU", "events", "player",
        "era", "groups", "calendar", "glt", "globalLib",
        "animalPopulation", "languages", "translations"
    ]*/
    send(reqVar.map(e=>e).join(", "))
    const desc = {
        "HPU": "hour per unit, required for time, calendar, aging, etc",
        "glt": "global tags, for player state",
        "GID": "global id, required for generating new IDs for NPCs",
        "GLID": "global location ID, required for generating new IDs for locations",
        "animalPopulation": "contains animals",
        "STATICANIMALS": "archives of animals",
        "STATICPOPULATION": "archives of human entities",
        "languages": "contains languages",
    }
    const stop = [
        "animalPopulation",
        "STATICANIMALS",
        "STATICPOPULATION",
        "languages",
        "population",
        "locations"
    ]
    const deprecate = [
        "GID",
        "GLID",
        "AID"
    ]
    let n = true
    let err = 0
    let txt = "issues: <br>"
    for (const key of reqVar){
        if (stop.includes(key)&&!content[key]){
            txt += `• [red]Major variable MISSING[c] - ${key} var ${desc[key]?(": "+desc[key]):""}<br>`;
            n = false
            err ++
            //send(txt)
            //return {state: false, errors: err+1}
        }
        else if (!content[key]&&!deprecate[key]){
            txt += `• [red]Missing[c] - ${key} var ${desc[key]?(": "+desc[key]):""}<br>`;
            n = false
            err++
        }
    }
    for (const key of deprecate){
        if (content[key]){
            txt += `• [orange]deprecated[c] - ${key} var ${desc[key]?(": "+desc[key]):""}<br>`;
            n = false
            err++
        }
    }
    send(txt)
    return {state: n, errors: err}
}

export function load(content){
    send("loading file...")
    if (!content?.info&&
    !content.info.game?.name==="RE'KAN"
    ) {send("*error*: not a RE'KAN (.txt) file")}
    let verState = "([green]stable[c])"
    let checked = checkIntegrity(content)
    if (!checked.state){
        Corrupt()
        if (checked.errors>2){
            send(`file is [red]CORRUPTED[c] with >2 missing variable ([red]${checked.errors} Errors[c])`)
            return
        } else if (checked.errors>1){
            verState = "([red]unstable[c]) - <50%>not recommended to play<a>"
        } else {
            verState = "([orange]risky[c])"
        }
    }
    state.STATICPOPULATION = content.population
    state.languages = content.languages
    state.translations = content.translations
    state.STATICANIMALS = content.animalPopulation
    state.locations = content.locations
    state.GameStarted = content.GameStarted
    state.GID = content.GID
    state.GLID = content.GLID
    state.HPU = content.HPU
    state.events = content.events
    state.player = look(content.player?content.player:random(content.STATICPOPULATION).id)
    console.log(state.STATICPOPULATION)
    console.log(state.player)
    state.era = content.era
    state.groups = content.groups
    state.cal = content.calendar
    state.playerTags = content.playerTags
    state.glt = content.glt
    state.globalLib = content.globalLib
    send(`successfully loaded *//${content.info.name}* <br> • version-${content.info.game.version+" "+verState/*(content.info.game.version===version?"[green]stable[c]":"[red]not up to date[c]")*/} <br>you may now continue!`)
}
import { genBook, bookId, distribute } from "./BOOKS.JS"
import * as eraSys from "./ERA.JS"
import { generateAnimal, genAnimals, tame } from "./ANIMALS.js"
import { observable, waitUntil } from "./OBSERVABLES.js"
import { state } from "./STATE.js"
import { serialize, load, download, repairSave, checkIntegrity, roughSizeOfObject} from "./SAVE.js"
import { TextToNum, send, format } from "./SEND.js"
import { $, sleep } from "./HELPER.js"
import { random, sorter, RWCH } from "./UTILS.js"
import { structure, place, group, person } from "./CLASSES.js"
import { updBg, updWeatherImg, getImg, loadImgs } from "./IMAGES.js"
import { m, fm, onePersonPlease, genPeople, look, disNPC, newMem, shock, hasPartner, genImgForAll, genImg } from "./HUMANS.js"
import { useItem, hasItem, addItem, collect, loadItems, extendItem, consumeItem, appendItem, obtainItem } from "./ITEMS.js"
import { toDivine, toMortal } from "./DIVINITY.js"
import { BFS, reconstructPath, newJo, pathCache } from "./PATHFINDING.js"
import { newGoal, interpretGoals, giveGoals, unt } from "./GOAL.js"
import { locId, terrainType, addRes, generateResources, genLoc, placePeople, connectLoc, dMap, lookAround } from "./LOC.js"
import { buildFarm, buildMarket, buildHouse, buildLibrary, build, loadBuildings, structId } from "./BUILDINGS.js"
import { createLanguage, translate, langId, seperate, intelligibility, intellV2, borrowR, closeCognates } from "./LANGUAGES.js"
import { pregnant } from "./PREGNANCY.js"
import { approach, love, breakUp, checkMastery, nearPartner, talkOptions, bondWith, relation } from "./TALK&ROMANCE.js"
import { relive } from "./MEMORY.js"
import { BIC, applyDmg, visHP, WTRBD, CIF} from "./BODY.js"
import { inAFight, fId, combat, join, exitAF, checkSides, procFight, CIFON, assessHp, strDiff, newAttack } from "./COMBAT.js"
import { genHist } from "./HISTORY.js"
import { newGroup, newMember, hasMember, joinGr, newRank, exitAg, grId, claimed, claim, newRel } from "./GROUPS.js"
import { playerTags } from "./PLAYERTAGS.js"
import { createImagePerson, bootRekAssets } from "./APPEARANCEIMAGES.js"
import { genLoca, viewMap } from "./MAP.js"
import { update, u, w, c, iW, date, setFocus, removeFocus, focusMSG, upthedate, inside, struF } from "./MISC.js"
import { appendGoal, parseGoal } from "./GOALV2.js"
import { getRng } from "./SEED.js"
let startTheGame = true
let prevFPS = []
let memDeb = false
let memLimit = 2**8
let langBeingTranslated = null //createLanguage()
let showFullContentTranslation = false
let curLoc = ""
let prevLoc = ""
const startingMs = [
    "a bird that flies free, won't let itself be caged again.",
    "the limit is the sky",
    "the ocean swallows what is not committed to building a boat.",
    "the bravest warriors die knowing they will."
]
let aYear = 360
let aMonth = 30
if (state.settings.images){
    updBg(state.player)
    updWeatherImg(state.player)
}

async function updBy(x=100){ //update by how many ticks
    for (let i=0;i<x;i++){
        update()
        await sleep(0)
    }
}

function popUpd(){
    state.population = state.STATICPOPULATION.filter(e=>e&&e.state!=="dead")
}

async function goodsBadsRog(){
    send("loading goodsBadsRog scenario.")
    await genLang(1)
    state.locations = await genLoca(1, 1)
    await connectLoc()
    //console.log(state.locations)
    let goodiesLeader = onePersonPlease(18)
    let goodies = []
    let badiesLeader = onePersonPlease(18)
    let badies = []
    let rogues = []
    goodiesLeader.name = "good leader"
    badiesLeader.name = "bad leader"
    //state.player = goodiesLeader
    for (let i=0;i<4;i++){
        let good = onePersonPlease(18)
        good.name = "good "+i
        goodies.push(good)
        state.STATICPOPULATION.push(good)
    }
    for (let i=0;i<4;i++){
        let bad = onePersonPlease(18)
        bad.name = "bad "+i
        badies.push(bad)
        state.STATICPOPULATION.push(bad)
    }
    for (let i=0;i<4;i++){
        let rogue = onePersonPlease(18)
        rogue.name = "rogue "+i
        rogues.push(rogue)
        state.STATICPOPULATION.push(rogue)
    }
    state.STATICPOPULATION.push(goodiesLeader, badiesLeader)
    popUpd()
    await placePeople()
    combat(goodiesLeader, badiesLeader)
    for (const i of goodies){
        join(i, goodiesLeader.fight.id, goodiesLeader.fight.side)
    }
    for (const i of badies){
        join(i, badiesLeader.fight.id, badiesLeader.fight.side)
    }
    for (const i of rogues){
        join(i, badiesLeader.fight.id, "ROGUE")
    }
    await updBy(100)
}

async function groupsTest(){
    await genLang(1)
    state.locations = await genLoca(5,5)
    //console.log(state.locations)
    let a = onePersonPlease(18)
    let b = onePersonPlease(18)
    let c = onePersonPlease(18)
    let d = onePersonPlease(18)
    let e = onePersonPlease(18)
    let f = onePersonPlease(18)
    state.player = a
    state.STATICPOPULATION.push(a, b, c, d, e, f)
    popUpd()
    await placePeople()
    await sleep(1000)
    newGroup(a, [b])
    //console.log(grId(a.group.id).groupMembers)
    joinGr(c, a.group.id)
    joinGr(d, a.group.id)
    claim(grId(a.group.id), random(locId(a.location).connections))
    //await updBy(100)
    console.log(grId(a.group.id))
}

function firstIt(arr){
    return arr.length>0?arr[0]:null
}

async function itemGoalTest(){
    await loadItems()
    await genLang(1)
    await loadBuildings()
    state.locations = await genLoca(10,10)
    let loc = random(state.locations.filter(e=>e&&e.type!=="water"))
    let a = onePersonPlease(18)
    appendItem(a, "water", 10)
    appendGoal(a, "use", "water", 10)
    parseGoal(a)
    /*let b = build(a, "mine")
    //console.log(a)
    loc.structures.push(b.id)
    a.inside.state = true
    a.inside.structure = b.id
    appendItem(a, "pickaxe")
    //obtain*/
    state.STATICPOPULATION.push(a)
    await placePeople()
    await popUpd()
    //obtainItem(a)
    //console.log("personObj", a)
}

async function partnerTest(){
    await genLang(1)
    state.locations = await genLoca(1, 1)
    let a = onePersonPlease(18)
    let b = onePersonPlease(18)
    a.gender = "male"
    b.gender = "female"
    state.STATICPOPULATION.push(a, b)
    await placePeople()
    love(a, b)
    console.log(a, b)
    console.log(relation(a, b))
}
async function appearanceTest(){
    await genLang(1)
    state.locations = await genLoca(1, 1)
    let a = onePersonPlease(18)
    await toDivine(a)
    let i = genImg(a).then(e=>{
    //console.log(i)
    send(`<img width=100>${e.image}<img>`)
    })
    await placePeople()
}

//send("[align: center]<img width=100>./assets/BODYFEM.png<img>---hey")

async function playground(){
    await bootRekAssets()
    send("generating scenarios")
    let scene = "IT"
    if (scene==="GG"){
        groupsTest()
    } else if (scene==="IT"){
        itemGoalTest()
    } else if (scene==="AT"){
        appearanceTest()
    } else if (scene==="GT"){
        groupsTest()
    } else if (scene==="PT"){
        await partnerTest()
    } else if (scene==="GBR"){
        await goodsBadsRog()
    } else {
        send("loaded none.")
        startTheGame = true
        start()
        chnlog.addEventListener("click", ()=>{
            showChn = showChn?false:true
        })
        tick()
        sec()    
        console.log(chnlog)
        if (debug){
            debugLoop()
        }
    }
}

//playground()



/*function dBox(m, x, y){
    let d = document.createElement("div")
    d.style.position = "absolute"
    d.style.padding = "1px"
    d.style.minWidth = "0px"
    d.style.left = x+"px"
    d.style.top = y+"px"
    d.style.zIndex = 10
    let copy = document.createElement("div")
    copy.style.padding = "2px"p
    copy.style.width = "80px"
    copy.innerText = "copy"
    let close = document.createElement("div")
    close.style.padding = "2px"
    close.style.width = "80px"
    close.innerText = "close"
    d.appendChild(copy)
    d.appendChild(close)
    console.log("yes")
    document.body.appendChild(d)
    close.addEventListener("click", ()=>{
        document.body.removeChild(d)
    })
    copy.addEventListener("click",()=>{
        navigator.clipboard.writeText(m.innerText)
        document.body.removeChild(d)
    })
    return d
}*/

function check(t){
    if (t.length > 0){return true}
    return false
}

async function genLang(x){
    let l = []
    let m = send("k")
    for (let i=0;i<x;i++){
        let lang = createLanguage()
        l.push(lang)
        /*if (l.length>1){
            borrowR(l[0], lang, 3000)
        }*/
        m.innerHTML = format(`
        generating languages (${i})
        [${i}/${x}]
        `)
        await sleep(0)
    }
    for (let i=0;i<x*1;i++){
        l.push(seperate(random(l.filter(e=>!e.seperatedFrom)), getRng()*10))
        m.innerHTML = format(`
        generating languages (${i})
        [${i}/${x}]
        `)
        await sleep(0)
    }
    m.innerHTML = format("done [1/1]")
    send((JSON.stringify(l).length/1048576).toFixed(2)+"MB")
    state.languages = l
    await sleep(10)
    m.style.display = "none"
    return
}

async function placeLanguages(){
    for (const i of state.locations){
        let a = state.population.filter(e=>locId(e.location)===i)
        for (const ppl of a){
            ppl.languages.push(random(state.languages).id)
        }
    }
}

async function theBeginning(){
    state.seedCur = state.GenSettings.seed!==0?state.GenSettings.seed:Date.now()*performance.now()
    send(`*seed used* - ${state.seedCur}`)
    state.playerTags.generating.state = true
    await genLang(state.GenSettings.numOfLang)
    state.GenSettings.domLang = getRng()
    if (debug&&state?.languages){
        try{
        langEx.innerHTML = format(String(`
            languages examples:<br><br>
            *how are you? my name is Nico, and i made this game!*<br>
            ${state.languages.map(
            e=>"*"+e.name+
            ("*: **"+translate("how are you? my name is Nico, and i made this game!", e).translation)+
            "**<br>intelligibility with parent ("+(e.seperatedFrom?.language?e.seperatedFrom.language.name:"no parent")+"): "+(e.seperatedFrom?.language?(intellV2(e, e.seperatedFrom.language)*100).toFixed(2)+"%":"0%")).join("<br><br>")}<br><br>
            *the world is so beautiful, i can't wait to explore!*<br>
            ${state.languages.map(
            e=>"*"+e.name+"*: **"+translate("the world is so beautiful, i can't wait to explore!", e).translation+
            "**<br>intelligibility with parent ("+(e.seperatedFrom?.language?e.seperatedFrom.language.name:"no parent")+"): "+(e.seperatedFrom?.language?(intellV2(e, e.seperatedFrom.language)*100).toFixed(2)+"%":"0%")).join("<br><br>")}<br><br>
            *counting test*<br>
            ${state.languages.map(
            e=>"*"+e.name+"*: **"+translate("one two three four five six seven eight nine zero", e).translation+
            "**<br>intelligibility with parent ("+(e.seperatedFrom?.language?e.seperatedFrom.language.name:"no parent")+"): "+(e.seperatedFrom?.language?(intellV2(e, e.seperatedFrom.language)*100).toFixed(2)+"%":"0%")).join("<br><br>")}<br><br>
            *intelligibility test*<br>
            ${state.languages.map(e=>
                `*${e.name}*: intelligibility with firstLang (${state.languages[0].name}): ${(intellV2(state.languages[0], e)*100).toFixed(2)}%`
            ).join("<br><br>")}<br><br>
            *flipping test*<br>
            *${state.languages[0].name} is this much understandable to ${state.languages[1].name}*: ${(intellV2(state.languages[1], state.languages[0])*100).toFixed(2)}%<br>
            *${state.languages[1].name} is this much understandable to ${state.languages[0].name}*: ${(intellV2(state.languages[0], state.languages[1])*100).toFixed(2)}%
        `))
        } catch (e) {
            send(String(e))
            e
            throw e
        }
    }
    await genPeople(state.GenSettings.numOfHumans)
    /*if (state.settings.images){
        await genImgForAll()
    }*/
    state.population = state.STATICPOPULATION.filter(e=>e&&e.state==="alive")
    state.locations = await genLoca(state.GenSettings.numOfLocations, state.GenSettings.numOfLocations)
    //await connectLoc()
    await placePeople()
    //console.log(state.STATICPOPULATION)
    console.log(state.languages)
    //await placeLanguages()
    await genAnimals(state.GenSettings.numOfAnimals)
    for (const anim of state.STATICANIMALS){
        anim.location = random(state.locations)
    }
    state.playerTags.generating.state = false
    //console.log(intelligibility(nnnnn, state.languages[0]))
    //state.player= random(state.population)
    //toDivine(state.player)
    console.log(closeCognates(state.languages[0], state.languages[1]))
    /*console.log(state.population)
    console.log(state.locations)*/
    console.log(state.locations)
    //console.log(state.animalPopulation)
    //console.log(newJo(random(state.locations), state.locations[15]))
    await sleep(100)
    send(translate(random(startingMs), state.languages[0]).translation)
    await sleep(100)
    send("so, mortal, what do you wish to be?")
    send("[align: center] you wish to be a...<br> *( Commoner | Chosen | [#B9101F]Fallen God[c] | [yellow]God[c] | [f]custom[f])*")
    state.glt.askRole.value = true
    await waitUntil(state.glt.askRole, false)
    await sleep(100)
    for (let i=0;i<3;i++){
        toDivine(random(state.population))
    }
    send("do you wish to timelapse <20%>[red](recommended)[c]<a>?")
    state.glt.askTimeskip.value = true
    await waitUntil(state.glt.askTimeskip, false)
    state.player = random(state.population)
    //console.log(state.player)
    if (!state.player){
        send("[red]rejected[c]")
        theBeginning()
        return
    }
    send("**you** can now explore the world as it moves.")
    dMap(locId(state.player.location))
    if (state.glt.chosenStart==="god"){
        await toDivine(state.player)
    }
    if (state.glt.chosenStart==="fallen god"){
        await toDivine(state.player)
        toMortal(state.player)
    }
    if (state.glt.chosenStart==="custom"){
        state.playerTags.customChar.state = true
        let p = random(state.population)
        let locP = random(state.locations)
        let backstory = `you are born in  ${locP.name}`
        send(`---
            [align: center]*character creation*---
            name: ${p.name}---
            age: ~${Math.round(p.age)}---
            gender: ${p.gender}---
            level: (commoner, fallenGod, god)---
            backstory: ${backstory}
            ---
        `)
    }
    else {
        send(`
        your name is **${state.player.name}** 
        and is seen as a ${state.player.level}, 
        you are ${Math.round(state.player.age)} years old,
        is biologically a ${state.player.gender},
        you can speak ${state.player.languages.map(e=>e&&"the language of *"+langId(e.language).name+`* at a ${checkMastery(e.mastery)} level`).join(", ")}
        ${state.player.group.id?`, and you are from the group *${grId(state.player.group.id).name}*`:""}`)
        send(`today is a ${locId(state.player.location).rain.state?"rainy":"sunny"} day, and to help you begin, you can type "idle" for your next turn.`)
        lookAround(locId(state.player.location), 3)
        addItem(state.player, "divineCrystal", 1)
        //newGoal(player, "go", null, null, {A: locId(state.player.location), B: random(state.locations)})
        //newGoal(player, "use", "water")
        //console.log(state.player)
        state.met.push(state.player.id)
        update()
    }
    console.log(state.translations)
    //console.log(state.globalLib.filter(e=>e.read>10))*/
}

let ticksPerSec = 60
let ticks = 0
function sec(){
    if (prevFPS.length<=3){
        prevFPS.push(ticksPerSec)
        if (prevFPS.length>3){
            prevFPS.shift()
        }
    } else {
        prevFPS.shift()
        //prevFPS.push(ticksPerSec)
    }
    setTimeout(()=>{ticksPerSec=ticks;ticks=-1;requestAnimationFrame(sec)}, 1000)
    if (memDeb){
        let data = serialize()
        let size = JSON.stringify(data).length
        $("space").innerText = format(`${(size/(1024*1024)).toFixed(2)}mb (${((size/(1024*1024))/memLimit).toFixed(2)}%)`)
        $("limit").innerText = format(`${parseFloat(memLimit)}mb`)
        $("FPS").innerText = format(`${ticksPerSec}/s (avg ${(prevFPS.reduce((sum, e)=>{return sum + e}, 0)/prevFPS.length).toFixed(2)}FPS)`)
    }
}
console.log(getRng)
//localStorage
async function tick(){
    chlog()
    $("focus").innerHTML = focusMSG?focusMSG.innerHTML:""
    ticks++
    requestAnimationFrame(tick)
}

function displayStatus(x){
    //console.log(x)
    let a = ""
    for (let i in x.stats){
        //console.log(x)
        if (i==="hp"){
            let hp = visHP(x)
            a += `${i}: (${hp.p.toFixed(2)}%) [${hp.current.toFixed(2)}/${hp.max.toFixed(2)}]`
        } else {
            a += `${i}: (${x.stats[i].val.toFixed(2)}/${x.stats[i].max.toFixed(2)}) [${x.stats[i].val}/${x.stats[i].max}]`
        }
    }
    return a
}

//feb 5-6 - triple dash revolution!

function showInv(x){
    let a = "[align: center]*inventory*---"
    for (let i in x.inventory){
        a += `${x.inventory[i].item_name}: ${x.inventory[i].quantity.toFixed(2)}`
        if (i!==x.inventory.length-1){
            a += "---"
        }
    }
    send(a)
}

function showStruct(x, type="house"){
    let a = locId(x.location).structures.filter(e=>structId(e).type===type)
    let txt = `[align: center]you looked into the local registered *${type}* the following structures are: ---`
    for (const s of a){
        let stru = structId(s)
        txt += stru.name + " - " +
        (stru.state==="finished"?"[green]finished[c]":"[red]unfinished[c]") + " " + 
        (stru.itemsForSale?"["+stru.itemsForSale.length+"]":"")+"---"
    }
    return txt
}

async function timelapse(time, hpu=1){
    state.HPU = hpu>0?hpu:1
    let m = send("")
    for (let i=0;i<time;i++){
        update()
        m.innerHTML = format(`timelapsing... [${i}/${time}]`)
        await sleep(0)
    }
    state.HPU = 1
}

function toFeet(x){
    let r = Math.floor(x)
    let dec = x-r
    //console.log(dec)
    let inch = Math.floor(dec*12)
    return r+"\'"+inch
}

//console.log(typeof 5)

function typeOf(data){ //these are from my projects...
    if (typeof data === "string"){
        return "str"
    } else if (typeof data === "object"){
        for (let i=0;i<data.length;i++){
            if (data[i]){
                return "array"
            }
        }
        return "dictionary"
    } else if (typeof data === "number"){
        let a = data
        let b = Math.round(data)
        let c = a - b
        if (c == 0){
            return "int"
        } else {
            return "decimal"
        }
    } else if (typeof data === "boolean"){
        return "bool"
    }
    return "unknown"
}

function transform(str){
    let a = /\b(\d+)\b/.test(str)
    let b = /\b(true)\b/.test(str)
    let c = /\b(false)\b/.test(str)
    if (a){
        return typeOf(str)==="int"?parseInt(str):parseFloat(str)
    }
    if (b){
        return true
    } 
    if (c){
        return false
    }
    return undefined
}

//console.log(typeOf([1, 2, 3]))

//console.log(toFeet(63.57))

async function checkCmd(cmd){
    state.latest.innerHTML = format(`*you*: ${cmd}`)
    if (!startTheGame) {
        send("playground mode is on")
        //return
    }
    if (state.glt.cutscenes){
        document.getElementById("chatbox").removeChild(state.latest)
    }
    if (state.playerTags.generating.state){
        document.getElementById("chatbox").removeChild(state.latest)
        let n = send("command can't be *processed* mid-generation!")
        setTimeout(async ()=>{
            for (let i=100;i>0;i--){
                n.style.opacity = i+"%"
                await sleep(0)
            }
            document.getElementById("chatbox").removeChild(n)
        }, 2000)
        return
    }
    if (state.playerTags.timelapsing.state){
        send("you are *timelapsing*!")
        return
    }
    if (state.playerTags.customChar.state){
        return
    }
    if (langBeingTranslated){
        if (cmd==="exit"){
            langBeingTranslated = null
            send("you've exitted language translation.")
        } else {
            if (showFullContentTranslation){
                let a = translate(cmd, langBeingTranslated)
                send(`
                *Language Name*: ${a.language}<br>
                *Translating*: ${a.translating}<br>
                *Result*: ${a.translation}<br>
                *Meanings*: <br>${a.structure}<br>
                *UsedInContext*: <br>${a.used}<br>
                `)
            } else {
                send(translate(cmd, langBeingTranslated).translation)
            }
        }
        return
    }
    if (cmd.toLowerCase()==="filesize"){
        let data = serialize()
        let size = JSON.stringify(data).length
        //let size = msgpack.encode(data)
        send("saving this requires: "+(size/(1024*1024)).toFixed(2)+"MB of storage.")
        return
    }
    if (inAFight(state.player)&&state?.playerTags?.methodOfAtk?.state){
        let t = look(state.playerTags.focusedAtk.who)
        let f = fId(state.player.fight.id)
        let move = String(cmd)
        let moveObj = state.attacks.find(e=>e&&e.name===move)
        if (!f){
            state.playerTags.methodOfAtk.state = false
            return
        }
        if (moveObj){
            let viable = Object.keys(t.stats.hp)
            let part = []
            for (const i of viable){
                if (t.stats.hp[i].val>0){
                    part.push({
                        i: t.stats.hp[i].val
                    })
                }
            }
            part = RWCH(part)
            let res = true
            let totalDmg = moveObj.damage
            if (getRng()<state.player.combat.critCH){
                totalDmg *= state.player.combat.crit
            }
            if ((getRng()>moveObj.success)&& 
            (getRng()>Math.min(t.combat.dodgeCH, 0.9999))
            &&t.stats.stamina.val>=50){
                res = false
                f.log.innerHTML += format(`*you* [gray]missed[c] your attack!`)+"<br><br>"
                f.raw.push(`*you* [gray]missed[c] your attack!`)
                //applyDmg(t, part, 10)
                send("*you* [gray]missed[c] your attack!")
                //update()
            } else {
                applyDmg(t, part, totalDmg)
                f.log.innerHTML += format(`*you've* *[green]successfully[c]* used ${cmd.toLowerCase()} against ${t.name}!`)+"<br><br>"
                f.raw.push(`*you've* *[green]successfully[c]* used ${cmd.toLowerCase()} against ${t.name}!`)
                send(`*you've* *[green]successfully[c]* used ${cmd.toLowerCase()} against ${t.name}! leaving them ${assessHp(visHP(t).p)}`)
            }
            update()
            if (checkSides(f)<=1){
                let opp = f.STATICPART.filter(e=>e&&e.side!==state.player.fight.side)
                if (f.participants.find(e=>e&&e.obj===state.player.id)){
                    if (opp.length<=1){
                        let obj = look(opp.find(e=>e).obj)
                        //send("A")
                        //console.log(obj)
                        if (obj){
                            state.player.victories.push({
                                title: `i won a fight against ${obj.name}`,
                                obj: obj.id,
                                level: obj.level,
                                numOfOpp: opp.length
                            })
                        }
                    } else {
                        state.player.victories.push({
                            title: `i won a fight against ${opp.length} opponents!`,
                            numOfOpp: opp.length
                        })
                    }
                }
                for (const i of opp) {
                    let a = look(i.obj)
                    if (a) {
                        let m = newMem(a, "i lost a fight!", "bad", "angry")
                        m.importance = 1000
                        m.hp = 1000
                        m.type = "combat"
                        a.mood -= 0.1
                    }
                }
                console.log(state.player)
                exitAF(state.player)
                send("the fight ended.")
            }
            //send("[align: center]actions---attack")
        }
        state.playerTags.methodOfAtk.state = false
        return
    }
    if (inAFight(state.player)&&state?.player&&state?.playerTags?.whoAtk?.arr){
        let arr = state.playerTags.whoAtk.arr
        if (arr[parseInt(cmd)]){
            send("how should you attack this person?")
            send(`[align: center]*attacks*---${state.attacks.map(e=>`*${e.name}* - damage: *${e.damage.toFixed(2)}*/ defense: *${e.defense.toFixed(2)}*`).join("---")}`)
            state.playerTags.focusedAtk.who = arr[parseInt(cmd)].obj
            state.playerTags.whoAtk.arr = null
            state.playerTags.methodOfAtk.state = true
            //checkCmd("")
            return
        }
    }
    if (state?.player&&inAFight(state.player)){
        let fight = fId(state.player.fight.id)
        if (visHP(state.player).p<20){
            send("you are severely injured!")
        }
        if (checkSides(fight)<=1){
            send("you left the fight.")
            send("B")
            exitAF(state.player)
        } else if (fight&&cmd.toLowerCase()==="flee"){
            exitAF(state.player)
            send("you fled the fight!")
        } else if (fight&&cmd.toLowerCase()==="attack"){
            send("you are now attacking!")
            if (checkSides(fight)>=2){
                send(`who do you attack? (you are ${state.player.fight.side} side)`)
                let enemies = fight.participants.filter(e=>e&&e.side!==state.player.fight.side)
                send(`list:<br>${enemies.map((e, index)=>index+": *"+look(e.obj).name+`* (${e.side})`).join("<br>")}`)
                state.playerTags.whoAtk.arr = enemies
                //checkCmd("")
            } /*else if (checkSides(fight)===2) {
                let opp = fight.participants.find(e=>e&&e.obj!==state.player.id)
                if (opp){
                    send("you are attacking "+look(opp.obj).name)
                    state.playerTags.focusedAtk.who = opp.obj
                    state.playerTags.methodOfAtk.state = true
                    state.attacks = state.player.attacks
                    send(`*attacks*---${state.attacks.map(e=>`*${e.name}* - ${e.damage}`).join("---")}`)
                }
            }*/ else {
                exitAF(state.player)
                send("C")
                send("you left the fight.")
            }
            return
        }
    }
    if (state.playerTags.askToTame.state&&state.playerTags.askToTame.animalObj){
        if (cmd.toLowerCase()==="yes"){
            if (tame(state.player, state.playerTags.askToTame.animalObj)){
                send("you successfully tamed the animal!")
            } else {
                send("you failed to tame the animal, and it took off.")
            }
            state.playerTags.askToTame.state = false
            state.playerTags.askToTame.animalObj = null
        } else if (cmd.toLowerCase()==="no"){
            state.playerTags.askToTame.state = false
            state.playerTags.askToTame.animalObj = null
            send("you turned your head, and walked away from the animal.")
        } else {
            state.playerTags.askToTame.state = false
            state.playerTags.askToTame.animalObj = null
            send("the animal left.")
        }
        return
    }
    
    if (state.glt.askRole.value){
        if (["commoner", "chosen", "fallen god", "god", "custom"].includes(cmd.toLowerCase())){
            if (cmd.toLowerCase()==="custom"){
                send("alright!")
                //state.glt.askRole.value = false
                //return
            } else if (cmd.toLowerCase()==="commoner"){
                send("humble beginnings indeed...")
                await sleep(500)
                send("you have limitless potential...")
            } else if (cmd.toLowerCase()==="chosen"){
                send("a life with assistance and plot armor, interesting.")
            } else if (cmd.toLowerCase()==="god") {
                send("oh, my divine majesty, you are to rule this world with grace... or the opposite, it's up to you.")
                await sleep(500)
                send("but **unfortunately**, you'd need *faith* to heal and use your abilities effectively.")
            } else {
                send(`oh... a fallen "god" huh? well, go on.`)
                await sleep(500)
                send(`let me tell you a little secret, fallen gods don't need faith...`)
            }
            state.glt.askRole.value = false
            state.glt.chosenStart = cmd.toLowerCase()
        } else {
            send("huh, nonsense.")
        }
        return
    }
    let a = cmd.split(/\s+/g)
    let pt = state.playerTags
    if (pt.modifySettings.state){
        if (cmd.toLowerCase().includes("go")){
            pt.modifySettings.state = false
            state.GameStarted = true
            await theBeginning()
            return 
        }
        let setting = a[0]
        let value = a[1]
        send(`${setting} - ${value}`)
        state.seedCur = state.GenSettings.seed!==0?state.GenSettings.seed:Date.now()*performance.now()
        //send(`${state.GenSettings[setting]} - ${value}`)
        if (setting&&value){
            if (setting in state.GenSettings){
                if (typeOf(state.GenSettings[setting])===typeOf(transform(value))){
                    state.GenSettings[setting] = value
                    send(`${setting} has been set to ${state.GenSettings[setting]}`)
                } else {
                    send("incorrect value.")
                }
            } else {
                send("setting not found")
            }
        }
        return
    }
    let allModes = ["normal"]
    if (state.glt.pickModes){
        let com = cmd.toLowerCase()
        if (com==="normal"){
            send("[align:center]---THE WORLD HAS BEGUN---")
            state.seedCur = state.GenSettings.seed!==0?state.GenSettings.seed:Date.now()*performance.now()
            let txt = ""
            for (let i in state.GenSettings) {
                txt += `*${i}* - ${state.GenSettings[i]}---`
            }
            txt += "to edit type **settingsName** **newValue** and after finishing, type \"go\""
            send(`[align: center] *settings*---${txt}`)
            state.playerTags.modifySettings.state = true
            //state.GameStarted = true
            //await theBeginning()
        }
    }
    if (state.glt.askTimeskip.value){
        let k = cmd.toLowerCase()
        if (k==="yes"){
            send("alright, giddy up!")
            const m = send(`${state.cal.m} / ${state.cal.d} / ${state.cal.y}`)
            setFocus(m)
            const hint = random(state.GAMEHINTS)
            state.HPU = 179
            state.playerTags.timelapsing.state = true
            for (let o=0;o<=360*state.GenSettings.timelapseLength;o++){
                await update()
                let str = state.structures.filter(e=>e&&e.state==="finished").length
                let f = state.player?state.player:state.STATICPOPULATION[0]
                m.innerHTML = format(`[align: center] ${date()} [${locId(f.location).structures.filter(e=>e&&structId(e)?.state==="finished").length}] [${str}] [${state.population.length}] [${o}/${360*state.GenSettings.timelapseLength}] hint: ${hint}`)
                await sleep(1)
            }
            removeFocus()
            state.playerTags.timelapsing.state = false
            state.HPU = 1
            state.glt.askTimeskip.value = false
        } else if(k==="no") {
            state.playerTags.timelapsing.state = false
            state.HPU = 1
            state.glt.askTimeskip.value = false
        } else {
            if (state.glt.timesAskedTime<3){
                send("[ YES / NO ]")
                state.glt.timesAskedTime++
            } else if (state.glt.timesAskedTime===3){
                state.glt.cutscenes = true
                send("*???*: are you serious...?")
                await sleep(1000)
                send("*???*: that's a simple YES or NO question...")
                await sleep(2000)
                send("...")
                await sleep(1000)
                send("*???*: be better.")
                await sleep(1000)
                send("*???*: now choose [ YES / NO ]")
                state.glt.timesAskedTime++
                state.glt.cutscenes = false
            } else if (state.glt.timesAskedTime===10){
                state.glt.cutscenes = true
                send("*???*: okay, you're clearly not following my orders.")
                await sleep(1000)
                send("*???*: let me just check if i can... oh, there, now i forced you to say yes.")
                send("**clicks**")
                state.glt.cutscenes = false
                await sleep(1000)
                checkCmd("yes")
                //state.glt.timesAskedTime++
            } else {
                send("...")
                state.glt.timesAskedTime++
            }
            return
        }
        //return
    }
    //PLAYER TAGS
    //await sleep(500)
    if (playerTags(a, cmd)){
        return
    }
    for (let o in a){
        let n1 = a[o].toLowerCase()
        let n2 = a[+o+1]?a[+o+1].toLowerCase():null
        if (n1==="resume"&&state.player&&!state.GameStarted){
            state.GameStarted = true
            send("game resumed.")
        } else if (n1==="play"){
            if (!state.GameStarted&&state.player){
                state.GameStarted = true
                send("game resumed.")
            } else if (state.GameStarted){
                send("[red]Game has already started![c]")
            } else {
                state.glt.pickModes = true
                send(`[align:center] *choose a mode!*---(${allModes.map(e=>"*"+e+"*").join("|")})`)
            }
        } else if (n1==="repair"){
            if (!state.GameStarted){
                const input = document.createElement("input")
                input.type = "file"
                input.style.display = "none"
                input.accept = `.txt,.json`
                input.onchange = (e)=>{
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    reader.onload = (event)=>{
                        const content = event.target.result
                        try {
                            repairSave(JSON.parse(content))
                        } catch (e) {
                            if (e instanceof SyntaxError){
                                send(`*error*: yeah, no. We're not gonna load that, that's not a valid file.`)
                            } else {
                                send(`*error*: ${e}`)
                            }
                            //throw e
                        }
                    }
                    reader.onerror = (event)=>{
                        send(`*error*: ${event}`)
                    }
                    reader.readAsText(file)
                    input.remove()
                }
                document.body.appendChild(input)
                input.click()
            } else {
                send("game has already started!")
            }
        } else if (n1==="load"){
            if (!state.GameStarted){
                const input = document.createElement("input")
                input.type = "file"
                input.style.display = "none"
                input.accept = `.txt,.json`
                input.onchange = (e)=>{
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    reader.onload = (event)=>{
                        const content = event.target.result
                        try {
                            load(JSON.parse(content))
                            update()
                            if (state.settings.images){
                                updWeatherImg()
                                updBg(state.player)
                            }
                        } catch (e) {
                            if (e instanceof SyntaxError){
                                send(`*error*: yeah, no. We're not gonna load that, that's not a valid file.`)
                            } else {
                                send(`*error*: ${e}`)
                            }
                            //throw e
                        }
                    }
                    reader.onerror = (event)=>{
                        send(`*error*: ${event}`)
                    }
                    reader.readAsText(file)
                    input.remove()
                }
                document.body.appendChild(input)
                input.click()
            } else {
                send("game has already started!")
            }
        } else if (n1==="group"){
            if (state.player.group.id){
                let obj = grId(state.player.group.id)
                if (obj){
                    send(`you are living and under protection of the group *${obj.name}*, and your rank is *${state.player.group.rank}*`)
                }
            }
        } else if (n1==="eras"){
            let p = n2?parseInt(n2):1
            if (p){
                let page = `
                [align: center]*eras*:---
                `
                for (const i of state.era){
                    let pNo = state.era.indexOf(i)
                    let cond = (pNo<=3||pNo>=(3*p)&&pNo<=(6*p))
                    if (cond){
                        page += `${i.name} - *${i.date.m}/${i.date.d}/${i.date.y}* : it is translated from the language of *${langId(i.langId).name}* meaning *${i.translateOr}*---`
                    }
                }
                send(page)
            }
        } else if (n1==="war"){
            send("has been paused...")
            /*let A = random(state.groups)
            let B = random(state.groups)
            if (A&&B&&A!==B){
                newRel(A, B, "war")
                send(`successful... ${A.name} is now with war with ${B.name}`)
            } else {
                send("try again...")
            }*/
        } else if (n1==="pets"){
            send(`
            you checked your pets list:---
            ${state.animalPopulation.filter(e=>e.loves.includes(state.player.id)).map(e=>"• *"+e.name+`* - you tamed this animal, it is a ${e.species}.`).join("---")}---
            -end-
            `)
        } else if (n1==="map"){
            if (state.MAP.image){
                let m = await viewMap()
                send(`
                [align: center]
                *world map*---
                <img width=200 height=200>${m}<img>---
                ${state.groups.map(e=>`group: *${e.name}*<br>
                *territory*: ${e.territory.length}<br>
                *structures*: ${e.territory.reduce((sum, loc)=>{
                    if (loc){
                        return sum+locId(loc.loc).structures.length
                    }
                },0)}<br>
                *population*: ${e.groupMembers.length}
                `).join("---")}`)
            } else {
                send("map not generated yet.")
            }
        } else if (n1==="new"){
            state.GameStarted = true
            state.STATICPOPULATION = []
            state.locations = []
            state.player = null
            if (state.settings.images){
                updWeatherImg(state.player)
                updBg(state.player)
            }
            await theBeginning()
        } else if (n1==="exit"){
            state.GameStarted = false
            send("you've exitted gameplay, type \"resume\" if you wish to continue.")
            send(
                `[align: center]*MENU*:---
                resume/play---
                historical figures---
                languages
                `
            )
        } else if (n1==="help"){
            send(`[align: center]*commands*:---
            • *status* - shows your status---
            • *exit* - pause---
            • *new* - create and start a new game, [red]warning: erases previous progress![c]---
            • *map* - view your map---
            • *trade* - choose a specific market to trade with---
            • *nearby* - view who's nearby.---
            • *talk* - talk to anyone nearby.---
            • *pets* - view your pets.---
            • *go* - switch location---
            • *animals* - try and find an animals---
            • *idle* - stand still---
            • *use* [item] [count?] - use an item---
            • *view* [type] - check structures---
            • *buy* - approach the closest market and trade.
            `)
        } else if (state.GameStarted){
            if (n1==="use"){
                let item = a[+o+1]?a[+o+1]:null
                let count = a[+o+2]?parseInt(a[+o+2]):1
                if (item&&hasItem(state.player, item)){
                    let it = state.player.inventory.find(e=>e.item_name===item)
                    send(`you took your ${item} out and used it.`)
                    useItem(state.player, it, count)
                } else {
                    send("please state item!")
                }
            } else if (n1==="map"){
                let p = state.player.familiarLoc.filter(e=>e!==state.player.location).map(e=>"there is a path that leads to *"+locId(e).name+`* ${state?.player?.home?.loc===e?"(which is where your house is.)":""} the path is *current location* -> `+newJo(locId(state.player.location), locId(e)).map(o=>"*"+o.name+"*").join(" -> ")).join("---")
                send(
                    `
                    [align: center]you opened your *map*:--- ${p?p:"nothing to see..."}
                    `
                )
            } else if (n1==="animals"){
                send("you looked around, looking for animals")
                await sleep(1000)
                let anim = random(state.animalPopulation.filter(e=>locId(e.location)===locId(state.player.location)))
                //console.log(anim)
                if (getRng()<0.8&&anim){
                    send("you found a *"+anim.species+"*, by the looks of it, it is "+(anim.tamed?"tamed by someone.":"untamed."))
                    if (!anim.tamed){
                        send("would you like to tame it?")
                        state.playerTags.askToTame.state = true
                        state.playerTags.askToTame.animalObj = anim
                    }
                } else {
                    send("you found no animals.")
                }
            } else if (n1==="nearby"){
                //let npcsFound = []
                let close = state.population.filter(e=>e.location===state.player.location&&e.id!==state.player.id)
                send(`
                [align: center]you looked around, you found: ---${close.map((a, index)=>`${index}. *${a.name}* ${state.player.knows.some(e=>e&&e===a.id)?"(you know this person)":""}`).join("---")}---
                `)
            } else if (n1==="trade"){
                let m = locId(state.player.location).structures.filter(e=>e.type==="market"&&e.state==="finished"&&e.itemsForSale.length>0)
                if (!m){
                    send(`markets:<br>${m.map((e, index)=>`${index}. *${e.name}* you looked at it, and it seems to have ~${e.itemsForSale.length} ${e.itemsForSale.length>1?"items":"item"} for sale.`).join("<br>")}`)
                    send("choose a *market* <20%>(by index)<a> you want to trade with")
                } else {
                    send("how unfortunate, no markets to buy and trade in here at all.")
                }
                return
            } else if (n1==="buy"){
                send("you looked around to find a market")
                let market = locId(state.player.location).structures.find(e=>e&&e.state==="finished"&&e.type==="market"&&look(e.ownedBy).location===state.player.location&&e.itemsForSale.length>0)
                if (market&&look(market.ownedBy).location===state.player.location){
                    send("you approached a market named "+market.name)
                    send("*seller*: greetings, customer!")
                    send(`
                    1. *what can you offer?* <br>
                    2. *i want to buy* <br>
                    3. *who are you?* <br>
                    4. *leave*
                    `)
                    state.playerTags.buyingMarket = {
                        state: true,
                        marketObj: market
                    }
                } else {
                    send("you found *no available market*, not a single one, reasons are: 1. seller ain't here, 2. the building is unfinished, looks like you have to go to other places, lad.")
                }
            } else if (n1==="leave"){
                let s = inside(state.player)
                if (s){
                    send("you left the building.")
                    state.player.inside.state = false
                    state.player.inside.structure = null
                } else {
                    send("you are already outside.")
                }
            } else if (n1==="enter"){
                if (inside(state.player)){
                    send("you are inside a building, leave first.")
                } else {
                    let s = struF(state.player.location)
                    if (s){
                        send(`[align: center]structures:---${s.map((e, index)=>`${index}. *${e.name}* this is a *${e.type}* established by *${e.placedBy?look(e.placedBy).name:"no one"}*`).join("---")}.`)
                        pt.enterBuilding.state = true
                        pt.enterBuilding.arr = s
                    }
                }
            } else if (n1==="go"){
                if (inside(state.player)){
                    send("you are inside a building, leave first.")
                } else {
                    let txt = `[align: center]you started a journey, right now, there are ${locId(state.player.location).connections.length} places in which you can go, and you in *${locId(state.player.location).name}*, the locations are:---`
                    let l = locId(state.player.location)
                    for (const loc of l.connections){
                        let cObj = locId(loc)
                        txt += `${l.connections.indexOf(loc)}. *${cObj.name}* - a ${cObj.type}, with around ~${Math.round(state.population.filter(e=>e.location===loc).length/5)*5} inhabitants---`
                    }
                    console.log(l.connections)
                    send(txt)
                    state.playerTags.askWhereToGo.state = true
                }
            } else if (n1==="inventory"){
                showInv(state.player)
            } else if (n1==="view"){
                let type = a[+o+1]?a[+o+1]:null
                if (type){
                    send(showStruct(state.player, type))
                }
            } else if (n1==="talk"){
                //popUpd()
                //let friends = state.population.filter(e=>e.location===state.player.location&&state.player.knows.some(o=>o===e.id))
                if (state.player.state === "alive"){
                    let a = []
                    if (inside(state.player)){
                        a = state.population.filter(e=>e.location===state.player.location&&e.id!==state.player.id&&e.state==="alive"&&e.inside.state&&e.inside.structure===state.player.inside.structure)
                    } else {
                        a = state.population.filter(e=>e.location===state.player.location&&e.id!==state.player.id&&e.state==="alive"&&!e.inside.state)
                    }
                    if (a.length>0){
                        let b = a
                        send(
                            `[align: center]*talk to*---
                            ${b.map((e, index)=>`${e.image?`<img width=100>${e.image}<img>---`:""}${index}: *${e.name}* ${state.player.knows.some(o=>o&&o===e.id)?"(*[green]you know this person[c]*)":""}${e.inside.state?" (*they are inside a building.*)":""} - by the looks of it: ${e.gender==="female"?"she":"he"} has a ${e.appearance.eye.color} eye, and is ${toFeet(e.appearance.height.cur)}ft tall.`).join("---")}
                            ---
                            *back*
                            ---`
                        )
                        state.playerTags.chooseTalk.state = true
                        state.playerTags.chooseTalk.arr = b
                    } else {
                        send("there is no one to talk to in here...")
                    }
                }
            } else if (n1==="save"){
                send("please wait...")
                let data = serialize()
                let chunks = JSON.stringify(data)
                download(data.info.name+".json", chunks)
                /*let blob = new Blob([JSON.stringify(data, null, 2)], {type: "text/plain"})
                let url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.download = data.info.name+".txt"
                a.href = url
                a.click()
                URL.revokeObjectURL(url)
                document.body.removeChild(a)*/
                
            } else if (n1==="idle"){
                send("you stood silently")
                if (a[+o+1]){
                    if (state.player?.home?.loc===state.player.location||state.player.level==="god"){
                        let bb = parseInt(a[+o+1])
                        if (bb){
                            let m = send("idling for "+bb+" hours...")
                            let br = false
                            for (let i=0;i<bb;i++){
                                update()
                                if (state.playerTags.talk.state){br=true}
                                if (state.playerTags.chooseTalkMode.state){br=true}
                                if (state.playerTags.rekanianTalkPlayer.state){br=true}
                                if (state.player.stats.hydration.val<(state.player.stats.hydration.max/2)){
                                    send("[red] You're thirsty! [c]")
                                    br = true
                                    //break
                                }
                                if (state.player.stats.saturation.val<(state.player.stats.saturation.max/2)){
                                    send("[red] You're hungry! [c]")
                                    br = true
                                    //break
                                }
                                if (br) break
                                await sleep(0)
                            }
                            if (br===false){
                                m.innerHTML = format("done.")
                            } else {
                                m.innerHTML = format("interrupted.")
                            }
                        }
                    } else {
                        send("hm, i can't stay here for that long, i need to head back home.")
                        //update()
                    }
                }
            } else if (n1==="status"){
                let al = displayStatus(state.player)
                send(`
                ${al}
                `)
            }
        } else {
            send("start the game first!")
        }
    }
    if (state.GameStarted){
        if (state?.player?.stats?.hydration?.val<0.5){
            send("[red]you're thirsty![c]")
        }
        if (state?.player?.stats?.saturation?.val<0.5){
            send("[red]you're thirsty![c]")
        }
    }
}
//----------//
$("send").onclick = ()=>{
    if (check($("TypeBox").value)){
        let n = send($("TypeBox").value)
        $("TypeBox").value = ""
        checkCmd(n.innerText)
    }
}

$("TypeBox").addEventListener("keydown", function(e){
    if (e.key === "Enter"&&check($("TypeBox").value)){
        let n = send($("TypeBox").value)
        $("TypeBox").blur()
        $("TypeBox").value = ""
        checkCmd(n.innerText)
    }
})  

async function start(){
    await loadImgs()
    await loadItems()
    await loadBuildings()
    await bootRekAssets()
    send(`[align: center] ${state.settings.images?`<img width=100 border=false>/main/assets/TITLE.png<img>---`:`[red]*REKAN*[c]: \"STEAMS & CLOUDS\"---`}version: ${state.version}`)
    /*if (debug){
        mem = send(`
        memory of [0]:<br>
        `)
        setFocus(mem)
    }*/
    chnlog = send(`[align: center]-*CHANGELOG*- ---
    [#9E4DFFB8]-*LANGUAGES*-[c]---
    • *added* language generator<br>
    • *added* language grammar pack<br>
    • *added* language plurals<br>
    • *added* language verb conjugations<br>
    • *added* language translation (English to langN)<br>...---
    [#9E4DFFB8]-*ANIMALS*-[c]---
    • *added* animals<br>
    • *added* NPC taming animals<br>
    • *added* taming animals<br>...---
    [#9E4DFFB8]-*GENERAL*-[c]---
    • *added* more items<br>
    • *added* pregnancy<br>
    *...*---
    [#9E4DFFB8]-*SYSTEMIC*-[c]---
    • *added* seed system<br>
    • now every system relies on controlled randomness instead of chaos.<br>
    *...*
    `)
    send("thank you for playing *[red]♥[c]*")
    send("[align: center]this game is at its early stage, and any events\ncontaining similar or real world events are purely [red]*coincidental*[c]")
    if (debug){
        fpsCounter = send(`[align: center]${ticksPerSec}`)
        langEx = send("languagesExamples...")
    }
    send(`to begin, type "play"!`)
    state.msgHistory = []
    //await genPeople(500)
}

function debugLoop(){
    fpsCounter.innerHTML = format(`
    [align: center](debug/live)<br>
    FPS:${ticksPerSec}<br>
    *liveNPC*: ${u}, *warmNPC*: ${w}, *coldNPC*: ${c}<br>
    Animals: ${state.animalPopulation.length}<br>
    *fame*:<br>
    1: ${state.STATICPOPULATION.filter(e=>e.fame>0&&e.fame<1).length}<br>
    5: ${state.STATICPOPULATION.filter(e=>e.fame>5&&e.fame<10).length}<br>
    10: ${state.STATICPOPULATION.filter(e=>e.fame>10&&e.fame<20).length}<br>
    20: ${state.STATICPOPULATION.filter(e=>e.fame>20&&e.fame<30).length}<br>
    30: ${state.STATICPOPULATION.filter(e=>e.fame>30&&e.fame<50).length}<br>
    50: ${state.STATICPOPULATION.filter(e=>e.fame>50&&e.fame<100).length}<br>
    100: ${state.STATICPOPULATION.filter(e=>e.fame>100&&e.fame<150).length}<br>
    *language speakers*:<br>
    ${state.languages.map(e=>e&&e.name+": "+state.population.filter(o=>o.languages.filter(p=>p&&langId(p.language)?.name===e.name).length>0).length).join("---")}
    `)
    //showChn = showChn?false:true
    requestAnimationFrame(debugLoop)
}

function chlog(){
    if (chnlog){
        if (showChn===false){
            chnlog.style.height = "20px"
            chnlog.style.overflow = "hidden"
            //console.log("yes")
        } else if (showChn===true){
            chnlog.style.height = null
            chnlog.style.overflow = "none"
        }
    }
}
//send("hey---yo[4/3]")

let debug = true
let fpsCounter = null
let langEx = null
let mem = null
let chnlog = null
let showChn = false

if (window.innerHeight>1024){
    $("main").innerHTML += format("[align: center]Nico M Tinidora. 12/20/25-2026")
}

async function boot(){
    //let checkFor = Object.keys(state)
    let n = send(`*loading everything...*`)
    if (startTheGame){
        await start()
        chnlog.addEventListener("click", ()=>{
            showChn = showChn?false:true
        })
        tick()
        sec()    
        //console.log(chnlog)
        if (debug){
            debugLoop()
        }
    } else {
        playground()
    }
    n.style.display = "none"
}
boot()
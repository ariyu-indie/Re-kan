import { genBook, bookId, distribute } from "./BOOKS.JS"
import * as eraSys from "./ERA.JS"
import { generateAnimal, genAnimals, tame } from "./ANIMALS.js"
import * as names from "./NAMES.js"
import { observable, waitUntil } from "./OBSERVABLES.js"
import { state } from "./STATE.js"
import { serialize, load, download, repairSave, checkIntegrity, roughSizeOfObject} from "./SAVE.js"
import { TextToNum, send, format } from "./SEND.js"
import { $, sleep } from "./HELPER.js"
import { random } from "./UTILS.js"
import { structure, place, group, person } from "./CLASSES.js"
import { updBg, updWeatherImg, getImg } from "./IMAGES.js"
import { m, fm, onePersonPlease, genPeople, look, disNPC, newMem, shock } from "./HUMANS.js"
import { useItem, hasItem, addItem, collect } from "./ITEMS.js"
import { toDivine, toMortal } from "./DIVINITY.js"
import { BFS, reconstructPath, newJo, pathCache } from "./PATHFINDING.js"
import { newGoal, interpretGoals, giveGoals, unt } from "./GOAL.js"
import { locId, terrainType, addRes, generateResources, genLoc, placePeople, connectLoc, dMap, lookAround } from "./LOC.js"
import { buildFarm, buildMarket, buildHouse, buildLibrary } from "./BUILDINGS.js"
import { createLanguage, translate, langId, seperate, intelligibility, borrowR } from "./LANGUAGES.js"
import { pregnant } from "./PREGNANCY.js"
let focusMSG = null
let langBeingTranslated = null //createLanguage()
let showFullContentTranslation = false
let nnnnn = createLanguage()
console.log(translate("my name is Ariyu", nnnnn))
updBg(state.player)
updWeatherImg(state.player)

function setFocus(x){
    focusMSG = x
}

function removeFocus(){
    focusMSG = null
}

function date(){
    return state.cal.m+"m / "+state.cal.d+"dy / "+state.cal.y+"yr / "+state.cal.h+" hr"
}

/*function dBox(m, x, y){
    let d = document.createElement("div")
    d.style.position = "absolute"
    d.style.padding = "1px"
    d.style.minWidth = "0px"
    d.style.left = x+"px"
    d.style.top = y+"px"
    d.style.zIndex = 10
    let copy = document.createElement("div")
    copy.style.padding = "2px"
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
    for (let i=0;i<x*3;i++){
        l.push(seperate(random(l.filter(e=>!e.seperatedFrom)), 1))
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
        let a = state.population.filter(e=>e.location===i)
        for (const ppl of a){
            ppl.languages.push(random(state.languages).id)
        }
    }
}

async function theBeginning(){
    await genLang(state.GenSettings.numOfLang)
    if (debug&&state?.languages){
        try{
        langEx.innerHTML = format(String(`
            languages examples:<br><br>
            *how are you? my name is Nico, and i made this game!*<br>
            ${state.languages.map(
            e=>"*"+e.name+
            ("*: **"+translate("how are you? my name is Nico, and i made this game!", e).translation)+
            "**<br>intelligibility with parent ("+(e.seperatedFrom?.language?e.seperatedFrom.language.name:"no parent")+"): "+(e.seperatedFrom?.language?(intelligibility(e, e.seperatedFrom.language)*100).toFixed(2)+"%":"0%")).join("<br><br>")}<br><br>
            *the world is so beautiful, i can't wait to explore!*<br>
            ${state.languages.map(
            e=>"*"+e.name+"*: **"+translate("the world is so beautiful, i can't wait to explore!", e).translation+
            "**<br>intelligibility with parent ("+(e.seperatedFrom?.language?e.seperatedFrom.language.name:"no parent")+"): "+(e.seperatedFrom?.language?(intelligibility(e, e.seperatedFrom.language)*100).toFixed(2)+"%":"0%")).join("<br><br>")}<br><br>
            *counting test*<br>
            ${state.languages.map(
            e=>"*"+e.name+"*: **"+translate("one two three four five six seven eight nine zero", e).translation+
            "**<br>intelligibility with parent ("+(e.seperatedFrom?.language?e.seperatedFrom.language.name:"no parent")+"): "+(e.seperatedFrom?.language?(intelligibility(e, e.seperatedFrom.language)*100).toFixed(2)+"%":"0%")).join("<br><br>")}<br><br>
            *intelligibility test*<br>
            ${state.languages.map(e=>
                `*${e.name}*: intelligibility with firstLang (${state.languages[0].name}): ${(intelligibility(state.languages[0], e)*100).toFixed(2)}%`
            ).join("<br><br>")}<br><br>
            *flipping test*<br>
            *${state.languages[0].name} is this much understandable to ${state.languages[1].name}*: ${(intelligibility(state.languages[1], state.languages[0])*100).toFixed(2)}%<br>
            *${state.languages[1].name} is this much understandable to ${state.languages[0].name}*: ${(intelligibility(state.languages[0], state.languages[1])*100).toFixed(2)}%
        `))
        } catch (e) {
            send(String(e))
            e
            throw e
        }
    }
    await genPeople(state.GenSettings.numOfHumans)
    state.population = state.STATICPOPULATION.filter(e=>e&&e.state==="alive")
    await genLoc(state.GenSettings.numOfLocations)
    await connectLoc()
    await placePeople()
    //await placeLanguages()
    await genAnimals(state.GenSettings.numOfAnimals)
    for (const anim of state.STATICANIMALS){
        anim.location = random(state.locations)
    }
    //console.log(intelligibility(nnnnn, state.languages[0]))
    //state.player= random(state.population)
    //toDivine(state.player)
    console.log(state.population)
    //console.log(state.locations)
    //console.log(state.animalPopulation)
    //console.log(newJo(random(state.locations), state.locations[15]))
    await sleep(1000)
    send(translate(`the sky is yours to rule...`, state.languages[0]).translation)
    await sleep(1000)
    send("so, mortal, what do you wish to be?")
    send("[align: center] you wish to be a...<br> *( Commoner | Chosen | [#B9101F]Fallen God[c] | [yellow]God[c] )*")
    state.glt.askRole.value = true
    await waitUntil(state.glt.askRole, false)
    await sleep(1000)
    for (let i=0;i<3;i++){
        toDivine(random(state.population))
    }
    send("do you wish to timelapse <20%>[red](recommended)[c]<a>?")
    state.glt.askTimeskip.value = true
    await waitUntil(state.glt.askTimeskip, false)
    state.player = random(state.population)
    send("**you** can now explore the world as it moves.")
    dMap(state.player.location)
    if (state.glt.chosenStart==="god"){
        await toDivine(state.player)
    }
    if (state.glt.chosenStart==="fallen god"){
        await toDivine(state.player)
        toMortal(state.player)
    }
    send(`your name is **${state.player.name}** and is seen as a ${state.player.level}, you are ${Math.round(state.player.age)} years old, and is biologically a ${state.player.gender}, and you can speak ${state.player.languages.map(e=>"the language of *"+langId(e.language).name+"").join(", ")}`)
    send(`today is a ${state.player.location.rain.state?"rainy":"sunny"} day.`)
    lookAround(state.player.location, 3)
    addItem(state.player, "divineCrystal", 1)
    //newGoal(player, "go", null, null, {A: state.player.location, B: random(state.locations)})
    //newGoal(player, "use", "water")
    console.log(state.player)
    state.met.push(state.player.id)
    update()
    console.log(state.translations)
    console.log(state.globalLib.filter(e=>e.read>10))
}

let ticksPerSec = 60
let ticks = 0
function sec(){
    setTimeout(()=>{ticksPerSec=ticks;ticks=0;requestAnimationFrame(sec)}, 1000)
}
async function tick(){
    ticks++
    chlog()
    requestAnimationFrame(tick)
}
let EraYear = 0
function upthedate(x){
    let n = x
    while (n>0){
    for (let i in state.population){
        state.population[i].age += 1/8760
    }
    for (let i in state.animalPopulation){
        state.animalPopulation[i].age += 1/8760
    }
    state.cal.h++
    if (state.cal.h>23){
        state.cal.d++
        state.cal.h = 0
    }
    if (state.cal.d>=30){
        state.cal.m++
        state.cal.d=1
    }
    if (state.cal.m>=12){
        state.cal.y++
        console.log(
            "0:",state.population.filter(e=>e&&e.fame>0).length,"\n",
            "1:",state.population.filter(e=>e&&e.fame>1).length,"\n",
            "5:",state.population.filter(e=>e&&e.fame>5).length,"\n",
            "10:",state.population.filter(e=>e&&e.fame>10).length,"\n",
            "20:",state.population.filter(e=>e&&e.fame>20).length,"\n",
        )
        state.cal.m=0
    }
    if (state.cal.y===EraYear*3){
        const data = {
            pop: state.population,
            loc: state.locations,
            calendar: state.cal
        }
        state.era.push(eraSys.genEraName(data))
        console.log(state.era)
        EraYear++
    }
    n--
    }
    //return state.cal.m+" / "+state.cal.d+" / "+state.cal.y
}

function locEval(){
    for (let i in state.locations){
        let l = state.locations[i]
        let people = state.population.filter(e=>e&& e.location===l&&!e.pruned)
        let pers = random(people)
        if (pers && pers!==state.player&& Math.random()<(0.1*pers.hobbies.building)&&pers.age>18){
            l.difficulty *= 0.995
            let type = random(["farm", "house", "library", "market"])
            if (!pers) return
            if (!hasItem(pers, "wood")){
                newGoal(pers, "collect", "wood")
            }
            if (type==="farm"){
                l.structures.push(buildFarm(pers))
            } else if (type==="library"){
                l.structures.push(buildLibrary(pers))
            } else if (type==="market"){
                l.structures.push(buildMarket(pers))
            } else if (type==="house"){
                if (pers?.home?.structure?.ownedBy!==pers){
                    let house = buildHouse(pers)
                    pers.home.loc = pers.location.id
                    pers.home.structure = house
                    l.structures.push(house)
                }
            }
            if (state.player&&l===state.player.location){
                send(`${pers.name} built a ${type}!`)
            }
        }
        else if (pers && pers!==state.player&& Math.random()<0.001){
            if (pers&&pers.home?.loc&&pers.location!==pers.home.loc){
                newGoal(pers, "go", null, null, {A: pers.location, B: locId(pers.home.loc)})
            }
        }
        for (const o of l.structures){
            if (o.state==="unfinished"&&o.type==="farm"){
                if (o.materials["wood"]>5){
                    o.state = "finished"
                }
            } else if (o.state==="unfinished"&&o.type==="house"){
                if (o.materials["wood"]>2){
                    o.state = "finished"
                }
            } else if (o.state==="unfinished"&&o.type==="library"){
                if (o.materials["wood"]>5){
                    o.state = "finished"
                }
            } else if (o.state==="unfinished"&&o.type==="market"){
                if (o.materials["wood"]>3){
                    o.state = "finished"
                }
            } else if (o.type === "market" && o.state==="finished"){
                o.itemsForSale = o.itemsForSale.filter(e=>e&&e.amountForSale>0)
            } else if (o.type === "farm" && o.state==="finished"){
                addRes(l.resources, "fruit", 100)
                addRes(l.resources, "water", -20)
            }
        }
        //let nstruc = Math.round(Math.random()*time/100)
    }
    for (let i in state.locations){
        let l = state.locations[i]
        let people = state.population.filter(e=>e&& e.location===l)
        if (l.rain.state){
            if (l.rain.state===true&&l.rain.strength <= 0.01){
                l.rain.state = false
                l.rain.strength = 0
            } else {
                l.rain.strength *= 0.98
                addRes(l.resources, "water", 1000*(10+l.rain.strength))
                for (let p in l.connections){
                    let n = locId(l.connections[p])
                    if (n?.rain?.state===false){
                        n.rain.state = true
                        n.rain.strength = l.rain.strength/1.1
                        if (state.player&& n.name===state.player.location.name){
                            send(`the rain from ${l.name} has reached this land...`)
                        }
                    }
                }
            }
        } else if (Math.random()<0.001){
            let libA = random(l.structures.filter(e=>e.type==="library"&&e.books.length>0))
            let libB = random(locId(random(l.connections)).structures.filter(e=>e.type==="library"&&e.books.length>0&&e!==libA))
            if (libA&&libB){
                distribute(libA, libB)
                send("a book was distributed")
            }
        } else if (Math.random()<0.0001&&l.rain.state===false){
            l.rain.state = true
            l.rain.strength = Math.random()*0.5+0.5
            if (state.player&&l===state.player?.location){
                send("it has started raining...")
            }
        }
    }
}

function shareResources(loc){
    const shared = new Set()
    const people = state.population.filter(p =>
        p.location === loc && p.state === "alive" && 
        p.justEaten <= 0 && 
        p.justDrank <= 0
    )
    if (people.length < 2) return
    // --- THRESHOLDS ---
    const THIRSTY = 30
    const HUNGRY  = 30
    const SAFE_WATER = 45
    const SAFE_FOOD  = 45
    // --- HELPERS ---
    function totalItem(p, name){
        return p.inventory
            .filter(i => i.item_name === name)
            .reduce((a,b)=>a+b.quantity,0)
    }
    function giveItem(giver, receiver, name, amount, keep){
        let it = giver.inventory.find(i => i.item_name === name)
        if (!it) return false
        let give = Math.min(amount, it.quantity - keep)
        if (give <= 0) return false
        it.quantity -= give
        newMem(giver, `i gave some ${name} to ${(giver.knows.some(e=>e===receiver.id)?receiver.name:"someone")}`)
        newMem(receiver, `${(receiver.knows.some(e=>e===giver.id)?giver.name:"someone kind-hearted")} gave me some ${name}`)
        if (receiver.name===state?.player?.name){
            send("someone gave you a "+name)
        }
        if (giver.name===state?.player?.name){
            send("you gave someone a "+name)
        }
        addItem(receiver, name, give)
        return true
    }
    // --- FIND NEEDY ---
    const thirsty = people.filter(p => p.stats.hydration.val < THIRSTY)
    const hungry  = people.filter(p => p.stats.saturation.val < HUNGRY)
    // --- WATER SHARING (FIRST) ---
    for (let t of thirsty){
        const donors = people.filter(p =>
            p !== t &&
            p.stats.hydration.val > SAFE_WATER &&
            totalItem(p, "water") > 4
        )
        if (!donors.length) continue
        let giver = donors.find(p => !shared.has(p))
        if (!giver) continue

        shared.add(giver)
        giveItem(giver, t, "water", 2, 3)
    }
    // --- FOOD SHARING ---
    for (let h of hungry){
        const donors = people.filter(p =>
            p !== h &&
            p.stats.saturation.val > SAFE_FOOD &&
            totalItem(p, "fruit") > 3
        )
        if (!donors.length) continue
        let giver = donors.find(p => !shared.has(p))
        if (!giver) continue

        shared.add(giver)
        giveItem(giver, h, "fruit", 2, 2)
    }
}

function addToSale(x, market){
    let item = x.inventory.length > 0 ? random(x.inventory) : null
    if (item&&market.itemsForSale.some(e=>e.item_name===item.item_name)){
        return
    }
    if (item){
        let q = Math.random() * item.quantity
        let invIt = x.inventory.find(e => e.item_name === item.item_name)
        invIt.quantity -= q
        market.itemsForSale.push({
            item_name: item.item_name,
            amountForSale: q,
            inExchange: {
                item: random(["coin", random(["coin", random(state.itemDict)])]),
                amount: Math.random()*5
            }
        })
    }
}

function behaviors(x){
    let cd = state.population.filter(e=>e&&e.location===x.location&&e.state!=="dead"&&e.fame>state.population.length*0.01) //famous people
    if (Math.random()<0.001){ //make books
        if (x.location.structures.some(e=>e.type==="library")){
            let sub = random(cd)
            let lib = random(x.location.structures.filter(e=>e.state==="finished"&&e.type==="library"))
            if (sub&&lib){
                let book = genBook(x, sub)
                state.globalLib.push(book)
                lib.books.push(book.id)
                //console.log(state.globalLib)
                newMem(x, `i wrote a book about ${sub.name}`)
            }
        }
    } else if (Math.random()<0.001){
        let market = random(x.location.structures.filter(e=>e.ownedBy===x.id&&e.state==="finished"&&e.type==="market"))
        if (market){
            addToSale(x, market)
        } else {
            let l = random(state.locations.filter(e=>e.structures.some(r=>r.ownedBy===x.id)))
            if (l){
                newGoal(x, "go", null, null, {A: x.location, B: l})
            }
        }
    } else if (Math.random()<0.001){
        let a = random(x.location.structures)
        if (a){
            look(a.placedBy).fame += 1
            newMem(x, "i acknowledged a structure")
            if (state.player&&state.player.location===x.location){
                send("you saw someone acknowledge a structure.")
            }
        }
    } else if (Math.random()<0.01){
        if (hasItem(x, "wood")){
            let s = random(x.location.structures.filter(e=>e&&e.state==="unfinished"))
            if (s&&s.state==="unfinished"){
                let q = x.inventory.find(e=>e&&e.item_name==="wood").quantity*0.2
                if (s.materials["wood"]){
                    s.materials["wood"] += q
                } else {
                    s.materials["wood"] = q
                }
                addItem(x, "wood", -q)
            }
        } else {
            collect(x, "wood")
        }
    } else if (Math.random()<0.001){ //leave
        newGoal(x, "go", null, null, {A: x.location, B: random(state.locations)})
    } else if (Math.random()<0.001){ //leave
        if (x.home?.loc){
            newGoal(x, "go", null, null, {A: x.location, B: locId(x.home.loc)})
        }
    } else if (Math.random()<0.001){
        let library = x.location.structures.filter(e=>e.state==="finished"&&e.type==="library")
        let lib = random(library)
        if (!library&&lib?.books?.length>0){
            let book = random(lib.books)
            if (book){
                read(x, bookId(book))
                //console.log(state.globalLib.filter(e=>e.read>0))
            }
        }
    } else if (Math.random()<0.001){
        let animalChoices = state.animalPopulation.filter(e=>e.state==="alive"&&e.location===x.location)
        let animal = animalChoices?random(animalChoices):null
        if (animal){
            tame(x, animal)
            newMem(x, "i tamed an animal")
        }
    }
}

function processSatuHydra(x){
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    let waterDrain = ageFactor + 1.2 * (1 + x.location.difficulty)
    if (x.curGoal?.verb === "go") waterDrain *= 1.7
    if (!x.curGoal) waterDrain *= 0.5
    if (x.justDrank <= 0) {
        x.stats.hydration.val -= waterDrain
    } else {
        x.stats.hydration.val -= ageFactor
        x.justDrank--
    }
    let hungerDrain = ageFactor + 0.8 * (1 + x.location.difficulty)
    if (x.curGoal?.verb === "go") hungerDrain *= 1.6
    if (!x.curGoal) hungerDrain *= 0.5
    if (x.justEaten <= 0) {
        x.stats.saturation.val -= hungerDrain
    } else {
        x.stats.saturation.val -= ageFactor
        x.justEaten--
    }
}
function read(x, book){
    if (!look(book.subject)) return
    look(book.subject).fame += 1
    let opinion = "decent"
    x.adrenaline += x.hobbies.writing
    if (book.quality>x.hobbies.writing){
        opinion = random(["good", "adequate", "exquisite", "professional"])
        x.hobbies.writing *= 1.01
        look(book.author).fame += 1
    } else {
        opinion = random(["bad", "out of taste", "unoriginal", "redundant"])
        x.hobbies.writing *= 0.99
        look(book.author).fame -= 0.01
    }
    book.read++
    if (book.opinions[opinion]){
        book.opinions[opinion]++
    } else {
        book.opinions[opinion] = 1
    }
    newMem(x, `i read a book, i found it ${opinion}`)
}
/*function createGroup(loc){
    //if (groups.some(e=>e.territories)
}*/
function autoDrinkEat(x){
    if ( //auto drink
        x.stats.hydration.val < 85 &&
        hasItem(x, "water") &&
        x.justDrank <= 0
    ) {
        const it = x.inventory.find(e => e.item_name === "water")
        if (it) useItem(x, it, 0.25)
    }
    if ( //auto eat
        x.stats.saturation.val < 80 &&
        hasItem(x, "fruit") &&
        x.justEaten <= 0
    ) {
        const it = x.inventory.find(e => e.item_name === "fruit")
        if (it) useItem(x, it, 0.25)
    }
}

function globalUpd(x){ //light
    for (const mem of x.memory){
        mem.hp *= 0.99
    }
    if (!x.familiarLoc.includes(x.location.id)){
        x.familiarLoc.push(x.location.id)
    }
    if (x.age>12&&x.age<30){
        if (x.appearance.height.cur>=x.appearance.height.max){
            x.appearance.height.cur = x.appearance.height.max
        } else {
            x.appearance.height.cur *= 1.0000005
        }
    } else if(x.age>30&&x.age<50){
        x.appearance.height.cur *= 0.9999998
    }
    if (x.memory.some(e=>e.hp<=0.01)){
        x.memory = x.memory.filter(e=>e.hp>0.01)
    }
}

function updNpc(x){
    if (x.state==="dead") return
    behaviors(x)
    giveGoals(x)
    globalUpd(x)
    interpretGoals(x)
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    if (!x.fertile && x.age>16&&x.age<40){
        if (Math.random()<0.01){
            x.fertile = true
        }
    } else {
        if (Math.random()<0.01){
            x.fertile = false
        }
    }
    if (x.adrenaline>0){x.adrenaline -= 0.01}else{
        x.adrenaline = 0
    }
    x.inventory = x.inventory.filter(e=>e&&e.quantity>0)
    processSatuHydra(x)
    for (let key in x.hobbies) {
        if (x.hobbies[key] < 0) {
            x.hobbies[key] = 0
        } else if (x.hobbies[key] > 1) {
            x.hobbies[key] = 1
        }
    }
    x.stats.stamina.val += (x.stats.stamina.max*0.1)/(1+x.location.difficulty+ageFactor)
    if (x.stats.hydration.val < 5){
        x.stats.hp.val -= x.stats.hp.max*0.05+ageFactor
    }
    if (x.stats.saturation.val < 5){
        x.stats.hp.val -= x.stats.hp.max*0.03+ageFactor
    }
    autoDrinkEat(x)
    //x.fame -= 0.01
    if (x.fame<0){
        x.fame = 0
    } else if(x.fame>0) {
        x.fame -= 0.001
    }
    for (let i in x.stats){
        if (x.stats[i].val > x.stats[i].max){
            x.stats[i].val = x.stats[i].max
        }
        if (x.stats[i].val < 0){
            x.stats[i].val = 0
        }
    }
    if (x.stats.hp.val <= 0){
        shock(x, 5, "i just saw someone die")
        x.state = "dead"
        if (x===state.player){
            send("you [red]died![c]")
        }
    }
    //if (x!==state.player){
    //}
}

function warmUpd(x){
    behaviors(x)
    giveGoals(x)
    globalUpd(x)
    interpretGoals(x)
    //x.age += HPU/8640
    x.inventory = x.inventory.filter(e=>e&&e.quantity>0)
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    processSatuHydra(x)
    x.stats.stamina.val += (x.stats.stamina.max*0.2)/(1+x.location.difficulty+ageFactor)
    autoDrinkEat(x)
    for (let key in x.hobbies) {
        if (x.hobbies[key] < 0) {
            x.hobbies[key] = 0
        } else if (x.hobbies[key] > 1) {
            x.hobbies[key] = 1
        }
    }
    if (x.adrenaline>0){x.adrenaline -= 0.01}else{
        x.adrenaline = 0
    }
    if (x.stats.hydration.val < 5){
        x.stats.hp.val -= x.stats.hp.max*0.05+ageFactor
    }
    if (x.stats.saturation.val < 5){
        x.stats.hp.val -= x.stats.hp.max*0.03+ageFactor
    }
    if (x.stats.hp.val <= 0){
        shock(x, 5, "i just saw someone die")
        x.state = "dead"
    }
    //x.fame -= 0.01
    if (x.fame<0){
        x.fame = 0
    } else if(x.fame>0) {
        x.fame -= 0.001
    }
    for (let i in x.stats){
        if (x.stats[i].val > x.stats[i].max){
            x.stats[i].val = x.stats[i].max
        }
        if (x.stats[i].val < 0){
            x.stats[i].val = 0
        }
    }
}



function coldUpd(x){
    globalUpd(x)
    if (x.age>x.ageLimit||x.stats.hp.val<=0){
        shock(x, 5, "i just saw someone die.")
        x.state = "dead"
    }
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    if (x.location.resources.find(e=>e.item==="water").quantity<=0){
        x.stats.hp.val -= 10*ageFactor
        x.stats.hydration.val = 0
    }
    if (Math.random()<0.001){
        x.location = locId(random(x.location.connections))
    } else if (Math.random()<0.01&&x.home?.loc){
        x.location = locId(x.home.loc)
    }
    if (x.adrenaline>0){x.adrenaline -= 0.01}else{
        x.adrenaline = 0
    }
    if (x.location.resources.find(e=>e.item==="fruit").quantity<=0){
        x.stats.hp.val -= 10*ageFactor
        x.stats.saturation.val = 0
    }
    //x.fame -= 0.001
    if (x.fame<0){
        x.fame = 0
    } else if(x.fame>0) {
        x.fame -= 0.001
    }
    for (let key in x.hobbies) {
        if (x.hobbies[key] < 0) {
            x.hobbies[key] = 0
        } else if (x.hobbies[key] > 1) {
            x.hobbies[key] = 1
        }
    }
    let type = Math.random()<0.0001?random([
        "farm", "library",
        "market"
    ]):null
    if (type&&type==="farm"){
        if (x.age>18&&(1000/x.location.structures.filter(e=>e&&e.type==="farm").length>1000)){
            let farm = buildFarm(x)
            x.stats.stamina.val = x.stats.stamina.max
            farm.state = "finished"
            x.location.structures.push(farm)
        }
    }
    else if (type&&type==="library"){
        if (x.age>18){
            let library = buildLibrary(x)
            x.stats.stamina.val = x.stats.stamina.max
            library.state = "finished"
            x.location.structures.push(library)
        }
    }
    else if (type&&type==="market"){
        if (x.age>18){
            let market = buildMarket(x)
            x.stats.stamina.val = x.stats.stamina.max
            market.state = "finished"
            x.location.structures.push(market)
        }
    }
    else if (Math.random()<0.001&&x.location.structures.some(e=>e&&e.state==="finished"&& e.type==="market"&&e.ownedBy===x.id)){
        addItem(x, "water", 1+Math.random()*10)
        addItem(x, "fruit", 1+Math.random()*10)
        let mar = random(x.location.structures.filter(e=>e&&e.state==="finished"&& e.type==="market"&&e.ownedBy===x.id))
        if (mar){
            addToSale(x, mar)
        }
    }
    if (Math.random()<0.001){
        //if (x.home)
        const isAdult = x.age>=18
        const homeHasLoc = x.home?.loc
        const homeHasStruct = x.home?.structure
        const isOwnedByX = x.home?.structure?.ownedBy===x
        if (
            isAdult&& 
            (!homeHasLoc&&!homeHasStruct)||
            (homeHasLoc&&homeHasStruct&&!isOwnedByX)
        ){
            let house = buildHouse(x)
            x.stats.stamina.val = x.stats.stamina.max
            x.home.loc = x.location.id
            x.home.structure = house
            house.state = "finished"
            x.location.structures.push(house)
        }
    }
    if (Math.random()<0.001){
        let l = random(x.location.structures.filter(e=>e&& e.state==="finished"))
        if (l){
            look(l.placedBy).fame += 1
        }
    }
    if (Math.random()<0.001){
        let animalChoices = state.animalPopulation.filter(e=>e.location.id===x.location.id&&e.tamed===false)
        let animal = animalChoices?random(animalChoices):null
        //console.log(animal)
        if (animal){
            tame(x, animal)
            //("an animal has been tamed.")
        }
    }
    //let c = state.population.filter(e=>e&&e.location===x.location&&e.state!=="dead"&&e.fame>population.length*0.1) //famous people
    if (Math.random()<(0.0001+(x.hobbies.writing/100))){ //make books
        if (x.location.structures.some(e=>e.type==="library"&&e.state==="finished")){
            let sub = random(state.population.filter(
                    e=>e&&e.location===x.location&&e.fame>state.population.length*0.01
                )
            )
            let lib = random(x.location.structures.filter(e=>e.state==="finished"&&e.type==="library"))
            if (lib&&sub&&sub.fame>state.population.length*0.01&&state.globalLib.filter(e=>e&&e.subject===sub).length<3){
                let book = genBook(x, sub)
                state.globalLib.push(book)
                lib.books.push(book.id)
                sub.fame += 1
                //console.log(`${lib.name} books:`, lib.books)
            }
        }
    }
    if (Math.random()<(0.01+(x.hobbies.writing/100))){
        let lib = random(x.location.structures.filter(e=>e.type==="library"))
        if (lib){
            let book = random([
                random(lib.books.filter(e=>bookId(e).quality>0.8)),
                random(lib.books)
            ])
            if (book){
                read(x, bookId(book))
                //send("someone read a book")
            }
        }
        //read()
    }
}

function prune(x){
    if (!state.met.includes(x.id)){
        state.met.push(x.id)
    }
    let data = state.STATICPOPULATION.filter(e=>e.location?.id===x.location.id||state.met.includes(e.id))
    let dataNotMet = state.STATICPOPULATION.filter(e=>e.location?.id!==x.location.id&&!state.met.includes(e.id))
    let metRn = state.STATICPOPULATION.filter(e=>e.pruned&&e.location?.id===x.location.id&&!state.met.includes(e.id))
    for (const i of metRn){
        let a = onePersonPlease(1)
        a.name = i.name
        a.id = i.id
        a.age = i.age
        a.languages = i.languages
        a.location = i.location
        a.id = i.id
        a.age = i.age
        a.relatives = i.relatives
        a.inventory = i.inventory
        state.met.push(a.id)
        data.push(a)
    }
    for (const i of dataNotMet){
        data.push(
            {
                name: i.name,
                pruned: true,
                gender: i.gender,
                state: i.state,
                languages: i.languages,
                location: i.location,
                id: i.id,
                age: i.age,
                relatives: i.relatives,
                inventory: i.inventory
            }
        )
    }
    state.STATICPOPULATION = data
    console.log("data:", state.STATICPOPULATION)
}

$("focus").innerHTML = focusMSG?focusMSG.innerHTML:""

let u = 0
let w = 0
let c = 0
function update(args = {}) {
    state.population = state.STATICPOPULATION.filter(e => e.state === "alive")
    state.animalPopulation = state.STATICANIMALS.filter(e => e.state === "alive")
    let focus = state.player?state.player:state.STATICPOPULATION[0]
    if (state.GenSettings.pruning){
        prune(focus)
    }
    //console.log(focus)
    //let focus = player?player:state.STATICPOPULATION[0].location
    updBg(focus)
    updWeatherImg(focus)
    send("the world moves")
    $("calendar").innerText = date() + " " +focus.appearance.height.cur
    $("focus").innerHTML = focusMSG?focusMSG.innerHTML:""
    if (state.era[state.era.length-1]?.name){
        $("era").innerText = state.era[state.era.length-1].name
    }
    if (focus){
        $("HYDRATION").style.width = (focus.stats.hydration.val/focus.stats.hydration.max)*100+"%"
        $("SATURATION").style.width = (focus.stats.saturation.val/focus.stats.saturation.max)*100+"%"
    }
    if (state.player) updNpc(state.player)
    let updated = []
    let warm = []
    let cold = []
    
    for (let e of state.population) {
        if (e.state !== "alive") continue
        if (e.location.id === focus.location.id&&!e.pruned) {
            updated.push(e)
        } else if (focus.location.connections.includes(e.location.id)&&!e.pruned) {
            warm.push(e)
        } else if (!e.pruned){
            cold.push(e)
        }
    }
    u = updated.length
    w = warm.length
    c = cold.length
    // Phase 1: individual updates
    for (const i of updated) {
        updNpc(i)
        //await sleep(0)
    }
    for (const i of warm){
        warmUpd(i)
        //await sleep(0)
    }
    for (const i of cold){
        coldUpd(i)
        //await sleep(0)
    }
    // Phase 2: social resource sharing (ONCE per location)
    locEval()
    const locat = new Set(updated.map(p => p.location))
    if (state.player) locat.add(state.player.location)

    for (let loc of locat) {
        if (Math.random()<0.01){
            shareResources(loc)
        }
    }
    upthedate(state.HPU)
}

function displayStatus(x){
    console.log(x)
    let a = ""
    for (let i in x.stats){
        console.log(x)
        a += `${i}: (${x.stats[i].val.toFixed(2)}/${x.stats[i].max.toFixed(2)}) [${x.stats[i].val}/${x.stats[i].max}]`
    }
    return a
}

function showInv(x){
    let a = ""
    for (let i in x.inventory){
        a += `${x.inventory[i].item_name}: ${x.inventory[i].quantity.toFixed(2)}`
        if (i!==x.inventory.length-1){
            a += "<br>"
        }
    }
    send(a)
}

function showStruct(x, type="house"){
    let a = x.location.structures.filter(e=>e.type===type)
    let txt = `you looked into the local registered *${type}* the following structures are: <br>`
    for (const stru of a){
        txt += stru.name + " - " +
        (stru.state==="finished"?"[green]finished[c]":"[red]unfinished[c]") + " " + 
        (stru.itemsForSale?"["+stru.itemsForSale.length+"]":"")+"<br>"
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

async function checkCmd(cmd){
    state.latest.innerHTML = format(`*you*: ${cmd}`)
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
    if (state?.player&&state?.player?.inAFight?.state&&state?.player?.inAFight?.who){
        const opp = state.player.inAFight.who
        send(
            `
            Your health: [${state.player.stats.hp.val}/${state.player.stats.hp.max}]
            --•--<br>
            [red]enemy health[c]: [${opp.stats.hp.val}/${opp.stats.hp.max}]
            `
        )
        send("your move.")
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
    if (state.playerTags.timelapsing.state){
        send("you are *timelapsing*!")
        return
    }
    await sleep(500)
    if (state.glt.askRole.value){
        if (["commoner", "chosen", "fallen god", "god"].includes(cmd.toLowerCase())){
            if (cmd.toLowerCase()==="commoner"){
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
    if (state.glt.askTimeskip.value){
        let k = cmd.toLowerCase()
        if (k==="yes"){
            send("alright, giddy up!")
            const m = send(`${state.cal.m} / ${state.cal.d} / ${state.cal.y}`)
            setFocus(m)
            const hint = random(state.GAMEHINTS)
            state.HPU = 23
            state.playerTags.timelapsing.state = true
            for (let o=0;o<=360*5;o++){
                await update()
                let str = state.locations.reduce((sum, loc)=>{
                    return sum + loc.structures?.filter(e=>e&&e.state==="finished").length
                }, 0)
                let f = state.player?state.player:state.STATICPOPULATION[0]
                m.innerHTML = date()+format(` [${f.location.structures.filter(e=>e.state==="finished").length}] [${str}] [${state.population.length}] [${o}/${360*5}] hint: ${hint}`)
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
            send("[ YES / NO ]")
            return
        }
        //return
    }
    let a = cmd.split(/\s+/g)
    if (state.playerTags.askWhereToGo.state){
        if (a[0]&&parseInt(a[0])<5&&state.player.location.connections[parseInt(a[0])]){
            send(`you decided to go to ${locId(state.player.location.connections[parseInt(a[0])]).name}`)
            state.player.location = locId(state.player.location.connections[parseInt(a[0])])
            state.playerTags.askWhereToGo.state = false
            //update()
        } else {
            send("[ you must be confused ]")
        }
    }
    if (state.playerTags.offerMarketAsk.state){
        if (a[0]&&a[1]&&(state.playerTags.buyingMarket.marketObj.itemsForSale.some(e=>e.item_name===a[0].toLowerCase()&&e.amountForSale>0))){
            a[0] = a[0].toLowerCase()
            let itemYouGet = state.playerTags.buyingMarket.marketObj.itemsForSale.find(e=>e.item_name===a[0]&&e.amountForSale>0)
            console.log(itemYouGet)
            if (itemYouGet&&state.player.inventory.some(e=>e.item_name===itemYouGet.inExchange.item)){
                let playerIt = state.player.inventory.find(e=>e&&e.item_name===itemYouGet.inExchange.item)
                if (playerIt&&playerIt.quantity>(itemYouGet.inExchange.amount*parseInt(a[1]))){
                    if (parseInt(a[1])>itemYouGet.amountForSale){
                        addItem(state.player, itemYouGet.item_name, itemYouGet.amountForSale)
                        addItem(state.player, itemYouGet.inExchange.item, -(itemYouGet.inExchange.amount*itemYouGet.amountForSale))
                        send(`you got ${itemYouGet.amountForSale.toFixed(2)} *${itemYouGet.item_name}* for ${(itemYouGet.inExchange.amount*parseFloat(a[1])).toFixed(2)} *${itemYouGet.inExchange.item}*`)
                        itemYouGet.amountForSale = 0
                    } else {
                        addItem(state.player, itemYouGet.item_name, parseInt(a[1]))
                        addItem(state.player, itemYouGet.inExchange.item, -(itemYouGet.inExchange.amount*parseInt(a[1])))
                        send(`you got ${a[1]} *${itemYouGet.item_name}* for ${(itemYouGet.inExchange.amount*parseFloat(a[1])).toFixed(2)} *${itemYouGet.inExchange.item}*`)
                        itemYouGet.amountForSale -= parseInt(a[1])
                    }
                    send("*seller*: thanks for trading with me!")
                    state.playerTags.offerMarketAsk.state = false
                } else {
                    send("*seller*: oops, looks like you're short on what I've asked for.")
                    state.playerTags.offerMarketAsk.state = false
                }
            } else {
                send("*seller*: uhm, you don't have what I'm asking for...")
                state.playerTags.offerMarketAsk.state = false
            }
        } else {
            send("*seller*: oops, i cancelled your transaction, we are out of the item!")
            state.playerTags.offerMarketAsk.state = false
        }
        send("**type commands again to interact with the seller!**")
        return
    }
    if (state.playerTags.buyingMarket.state&& state.playerTags.buyingMarket.marketObj){
        send("you approached the seller.")
        if (a[0]&&a[0]==="1"){
            send("you asked what the seller could offer...")
            send("*seller*: alright.")
            send(`the seller began to rummage through ${look(state.playerTags.buyingMarket.marketObj.ownedBy).gender==="male"?"his":"her"} barrels`)
            if (state.playerTags.buyingMarket.marketObj.itemsForSale.filter(e=>e.amountForSale>0).length>0){
                send("*seller*: here's what i could offer")
                let txt = "*seller's offer*: <br>"
                for (const item of state.playerTags.buyingMarket.marketObj.itemsForSale){
                    txt += `• *${item.item_name}* - i have ${item.amountForSale.toFixed(2)} for sale, and i expect to get ${item.inExchange.amount.toFixed(2)} ${item.inExchange.item}s per 1 unit!<br>`
                }
                send(txt)
            } else {
                send("*seller*: shucks, no stocks! maybe come back later?")
                state.playerTags.buyingMarket.state = false
                state.playerTags.buyingMarket.marketObj = null
            }
        } else if (a[0]&&a[0]==="2"){
            send("*seller*: alright! what are you gonna buy? <50%>item [quantity]<a>")
            state.playerTags.offerMarketAsk = {
                state: true
            }
        } else if (a[0]&&a[0]==="3"){
            send(`my name is ${look(state.playerTags.buyingMarket.marketObj.placedBy).name}!`)
        } else if (a[0]&&a[0]==="4"){
            send(`*seller*: alright, see ya!`)
            state.playerTags.buyingMarket.state = false
            state.playerTags.buyingMarket.marketObj = null
        }
        return
    }
    for (let o in a){
        let n1 = a[o].toLowerCase()
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
                send("[align:center]---THE WORLD HAS BEGUN---")
                state.GameStarted = true
                await theBeginning()
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
                            updWeatherImg()
                            updBg(state.player)
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
        } else if (n1==="pets"){
            send(`
            you checked your pets list:<br>
            ${state.animalPopulation.filter(e=>e.loves.includes(state.player.id)).map(e=>"• *"+e.name+`* - you tamed this animal, it is a ${e.species}.`).join("<br>")}<br>
            -end-
            `)
        } else if (n1==="new"){
            state.GameStarted = true
            state.player = null
            updWeatherImg(state.player)
            updBg(state.player)
            theBeginning()
        } else if (n1==="exit"){
            state.GameStarted = false
            send("you've exitted gameplay, type \"resume\" if you wish to continue.")
            send(
                `[align: center]*MENU*:<br>
                resume/play<br>
                historical figures<br>
                languages<br>
                `
            )
        } else if (n1==="help"){
            send(`
            • *status* - shows your status<br>
            • *exit* - pause<br>
            • *new* - create and start a new game, [red]warning: erases previous progress![c]<br>
            • *go* - switch location<br>
            • *animals* - try and find an animals<br>
            • *idle* - stand still<br>
            • *use* [item] [count?] - use an item<br>
            • *view* [type] - check structures<br>
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
                let p = state.player.familiarLoc.filter(e=>e!==state.player.location.id).map(e=>"there is a path that leads to *"+locId(e).name+"* the path is *current location* -> "+newJo(state.player.location, locId(e)).map(o=>"*"+o.name+"*").join(" -> ")).join(", <br>")
                send(
                    `
                    you opened your *map*:<br> ${p?p:"nothing to see..."}
                    `
                )
            } else if (n1==="animals"){
                send("you looked around, looking for animals")
                await sleep(1000)
                let anim = random(state.animalPopulation.filter(e=>e.location===state.player.location))
                console.log(anim)
                if (Math.random()<0.8&&anim){
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
                let npcsFound = []
                let close = state.population.filter(e=>e.location.id===state.player.location.id)
                for (let i=0;i<Math.random()*3;i++){
                    let a = random(close)
                    if (!npcsFound.some(e=>e.name===a.name)){
                        npcsFound.push(a)
                    }
                }
                send(`
                you looked around, you found ${npcsFound.map((a, index)=>`${index}. **${state.player.knows.find(e=>e===a.id)?a.name:"??"}**`).join(", ")}
                `)
            } else if (n1==="buy"){
                send("you looked around to find a market")
                let market = state.player.location.structures.find(e=>e&&e.state==="finished"&&e.type==="market"&&look(e.ownedBy).location===state.player.location&&e.itemsForSale.length>0)
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
            } else if (n1==="go"){
                let txt = `you started a journey, right now, there are ${state.player.location.connections.length}:<br>`
                for (const loc of state.player.location.connections){
                    txt += `${state.player.location.connections.indexOf(loc)}. *${locId(loc).name}* - a ${locId(loc).type}, with around ${state.population.filter(e=>e.location.id===loc).length} <br>`
                }
                send(txt)
                state.playerTags.askWhereToGo.state = true
            } else if (n1==="inventory"){
                showInv(state.player)
            } else if (n1==="view"){
                let type = a[+o+1]?a[+o+1]:null
                if (type){
                    send(showStruct(state.player, type))
                }
            } else if (n1==="talk"){
                let a = state.population.filter(e=>e.location.id===state.player.location.id&&state.player.knows.some(o=>o===e.id))
                if (a.length<=0){
                    a = state.population.filter(e=>e.location.id===state.player.location.id)
                    if (a){
                        let b = []
                        for (let i=0;i<Math.random()*3;i++){
                            b.push(random(a))
                        }
                        send(
                            `there are some people you can try talking to:<br>
                            ${b.map((e, index)=>`${index}: *${state.player.knows.some(o=>o===e.id)?e.name:"???"}* - ${e.gender==="female"?"she":"he"} has a `).join(",<br>")}
                            `
                        )
                    }
                }
            } else if (n1==="save"){
                send("please wait...")
                let data = serialize()
                let chunks = JSON.stringify(data)
                download(data.info.name, chunks)
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
                    if (state.player.home.loc.id===state.player.location.id){
                        let bb = parseInt(a[+o+1])
                        if (bb){
                            let m = send("idling for "+bb+" hours...")
                            for (let i=0;i<bb;i++){
                                update()
                                if (state.player.stats.hydration.val<(state.player.stats.hydration.max/2)){
                                    send("[red] You're thirsty! [c]")
                                    break
                                }
                                if (state.player.stats.saturation.val<(state.player.stats.saturation.max/2)){
                                    send("[red] You're hungry! [c]")
                                    break
                                }
                                await sleep(0)
                            }
                            m.innerHTML = format("done.")
                        }
                    } else {
                        send("hm, i can't stay here for that long, i need to head back home.")
                        update()
                    }
                } else {
                    update()
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
        update()
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
    if (e.key === "Enter"){
        let n = send($("TypeBox").value)
        $("TypeBox").blur()
        $("TypeBox").value = ""
        checkCmd(n.innerText)
    }
})  

async function start(){
    send(`[align: center] [red]RE'KAN[c]: \"STEAMS & CLOUDS\"<br>version: ${state.version}`)
    chnlog = send(`[align: center]-*CHANGELOG*-<br>---<br>
    [#9E4DFFB8]-*LANGUAGES*-[c]<br>
    • *added* language generator<br>
    • *added* language grammar pack<br>
    • *added* language plurals<br>
    • *added* language verb conjugations<br>
    • *added* language translation (English to langN)<br>...<br><br>
    [#9E4DFFB8]-*ANIMALS*-[c]<br>
    • *added* animals<br>
    • *added* NPC taming animals<br>
    • *added* taming animals<br>...<br><br>
    [#9E4DFFB8]-*GENERAL*-[c]<br>
    • *added* more items<br>
    • *added* pregnancy<br>
    *...*
    `)
    send("thank you for playing ♥")
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
    liveNPC: ${u}, warmNPC: ${w}, coldNPC: ${c}<br>
    Animals: ${state.animalPopulation.length}<br>
    fame:<br>
    1: ${state.STATICPOPULATION.filter(e=>e.fame>0&&e.fame<1).length}<br>
    5: ${state.STATICPOPULATION.filter(e=>e.fame>5&&e.fame<10).length}<br>
    10: ${state.STATICPOPULATION.filter(e=>e.fame>10&&e.fame<20).length}<br>
    20: ${state.STATICPOPULATION.filter(e=>e.fame>20&&e.fame<30).length}<br>
    30: ${state.STATICPOPULATION.filter(e=>e.fame>30&&e.fame<50).length}<br>
    50: ${state.STATICPOPULATION.filter(e=>e.fame>50&&e.fame<100).length}<br>
    100: ${state.STATICPOPULATION.filter(e=>e.fame>100&&e.fame<150).length}<br>
    language speakers:<br>
    ${state.languages.map(e=>e.name+": "+state.population.filter(o=>o.languages.filter(p=>p&&p.language.name===e.name).length>0).length).join("<br>")}
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

let debug = true
let fpsCounter = null
let langEx = null

let chnlog = null
let showChn = false

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
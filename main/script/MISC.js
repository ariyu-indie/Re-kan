import { genBook, bookId, distribute } from "./BOOKS.JS"
import * as eraSys from "./ERA.JS"
import { generateAnimal, genAnimals, tame } from "./ANIMALS.js"
import { observable, waitUntil } from "./OBSERVABLES.js"
import { state } from "./STATE.js"
import { TextToNum, send, format } from "./SEND.js"
import { $, sleep } from "./HELPER.js"
import { random, sorter, RWCH } from "./UTILS.js"
import { structure, place, group, person } from "./CLASSES.js"
import { updBg, updWeatherImg, getImg } from "./IMAGES.js"
import { m, fm, onePersonPlease, genPeople, look, disNPC, newMem, shock, hasPartner, genImg } from "./HUMANS.js"
import { useItem, hasItem, addItem, collect } from "./ITEMS.js"
import { toDivine, toMortal } from "./DIVINITY.js"
import { BFS, reconstructPath, newJo, pathCache } from "./PATHFINDING.js"
import { newGoal, interpretGoals, giveGoals, unt } from "./GOAL.js"
import { locId, terrainType, addRes, generateResources, genLoc, placePeople, connectLoc, dMap, lookAround } from "./LOC.js"
import { buildFarm, buildMarket, buildHouse, buildLibrary, build, buildings, structId } from "./BUILDINGS.js"
import { createLanguage, translate, langId, seperate, intelligibility, intellV2, borrowR } from "./LANGUAGES.js"
import { pregnant } from "./PREGNANCY.js"
import { approach, love, breakUp, checkMastery, nearPartner, talkOptions, bondWith} from "./TALK&ROMANCE.js"
import { relive } from "./MEMORY.js"
import { BIC, applyDmg, visHP, WTRBD, CIF, tremblingCause } from "./BODY.js"
import { inAFight, fId, combat, join, exitAF, checkSides, procFight, CIFON, assessHp, strDiff } from "./COMBAT.js"
import { genHist } from "./HISTORY.js"
import { newGroup, newMember, hasMember, joinGr, newRank, exitAg, grId, claimed, claim, newRel } from "./GROUPS.js"
import { playerTags } from "./PLAYERTAGS.js"
import { viewMap } from "./MAP.js"
import { getRng } from "./SEED.js"
import { move } from "./SUPERFUNC.js"

export let focusMSG = null
let fameTh = 0

export function setFocus(x){
    focusMSG = x
}

export function removeFocus(){
    focusMSG = null
}

export function date(){
    return state.cal.m+"m / "+state.cal.d+"dy / "+state.cal.y+"yr / "+state.cal.h+" hr"
}

let EraYear = 0

export async function upthedate(x){
    let n = x
    while (n>0){
    for (let i in state.population){
        state.population[i].age += (1/8760)
    }
    for (let i in state.animalPopulation){
        state.animalPopulation[i].age += (1/8760)
    }
    state.cal.h++
    if (state.cal.h>=24){
        state.cal.d++
        state.cal.h = 0
    }
    if (state.cal.d>=30.4166667){
        state.cal.m++
        state.cal.d=1
    }
    if (state.cal.m>=12){
        state.cal.y++
        /*console.log(
            "0:",state.population.filter(e=>e&&e.fame>0).length,"\n",
            "1:",state.population.filter(e=>e&&e.fame>1).length,"\n",
            "5:",state.population.filter(e=>e&&e.fame>5).length,"\n",
            "10:",state.population.filter(e=>e&&e.fame>10).length,"\n",
            "20:",state.population.filter(e=>e&&e.fame>20).length,"\n",
        )*/
        state.cal.m=0
    }
    if (state.cal.y===EraYear*3){
        const data = {
            pop: state.population,
            loc: state.locations,
            calendar: state.cal
        }
        state.era.push(eraSys.genEraV2(data))
        //console.log(state.era)
        EraYear++
        let map = await viewMap()
        send(`[align: center]*world map*---<img width=200 height=200>${map}<img>`)
    }
    n--
    }
    //return state.cal.m+" / "+state.cal.d+" / "+state.cal.y
}

export function locEval(){
    /*for (let i in state.locations){
        let l = state.locations[i]
        for (const i of l.structures){
            if (i.hp<=0){
                i.materials = []
                i.state = "unfinished"
            }
        }
        let people = state.population.filter(e=>e&& locId(e.location)===l&&!e.pruned)
        let pers = random(people)
        if (pers&&pers.isInWomb===false&&pers!==state.player&& getRng()<(0.1*pers.hobbies.building)&&pers.age>18){
            l.difficulty *= 0.995
            let type = random(["farm", "house", "library", "market"])
            if (!pers) return
            if (!hasItem(pers, "wood")){
                newGoal(pers, "collect", "wood")
            }
            if (type!=="house"){
                let b = build(pers, type)
                l.structures.push(b)
                console.log("build")
            } else if (type==="house"){
                if (!pers.home?.structure&&pers?.home?.structure?.ownedBy!==pers){
                    let house = build(pers, "house")
                    if (house){
                        pers.home.loc = pers.location
                        pers.home.structure = house.id
                        let m1 = newMem(pers, "i established my home!", "good", "happy")
                        m1.hp = 9999
                        m1.type = "structure"
                        m1.structure = house.id
                        m1.importance = 999
                        l.structures.push(house)
                    }
                }
            }
            if (state.player&&l===locId(state.player.location)){
                send(`${pers.name} built a ${type}!`)
            }
        }
        else if (pers && pers!==state.player&& getRng()<0.001){
            if (pers&&pers.home?.loc&&pers.location!==pers.home.loc){
                newGoal(pers, "go", null, null, {A: locId(pers.location), B: locId(pers.home.loc)})
            }
        }
        //if (l.structures.length<=0) continue
        for (const o of l.structures){
            if (o.requires.length<=0){
                o.state = "finished"
            } else {
                for (const i of o.requires){
                    if (i.met>=i.quantity){
                        o.requires = o.requires.filter(e=>e&&e.item!==i.item)
                    }
                }
            }
        }
        //let nstruc = Math.round(getRng()*time/100)
    }*/
    for (let i in state.locations){
        if (getRng()<0.01){
        let l = state.locations[i]
        let people = state.population.filter(e=>e&& locId(e.location)===l)
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
                        if (state.player&& n.name===locId(state.player.location).name){
                            send(`the rain from ${l.name} has reached this land...`)
                        }
                    }
                }
            }
        } else if (getRng()<0.01){
            let libA = random(l.structures.filter(e=>e&&e.type==="library"&&e.books.length>0))
            let libB
            if (l.connections.length>0){
                libB = random(locId(random(l.connections)).structures.filter(e=>e&&e.type==="library"&&e.books.length>0&&e!==libA))
            }
            if (libA&&libB){
                let b = distribute(structId(libA), structId(libB))
                //console.log(b)
                if (b){
                    let res = random([
                        "it travelled across the valleys",
                        "it is preserved for more people to see"
                    ])
                    send(`a book titled ${b.title} was distributed, ${res}.`)
                }
            }
        } else if (getRng()<0.0001&&l.rain.state===false){
            l.rain.state = true
            l.rain.strength = getRng()*0.5+0.5
            if (state.player&&l===state.player?.location){
                send("it has started raining...")
            }
        }
        } else {continue}
    }
}

export function shareResources(loc){
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
        let m1 = newMem(giver, `i gave some ${name} to ${(giver.knows.some(e=>e===receiver.id)?receiver.name:"someone")}`)
        m1.target = receiver.id
        m1.type = "person"
        let m2 = newMem(receiver, `${(receiver.knows.some(e=>e===giver.id)?giver.name:"someone kind-hearted")} gave me some ${name}`)
        m2.target = giver.id
        m2.type = "person"
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

export function addToSale(x, market){
    let item = x.inventory.length > 0 ? random(x.inventory) : null
    if (item&&market.itemsForSale.some(e=>e.item_name===item.item_name)){
        return
    }
    if (item){
        let q = getRng() * item.quantity
        let invIt = x.inventory.find(e => e.item_name === item.item_name)
        invIt.quantity -= q
        market.itemsForSale.push({
            item_name: item.item_name,
            amountForSale: q,
            inExchange: {
                item: random(["coin", random(["coin", random(state.itemDict)])]),
                amount: getRng()*5
            }
        })
    }
}

export function langUpd(x){
    if (getRng()<=0.0001){
        seperate(x)
        send("a language dialect has formed")
    }
}

export function inside(x){
    if (x.inside?.state){
        return x.inside.structure
    }
    return null
}

export function UPDin(x){
    if (!x) return
    let legs = x.stats.hp.leftLeg?.val>=20||x.stats.hp.rightLeg?.val>=20
    let arms = x.stats.hp.leftArm?.val>=20||x.stats.hp.rightArm?.val>=20
    let cd = state.population.filter(e=>e&&locId(e.location)===locId(x.location)&&(e.state!=="dead"&&e.fame>state.population.length*0.01)) //famous people
    let b = inside(x)
    if (b){
        let obj = locId(x.location).structures.find(e=>e&&e.id===b)
        if (obj){
            if (obj.type==="library"){
                if (getRng()<0.01){ //make books
                    if ((arms)&&locId(x.location).structures.some(e=>e&&e.type==="library")){
                        let sub = random(cd)
                        let lib = obj
                        if (sub&&lib){
                            let book = genBook(x, sub)
                            state.globalLib.push(book)
                            lib.books.push(book.id)
                            //console.log(state.globalLib)
                            send("a book was written.")
                            let m1 = newMem(x, `i wrote a book about ${sub.name}`, "good", "encouraged")
                            m1.target = sub.id
                            m1.structure = lib.id
                            m1.type = "person"
                        }
                    }
                } else if (getRng()<0.01){
                    if (!arms) return
                    let lib = obj
                    if (lib?.books?.length>0){
                        let book = random(lib.books)
                        if (book){
                            read(x, bookId(book))
                            //console.log(state.globalLib.filter(e=>e.read>0))
                        }
                    }
                } //readbooks
            }
            
        }
        if (getRng()<0.01){
            x.inside.state = false
            x.inside.structure = null
        }
    }
}

export function struF(locID, type="any"){
    if (type==="any") return locId(locID).structures.filter(e=>e&&e.state==="finished")
    let res = locId(locID).structures.filter(e=>e&&e.state==="finished"&&e.type===type)
    if (res.length>0){
        return res
    }
    return []
}

export function behaviors(x){
    if (x.isInWomb) return
    UPDin(x)
    let legs = x.stats.hp.leftLeg?.val>=20||x.stats.hp.rightLeg?.val>=20
    let arms = x.stats.hp.leftArm?.val>=20||x.stats.hp.rightArm?.val>=20
    //if (!(armL&&armR)) return
    if (!(legs)) return
    let cd = state.population.filter(e=>e&&locId(e.location)===locId(x.location)&&(e.state!=="dead"&&e.fame>state.population.length*0.01)) //famous people
    /*if (getRng()<0.001){
        
    }*/
    if (getRng()<0.001){
        if (!x.group?.id){
            let groupsTJ = state.population.filter(e=>e&&e.location===x.location&&e.group.id)//groups to join, people with groups 
            if (groupsTJ){
                let g = random(groupsTJ) //person obj
                if (g){
                    let group = g.group //direct person obj access of group
                    let grObj = grId(group.id)
                    //console.log(group)
                    joinGr(x, group.id)
                    if (grObj){
                        send(`${grObj.name} has welcomed its number ${grObj.groupMembers.length} member!`)
                    }
                } else if (g&&state.player.id===g.id) {
                    let group = g.group
                    state.playerTags.joinGroupAsk.state = true
                    state.playerTags.joinGroupAsk.group = group.id
                }
            }
        }
    } else if (getRng()<0.0001){
        let closeFriend = random(x.knows)
        if (closeFriend&&!claimed(x.location)){
            let n = look(closeFriend)
            if (n&&getRng()>n.social.pride){
                let g = newGroup(x, [n])
                if (g){
                    send(`a new group named ${g.name} was founded by ${x.name}.`)
                }
            }
        } else if (!closeFriend&&!claimed(x.location)){
            let g = newGroup(x)
            if (g){
                send(`a new group named ${g.name} was founded by ${x.name}.`)
            }
        }
    } else if (getRng()<0.01&&x.group?.id){
        let res = claim(grId(x.group.id), x.location)
        if (res){
            let popInIt = state.population.filter(e=>e&&e.location===x.location&&e.group?.id!==x.group.id)
            for (const i of popInIt){
                i.group.id = null
                i.group.rank = null
                joinGr(i, x.group.id)
            }
            send(`this land has been claimed, capturing ${popInIt.length}+ people.`)
            //send("a land has been claimed...")
        }
    } else if (getRng()<0.1){
        let building = RWCH(state.settings.buildRarity, item=>{return item.score})
        //console.log(building)
        if (building){
            let b = build(x, building.building)
            //console.log(b)
            if (b){
                locId(x.location).structures.push(b.id)
            }
        }
    } else if (getRng()<0.01){
        let inFights = state.population.filter(e=>e&&inAFight(e))
        if (inFights.length>0){
            let f = random(inFights).fight.id
            if (f){
                let s = "neutral"
                if (x?.group?.id===f?.group?.id){
                    s = x.fight.side
                    let fightObj = fId(f.fight.id)
                    let allG = []
                    for (const i of fightObj.participants){
                        if (!allG.includes(look(i.obj).group?.id)){
                            allG.push(look(i.obj).group.id)
                        }
                    }
                    if (allG.length<=1){
                        s = "neutral"
                    }
                }
                join(x, f, s)
                let fightObj = fId(f)
                fightObj.log.innerHTML += format(`${x.name} joined the fight as ${x.fight.side} to stop it!<br><br>`)
                send(`${x.name} joined the fight as ${x.fight.side} to stop it!`)
            }
        }
    } else if (getRng()<0.01){
        if (x.group.id&&x.areaInterest>0.8){
            claim(grId(x.group.id), x.location)
        }
    } else if (getRng()<0.01){
        relive(x)
    } else if (x.mood<0.3&&getRng()<0.01){
        let target = random(state.population.filter(e=>e&&e.location===x.location))
        combat(x, target)
    } else if (x.mood<0.3&&getRng()<0.01){
        breakUp(x)
    } else if (getRng()<0.01){
        if (inside(x)){
            return
        } else {
            let b = struF(x.location)
            if (b){
                let building = random(b)
                if (building){
                    newGoal(x, "enter", building.id)
                }
            }
        }
    } else if (getRng()<0.01){
        if (x.mood>0.5){
            let chosen = random(state.population.filter(e=>e&&x.location===e.location&&e!==x))
            if (chosen&&x){
                approach(x, chosen)
            }
        } else if (x.mood>0.2&&x.mood<0.5&&getRng()<0.01){
            let chosen = random(state.population.filter(e=>e&&x.location===e.location&&e!==x))
            if (chosen&&x){
                approach(x, chosen)
            }
        }
    } else if (getRng()<0.01&&x.mood>0.5){
        let chosen = random(state.population.filter(e=>e&&x.location===e.location&&e!==x&&x.gender!==e.gender))
        if (chosen&&x){
            if (love(x, chosen)){
                send("a local love was formed!")
            }
        }
    } else if (getRng()<0.1){
        let st = random(locId(x.location).structures.filter(e=>e&&e.state==="unfinished"))
        if (st){
            let f = st.requires[0]
            if (f){
                let item = hasItem(x, f.item) 
                if (item){
                    if (item.quantity>f.quantity){
                        let need = f.quantity-f.met
                        f.met += need
                        item.quantity -= need
                    } else {
                        f.met += item.quantity
                        item.quantity = 0
                    }
                }
            }
        }
    } else if (getRng()<0.01){
        let market = random(locId(x.location).structures.filter(e=>e&&e.ownedBy===x.id&&e.state==="finished"&&e.type==="market"))
        if (market){
            addToSale(x, market)
        } else {
            let l = random(state.locations.filter(e=>e&&e.structures.some(r=>r&&r.ownedBy===x.id)))
            if (l){
                newGoal(x, "go", null, null, {A: locId(x.location), B: l})
            }
        }
    } else if (getRng()<0.001){
        let a = random(locId(x.location).structures)
        if (a){
            a = structId(a)
            look(a.placedBy).fame += 1
            let m1 = newMem(x, "i acknowledged a structure")
            m1.target = a.id
            m1.type = "structure"
            if (state.player&&locId(state.player.location)===locId(x.location)){
                send("you saw someone acknowledge a structure.")
            }
        }
    } else if (getRng()<0.1){
        for (let i=0;i<5;i++){
            collect(x, "wood")
        }
    } else if (getRng()<0.01){ //leave
        newGoal(x, "go", null, null, {A: locId(x.location), B: random(state.locations)})
    } else if (getRng()<0.001){ //leave
        if (x.home?.loc&&x.home.structure){
            let home = x.home.structure
            if (home){
                newGoal(x, "enter", home)
            }
        }
    } else if (getRng()<0.001){
        if (!arms) return
        let animalChoices = state.animalPopulation.filter(e=>e&&e.state==="alive"&&locId(e.location)===locId(x.location))
        let animal = animalChoices?random(animalChoices):null
        if (animal){
            tame(x, animal)
            let m1 = newMem(x, "i tamed an animal")
            m1.target = animal.id
            m1.type = "animal"
        }
    }
}

export function processSatuHydra(x){
    if (!x||!x.location||!locId(x.location)) return
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    let waterDrain = ageFactor + 1.2 * (1 + locId(x.location).difficulty)
    if (x.curGoal?.verb === "go") waterDrain *= 1.7
    if (!x.curGoal) waterDrain *= 0.5
    if (x.justDrank <= 0) {
        x.stats.hydration.val -= waterDrain
    } else {
        x.stats.hydration.val -= ageFactor
        x.justDrank--
    }
    let hungerDrain = ageFactor + 0.8 * (1 + locId(x.location).difficulty)
    if (x.curGoal?.verb === "go") hungerDrain *= 1.6
    if (!x.curGoal) hungerDrain *= 0.5
    if (x.justEaten <= 0) {
        x.stats.saturation.val -= hungerDrain
    } else {
        x.stats.saturation.val -= ageFactor
        x.justEaten--
    }
}
export function read(x, book){
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
    let m1 = newMem(x, `i read a book, i found it ${opinion}`)
    x.knows.push(book.subject)
    m1.target = book.id
    m1.type = "book"
}
/*function createGroup(loc){
    //if (groups.some(e=>e.territories)
}*/
export function autoDrinkEat(x){
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
    //console.log("h")
}

export function wombUpd(x){
    if (x.age>0.75){
        x.isInWomb = false
        let mother = look(x.relatives.find(e=>e.person&&e.type==="parent"&&e.gender==="female").person)
        send("a life was born!")
        if (mother){
            x.location = mother.location
            mother.pregnant.state = false
            mother.pregnant.fetus = null
        } else {
            x.location = random(states.location)
        }
    }
}

export function globalUpd(x){ //light
    for (const mem of x.memory){
        mem.hp -= Math.min(1, 1*state.HPU)
    }
    if (x.mood>1){
        x.mood = 1
    } else if (x.mood<0){
        x.mood = 0
    }
    if (x.mood>0.8){
        x.mood -= 0.001
    } else if (x.mood<0.8){
        x.mood += 0.001
    }
    if (x.inside.state){
        let loc = state.locations.find(e=>e&&e.structures.find(o=>o&&o.id===x.inside.structure))
        if (loc){
            move(x, loc.id)
        }
    }
    if (x.knows.length!==x.relationships.length){
        for (const i of x.knows){
            if (!x.relationships.some(e=>e&&e.id===i)){
                bondWith(x, look(i))
            }
        }
        let r = []
        for (const i of x.relationships){
            if (!r.some(e=>e&&e.id===i.id)){
                r.push(i)
            }
        }
        x.relationships = r
    }
    for (const i of x.relatives){
        let p = look(i.person)
        if (p){
            if (!x?.relationships.some(e=>e&&e.id===i.person)){
                let n = bondWith(x, p)
                n.level = 0.9
            }
        }
    }
    if (x.level!=="god"&&!x.worship.god&&getRng()<0.0001){
        let gods = state.population.filter(e=>e&&e.level==="god")
        if (gods){
            let god = random(gods)
            if (god){
                x.worship.god = god.id
                x.worship.faith = 0.5
                if (god===state.player){
                    send("you felt someone worship you...")
                }
            }
        }
    } else if(x.worship.god) {
        let god = look(x.worship.god)
        if (god){
            god.stats.faith.val += x.worship.faith
        }
    }
    if (x.level==="god"){
        if (x.stats.faith.val>x.stats.faith.max){
            x.stats.faith.val = x.stats.faith.max
        } else if (x.stats.faith.val<0){
            x.stats.faith.val = 0
        }
    }
    let l = locId(x.location)
    let isWet = x.condition.find(e=>e&&e==="WET")
    if (l?.rain?.state&&l?.rain?.strength>0.3&&!isWet){
        let m1 = newMem(x, "i got wet and soaked by the rain", "bad", "angry")
        m1.type = "weather"
        x.condition.push("WET")
    }
    if (!x.familiarLoc.includes(x.location)){
        x.familiarLoc.push(x.location)
    }
    if (x.home.loc&&!x.familiarLoc.includes(x.home.loc)){
        x.familiarLoc.push(x.home.loc)
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

export function updNpc(x){
    BIC(x)
    if (!x||x.state==="dead"||!locId(x.location)) return
    let hp = visHP(x)
    if (hp.p <= 50|| x.nextTurn==="unconscious") {
        shock(x, 2, "someone was knocked!")
        x.state = "unconscious"
        if (inAFight(x)&&x?.id!==state?.player?.id){
            let msg = "eum..."
            if (getRng()<x.social.pride){
                msg = random([
                    "what...?!",
                    "i...",
                    "no!",
                    "ach!"
                ])
            } else {
                msg = random([
                    "mhm...",
                    "ah...",
                    "hm...",
                    "eh..."
                ])
            }
            fId(x.fight.id).log.innerHTML += format(`an attack made *${x.name}* *[red]unconscious[c]*!`)+"<br><br>"
            fId(x.fight.id).log.innerHTML += format(`*${x.name}*: \"${msg}\"`)+"<br><br>"
        }
        exitAF(x)
        if (x.id === state?.player?.id) {
            send("you're *[orange]unconscious![c]*")
        }
        send("someone passed out.")
        return
    }
    if (hp.p <= 0||x.nextTurn==="dead") {
        shock(x, 5, "i just saw someone die")
        x.state = "dead"
        if (inAFight(x)&&x?.id!==state?.player?.id){
            let msg = "aw..."
            if (getRng()<x.social.pride){
                msg = random([
                    "no, no!",
                    "i despise you!",
                    "you'll burn!",
                    "curse you!"
                ])
            } else {
                msg = random([
                    "this is how it ends...",
                    "maybe next time...",
                    "life's awesome while it lasted...",
                    "ugh...",
                    "goodbye.",
                ])
            }
            fId(x.fight.id).log.innerHTML += format(`${["hunger", "thirst"].includes(x.cause)?"":"a devastating attack made "}*${x.name}* *[red]${["hunger", "thirst"].includes(x.cause)?"died":"die"}[c]* by ${x.cause?x.cause:"unknown cause"}.`)+"<br><br>"
            fId(x.fight.id).log.innerHTML += format(`*${x.name}*: \"${msg}\"`)+"<br><br>"
        }
        exitAF(x)
        if (x.id === state?.player?.id) {
            send("you [red]died![c]")
        }
        if (state?.player?.knows.includes(x.id)){
            send(x.name+" died.")
        } else {
            send("someone died.")
        }
        return
    }
    if (state.player&&x?.id===state.player?.id&&x.stats.hp.meta.bleeding.parts){
        let bleeding = x.stats.hp.meta.bleeding.parts
        for (let i in bleeding){
            if (bleeding[i]){
                send("you're bleeding! in the "+i+` [red]↓(${bleeding[i]})[c]`)
            } 
        }
    }
    for (let i in x.stats.hp.meta.bleeding.parts){
        let b = x.stats.hp.meta.bleeding.parts[i]
        if (b){
            x.stats.hp[i].val -= b
        }
    }
    if (x?.id!==state.player?.id&&!inAFight(x)){
        behaviors(x)
        giveGoals(x)
        interpretGoals(x)
        x.areaInterest += 0.01
    }
    //send(`${x.name}'s' turn`)
    //send("hello")
    procFight(x)
    globalUpd(x)
    //tremblingCause(x)
    if (x.stats.tremble.val<0){
        x.stats.tremble.val = 0
    } else if(x.stats.tremble>0) {
        x.stats.tremble.val -= 0.005
    }
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    if (!x.fertile && x.age>16&&x.age<40){
        if (getRng()<0.001){
            x.fertile = true
        }
    } else if (x.fertile&&x.age>40) {
        if (getRng()<0.001){
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
    x.stats.stamina.val += (x.stats.stamina.max*0.1)/(1+locId(x.location).difficulty+ageFactor)
    if (x.stats.hydration.val <= 0.10*x.stats.hydration.max){
        x.stats.hp.head.val -= x.stats.hp.head.max*0.05+ageFactor
        x.cause = "thirst"
    }
    if (x.stats.saturation.val <= 0.10*x.stats.saturation.max){
        x.stats.hp.head.val -= x.stats.hp.head.max*0.03+ageFactor
        x.cause = "hunger"
    }
    autoDrinkEat(x)
    //x.fame -= 0.01
    if (x.fame<0){
        x.fame = 0
    } else if(x.fame>0) {
        x.fame -= 0.001
    }
    for (let i in x.stats){
        if (i==="hp") continue
        if (x.stats[i].val > x.stats[i].max){
            x.stats[i].val = x.stats[i].max
        }
        if (x.stats[i].val < 0){
            x.stats[i].val = 0
        }
    }
    for (let i in x.stats.hp){
        let s = x.stats.hp[i]
        if (s.val>s.max){
            s.val = s.max
        } else if (s.val<0){
            s.val = 0
        }
    }
    //if (x!==state.player){
    //}
}

export function prunedUpd(x){
    if (x.state==="dead"||locId(x.location)) return
    let loc = random(state.locations.filter(e=>e.id!==x.location))
    let a = random(state.STATICPOPULATION.filter(e=>e.location===loc.id&&e.pruned))
    if (getRng()<0.1){
        let type = random(["house", "library", "market", "farm"])
        if (type==="house"){
            let b = buildHouse(a)
            b.state = "finished"
            loc.structures.push(b)
        }
        else if (type==="library"){
            let b = buildLibrary(a)
            b.state = "finished"
            loc.structures.push(b)
        }
        else if (type==="market"){
            let b = buildMarket(a)
            b.state = "finished"
            loc.structures.push(b)
        }
        else if (type==="farm"){
            let b = buildFarm(a)
            b.state = "finished"
            loc.structures.push(b)
        }
    }
    //console.log("yes")
}

export async function estiBat(x, t){
    if (!x||!t) return
    let winner = strDiff(x, t)
    if (t.fame >= 10) {
        if (winner.id === x.id) {
            send(`famous ${t.name} was killed.`)
            t.stats.hp.head.val = -999
            t.nextTurn = "dead"
        } else {
            send(`famous ${t.name} killed ${x.name} after getting attacked.`)
            x.stats.hp.head.val = -999
            x.nextTurn = "dead"
        }
    } else {
        if (winner.id === x.id) {
            send(`a death in ${locId(x.location).name} occured.`)
            t.stats.hp.head.val = -999
            t.nextTurn = "dead"
        } else {
            send(`a death in ${locId(x.location).name} occured`)
            x.stats.hp.head.val = -999
            x.nextTurn = "dead"
        }
    }
    if (t.group.id&&x.group.id&&getRng()<0.01){
        //let img = await viewMap()
        //send(`<img width=200 height=200>${img}<img>`)
        let g = grId(t.group.id)
        let gB = grId(x.group.id)
        if (g&&gB){
            newRel(g, gB, "war")
            send("a [red]war[c] has been declared!")
        }
    }
    winner.murder++
    winner.fame += 3
    return winner
}

export function coldUpd(x){
    if (!x||!(locId(x.location))) return
    globalUpd(x)
    BIC(x)
    let hp = visHP(x)
    if (x.age>x.ageLimit||hp.p<=20||x.nextTurn==="dead"){
        shock(x, 5, "i just saw someone die.")
        if (x.group?.id){
            let obj = grId(x.group.id)
            if (obj){
                obj.stability -= 1/obj.groupMembers.length
                if (x.group.rank==="leader"||x.group.rank==="core"){
                    send(`the *${x.group.rank}* of *${obj.name}* has *[red]died[c]*!`)
                }
                exitAg(x)
            }
        }
        x.state = "dead"
    }
    if (getRng()<0.001){
        let chosen = random(state.population.filter(e=>e&&e.location===x.location&&!(e.gender===x.gender)))
        if (x&&chosen){
            love(x, chosen)
            //send("love from apar")
        }
    }
    if (getRng()<0.001){
        let partner = look(nearPartner(x)?.person)
        if (partner){
            if (x.age>16&&x.age<32){
                if (partner.age>16&&partner.age<32){
                    x.fertile = true
                    partner.fertile = true
                    let father = x.gender==="male"?x:partner
                    let mother = x.gender==="female"?x:partner
                    pregnant(mother, father)
                    send("a conception happened.")
                }
            }
        }
    }
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    let lo = locId(x.location)
    //console.log(lo)
    if (lo.resources.find(e=>e.item==="water").quantity<=0){
        x.stats.hp.head.val -= 10*ageFactor
        x.stats.hydration.val = 0
    }
    if (getRng()<0.05){
        x.location = random(lo.connections)
    } else if (getRng()<0.01&&x.home?.loc){
        x.location = x.home.loc
    }
    if (x.adrenaline>0){x.adrenaline -= 0.01}else{
        x.adrenaline = 0
    }
    if (lo?.resources.find(e=>e.item==="fruit")?.quantity<=0){
        x.stats.hp.head.val -= 10*ageFactor
        x.stats.saturation.val = 0
    }
    //x.fame -= 0.001.
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
    let type = getRng()<(0.001-(lo.difficulty/1000))?random([
        "farm", "library",
        "market"
    ]):null
    if (type){
        let b = build(x, type)
        if (b){
            b.state = "finished"
            b.requires = []
            locId(x.location).structures.push(b.id)
        }
    } else if (getRng()<0.001&&lo.structures.some(e=>e&&e.state==="finished"&& e.type==="market"&&e.ownedBy===x.id)){
        addItem(x, "water", 1+getRng()*10)
        addItem(x, "fruit", 1+getRng()*10)
        let mar = random(lo.structures.filter(e=>e&&e.state==="finished"&& e.type==="market"&&e.ownedBy===x.id))
        if (mar){
            addToSale(x, mar)
        }
    }
    if ((getRng()<0.1&&x.group?.id)||grId(x.group?.id)?.relations.some(o=>o&&o.type==="war")){
        let gObj = grId(x.group.id)
        let res = claim(gObj, x.location)
        if (lo.connections
        .some(e=>e&&gObj.territory
        .some(o=>o&&o.loc===e))){
            if (res){
                let popInIt = state.population.filter(e=>e&&e.location===x.location&&e.group?.id!==x.group.id)
                for (const i of popInIt){
                    i.group.id = null
                    i.group.rank = null
                    let g = grId(i.group.id)
                    if (g){
                        g.groupMembers = g.groupMembers.filter(e=>e&&e.id!==i.id)
                    }
                    joinGr(i, x.group.id)
                }
                send(`${lo.name} has been claimed, capturing ${popInIt.length}+ people.`)
            }
        }
    }
    if (getRng()<0.001){
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
            x.home.loc = x.location
            x.home.structure = house.id
            house.state = "finished"
            lo.structures.push(house.id)
        }
    }
    if (getRng()<0.0001){
        let t = random(state.population.filter(e=>e&&e.location===x.location))
        estiBat(x, t)
        /*if (t){
            let winner = strDiff(x, t)
            if (t.fame>=10){
                if (winner.id===x.id){
                    send(`famous ${t.name} was killed.`)
                    t.stats.hp.head.val = -999
                } else {
                    send(`famous ${t.name} killed ${x.name} after getting attacked.`)
                    x.stats.hp.head.val = -999
                }
            } else {
                if (winner.id===x.id){
                    send(`a death in ${locId(x.location).name} occured.`)
                    t.stats.hp.head.val = -999
                } else {
                    send(`a death in ${locId(x.location).name} occured`)
                    x.stats.hp.head.val = -999
                }
            }
            winner.murder++
            winner.fame += 3
        }*/
    }
    /*if (x.group?.id){
        let g = grId(x.group.id)
        let war = g.relations.find(e=>e&&e.type==="war")
        if (war){
            let l = locId(x.location)
            let close = l.connections.filter(e=>e&&grId(war.group)?.territory.some(o=>o&&o.loc===e))
            if (close){
                x.location = random(close)
            } else {
                x.location = random(l.connections)
            }
        }
    }*/
    if (x.group?.id){
        let group = grId(x.group?.id)
        let war = group.relations.filter(e=>e&&e.type==="war")
        if (war){
            let c = random(war)
            if (c){
                let enObj = grId(c.group)
                let att = random(state.population.filter(e=>e&&e.group?.id===c.group))
                if (att){
                    let w = estiBat(x, att)
                    if (w.id===x.id){
                        let thisG = state.population.filter(e=>e&&e.group.id===x.group.id&&e.location===x.location&&e.group.rank==="fighter").length
                        if (thisG<=1&&!group.territory.some(e=>e&&e.loc===x.location)){
                            group.territory.push({
                                loc: x.location
                            })
                            let prev = state.groups.find(e=>e&&e.territory.some(o=>o&&o.loc===x.location))
                            if (prev){
                                prev.territory = prev.territory.filter(e=>e&&e.loc!==x.location)
                            }
                            send("[red]a land was captured![c]")
                        }
                        //             find                       
                        x.location = 
                        group.territory.find(e=>e&&
                        locId(e.loc)?.connections.some(
                            o=>o&&enObj.territory.some(
                                p=>p&&p.loc===o)))
                    }
                }
            }
        }
    }
    if (getRng()<0.0001){
        let t = random(state.population.filter(e=>e&&e.location===x.location))
        //send(JSON.stringify(t))
        if (t){
            let g = newGroup(x, [t])
            if (g?.establishedBy){
                let founder = look(g.establishedBy)
                send(`a *group* named *[green]${g.name}[c]* was founded by ${founder.name}`)
            }
        } else {
            let g = newGroup(x)
            if (g?.establishedBy){
                let founder = look(g.establishedBy)
                send(`a *group* named *[green]${g.name}[c]* was founded by ${founder.name}`)
            }
        }
    }
    if (getRng()<0.01){
        if (!x.group?.id) {
            let groupsTJ = state.population.filter(e => e && e.location === x.location && e.group.id) //groups to join, people with groups 
            if (groupsTJ) {
                let g = random(groupsTJ) //person obj
                if (g) {
                    let group = g.group //direct person obj access of group
                    let grObj = grId(group.id)
                    //console.log(group)
                    joinGr(x, group.id)
                    if (grObj) {
                        send(`${grObj.name} has welcomed its number ${grObj.groupMembers.length} member!`)
                    }
                } 
            }
        }
    }
    if (getRng()<0.001){
        let l = structId(random(state.structures.filter(e=>e&&lo.structures.some(o=>o&&o===e.id)&&e.state==="finished")))
        if (l){
            look(l.placedBy).fame += 1
        }
    }
    if (getRng()<0.001){
        let animalChoices = state.animalPopulation.filter(e=>e.location===x.location&&e.tamed===false)
        let animal = animalChoices?random(animalChoices):null
        //console.log(animal)
        if (animal){
            tame(x, animal)
            //("an animal has been tamed.")
        }
    }
    //let c = state.population.filter(e=>e&&locId(e.location)===locId(x.location)&&e.state!=="dead"&&e.fame>population.length*0.1) //famous people
    if (getRng()<(0.0001+(x.hobbies.writing/100))){ //make books
        if (locId(x.location)){
            let sub = random(state.population.filter(
                    e=>e&&locId(e.location)===lo&&e.fame>fameTh
                )
            )
            let lib = random(state.structures.filter(e=>e&&lo.structures.some(o=>o&&o===e.id)&&e.state==="finished"&&e.type==="library"))
            if (lib&&sub&&sub.fame>fameTh&&state.globalLib.filter(e=>e&&e.subject===sub).length<3){
                let book = genBook(x, sub)
                state.globalLib.push(book)
                lib.books.push(book.id)
                sub.fame += 1
                //console.log(`${lib.name} books:`, lib.books)
            }
        }
    }
    /*if (hp<=20){
        x.state = "dead"
    }*/
    if (getRng()<(0.01+(x.hobbies.writing/100))){
        let lib = random(lo.structures.filter(e=>e.type==="library"))
        if (lib){
            lib = structId(lib)
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

export function prune(x){
    if (!state.met.includes(x.id)){
        state.met.push(x.id)
    }
    let data = state.STATICPOPULATION.filter(e=>e.location===x.location||state.met.includes(e.id))
    let dataNotMet = state.STATICPOPULATION.filter(e=>e.location!==x.location&&!state.met.includes(e.id))
    let metRn = state.STATICPOPULATION.filter(e=>e.pruned&&e.location===x.location&&!state.met.includes(e.id))
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
    //console.log("data:", state.STATICPOPULATION)
}

//$("focus").innerHTML = focusMSG?focusMSG.innerHTML:""

export function warmUpd(x){
    if (!x||x.state==="dead"||!locId(x.location)) return
    behaviors(x)
    giveGoals(x)
    globalUpd(x)
    interpretGoals(x)
    BIC(x)
    procFight(x)
    //x.age += HPU/8640
    x.inventory = x.inventory.filter(e=>e&&e.quantity>0)
    let hardCap = 1/((1+x.ageLimit)*10)
    let ageFactor = hardCap * x.age * x.age
    processSatuHydra(x)
    x.stats.stamina.val += (x.stats.stamina.max*0.2)/(1+locId(x.location).difficulty+ageFactor)
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
        x.stats.hp.head.val -= x.stats.hp.head.max*0.05+ageFactor
    }
    if (x.stats.saturation.val < 5){
        x.stats.hp.head.val -= x.stats.hp.head.max*0.03+ageFactor
    }
    if (x.stats.hp.head.val <= 0){
        shock(x, 5, "i just saw someone die")
        exitAF(x)
        x.state = "dead"
    }
    if (visHP(x).p<=20){
        exitAF(x)
        x.state = "unconscious"
    }
    //x.fame -= 0.01
    if (x.fame<0){
        x.fame = 0
    } else if(x.fame>0) {
        x.fame -= 0.001
    }
    for (let i in x.stats.hp){
        let s = x.stats.hp[i]
        if (s.val>s.max){
            s.val = s.max
        } else if (s.val<0){
            s.val = 0
        }
    }
    for (let i in x.stats){
        if (i==="hp") continue
        if (x.stats[i].val > x.stats[i].max){
            x.stats[i].val = x.stats[i].max
        }
        if (x.stats[i].val < 0){
            x.stats[i].val = 0
        }
    }
}

export let u = 0
export let w = 0
export let c = 0
export let iW = 0
export function update(args = {}) {
    state.fights = state.fights.filter(e=>e&&e.participants.length>=1)
    //console.log(state.fights)
    state.population = state.STATICPOPULATION.filter(e => e.state === "alive")
    state.animalPopulation = state.STATICANIMALS.filter(e => e.state === "alive")
    let focus = state.player?state.player:state.STATICPOPULATION[0]
    if (state.GenSettings.pruning){
        prune(focus)
        prunedUpd(focus)
    }
    for (const lang of state.languages){
        langUpd(lang)
    }
    fameTh = state.population.length*0.05
    /*if (!state.player){
        genHist()
    }*/
    /*if (debug){
        mem.innerHTML = format(`
        memory of focus:<br>
        ${focus.memory.map(e=>e.content+" - "+e.hp.toFixed(2)).join("<br>")}
        `)
        setFocus(mem)
    }*/
    //console.log(focus)
    //let focus = player?player:state.STATICPOPULATION[0].location
    //let prevLoc = null
    /*if (state.settings.images){
        if (prevLoc&&prevLoc===curLoc){
            updBg(focus)
            updWeatherImg(focus)
        } else {
            prevLoc = curLoc
            curLoc = locId(focus.location).type
        } 
    }*/
    send("the world moves")
    $("calendar").innerText = date() + " " //focus.appearance.height.cur
    if (state.era[state.era.length-1]?.name){
        $("era").innerText = state.era[state.era.length-1].name
    }
    if (focus?.stats?.hydration&&focus?.stats.saturation){
        let hp = visHP(focus)
        $("HEALTH").style.width = hp.p+"%"
        $("HYDRATION").style.width = (focus.stats.hydration.val/focus.stats.hydration.max)*100+"%"
        $("SATURATION").style.width = (focus.stats.saturation.val/focus.stats.saturation.max)*100+"%"
        $("mood").innerText = focus.mood
    }
    if (state.player) updNpc(state.player)
    let updated = []
    let warm = []
    let cold = []
    let inWomb = []
    for (const i of state.groups){
        if (i.territory.length<=0||i.groupMembers.length<=0){
            for (const o of i.relations){
                let g = grId(o.group)
                if (g){
                    g.relations = g.relations.filter(e=>e&&e.group!==i.id)
                }
            }
            for (const o of i.groupMembers){
                let obj = look(o.id)
                if (obj){
                    exitAg(obj)
                }
            }
            send(`${state.player?.group.id===i.id?"*your group*":i.name} had [red]*collapsed*[c].`)
            i.relations = []
            state.groups = state.groups.filter(e=>e&&e.id!==i.id)
        }
        if (i.stability<=0.1&&getRng()<0.01){
            i.territory = []
        }
        let leader = i.groupMembers.find(e=>e&&e.rank==="leader")
        let core = i.groupMembers.find(e=>e&&e.rank==="core")
        if (leader){
            let obj = look(leader.id)
            if (obj.state==="dead"){
                i.stability -= 0.002
            }
        } else {
            i.stability -= 0.001
        }
    }
    for (let e of state.population) {
        if (e.state === "dead") continue
        if (e.isInWomb===true){
            inWomb.push(e)
        } else if (state.player&&e.location === focus.location&&!e.pruned) {
            updated.push(e)
        } else if (state.player&&locId(focus.location).connections.includes(e.location)&&!e.pruned) {
            warm.push(e)
        } else {
            cold.push(e)
        }
    }
    u = updated.length
    w = warm.length
    c = cold.length
    iW = inWomb.length
    for (const i of updated) {
        updNpc(i)
    }
    for (const i of warm){
        warmUpd(i)
    }
    for (const i of cold){
        coldUpd(i)
    }
    for (const i of inWomb){
        wombUpd(i)
    }
    locEval()
    /*const locat = new Set([...updated, ...warm].map(p => p.location))
    if (state.player) locat.add(locId(state.player.location))

    for (let loc of locat) {
        if (getRng()<0.001){
            shareResources(loc)
        }
    }*/
    upthedate(state.HPU)
}
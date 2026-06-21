import { state } from "./STATE.js"
import { send, format } from "./SEND.js"
import { person, place } from "./CLASSES.js"
import * as names from "./NAMES.js"
import { random, RBH } from "./UTILS.js"
import { addItem, hasItem, collect, useItem} from "./ITEMS.js"
import { sleep, $ } from "./HELPER.js"
import { translate, langId } from "./LANGUAGES.js"
import { newAttack } from "./COMBAT.js"
import { bondWith } from "./TALK&ROMANCE.js"
import { createImagePerson } from "./APPEARANCEIMAGES.js"
import { getRng } from "./SEED.js"

export function genName(x, txt){
    let lang = RBH(x.languages, item=>{return item.mastery})
    //console.log(lang)
    if (lang?.language){
        return translate(txt, langId(lang.language))
    }
    return null
}

export function newMem(x, txt, m="neutral", em="calm"){
    let memory = {
        content: txt,
        type: "others",
        locOfAs: x.location,
        association: m,
        target: null,
        emotion: em,
        importance: x.adrenaline,
        hp: 5*(1+x.adrenaline)
    }
    x.memory.push(memory)
    return memory
}

export function shock(near, intensity, mem="", hate=[false, 100]){
    let close = state.population.filter(e=>e.state==="alive"&&e.location===near.location)
    if (!close) return
    for (let i=0;i<close.length*intensity;i++){
        let ch = random(close)
        ch.adrenaline += intensity
        if (mem){
            newMem(ch, mem)
        }
        if (hate[0]){
            let a = bondWith(ch, near)
            a.xr.level = 0
            a.tr.level = -100
        }
    }
}

export function look(x){
    let a = state.STATICPOPULATION.find(e=>e&&e.id===x)
    return a
}
export function disNPC(x){
    let a = state.STATICPOPULATION.filter(e=>e&&e.id.startsWith(x+" ")).pop()
    return a
}

export function genderiz(){
    let ftm = state.GenSettings.femaleRat/state.GenSettings.maleRat
    let mtf = state.GenSettings.maleRat/state.GenSettings.femaleRat
    let mc = getRng()*mtf
    let fc = getRng()*ftm
    if (fc > mc) return "female"
    return "male"
}

export function procRel(s, parent1, parent2){
    parent1.relatives.push({
        person: s.id,
        type: "child",
        gender: s.gender
    })
    parent2.relatives.push({
        person: s.id,
        type: "child",
        gender: s.gender
    })
    s.relatives.push({
        person: parent1.id,
        type: "parent",
        gender: parent1.gender
    })
    s.relatives.push({
        person: parent2.id,
        type: "parent",
        gender: parent2.gender
    })
    let par = [parent1, parent2]
    for (let i in par){
        let parentN = par[i]
        for (let o in parentN.relatives){
            let pers = look(parentN.relatives[o].person)
            let t=parentN.relatives[o].type
            if (pers&&pers!==s&&!s.relatives.some(e=>e.person===pers.id)){
                if (t==="child"){
                    s.relatives.push({
                        person: pers.id,
                        type: "sibling",
                        gender: pers.gender
                    })
                    pers.relatives.push({
                        person: s.id,
                        type: "sibling",
                        gender: s.gender
                    })
                }
                if (t==="sibling"){
                    let a = pers.gender==="male"?"uncle":"aunt"
                    let b = s.gender==="male"?"nephew":"niece"
                    s.relatives.push({
                        person: pers.id,
                        type: b,
                        gender: pers.gender
                    })
                    pers.relatives.push({
                        person: s.id,
                        type: a,
                        gender: s.gender
                    })
                }
                if (t==="parent"){
                    s.relatives.push({
                        person: pers.id,
                        type: "grandparent",
                        gender: pers.gender
                    })
                    pers.relatives.push({
                        person: s.id,
                        type: "grandchild",
                        gender: s.gender
                    })
                }
            }
        }
    }
}

export function genHobbies(){
    let h = {}
    h.leadership = getRng()
    h.socializing = getRng()
    h.building = getRng()
    h.art = getRng()
    h.sculpting = getRng()
    h.writing = getRng()
    h.observing = getRng()
    return h
}

export function hasPartner(x){
    let a = x.relatives.find(e=>e.type.includes("partner"))
    if (a){
        return a
    } else {
        return null
    }
}

export const bioColorsRgb = {
    "black": [0,0,0,255],
    "brown": [165, 42, 42, 255],
    "hazel": [129, 105, 73, 255],
    "amber": [255, 191, 0, 255],
    "dark brown": [101, 67, 33, 255],
    "light brown": [222, 184, 135, 255],
    "auburn": [224, 128, 64, 255],
    "chestnut": [152, 105, 80, 255]
}

const bioColors = [
    "black",
    "brown",
    "hazel",
    "amber",
    "dark brown",
    "light brown",
    "auburn",
    "chestnut"
] 

function generateAppearance(x){
    let parent = x.relatives.find(e=>e.type.includes("parent"))
    let parent2 = x.relatives.find(e=>e.type.includes("parent")&&e!==parent)
    if (parent&&parent2){
        let p1 = locId(parent.person).appearance
        let p2 = locId(parent2.person).appearance
        let minH = Math.min(p1.height.max, p2.height.max)
        let maxH = Math.max(p1.height.max, p2.height.max)
        let minSk = Math.min(p1.skin.color, p2.skin.color) //just melanin, higher, the darker the skin, the lower, the lighter the skin.
        let maxSk = Math.max(p1.skin.color, p2.skin.color)
        let minES = Math.min(p1.eye.size, p2.eye.size)
        let maxES = Math.max(p1.eye.size, p2.eye.size)
        x.appearance.height.cur = 2
        x.appearance.height.max = minH+getRng()*(maxH-minH)
        x.appearance.hair.top = random([p1.hair.top, p2.hair.top])
        x.appearance.hair.color = random([p1.hair.color, p2.hair.color])
        x.appearance.nose.shape = random([p1.nose.shape, p2.nose.shape])
        x.appearance.hair.length = 0.1
        x.appearance.eye.color = random([p1.eye.color, p2.eye.color])
        x.appearance.eye.size = minES+getRng()*(maxES-minH)
        x.appearance.skin.color = minSk+getRng()*(maxSk-minSk)
    } else {
        x.appearance.height.max = 5+getRng()*3
        x.appearance.height.cur = (x.age/(x.age+5))*x.appearance.height.max
        x.appearance.eye.color = random(bioColors)
        x.appearance.eye.size = getRng()
        x.appearance.hair.top = random(["top", "top_curly"])
        x.appearance.hair.color = random(bioColors)
        x.appearance.nose.shape = random(["sharp", "curvy", "bumped"])
        x.appearance.hair.length = getRng()
        x.appearance.skin.color = 0.5+getRng()*0.2
    }
    if (x.gender==="female"){
        x.appearance.hair.front = random(["curvy", "inward", "long", "outward", "spiky downward"])
        if (x.appearance.hair.length>0.8){
            x.appearance.hair.back = "long"
        }
        else if (x.appearance.hair.length>0.4){
            x.appearance.hair.back = "medium"
        }
        else if (x.appearance.hair.length>0.0){
            x.appearance.hair.back = "short"
        }
    } else {
        x.appearance.hair.front = random(["curly", "messy", "spiky"])
        x.appearance.hair.back = "short"
    }
}

export async function genImg(x){
    await createImagePerson(x).then((blob)=>{
        x.image = blob
    })
    return new Promise(resolve=>{
        resolve(x)
    })
}

export async function genImgForAll(){
    let m = send("generating IMAGES")
    let n = 1
    for (const i of state.STATICPOPULATION){
        if (!i.image){
            await createImagePerson(i).then((blob)=>{
                i.image = blob
            })
            m.innerHTML = format(`generating images... [${n}/${state.STATICPOPULATION.length}]`)
            n++
        }
        //await sleep(0)
    }
    m.innerHTML = format(`done! [1/1]`)
    await sleep(10)
    m.style.display = "none"
}

export function onePersonPlease(age=null){
    let p = new person()
    p.gender = genderiz()
    p.hobbies = genHobbies()
    if (state.languages.length>0){
        p.languages.push(
            {
                language: random([state.languages[Math.floor(state.GenSettings.domLang*state.languages.length)], random(state.languages)]).id,
                mastery: 0.90+getRng()*0.10
            }
        )
    }
    let punch = newAttack("punch")
    punch.damage = p.combat.damage
    punch.success = 0.9
    let kick = newAttack("kick")
    kick.damage = p.combat.damage+(p.combat.damage*0.2)
    kick.success = 0.6
    p.attacks.push(punch, kick)
    let fName = ""
    let lName = ""
    if (p.languages[0]?.language){
        fName = translate(random(random(langId(p.languages[0].language).lexicon).meaning), langId(p.languages[0].language)).translation
        lName = translate(random(random(langId(p.languages[0].language).lexicon).meaning), langId(p.languages[0].language)).translation
    }
    p.name = `${fName} ${lName}`//names.GFFN(p.gender)
    p.id = `${Math.floor(10**9+getRng()*10**10)} (${p.name})`
    //state.GID++
    if (age===null){
        p.age = 16+getRng()*30
    } else {
        p.age = age
    }
    generateAppearance(p)
    if (p.gender === "female") fm++
    if (p.gender === "male") m++
    if (p.age > 25) {
        let pa2 = random(state.STATICPOPULATION)
        if (pa2 && !hasPartner(pa2) &&  pa2.age > 20 && pa2.gender !== p.gender) {
            let noc = 1+getRng() * 2
            p.relatives.push({
                person: pa2.id,
                type: `partner`,
                gender: pa2.gender
            })
            pa2.relatives.push({
                person: p.id,
                type: `partner`,
                gender: p.gender
            })
            for (let i = 0; i < noc; i++) {
                if (p&&pa2){
                    let s = onePersonPlease()
                    //console.log(s)
                    let father = p.gender==="male"?p:pa2
                    let ln = String(father.name).split(/\s+/g)
                    s.name = names.GFN(s.gender)+" "+ln[1]
                    s.id = state.GID-1+` (${s.name})`
                    if (p.languages.length>0&&pa2.languages.length>0){
                        s.languages = [
                            {
                                language: random([p.languages[0].language, pa2.languages[0].language]),
                                mastery: 0.60+getRng()*0.40
                            }
                        ]
                    }
                    s.age = 8 + getRng() * ((pa2.age + p.age) / 5)
                    procRel(s, p, pa2)
                    state.STATICPOPULATION.push(s)
                }
            }
        }
    }
    return p
}
export let m = 0
export let fm = 0
export async function genPeople(x){
    let start = Date.now()
    //let pp = []
    let mmm = send(`[0/${x}]`)
    for (let i=0;i<x;i++){
        let p = await onePersonPlease()
        addItem(p, "water", 1)
        addItem(p, "coin", getRng()*100)
        //population.push(p)
        state.STATICPOPULATION.push(p)
        mmm.innerHTML = format(`generating (${state.STATICPOPULATION.length}) NPCS... [${i}/${x}] - ${p.name}`)
        await sleep(0)
        //console.log(p)
    }
    mmm.innerHTML = format(`done! [1/1]`)
    //state.STATICPOPULATION = [...state.STATICPOPULATION, ...pp]
    let end = Date.now()
    console.log("male:", m, "female:", fm, "ratio: per 1 male there is ", fm/m, "females")
    console.log(end-start+"ms")
    console.log(state.STATICPOPULATION)
    await sleep(10)
    mmm.style.display = "none"
}
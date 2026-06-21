import { state } from "./STATE.js"
import { send } from "./SEND.js"
import { newMem, look, shock } from "./HUMANS.js"
import { random } from "./UTILS.js"
import { combat, inAFight } from "./COMBAT.js"
import { intellV2, langId } from "./LANGUAGES.js"
import { initTalk } from "./PLAYERTAGS.js"
import { getRng } from "./SEED.js"

export function newTopic(name){
    return {
        topic: name,
        location: null,
        type: [],
    }
}

export function commonTopics(){
    let greet = newTopic("greet")
    greet.type.push("greet")
    let whatMind = newTopic("what's on your mind?")
    whatMind.type.push("personal", "rekan")
    let joinG = newTopic("join my group!")
    joinG.type.push("group", "persuasion")
    let recom = newTopic("any location recommendations?")
    recom.type.push("location")
    let partnerAsk = newTopic("do you have a partner?")
    partnerAsk.type.push("partner", "question", "personal", "rekan")
    let askAge = newTopic("how old are you?")
    askAge.type.push("age", "question", "personal", "rekan")
    let trade = newTopic("trade")
    trade.type.push("trade")
    return [
        greet,
        joinG,
        whatMind,
        partnerAsk,
        askAge,
        trade,
        recom
    ]
}

export function bondWith(x, target){
    let a = x.relationships.find(e=>e.id===target.id)
    let b = target.relationships.find(e=>e.id===x.id)
    if (a&&b){
        a.level += 0.05
        b.level += 0.05
    } else {
        x.relationships.push({
            id: target.id,
            level: 0.5
        })
        target.relationships.push({
            id: x.id,
            level: 0.5
        })
    }
    let aR = x.relationships.find(e=>e.id===target.id)
    let bR = target.relationships.find(e=>e.id===x.id)
    return {
        xr: aR, 
        tr: bR
    }
}

async function breakBond(x, target){
    let bondX = x.relationships.find(e=>e.id===target.id)
    let bondT = target.relationships.find(e=>e.id===x.id)
    if (bondX&&bondT){
        bondX.level = -0.8
        bondT.level = -0.8
    } else {
        await bondWith(x, target)
        breakBond(x, target)
    }
    return
}

export function breakUp(x){
    if (!x) return
    let partner = x.relatives.find(e=>e&&e.person&&e.type==="partner")
    if (partner) {partner = look(partner.person)}
    if (partner){
        partner.relatives = partner.relatives.filter(e=>e&&e.person!==x.id)
        x.relatives = x.relatives.filter(e=>e&&e.person!==partner.id)
        shock(x, "i saw someone get dumped", 0.4)
        let m1 = newMem(x, "my partner just broke up with me", "bad", "sad")
        m1.target = partner
        m1.type = "person"
        m1.importance = 999
        m1.hp = 999
        let m2 = newMem(x, "i just broke up with my partner", "bad", "sad")
        m2.target = x
        m2.type = "person"
        m2.importance = 300
        m2.hp = 700
        partner.mood -= 0.1
    }
}

export function nearPartner(x){
    if (!x) return
    let p = x.relatives.find(e=>e&&e.type==="partner"&&look(e.person)?.location===x.location)
    if (p){
        x.mood += 0.001
        return p
    }
}

export function checkMastery(x){
    if (x>=0.9){
        return "native-fluent"
    } else if (x>=0.7){
        return "fluent"
    } else if (x>=0.4){
        return "conversational"
    } else {
        return "basic"
    }
}

export function newKnowledge(x){
    return {
        name: x.name,
        id: x.id,
    }
}

export function love(x, target){
    if (inAFight(x)) return
    if (!x) return
    if (target===state.player) return false
    if (x&&target&&x.relatives.find(e=>e.type==="partner")||target.relatives.find(e=>e.type==="partner")) return false
    x.relatives.push({
        person: target.id,
        type: "partner",
        gender: target.gender
    })
    target.relatives.push({
        person: x.id,
        type: "partner",
        gender: x.gender
    })
    let n = bondWith(x, target)
    n.xr.level = 0.9
    n.tr.level = 0.9
    x.adrenaline += 2
    target.adrenaline += 2
    shock(x, 0.3, "i saw a confession")
    let m1 = newMem(x, "i became partner with "+target.name, "good")
    m1.importance = 999
    m1.hp = 999
    let m2 = newMem(target, "i became partner with "+target.name, "good")
    m2.importance = 999
    m2.hp = 999
    x.mood += 1
    target.mood += 1
    return true
}

export function understands(x, target){
    if (x.languages.length<=0||target.languages.length<=0) return
    let list = x.languages.filter(e=>e&&e.mastery>0.3)
    if (list.length<=0) return random(target.languages)
    for (const i of list){
        let lang = target.languages.find(e=>e&&e.language.id===i.language.id&&e.mastery>0.3)
        if (lang?.mastery >= 0.5){
            lang.mastery += 0.01
            i.mastery += 0.01
            if (lang){
                return "done"
            }
        } else {
            break
            //return random(target.languages)
        }
    }
    let lan = langId(random(target.languages).language)
    let Xlang = langId(random(x.languages).language)
    let int = lan?Xlang?intellV2(lan, Xlang):0:0
    //console.log(lan, Xlang)
    return {
        Tlanguage: lan.id,
        intelligibility: int
    }
}

export function talkOptions(x){
    let options = [
        "how are you?",
        "where are you from?",
        "do you know [name]?",
        "are you hungry?",
        "are you thirsty?",
        "i hate you",
        "do you have a partner?"
    ]
    let rel = state.player.relationships.find(e=>e.id===x.id)
    let txt = ""
    if (rel){
        txt = options.map((e, index)=>{
            if (index<=rel.level+1){index+1+". "+e}
        }).join("<br>")
    } else if (state?.player?.knows.some(e=>e===x.id)){
        txt = "1. "+options[0]+"<br>2. "+options[1]+"<br>"
    } else {
        txt = "0. what is your name?"
    }
    send(txt)
}

export function relation(x, target){ //both are obj
    if (!(x&&target)) return
    let res = x.relationships.find(e=>e&&e.id===target.id)
    if (res){
        return res
    } else {
        return null
    }
}

export function approach(x, target){ //NPC ONLY
    if (inAFight(x)) return
    if (!x||!target) return
    if (x===target) return
    //let a = state.locations.filter(e=>e&&!x.familiarLoc.includes(e.id))
    let partner = target.relatives.find(e=>e&&e.type==="partner")
    if (target===state.player){
        if (x.knows.some(e=>e&&e===state.player.id)){
            send(`*${x.name}*: hey, friend.`)
            //talkOptions(x)
            state.playerTags.talk.obj = x.id
            state.playerTags.talk.state = true
            state.playerTags.chooseTalkMode.state = true
        } else {
            send("you are approached by someone")
            let txt = "hello there!"
            let pr = x.social.pride
            if (pr>0.8){
                txt = "hm, i think i know you."
            } else if (pr>0.6){
                txt = "hey, how are you?"
            } else if (pr>0.3){
                txt = "h-hey!"
            } else {
                txt = "uhm... h-hi."
            }
            send(`*${x.name}*: ${txt}`)
            state.playerTags.talk.obj = x.id
            state.playerTags.talk.state = true
            state.playerTags.chooseTalkMode.state = true
        }
        initTalk(x)
    } else {
        let langL = understands(x, target)
        if (langL==="done"||langL.intelligibility>=70){
            x.adrenaline += 0.8
            target.adrenaline += 0.8
            if (!x.knows.some(e=>e&&e===target.id)){
                x.knows.push(
                    target.id
                )
            }
            if (!target.knows.some(e=>e&&e===x.id)){
                target.knows.push(
                    x.id
                )
            }
            let m = random(["good", "bad"])
            let emotion = m==="good"?"happy":"angry"
            let a = newMem(x, "i had a talk with "+target.name, m, emotion)
            let b = newMem(target, "i was approached and had a talk with "+x.name, m, emotion)
            x.mood += emotion==="good"?0.03:-0.02
            target.mood += emotion==="good"?0.03:-0.02
            a.target = target.id
            b.target = x.id
            if (emotion==="angry"&&x.mood<0.3){
                combat(x, target)
            } else {
                bondWith(x, target)
            }
        } else {
            x.adrenaline += 0.8
            target.adrenaline += 0.8
            if (!x.knows.some(e=>e&&e===target.id)){
                x.knows.push(
                    target.id
                )
            }
            if (!target.knows.some(e=>e&&e===x.id)){
                target.knows.push(
                    x.id
                )
            }
            bondWith(x, target)
            let emotion = "confused"
            let a = newMem(x, "i had a talk with "+target.name+", i don't understand a single word.", "neutral", emotion)
            let b = newMem(target, "i was approached and had a talk with "+x.name+", i don't understand a single word.", "neutral", emotion)
            a.target = target.id
            b.target = x.id
            let lng = x.languages.find(e=>e&&e.language===langL.Tlanguage)
            if (lng){
                lng.mastery += 0.02
            } else if (langL) {
                x.languages.push({
                    language: langL.Tlanguage,
                    mastery: 0.02
                })
            }
        }
    }
    if (partner?.person){
        let p = look(partner.person)
        if (partner.person===state?.player?.id&&state?.player?.location===target.location){
            send("you saw your partner talking to someone.")
        } else if (p?.location===target?.location&&look(partner.person)?.gender===x.gender){
            p.adrenaline += 0.9
            if (getRng()<0.5){
                let a = newMem(p, "i felt jealous seeing my partner be approached by someone.", "bad", "jealous")
                a.target = target
                p.mood -= 0.02
            } else if (getRng()<0.5){
                if (state.player===target){
                    send("**partner**: who is this?")
                    let a = newMem(p, "i got protective around my partner.", "neutral", "jealous")
                    a.target = target.id
                } else {
                    let a = newMem(p, "i got protective around my partner.", "neutral", "jealous")
                    a.target = target.id
                }
                p.mood -= 0.01
            }
        }
    }
}
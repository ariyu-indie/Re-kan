import { state } from "./STATE.js"
import { fight } from "./CLASSES.js"
import { send, format } from "./SEND.js"
import { random, sorter, RWCH } from "./UTILS.js"
import { look, newMem } from "./HUMANS.js"
import { visHP, applyDmg, CIF, WTRBD } from "./BODY.js"
import { locId } from "./LOC.js"
import { grId, newRel } from "./GROUPS.js"
import { getRng } from "./SEED.js"

export function newAttack(n){
    return {
        name: n,
        damage: 10,
        defense: 0,
        healing: {
            others: false,
            amount: 0
        },
        success: 0.0, //0.0-1.0
        speed: 1, //1 second
        magic: {}
    }
}

export function CIFON(x, target){ //CHECK IF FIGHT OR NOT, IF IN FIGHT, IS IT SAME WITH X?
//return false
    if (!(x&&target)) return false
    if (!inAFight(x)) return false
    if (inAFight(target)){
        if (target.fight.id===x.fight.id){
            return true
        } else {
            return false
        }
    } else {
        return true
    }
    return false
}

export function assessHp(x){
    //console.log(x)
    if (x>95){
        return "subtly injured"
    } else if (x>90){
        return "injured"
    } else if (x>80){
        return "greatly injured"
    } else if (x>70){
        return "severely injured"
    } else if (x>50){
        return "dangerously injured"
    } else {
        return "deathly injured"
    }
}

let avgStr = 122.294

export function strDiff(x, target){
    let dmg = (x.combat.damage+target.combat.damage)/2 //10
    let crit = (x.combat.crit+target.combat.crit)/2 //1.2
    let critCH = (x.combat.critCH+target.combat.critCH)/2 //0.02
    let dodgeCH = (x.combat.dodgeCH+target.combat.dodgeCH)/2 //0.25
    let HP = (visHP(x).max+visHP(target).max)/2 // 600 // 122.294
    let totalX = x.combat.damage+x.combat.crit+x.combat.critCH+x.combat.dodgeCH+visHP(x).max
    let totalT = target.combat.damage+target.combat.crit+target.combat.critCH+target.combat.dodgeCH+visHP(target).max
    let strongest = sorter([totalX, totalT], item=>{return item})[0]
    if (strongest===totalX){
        strongest = x
    } else {
        strongest = target
    }
    return {
        diff: (dmg+crit+critCH+dodgeCH+HP)/5,
        strong: strongest,
    }
}

export function procFight(x){  
    //visHP(x)
    if (!x?.fight?.id&&!x?.fight?.side) return
    if (x.state==="alive"&&inAFight(x)&&x.id!==state?.player?.id){
        //console.log(CIFON(x, state.player))
        let fight = fId(x.fight.id)
        if (fight?.participants.length <= 1|| checkSides(fight)<=1) {
            if (CIFON(x, state.player)&&x.location===state?.player?.location||!state.GameStarted||!state.player){
                if (!fight.log.innerText.includes("a brawl ended, the winners are the "+x.fight.side+" side")){
                    let m = fight.turn+". a brawl ended, the winners are the "+x.fight.side+" side"
                    fight.log.innerHTML += format(m)+"<br><br>"
                    fight.raw.push(m)
                }
                let opponents = fight.STATICPART.filter(e=>e&&e.side!==x.fight.side)
                x.victories.push({
                    title: `i won a fight against ${opponents.length} opponents!`,
                    numOfOpp: opponents.length
                })
                let curG = grId(x.group.id)
                for (const i of opponents){
                    let a = look(i.obj)
                    if (a.group.id&&curG&&getRng()<0.1){
                        let gr = grId(a.group.id)
                        if (gr&&curG){
                            newRel(curG, gr, "war")
                            send("a war has been [red]declared![c]")
                        }
                    }
                    if (a){
                        let m = newMem(a, "i lost a fight!", "bad", "angry")
                        m.importance = 1000
                        m.hp = 1000
                        m.type = "combat"
                        a.mood -= 0.1
                    }
                }
                let m1 = newMem(x, "i won a fight!", "good", "happy")
                m1.importance = 100
                m1.hp = 100
                m1.type = "combat"
            }
            exitAF(x)
        } else if (fight){
            let self = fight.participants.find(e=>e&&e.obj===x.id)
            let target = null
            let xSide = x.fight.side//fight.participants.find(e=>e&&e.obj===x.id)
            //throw Error(xSide)
            if (xSide){
                //xSide = xSide.side
                //console.log(xSide
                let oppSides = fight.participants.filter(e=>e&&e.side!==xSide&&e.obj!==x.id)
                //throw Error(oppSides.map(e=>e.side))
                if (oppSides.length<=0) return
                let n = RWCH(oppSides, (item)=>{return item.damage})
                if (n){
                    target = look(n.obj)
                    //console.log(target)
                    let partsARR = ["head", "leftArm", "rightArm", "torso"]
                    let part = random(partsARR)
                    let eng = ["head", "left arm", "right arm", "torso"]
                    if (target&&target.fight?.side){
                        if (visHP(target).p<=30&&getRng()<0.05){
                            fight.log.innerHTML += `*${x.name}* showed mercy to ${target.name}`
                            fight.raw.push(`*${x.name}* showed mercy to ${target.name}`)
                            exitAF(target)
                        }
                        if (getRng()<=0.1){
                            let msg = null
                            let diff = strDiff(x, target)
                            if (diff.strong===x&&diff.diff>=avgStr*2){
                                if (getRng()<x.social.pride){
                                    msg = random([
                                        "this battle should be worth my while!",
                                        "what a ridicule!",
                                        "you are no match for me!",
                                        "this battle is a joke!",
                                        "why are you being a blockade?",
                                        "weakling!",
                                        "you're weak!",
                                        "stop trying!",
                                        "just give up!",
                                        "you won't win!"
                                    ])
                                } else {
                                    msg = random([
                                        "you can try...",
                                        "i do not wish to end you.",
                                        "i seek no battle.",
                                        "stop this at once...",
                                        "this is futile.",
                                        "I'm right here.",
                                        "let's stop these..."
                                    ])
                                }
                            }
                            else if (diff.strong===x){
                                if (getRng()<x.social.pride){
                                    msg = random([
                                        "you're slippery!",
                                        "stop moving!",
                                        "what are you? scaredycat?",
                                        "I'm going to defeat you!",
                                        "stop moving!",
                                        "you're a disgrace!",
                                        "I'll bring you down!",
                                        "you're nothing!"
                                    ])
                                } else {
                                    msg = random([
                                        "equal huh?",
                                        "you dodged my attacks.",
                                        "you're agile",
                                        "persistent.",
                                        "impressively done",
                                        "you're good",
                                        "nice moves.",
                                        "incredible."
                                    ])
                                }
                            } else {
                                if (x.level==="god"){
                                    msg = random([
                                        "you have all the powers, stop this...",
                                        "doing this is not worth it!",
                                        "such act will not be accepted.",
                                        "you have caused blasphemy to the rest of us!",
                                        "why?",
                                        "why, are you doing this?",
                                        "just stop...",
                                        "please...",
                                        "you are unsure of what you're doing...",
                                        "is this really a path to greatness?"
                                    ])
                                } else {
                                    msg = random([
                                        "let's talk about this!",
                                        "let's negotiate!",
                                        "help!",
                                        "stop!",
                                        "please, have mercy!",
                                        "i didn't mean to!",
                                        "i didn't ask for this!"
                                    ])
                                }
                            }
                            if (visHP(x).p<=30){
                                if (getRng()<x.social.pride){
                                    msg = random([
                                        "this is unacceptable!",
                                        "I'll find my revenge!",
                                        "curse you!"
                                    ])
                                } else {
                                    msg = random([
                                        "please, have mercy!",
                                        "i don't deserve this!",
                                        "help me!",
                                    ])
                                }
                            }
                            fight.log.innerHTML += format(`*${x.name}*: \"${msg}\"`)+"<br><br>"
                            fight.raw.push(`*${x.name}*: \"${msg}\"`)
                        }
                        let move = random(x.attacks)
                        let totalDmg = move.damage
                        let staminaUsed = (totalDmg*0.1)+(move.defense*0.1)+(move.healing.amount*0.1)
                        console.log(staminaUsed)
                        //send(String(staminaUsed))
                        if (getRng()<x.combat.critCH){
                            totalDmg *= x.combat.crit
                        }
                        let res = true//applyDmg(target, part, totalDmg)
                        if (x.stats.stamina.val < staminaUsed) {
                            res = false
                        } else if (move.success<getRng()&&
                            target?.id!==state?.player?.id&&
                            getRng()>Math.min(target.combat.dodgeCH, 0.9999)&&
                            target.stats.stamina.val>=50){
                            target.stats.stamina.val -= 50
                            fight.log.innerHTML += format(`*${target.name}* dodged an attack.`)+"<br><br>"
                            fight.raw.push(`*${target.name}* dodged an attack.`)
                            res = false
                        } else {
                            res = applyDmg(target, part, totalDmg)
                            x.stats.stamina.val -= staminaUsed
                        }
                        if (res/*&&((CIFON(x, state.player)&&(x.location===state?.player?.location)||!state.player||state?.player?.state==="dead"))*/){
                            self.damage += totalDmg
                            let method = move
                            if (method){
                                if (!CIF(x)){
                                    exitAF(x)
                                    return
                                }
                            }
                            if (fight.turn===fight.turnEs*10||CIFON(x, state.player)){
                                let m = `${fight.turn}. *${x.name}* (${x.fight.side}) used *[red]${method.name}[c]* against ${target.id===state?.player?.id?"you":"*"+target.name+"*"} (${target.fight.side}) in the *${eng[partsARR.indexOf(part)]}*, leaving ${target.id===state?.player?.id?"you":"them"} ${assessHp(visHP(target).p)}!`
                                fight.raw.push(m)
                                fight.log.innerHTML += format(m)+"<br><br>"
                                if (state?.player?.fight?.id===x.fight.id){
                                    let n = send(m)
                                    n.style.background = fight.color
                                }
                                WTRBD(target)
                                if (target.nextTurn==="dead"){
                                    x.murder++
                                }
                                fight.turnEs++
                                if ((totalDmg/100)>1){
                                    for (let i=1;i<(totalDmg/100);i++){
                                        let loca = locId(x.location)
                                        let struct = loca?random(loca.structures):null
                                        //throw Error(struct)
                                        if (struct){
                                            fight.log.innerHTML += format(`*${target.name}* was launched towards a ${struct.type}.`)+"<br><br>"
                                            fight.raw.push(`*${target.name}* was launched through a *${struct.type}* named *${struct.name}*.`)
                                            struct.hp -= totalDmg/10
                                        } else {
                                            fight.log.innerHTML += format(`*${target.name}* was launched far away!`)+"<br><br>"
                                            fight.raw.push(`*${target.name}* was launched far away.`)
                                            return
                                        }
                                    }
                                }
                            }
                            
                        } else if(!res/*&&(CIFON(x, state.player)||!state.player||state?.player?.state==="dead")*/) {
                            let m = `${fight.turn}. *${x.name}* (${x.fight.side}) *[gray]missed[c]* an attack intended for ${target.id===state?.player?.id?"you":"someone"}`
                            fight.raw.push(m)
                            fight.log.innerHTML += format(m)+"<br><br>"
                            //m.style.background = fight.color
                        }
                    }
                }
            }
        }
        fight.turn++
    }
}

export function GRCH() {
    const r = Math.floor(getRng() * 106) + 150 // 150-255
    const g = Math.floor(getRng() * 106) + 150
    const b = Math.floor(getRng() * 106) + 150
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function inAFight(x){
    if (x?.fight?.id&&x?.fight?.side)
    {return true}
    return false
}

export function fId(x){
    let a = state.fights.find(e=>e.id===x)
    //console.log(a)
    return a
}

export function checkSides(x){
    let sides = []
    for (const p of x.participants){
        if (!sides.includes(p.side)){
            sides.push(p.side)
        }
    }
    return sides.length
}

export function combat(x, opp, aS="BLUE", bS="RED"){
    if (!(x||opp)&&!inAFight(x)&&!inAFight(opp)) return
    let f = new fight()
    if (f){
        f.color = GRCH()
        f.participants.push({
            obj: x.id,
            damage: 0,
            side: aS
        })
        f.participants.push({
            obj: opp.id,
            damage: 0,
            side: bS
        })
        opp.fight = {
            id: f.id,
            side: bS
        }
        x.fight = {
            id: f.id,
            side: aS
        }
        f.STATICPART.push({
            obj: x.id,
            side: aS
        })
        f.STATICPART.push({
            obj: opp.id,
            side: bS
        })
        if (state?.player?.location===x.location|| !state.GameStarted || !state.player){
            send("a fight broke out!")
            //console.log(f)
        }
        let summed = document.createElement("div")
        summed.innerHTML += format(`*${x.name}* (${x.fight.side}) uses *${x.combat.style?x.combat.style:"no"}* combat style, ${x.gender==="male"?"he":"she"} is a ${x.level}`)+"<br><br>"
        summed.innerHTML += format(`*${opp.name}* (${opp.fight.side}) uses *${opp.combat.style?opp.combat.style:"no"}* combat style, ${opp.gender==="male"?"he":"she"} is a ${opp.level}`)+"<br><br>"
        //summed.innerHTML = fight.log.map((e, index) => format(index + ". " + e)).join("<br>")
        summed.style.fontSize = "12px"
        summed.style.height = "120px"
        summed.style.overflowY = "scroll"
        summed.style.background = fight.color
        summed.style.padding = "4px"
        summed.addEventListener("click", ()=>{
            navigator.clipboard.writeText(summed.innerText)
            .then(()=>{
                console.log("done!")
            })
        })
        document.getElementById("chatbox").appendChild(summed)
        if (x.id===state?.player?.id||opp.id===state?.player?.id){
            send("you've entered a fight.")
            send("[align: center]*actions*---attack")
            console.log(state.player)
            state.attacks = []
            for (const i of state.player.attacks){
                state.attacks.push(i)
            }
        }
        f.log = summed
        state.fights.push(f)
        //console.log(state.fights)
        return f
    }
}

export function join(x, id, s="neutral"){ //id === fight id
    let f = fId(id)
    if (!x||inAFight(x)) return
    if (!f.participants.some(e=>e&&e.obj===x.id)){
        f.participants.push({
            obj: x.id,
            damage: 0,
            side: s
        })
        f.STATICPART.push({
            obj: x.id,
            side: s
        })
        f.log.innerHTML += format(`*${x.name}* joined the fight, fighting with ${s}! they're a ${x.level}`)+"<br><br>"
        f.raw.push(`*${x.name}* joined the fight, fighting with ${s}! they're a ${x.level}.`)
        x.fight = {
            id: f.id,
            side: s
        }
    }
}

export function exitAF(x){ //all fights
    if (!x||!inAFight(x)) return
    let n = fId(x.fight.id)
    if (n){
        n.participants = n.participants.filter(e=>e&&e.obj!==x.id)
        n.log.innerHTML += format(`*${x.name}* *[red]left[c]* the fight`)+"<br><br>"
        n.raw.push(`*${x.name}* left the fight`)
        x.fight.id = null
        x.fight.side = null
        //console.log(x.name+" exit fight "+x.stats.hp.head.val)
    }
    //for (const f of x.fights){
    //}
}
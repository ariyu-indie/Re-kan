import { state } from "./STATE.js"
// for the human body & stuff... idk, the name is self-explanatory.

export function visHP(x){
    if (!x) return
    let s = x.stats.hp
    let hpCur = 0
    hpCur += s.head.val
    hpCur += s.torso.val
    hpCur += s.leftArm.val
    hpCur += s.rightArm.val
    hpCur += s.leftLeg.val
    hpCur += s.rightLeg.val
    let hpMax = 0
    hpMax += s.head.max
    hpMax += s.torso.max
    hpMax += s.leftArm.max
    hpMax += s.rightArm.max
    hpMax += s.leftLeg.max
    hpMax += s.rightLeg.max
    return {
        p: (hpCur/hpMax)*100,
        current: hpCur,
        max: hpMax
    }
}

export function tremblingCause(x){
    let near = state.STATICPOPULATION.filter(e=>e&&e.location===x.location)
    for (const i of near){
        if (i.state==="dead"&&!i.isBuried.state){
            x.stats.tremble.val += 0.05
        } else if (i.level==="god"){
            x.stats.tremble.val += 0.03
        } else if (i.fight?.id){
            x.stats.tremble.val += 0.01
        }
    }
    if (x.stats.tremble.val>x.stats.tremble.max){
        x.stats.tremble.val = x.stats.tremble.max
    }
}

export function WTRBD(x){ //would this rekanian be dead at this point? good for checking current state without needing the next update.
    let hp = visHP(x)
    let s = x.stats.hp
    let st = x.stats
    if (s.head.val<=0){
        x.cause = "head trauma"
        x.nextTurn = "dead"
        return true
    }
    if (s.torso.val<=0){
        x.nextTurn = "dead"
        x.cause = "internal bleeding in the torso"
        return true
    }
    if (hp.p<=20){
        x.nextTurn = "unconscious"
        return true
    }
    return false
}

export function CIF(x){ //can it fight? if so, which would it use?
    let s = x.stats.hp
    //let method = ""
    if (s.leftArm.val>50||s.rightArm.val>50){
        return true
    } else if (s.leftLeg.val>50&&s.rightLeg.val>50){
        return true
    } else if (s.head.val>70){ //like, slamming head? lil damage but works.
        return true
    }
    return false
}

export function applyDmg(x, part, amount){
    let n = x.stats.hp[part]
    if (n){
        n.val -= amount
        if (amount>=n.max*0.2){
            if (x?.stats?.hp?.meta?.bleeding.parts[part]){
                x.stats.hp.meta.bleeding.parts[part] += 1.0
            } else {
                x.stats.hp.meta.bleeding.parts[part] = 1.0
            }
        } 
        if (n.val<0){
            n.val = 0
        }
        return true
    }
    return false
}

export function BIC(x){ //body integrity check
    if (x.state==="dead") return
    let s = x.stats.hp
    let head = s.head
    let torso = s.torso
    let armL = s.leftArm
    let armR = s.leftArm
    let legL = s.leftArm
    let legR = s.leftArm
    if (head.val<=0){
        x.nextTurn = "dead"
    } else if (torso.val<=0){
        x.nextTurn = "dead"
    }
    return
}
import { state } from "./STATE.js"
import { send, format } from "./SEND.js"
import { sleep, $ } from "./HELPER.js"

export function toMortal(x){
    if (x.level === "god"){
        x.level = "fallen god"
        x.combat.damage *= 1/5
        delete x.stats.faith
        x.stats.hp.head.val *= 1/4
        x.stats.hp.head.max *= 1/4
        x.stats.hp.leftLeg.val *= 1/4
        x.stats.hp.torso.max *= 1/4
        x.stats.hp.torso.val *= 1/4
        x.stats.hp.leftLeg.max *= 1/4
        x.stats.hp.rightLeg.val *= 1/4
        x.stats.hp.rightLeg.max *= 1/4
        x.stats.hp.rightArm.val *= 1/4
        x.stats.hp.rightArm.max *= 1/4
        x.stats.hp.leftArm.val *= 1/4
        x.stats.hp.leftArm.max *= 1/4
        x.stats.hydration.val *= 1/4
        x.stats.hydration.max *= 1/4
        x.stats.saturation.val *= 1/4
        x.stats.saturation.max *= 1/4
        x.stats.stamina.val *= 1/4
        x.stats.stamina.max *= 1/4
        send("a god has fallen, and it is not great news.")
    }
}

export async function toDivine(x, mul=1){
    if (x.level !== "god"){
        x.level = "god"
        x.ageLimit = 10000
        x.combat.damage += 50
        x.stats.faith = {}
        x.stats.faith.val = 70
        x.stats.faith.max = 100
        x.combat.damage *= 10*mul
        x.combat.crit *= 2*mul
        x.combat.critCH *= 2*mul
        x.combat.dodgeCH *= 10*mul
        x.attacks.forEach(e=>e.damage*=10000*mul)
        x.stats.hp.head.val += 100000*mul
        x.stats.tremble.val *= 10000*mul
        x.stats.tremble.max *= 10000*mul
        x.stats.hp.head.max += 100000*mul
        x.stats.hp.torso.val += 100000*mul
        x.stats.hp.torso.max += 100000*mul
        x.stats.hp.leftLeg.val += 100000*mul
        x.stats.hp.leftLeg.max += 100000*mul
        x.stats.hp.rightLeg.val += 100000*mul
        x.stats.hp.rightLeg.max += 100000*mul
        x.stats.hp.leftArm.val += 100000*mul
        x.stats.hp.leftArm.max += 100000*mul
        x.stats.hp.rightArm.val += 100000*mul
        x.stats.hp.rightArm.max += 100000*mul
        x.stats.stamina.val += 1000*mul
        x.stats.stamina.max += 1000*mul
        x.stats.hydration.val += 10000*mul
        x.stats.hydration.max += 10000*mul
        x.stats.saturation.val += 10000*mul
        x.stats.saturation.max += 10000*mul
        if (state.player&& x===state.player){
            send("you began to levitate...")
            await sleep(1000)
            send("**wings** materializing behind your back...")
            await sleep(1000)
            send("and with an immediate *unfurling of your [f]wings[f]*— you send a *ripple* that can be felt for **miles** away.")
            await sleep(1000)
        }
        if (state.player&& x!==state.player){
            send("a *ripple* was felt, one that signals the birth of gods.")
        }
    }
}
import { send } from "./SEND.js"
import { random } from "./UTILS.js"
import { newMem } from "./HUMANS.js"
import { newGoal } from "./GOAL.js"
import { locId } from "./LOC.js"
import { getRng } from "./SEED.js"

export function relive(x){
    let mem = random(x.memory.filter(e=>e.type!=="memory"))
    if (mem){
        let m1 = newMem(x, `
        i felt ${mem.emotion} after remembering the time when ${mem.content}
        `, mem.association, mem.emotion)
        if (mem.association?.includes("bad")){
            x.mood -= 0.02
        } else if (mem.association?.includes("good")){
            x.mood += 0.02
        }
        m1.hp = 100
        m1.importance = mem.importance
        m1.type = "memory"
        mem.hp += 100
        if (getRng()<0.1&&mem.association?.includes("good")){
            newGoal(x, "go", null, null, {A: locId(x.location), B: locId(m1.locOfAs)})
        }
        return mem
    }
}
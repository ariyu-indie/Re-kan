import { state } from "./STATE.js"
import { newGroup } from "./GROUPS.js"
import { send } from "./SEND.js"
import { random } from "./UTILS.js"

function n(txt){
    send(`in year ${state.cal.y}, ${txt}`)
}

export function genHist(){
    if (Math.random()<0.01){
        let A = random(state.population)
        let B = random(state.population.filter(e=>e&&e.id!==A.id))
        if (A&&B&&!A.group.id&&!B.group.id){
            let g = newGroup(A, [B])
            if (g){
                n(`a group named ${g.name} was established.`)
            }
        }
    }
}
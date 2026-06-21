import { state } from "./STATE.js"

export function getRng(c=1, min=0, max=0){ //returns based on current seed
    let range = min!==0?max!==0?max-min:false:false
    let a = state.constants[c][0]
    let b = state.constants[c][1]
    state.seedCur = (a * state.seedCur + b) % state.bits
    if (range===false){
        return (state.seedCur/state.bits)
    } else {
        return min+(state.seedCur/state.bits)*range
    }
}
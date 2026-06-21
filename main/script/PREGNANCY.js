import { onePersonPlease } from "./HUMANS.js"
import { state } from "./STATE.js"

export function sex(x, target){
    let m = x.gender==="female"?x:target
    let f = x.gender==="male"?x:target
    if (m&&f){
        pregnant(m, f)
    }
}

export function pregnant(mother, father){
    if ((mother.gender==="female"&&father.gender==="male")&&mother.fertile&&father.fertile){
        mother.pregnant.state = true
        if (!mother.relatives.some(e=>e.person===father.id)){
            mother.relatives.push({
                person: father.id,
                type: "partner",
                gender: "male"
            })
        } if (!father.relatives.some(e=>e.person===mother.id)){
            father.relatives.push({
                person: mother.id,
                type: "partner",
                gender: "female"
            })
        }
        let f = onePersonPlease(0)
        f.relatives.push({
            person: mother.id,
            type: "parent",
            gender: "female"
        })
        f.relatives.push({
            person: father.id,
            type: "parent",
            gender: "male"
        })
        mother.relatives.push({
            person: f.id,
            type: "child",
            gender: f.gender
        })
        father.relatives.push({
            person: f.id,
            type: "child",
            gender: f.gender
        })
        console.log(f)
        f.isInWomb = true
        f.name = ""
        mother.pregnant.fetus = f.id
        console.log(mother.pregnant)
        state.STATICPOPULATION.push(f)
        return f
    }
}
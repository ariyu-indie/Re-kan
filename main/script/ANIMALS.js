import * as names from "./NAMES.js"
import { state } from "./STATE.js"
import { send, format } from "./SEND.js"
import { sleep } from "./HELPER.js"
import { random } from "./UTILS.js"
import { getRng } from "./SEED.js"

class Animal{
    constructor(){
        this.name = null
        this.state = "alive"
        this.tameAbility = getRng()
        this.id = null
        this.loves = []
        this.drops = {}
        this.tamed = false
        this.gender = null
        this.age = 0
        this.location = null
        this.hp = 100
        this.species = null
    }
}

export function generateAnimal(){
    let a = new Animal()
    a.gender = random(["female", "male"])
    a.age = 0.1+getRng()*10
    a.species = random([
        random(["cat", "dog"]), 
        "cat", "dog", "chicken", "pig"
    ])
    a.id = state.AID
    state.AID++
    a.name = names.GFN(a.gender)
    return a
}

export function lookAnimal(id){
    return state.STATICANIMALS.filter(e=>e.id===id)
}

export function tame(x, animal){
    let success = (x.naturalSkills.taming+getRng())*2
    if (x&&animal&&(success>(0.8))&&!animal.tamed){
        animal.tamed = true
        animal.loves.push(x.id)
        x.tamedAnimals.push(animal.id)
        x.adrenaline += 0.8
        return true
    }
    return false
}

export async function genAnimals(n=50){
    let x = (n-(n/2))+getRng()*(n)
    let l = []
    let m = send("a")
    for (let i=0;i<x+1;i++){
        let a = generateAnimal()
        //l.location = random(state.locations)
        //a.id = state.AID
        a.loves = []
        a.location = random(state.locations).id
        m.innerHTML = format(`generating (${state.AID}) animals [${i}/${x}]`)
        l.push(a)
        //state.AID++
        await sleep(0)
    }
    console.log(l)
    state.STATICANIMALS = l
    state.animalPopulation = state.STATICANIMALS
    m.innerHTML = format(`done! [1/1]`)
    await sleep(10)
    m.style.display = "none"
    //return l
}
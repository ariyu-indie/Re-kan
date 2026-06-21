import { random, RWCH } from "./UTILS.js"
import { locId } from "./LOC.js"
import { structId } from "./BUILDINGS.js"
import { toDivine, toMortal } from "./DIVINITY.js"
import { state } from "./STATE.js"
import { getRng } from "./SEED.js"

export function newItem(name){
    let item = {
        NAME: name.toLowerCase(),
        ID: Math.round(10**9+Math.random()*10**10),
        TYPE: null,
        CLASS: null,
        WEIGHT: 0,
        ACTIONS: [],
        CRAFT: {
            state: false,
            req: []
        },
        BREW: {
            state: false,
            req: []
        },
        SMELT: {
            state: false,
            req: []
        },
        GATHERED: {
            state: true,
            type: ["pick"]
        },
        equipment: {
            state: true,
            type: ["melee", "throw"],
            durability: 100
        },
        effects: {
            hydration: 0,
            deliciousness: 0,
            saturation: 0,
            poison: 0,
            damage: 0,
            heal: 0,
            stamina: 0,
            intoxication: 0,
        },
        attack: {
            blunt: 10,
            splash: 0,
            stab: 0,
            poison: 0
        },
        value: 0
    }
    state.itemDictv2.push(item)
    return item
}

export function extendItem(NOID){ //name or id
    let item = state.itemDictv2.find(e=>e&&(e.ID===NOID||e.NAME===NOID))
    let r
    if (item){
        r = structuredClone(item)
        r.ID = Math.round(10**9+Math.random()*10**10)
        r.TYPE = item.TYPE
        r.CLASS = item.NAME
        if (item.CLASS){
            r.CLASS = item.CLASS
        }
        state.itemDictv2.push(r)
    }
    return r?r:null
}

export function itemId(NOID){
    return state.itemDictv2.find(e=>e&&(e.ID===NOID||e.NAME===String(NOID).toLowerCase()))
}

export function combine(A, B, mid="-"){ //id or name
    let objA = A.ID?A:itemId(A)
    let objB = B.ID?B:itemId(B)
    if (objA&&objB){
        let base = structuredClone(objA)
        base.ID = Math.round(10**9+Math.random()*10**10)
        let check = state.itemDictv2.find(e=>e&&e.ROOT?.F===base.NAME&&e.ROOT?.S===objB.NAME)
        //console.log(check)
        if (check){
            return check
        }
        base.ROOT = {
            F: objA.NAME,
            S: objB.NAME
        }
        base.WEIGHT += objB.WEIGHT
        base.CRAFT.state = true
        base.CRAFT.req = [base.NAME, objB.NAME]
        base.NAME = objA.NAME+mid+objB.NAME
        for (let i in base.effects){
            base.effects[i] += objB.effects[i]
            base.effects[i] /= 1.1
        }
        for (let i in base.attack){
            base.attack[i] += objB.attack[i]
            //base.attack[i] /= 1.1
        }
        base.value += objB.value
        base.equipment.durability += objB.equipment.durability
        base.GATHERED.state = false
        state.itemDictv2.push(base)
        return base
    }
}

function checkIntegrity(){
    for (const i of state.itemDictv2){
        if (i.effects.deliciousness>1){
            i.effects.deliciousness = 0.99
        }
    }
}

export function itemExist(x, ID){
    let itemObj = itemId(ID)
    if (itemObj){
        let inv = x.inventory.find(e=>e&&e.item_name===itemObj.NAME)
        if (inv){
            return inv
        }
    }
    return false
}

export function loadItems(){
    let l = state.itemDictv2
    let divine = newItem("divine crystal")
        divine.TYPE = "divine"
        divine.WEIGHT = 5 //kg
        divine.deliciousness = 0.0
        divine.value = 99999
    let wood = newItem("wood")
        wood.GATHERED.type = ["pick"]
        wood.WEIGHT = 5
    let stick = extendItem("wood")
        stick.NAME = "stick"
        stick.GATHERED.type = ["pick"]
        stick.WEIGHT = 0.1
    let metal = newItem("metal")
        //metal.damage = 40
        metal.attack.blunt = 30
        metal.attack.stab = 20
        metal.WEIGHT = 10
        metal.GATHERED.type = ["mine"]
        metal.TYPE = "solid"
        metal.effects.poison = 10
        metal.value = 20
    let iron = extendItem("metal")
        iron.NAME = "iron"
        iron.WEIGHT = 25
        iron.equipment.durability = 10000
        iron.effects.poison = 5
        iron.value = 8
    let gold = extendItem("metal")
        gold.NAME = "gold"
        gold.equipment.durability = 250
        gold.effects.poison = 0
        gold.value = 800
    let nickel = extendItem("metal")
        nickel.NAME = "nickel"
        nickel.equipment.durability = 1000
        nickel.value = 8
    let pickaxe = combine("wood", "stick")
        pickaxe.NAME = "pickaxe"
        pickaxe.CLASS = "weapon"
        //pickaxe.value = 10
        //pickaxe.equipment.durability = 100
        pickaxe.attack.stab = 30
    let sword = combine("stick", "stick")
        sword.NAME = "sword"
        sword.CLASS = "weapon"
        //sword.value = 10
        //sword.equipment.durability = 100
        sword.attack.stab = 60
        //sword.attack.blunt = 20
    let toolBase = state.itemDictv2.filter(e=>e&&e.CLASS==="weapon")
    let solids = state.itemDictv2.filter(e=>e&&e.CLASS==="metal")
    console.log(toolBase)
    for (const i of toolBase){
        for (const el of solids){
            combine(el, i)
        }
    }
    let water = newItem("water")
        water.effects.hydration = 80
        water.TYPE = "liquid"
        water.GATHERED.type = ["bucket"]
        water.equipment.durability = 1
        water.effects.stamina = 20
        water.attack.splash = 1
        water.value = 1
    let vegetable = newItem("vegetable")
        vegetable.GATHERED.state = false
        vegetable.effects.stamina = 5
        vegetable.TYPE = "organic"
        vegetable.effects.saturation = 60
    let fruit = newItem("fruit")
        fruit.effects.hydration = 150
        fruit.effects.saturation = 250
        fruit.effects.stamina = 200
        fruit.GATHERED.state = false
        fruit.equipment.durability = 5
        fruit.effects.heal = 500
        fruit.TYPE = "organic"
        fruit.value = 50
        //console.log(state)
        //l.push(water, fruit)
    let apple = extendItem("fruit")
        apple.NAME = "apple"
        apple.effects.deliciousness = 0.9
        apple.effects.hydration = 15
        apple.GATHERED.state = true
        apple.effects.saturation = 60
        apple.effects.stamina = 20
        apple.effects.heal = 5
        apple.value = 5
    let orange = extendItem("apple")
        //console.log(orange)
        orange.NAME = "orange"
        orange.effects.deliciousness = 0.8
        orange.effects.stamina = 30
    let strawberry = extendItem("apple")
        //console.log(orange)
        strawberry.NAME = "strawberry"
        strawberry.effects.deliciousness = 0.8
        strawberry.effects.stamina = 30
    let applewine = extendItem("water")
        applewine.NAME = "apple wine"
        applewine.GATHERED.state = false
        applewine.effects.deliciousness = 0.9
        applewine.effects.intoxication = 0.5
        applewine.BREW.req = ["water", "apple"]
    let tomato = extendItem("apple")
        tomato.NAME = "tomato"
        tomato.effects.deliciousness = 0.6
    let goldenApple = combine("gold", "apple")
    let mix1 = combine("orange", "apple")
        mix1.NAME = "Nico's mix 1"
    let mix2 = combine("strawberry", "water")
        mix2.NAME = "Nico's mix 2"
    let fruitSalad = combine(combine(mix1, mix2), "water")
        fruitSalad.NAME = "fruit salad"
        //console.log()
    //combine("iron", "apple")
    //l.push(apple, orange)
    checkIntegrity()
    console.log(l)
}

export function consumeItem(x, ID, amount=1){
    let itemObj = itemId(ID)
    //console.log(itemObj)
    let itemX = x.inventory.find(e=>e&&e.item_name===itemObj.NAME)
    if (itemX?.quantity>0){
        for (let p=0;p<Math.round(amount);p++){
            for (let i in itemObj.effects){
                //console.log(i)
                if (x.stats[i]){
                    //console.log(i)
                    let need = Math.min(x.stats[i].max-x.stats[i].val, itemObj.effects[i])
                    x.stats[i].val += need
                } else if (i==="heal"){
                    for (let o in x.stats.hp){
                        let part = x.stats.hp
                        let need = Math.min(part[o].max-part[o].val, itemObj.effects[i])
                        part[o].val += need
                    }
                } else if (i==="damage"){
                    for (let o in x.stats.hp){
                        let part = x.stats.hp
                        let need = Math.min(part[o].max-part[o].val, itemObj.effects[i])
                        part[o].val -= need
                    }
                }
            }
            itemX.quantity--
        }
    }
}

export function obtainItem(x){ //for goals only
    let loc = locId(x.location)
    //console.log(loc, x.location)
    if (loc&&x.inside.state){
        let result = RWCH(loc.resources, item=>{return item.quantity})
        return result
    } 
}

export function appendItem(x, item, amount = 1){
    let itemObj = item.ID?item:itemId(item)
    let loc = locId(x.location)
    if (itemObj&&loc){
        let inv = x.inventory.find(e=>e&&e.item_name===itemObj.NAME)
        if (inv){
            let obj = loc.resources.find(e=>e&&e.item===item)
            if (obj.quantity>0){
                obj.quantity -= amount
            } else {
                return
            }
        }
        if (inv){
            x.quantity += amount
        } else {
            x.inventory.push({
                item_name: itemObj.NAME,
                quantity: amount
            })
        }
    }
}

export function useItem(x, item, q = 1) {
    let a = Math.max(Math.ceil(q), 1)
    let hy = x.stats.hydration
    let sa = x.stats.saturation
    let st = x.stats.stamina
    let to = x.stats.intoxication
    while (a > 0 && item.quantity > 1) {
        if (item.item_name === "beer") {
            const need = x.stats.hydration.max-x.stats.hydration.val
            const drink = Math.min(need, x.stats.hydration.max*0.1)
            hy.val += drink
            st.val += 10
            x.justDrank += 3
            to.val += Math.min(to.max-to.val, 0.2)
        } else if (item.item_name === "fruit") {
            const need = x.stats.saturation.max - x.stats.saturation.val
            const eat = Math.min(need, x.stats.saturation.max * 0.35)
            x.stats.saturation.val += eat
            x.stats.stamina.val += 8
            x.justEaten += 10
        }
        else if (item.item_name === "water") {
            const need = x.stats.hydration.max - x.stats.hydration.val
            const drink = Math.min(need, x.stats.hydration.max * 0.5)
            x.stats.hydration.val += drink
            x.stats.stamina.val += 30
            x.justDrank += 6
        }
        else if (item.item_name === "divineCrystal") {
            toDivine(x)
        }
        item.quantity--
        a--
    }
}

export function hasItem(x, item){
    let r = x.inventory.find(e=>e.item_name===item&&e.quantity>0)
    if (r){
        return r
    }
    return false
}

export function addItem(x, item, q=1){
    let a = x.inventory.find(e=>e.item_name===item&&e.quantity>0)
    if (a){
        a.quantity += q
    } else {
        x.inventory.push({
            item_name: item,
            quantity: q
        })
    }
}

const reqToget = {
    "metal": "pickaxe",
    "crystal": "pickaxe"
}

export function collect(x, item){
    //console.log("an npc is collecting something...")
    function canCollect(item) {
        const tool = reqToget[item]
        if (!tool) return true
        return x.inventory.some(e => e.item_name === tool)
    }
    let odds = getRng()*4
    if (odds > locId(x.location).difficulty){
        let it = locId(x.location).resources.find(e=>e&&e.item===item)
        if (it&&it.quantity>=0&& canCollect(it.item)){
            if (it.item==="water"&&x.stats.stamina.val>5){
                if (it.item === "water") {
                    let q = Math.max(1, getRng() * 2)
                    it.quantity -= q
                    addItem(x, "water", q)
                    x.stats.stamina.val -= 5
                    return
                } 
            } else if (it.item==="fruit"&&x.stats.stamina.val>5){
                if (it.item === "fruit") {
                    let q = Math.max(1, getRng() * 2)
                    it.quantity -= q
                    addItem(x, "fruit", q)
                    x.stats.stamina.val -= 5
                    return
                } 
            } else if(x.stats.stamina.val>20){
                let q = 1
                it.quantity -= q<it.quantity?q:it.quantity
                addItem(x, item, q)
                x.stats.stamina.val -= 20
                return
            }
        }
    }
}
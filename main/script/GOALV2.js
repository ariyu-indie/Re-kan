import { hasItem, obtainItem, consumeItem } from "./ITEMS.js"
import { structId, exitAB } from "./BUILDINGS.js"

export function appendGoal(x, type, item, amount=1){
    if (!x||!type||!item) return
    let goal = {
        VERB: type,
        ITEM: item,
        AM: amount
    }
    x.goals.push(goal)
    return goal
}

export function parseGoal(x){
    //console.log(x)
    if (!x) return
    while (x.goals.length>0){
        let cur = x.goals.shift()
        for (let i=0;i<cur.AM;i++){
            let stOj = null
            if (x.inside.state){
                stObj = structId(x.inside.structure)
            }
            if (cur?.VERB==="enter"){
                if (x.inside.state){
                    exitAB(x)
                }
                
            } else if (cur?.VERB==="use"){
                if (hasItem(x, cur?.ITEM)){
                    consumeItem(x, cur.ITEM)
                    console.log(`${cur.ITEM} consumed`)
                } else {
                    obtainItem(x)
                }
            }
        }
        //console.log(cur)
    }
}
import { getRng } from "./SEED.js"
export function random(x){
    return x[Math.floor(getRng()*x.length)]
}
export function sorter(arr, e=(item)=>{return item}){
    let sorted = arr
    for (const i of arr){
        for (const o of arr){
            let nextItem = sorted[+sorted.indexOf(o)+1]
            if (nextItem){
                if (e(o)<e(nextItem)){
                    let a = sorted.indexOf(o)
                    let b = sorted.indexOf(nextItem)
                    sorted[b] = o
                    sorted[a] = nextItem
                }
            } else {
                break
            }
        }
    }
    return sorted
}
export function sorterLow(arr, e=(item)=>{return item}){
    let sorted = arr
    for (const i of arr){
        for (const o of arr){
            let nextItem = sorted[+sorted.indexOf(o)+1]
            if (nextItem){
                if (e(o)>e(nextItem)){
                    let a = sorted.indexOf(o)
                    let b = sorted.indexOf(nextItem)
                    sorted[b] = o
                    sorted[a] = nextItem
                }
            } else {
                break
            }
        }
    }
    return sorted
}


export function RBH(arr, e=(item)=>{return item}){ //random by highest 
    let highest = null
    let r = []
    for (const i of arr){
        if (highest===null){highest=i;r.push(i); continue}
        if (e(i)>e(highest)){
            highest = i
            r = [highest]
            //r.push(i)
        } else if (e(i)===e(highest)){
            r.push(i)
        }
    }
    if (r.length>1){
        return random(r)
    } else {
        return highest
    }
}
export function RBL(arr, e=(item)=>{return item}){ //random by highest 
    let lowest = null
    let r = []
    for (const i of arr){
        if (lowest===null){lowest=i;r.push(i); continue}
        if (e(i)<e(lowest)){
            lowest = i
            r = [lowest]
            //r.push(i)
        } else if (e(i)===e(lowest)){
            r.push(i)
        }
    }
    if (r.length>1){
        return random(r)
    } else {
        return lowest
    }
}

export function absRand(i=[]){
    return i[Math.floor(Math.random()*i.length)]
}

export function RWCH(arr, e=(item)=>{return item}){ //lowest === rarest.
    if (!arr) return
    let res = null
    let resultArr = sorterLow(arr, e)
    let max = e(resultArr[resultArr.length-1])
    let rand = getRng()*max+5
    //console.log(rand, max, resultArr)
    for (const i of resultArr){
        if (rand>max){
            return resultArr[resultArr.length-1]
        }
        if (rand<i.score){
            return i
        }
    }
    return resultArr[resultArr.length-1]
}

/*console.log(RWCH([
    {
        score: 1
    },
    {
        score: 9
    },
    {
        score: 10
    }
], item=>{return item.score}))*/
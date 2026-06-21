import { state } from "./STATE.js"
import { group } from "./CLASSES.js"
import { genName } from "./HUMANS.js"
import { meanings } from "./DICTIONARY.js"
import { GRCH } from "./COMBAT.js"
import { random } from "./UTILS.js"
import { look } from "./HUMANS.js"
import { send } from "./SEND.js"

/*all ranks are as follows:
leader: assigns ranks and commands.
core: commands the fighters, in exchange for goods
fighters: fights and protects members, in exchange for goods.
civilian: lives, does labor and offerings for the leaders in exchange for protection.

the loop:

leader pays cores to manage military, and gives goods to fighters 
core fights and commands the fighters,
fighters protect members
civilian gives goods to leader for protection.
*/

export function grId(id){
    return state.groups.find(e=>e.id===id)
}

export function getR(g, r="civilian"){
    if (!g) return null
    let res = g.groupMembers.find(e=>e&&e.rank===r)
    if (res){
        return res.id
    } else {
        return null
    }
}

export function newMember(x, group, r="civilian"){
    if (group){
        group.groupMembers.push({
            id: x.id,
            rank: r
        })
        x.group.id = group.id
        x.group.rank = r
        //console.log("yo")
        return x
    } else {
        //console.log(group)
    }
    //console.log(group)
    return false
}

export function exitAg(x){
    if (!x.group.id) return
    let g = grId(x.group.id)
    if (g){
        g.groupMembers = g.groupMembers.filter(e=>e&&e.id!==x.id)
        x.group.id = null
        x.group.rank = null
    }
}

export function hasMember(x, group){
    if (!group||!x) return false
    //console.log(group.groupMembers.find(e=>e.id===x.id))
    if (group.groupMembers.find(e=>e&&e.id===x.id)){
        //console.log("bam")
        return true
    }
    return false
    
}

export function newRank(x, group, r="civilian"){
    if (!x||!group) return
    let g = group
    if (typeof group==="number"){
        g = grId(group)
    }
    if (g){
        let m = g.groupMembers.find(e=>e&&e.id===x.id)
        if (m){
            m.rank = r
            x.group.rank = r
        }
    }
}

export function joinGr(x, group){ //group === group Id
    if (x.group.id) {return}
    if (!group) {return}
    let g = grId(group)
    //newMember(x, g)
    //console.log("yey")
    if (hasMember(x, g)) {return}
    if (g){
        let leader = look(getR(g, "leader"))
        let core = look(getR(g, "core"))
        //console.log(leader.name)
        if (leader){
            if (core&&x.combat.damage>core.combat.damage){
                newMember(x, g, "core")
                newRank(core, g, "fighter")
                let n = hist(g, `the core of ${g.name} has been replaced.`)
                n.sub = x.id
            } else if (x.combat.damage>leader.combat.damage){
                if (!core){
                    newMember(x, g, "core")
                } else {
                    newMember(x, g, "fighter")
                }
            } else {
                newMember(x, g, "civilian")
                //return true
            }
            //returngroup
            //console.log("pog")
        } else {
            newMember(x, g, "leader")
            //return true
        }
        let m = hist(g, `${x.name} has joined our group! their rank is ${x.group.rank}`)
        m.sub = x.id
        return true
    }
    return false
}

/*export function newRel(gA, gB){ //id
    if (!gA||!gB) return
    let groupA = grId(gA)
    let groupB = grId(gB)
    if (groupA&&groupB){
        groupA.relations.push({
            group: gB,
            level: 0.5
        })
        groupB.relations.push({
            group: gA,
            level: 0.5
        })
        hist(groupA, `we've made relation with ${groupB.name}`)
        hist(groupB, `we've made relation with ${groupA.name}`)
    }
}*/

export function claim(groupObj, l){ //id
    if (!claimed(l)){
        if (!groupObj.territory.some(e=>e&&e.loc===l)){
            groupObj.territory.push({
                loc: l
            })
            hist(groupObj, "we claimed a land.")
            return groupObj
        } 
        return false
    } else {
        return false
    }
}

export function claimed(loc){ //id
    let g = state.groups.find(e=>e&&e.territory.find(o=>o&&o.loc===loc))
    /*console.log("res", g)
    console.log("id", loc)*/
    if (g){
        //console.log("yes")
        return g
    }
    return false
}

export function hist(groupObj, content="empty"){
    let h = {
        text: content,
        date: {
            year: state.cal.y,
            month: state.cal.m,
            day: state.cal.d,
            hour: state.cal.h
        },
        sub: null
    }
    groupObj.history.push(h)
    return h
}

export function newRel(x, target, typ){
    if (!x||!target) return
    let xR = x.relations.find(e=>e&&e.group===target.id)
    let taR = target.relations.find(e=>e&&e.group===x.id)
    if (xR&&taR){
        xR.type = typ
        taR.type = typ
    } else {
        x.relations.push({
            group: target.id,
            type: typ
        })
        target.relations.push({
            group: x.id,
            type: typ
        })
    }
}

export function newGroup(x, y=[]){ //first members, obj
    if (claimed(x.location)) return
    let g = new group()
    g.color = GRCH()
    let n = "the "+random(meanings)+" "+random(meanings)
    g.name = genName(x, n).translation
    let m = hist(g, `this year, ${state.cal.y}, ${g.name} was founded!`)
    m.sub = x.id
    g.groupMembers.push({
        id: x.id,
        rank: "leader"
    })
    g.territory.push({
        loc: x.location
    })
    g.establishedBy = x.id
    x.group.id = g.id
    x.group.rank = "leader"
    for (const i of y){
        newMember(i, g)
    }
    //console.log("done")
    state.groups.push(g)
    return g
}
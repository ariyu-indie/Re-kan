import { state } from "./STATE.js"
import { send } from "./SEND.js"
import { look, hasPartner, genImg } from "./HUMANS.js"
import { locId } from "./LOC.js"
import { newTopic, commonTopics, bondWith, nearPartner, relation, understands} from "./TALK&ROMANCE.js"
import { update } from "./MISC.js"
import { combat } from "./COMBAT.js"
import { random } from "./UTILS.js"
import { addItem, hasItem } from "./ITEMS.js"
import { joinGr } from "./GROUPS.js"
import { advanceVowels, commonConsonants, advanceConsonants, translate } from "./LANGUAGES.js"
import { relive } from "./MEMORY.js"
import { getRng } from "./SEED.js"

let pt = state.playerTags

function mood(x){ //x === number
    if (x>=0.8){
        return "joyous"
    } else if (x>=0.7){
        return "happy"
    } else if(x>=0.6){
        return "fine"
    } else if(x>=0.4){
        return "neutral"
    }  else if(x>=0.3){
        return "frustrated"
    }  else {
        return "angry"
    }
}

export function initTalk(x){
    send(`[align: center]---topics---leave---`)
    pt.chooseTalkMode.state = true
    state.topics = commonTopics()
    let bye = newTopic(`see you later`)
    bye.type.push("leave", "action")
    state.topics.push(bye)
    let tellPlayer = newTopic(`let me tell you who i am`)
    tellPlayer.type.push("personal", "info")
    if (!x?.knows.some(e=>e&&e===state.player?.id)){
        state.topics.push(tellPlayer)
    }
    let fight = newTopic(`fight ${x.name}`)
    fight.type.push("combat", "violence", "crime", "action")
    for (const i of state.player.knows) {
        if (x.id !== i) {
            let topic = newTopic(`do you know ${look(i).name}?`)
            topic.type.push("question", "person")
            topic.person = i
            state.topics.push(topic)
        }
    }
    for (const i of state.player.victories) {
        if (i) {
            let topic = newTopic(i.title)
            topic.type.push("combat", "achievement")
            if (i.level&&i.obj){
                topic.level = i.level
                topic.obj = i.obj
            }
            topic.numOfOpp = i.numOfOpp
            state.topics.push(topic)
        }
    }
    state.topics.push(fight)
}

function trembleInit(txt){
    let tS = txt.match(/([^\s]+)/g)
    let res = []
    for (const l of tS){
        if (getRng()<0.5){
            let first = l[0]
            res.push(first+"-"+l)
        } else {
            res.push(l)
        }
    }
    return res.map(e=>e).join(" ")
}

trembleInit("how are you")

function tremble(txt){
    let all = new RegExp(`(\\w|[${advanceVowels.map(e=>e)}]|[${advanceConsonants.map(e=>e)}]|\\s+|\\?|\\!|\\.|\\,)`, "g")
    let tS = txt.match(all)
    let res = ""
    for (const letter of tS){
        if ([...commonConsonants, ...advanceConsonants].find(e=>e&&e===letter)){
            if (getRng()<0.4){
                res += `${letter}-${letter}`
            } else {
                res += letter
            }
        } else {
            res += letter
        }
    }
    //console.log(tS)
    //console.log(res)
    return res
}

function assess(x, max=1){
    let p = (x/max)
    if (p>=0.8){
        return "severely"
    } else if (p>=0.7){
        return "noticeably"
    } else if (p>=0.4){
        return "slightly"
    } else {
        return "subtly"
    }
}

function rekSay(txt, r, t){
    state.topics = state.topics.filter(e => e && e.topic !== t.topic)
    let m = mood(r.mood)
    if ((r.stats.tremble.val/r.stats.tremble.max)>=0.1){
        txt = trembleInit(txt)
        m += `, ${assess(r.stats.tremble.val, r.stats.tremble.max)} trembling`
    }
    send(`*${r.name}* (${m}): ${txt}`)
}

//tremble("hello? ĝó how are you?")

export function playerTags(a, cmd){ //a === array
    if (pt?.choseTopic?.state&&pt.talk?.obj){
        if (cmd.toLowerCase()==="leave"){
            pt.talk.state = false
            send(`you walked away (you are no longer talking with ${look(pt.talk.obj).name})`)
            return true
        }
        let index = parseInt(cmd)
        let r = look(pt.talk.obj)
        let understand = understands(state.player, r)
        //console.log(state.topics[index])
        if (state.topics[index]){
            let t = state.topics[index]
            //console.log("yolo")
            let txt = "hello"
            if (understand!=="done"){
                txt = translate("sorry, I don't understand", r.languages[0].language)
            } if (t.type.some(e=>e&&e==="personal")&&r.social.pride<getRng()){
                if (t.type.some(e=>e&&e==="rekan")){
                    txt = "why should i tell you that"
                } else {
                    txt = "uhm okay..."
                }
            } else if (t.topic.includes("i won a fight")){
                if (t.numOfOpp>1){
                    if (r.social.pride<getRng()){
                        txt = random(["hm, i know i can do better.", "that's rookie.", "who asked?"])
                    } else {
                        txt = random(["that's incredible!", "that's awesome!"])
                    }
                } else{
                    if (r.social.pride<getRng()){
                        txt = "they had it coming..."
                        let theyWereA = newTopic(`they are a ${t.level}`)
                        theyWereA.obj = t.obj
                        theyWereA.level = t.level
                        theyWereA.type.push("information", "person")
                        state.topics.push(theyWereA)
                    } else {
                        txt = "that's nice..."
                    }
                    let rel = relation(r, look(t.obj))
                    if (rel&&rel.level>0.5){
                        txt = random(["are you serious?! that's my friend!", "are you insane?!"])
                        let NTPrel = relation(r, state.player)
                        if (NTPrel){
                            NTPrel.level -= 100
                        }
                        rekSay(txt, r, t)
                        combat(r, state.player)
                        pt.talk.state = false
                        pt.talk.obj = null
                        pt.choseTopic.state = false
                        pt.chooseTalkMode.state = false
                        return true
                    } 
                }
            } else if (t.type.includes("leave")){
                if (r.knows.includes(state.player.id)&&(r.mood>0.3||state.player.level==="god")){
                    txt = "farewell!"
                } else if (r.social.pride<getRng()){
                    txt = "good riddance."
                } else {
                    txt = "see ya later."
                }
                pt.talk.state = false
                pt.talk.obj = null
                pt.choseTopic.state = false
                pt.chooseTalkMode.state = false
                rekSay(txt, r, t)
                //send(txt)
                return true
            } else if (r.mood<0.3){
                txt = random(["leave me alone", "get lost", "stop"])
            } else if (t.topic==="who are they?"){
                let partner = hasPartner(r)
                if (partner){
                    txt = `their name is ${look(partner.person).name}`
                } else {
                    txt = "sadly... i lied."
                }
            } else if (t.topic==="break up with them"){
                let partner = hasPartner(r)
                //console.log(partner)
                if (partner){
                    let rel = relation(r, look(partner.person))
                    //console.log(rel)
                    if (rel&&rel.level<0.2&&getRng()<0.5){
                        txy = "hmm, maybe i should..."
                        //console.log(rel)
                    } else {
                        txt = "no way!"
                    }
                } else {
                    txt = "no way..."
                }
            } else if (t.topic==="do you have a partner?"){
                let partner = hasPartner(r)
                txt = `${partner?"yes i have a partner!":"no i don't have a partner."}`
                if (partner){
                    let breakUp = newTopic("break up with them")
                    breakUp.type.push("personal", "persuasion", "action", "partner")
                    let whoAreThey = newTopic("who are they?")
                    whoAreThey.type.push("personal", "rekan", "question", "person", "partner")
                    state.topics.push(breakUp, whoAreThey)
                }
            } else if (t.topic==="join my group!"){
                if (getRng()<0.01){
                    txt = "alright!"
                } else {
                    txt = random(["no thanks.", "not interested.", "erm"])
                }
            } else if (t.topic==="what's on your mind?"){
                let mem = relive(r)
                if (mem){
                    txt = `i remember when ${mem.content} i felt ${mem.emotion}.`
                }
            } else if (t.topic==="let me tell you who i am"){
                let p = state.player
                r.knows.push(p.id)
                p.knows.push(r.id)
                bondWith(p, r)
                txt = `so, your name is ${p.name}... and you are a ${p.level}?`
            } else if (t.topic==="greet"){
                txt = random(["hello there!", "how are you?", "everything's good?"])
            } else if (t.topic.startsWith(`any location recommendations?`)){
                if (r.familiarLoc.length>1){
                    let loc = random(r.familiarLoc.filter(e=>e&&e!==r.location))
                    txt = `yes! i recommend you go to ${locId(loc).name}.`
                } else {
                    txt = `got nothing on me right now.`
                }
            } else if (t.topic.startsWith(`do you know`)){
                if (t.person){
                    let tObj = look(t.person)
                    if (r.knows.some(e=>e&&e===t.person)){
                        txt = `yes! i know *${tObj.name}*!`
                    } else {
                        txt = `hmm, i do not know who that is.`
                    }
                }
            } else if (t.topic.startsWith(`fight ${r.name}`)){
                txt = `agh!`
                combat(state.player, r)
                pt.talk.state = false
                pt.talk.obj = null
                pt.choseTopic.state = false
                pt.chooseTalkMode.state = false
                rekSay(txt, r, t)
                return true
            } else if (t.topic = "how old are you?"){
                txt = `i am ${Math.round(r.age)} years old.`
            }
            rekSay(txt, r, t)
        }
        let txt = `---${state.topics.map((e, index)=>`${index}. *topic*: **${e.topic}**<br>*tags*: **${e.type.map(o=>o).join(", ")}**`).join("---")}---`
        send(txt)
        return true
    }
    if (pt.chooseTalkMode?.state){
        let r = look(state.playerTags.talk.obj)
        if (r&&cmd==="topics"){
            //console.log(state.topics)
            let p = state.player
            let txt = `---${state.topics.map((e, index)=>`${index}. *topic*: **${e.topic}**<br>*tags*: **${e.type.map(o=>o).join(", ")}**`).join("---")}---`
            pt.choseTopic.state = true
            send(txt)
        } else {
            pt.talk.state = false
            send("you walked away")
        }
        pt.chooseTalkMode.state = false
        return true
    }
    if (pt?.enterBuilding?.state&&pt?.enterBuilding.arr){
        let ind = parseInt(cmd)
        if (pt?.enterBuilding?.arr[ind]){
            state.player.inside.state = true
            state.player.inside.structure = pt.enterBuilding.arr[ind]
            send(`you entered *${pt.enterBuilding.arr[ind].name}*`)
            pt.enterBuilding.state = false
            pt.enterBuilding.arr = null
        }
    }
    if (pt?.talk?.state&&pt?.talk?.obj){
        let o = pt.talk.obj
        send(`you are talking to *${o.name}*, they are *${mood(o.mood)}*`)
        let r = look(pt?.talk?.obj)
        //pt.chooseTalkMode.state = true
        return true
    }
    /*if (state?.playerTags?.talk?.state&&state?.playerTags?.talk?.obj){
        let t = parseInt(cmd)
        let r = look(state?.playerTags?.talk?.obj)
        let name = r.name
        let txt = `*${state.topics.map(e=>`${e.topic}*<br>*tags: ${e.type.map(o=>o).join(", ")}*<br>`).join("<br>")}`
        send(txt)
    }*/
    if (state?.playerTags?.rekanianTalkPlayer?.state){
        let rek = look(state.playerTags.rekanianTalkPlayer.obj)
        let q = state.playerTags.rekanianTalkPlayer.question
        if (!rek){
            state.playerTags.rekanianTalkPlayer.state = false
            state.playerTags.rekanianTalkPlayer.obj = null
            state.playerTags.rekanianTalkPlayer.question = null
            return true
        }
        if (q==="name"){
            if (a[0]&&a[0].toLowerCase()==="a"){
                send("you told them your name. \"nice name!\" they said. My name is "+rek.name+", and they walked away.")
                rek.knows.push(state.player.id)
                state.player.knows.push(rek.id)
            } else {
                send("they had a slight frown, before walking away")
                rek.mood -= 0.03
            }
            state.playerTags.rekanianTalkPlayer.state = false
            state.playerTags.rekanianTalkPlayer.obj = null
            state.playerTags.rekanianTalkPlayer.question = null
        }
        return true
    }
    if (state?.playerTags?.askWhereToGo?.state){
        let pl = locId(state.player.location)
        if (a[0]&&
        parseInt(a[0])<pl.connections.length&&
        pl.connections[parseInt(a[0])]){
            let dest = locId(pl.connections[parseInt(a[0])])
            send(`you decided to go to ${dest.name}`)
            let h = 0
            for (let i=0;i<dest.difficulty*2;i++){
                update()
                h++
            }
            send(`
            the journey was${h>1?"n't quick":" quick"}, you arrived there ${h} hour${h>1?"s":""} later
            `)
            state.player.location = locId(state.player.location).connections[parseInt(a[0])]
            state.playerTags.askWhereToGo.state = false
            //update()
        } else {
            send("[ you must be confused ]")
        }
    }
    if (state?.playerTags?.offerMarketAsk?.state){
        if (a[0]&&a[1]&&(state.playerTags.buyingMarket.marketObj.itemsForSale.some(e=>e.item_name===a[0].toLowerCase()&&e.amountForSale>0))){
            a[0] = a[0].toLowerCase()
            let itemYouGet = state.playerTags.buyingMarket.marketObj.itemsForSale.find(e=>e.item_name===a[0]&&e.amountForSale>0)
            //console.log(itemYouGet)
            if (itemYouGet&&state.player.inventory.some(e=>e.item_name===itemYouGet.inExchange.item)){
                let playerIt = state.player.inventory.find(e=>e&&e.item_name===itemYouGet.inExchange.item)
                if (playerIt&&playerIt.quantity>(itemYouGet.inExchange.amount*parseInt(a[1]))){
                    if (parseInt(a[1])>itemYouGet.amountForSale){
                        addItem(state.player, itemYouGet.item_name, itemYouGet.amountForSale)
                        addItem(state.player, itemYouGet.inExchange.item, -(itemYouGet.inExchange.amount*itemYouGet.amountForSale))
                        send(`you got ${itemYouGet.amountForSale.toFixed(2)} *${itemYouGet.item_name}* for ${(itemYouGet.inExchange.amount*parseFloat(a[1])).toFixed(2)} *${itemYouGet.inExchange.item}*`)
                        itemYouGet.amountForSale = 0
                    } else {
                        addItem(state.player, itemYouGet.item_name, parseInt(a[1]))
                        addItem(state.player, itemYouGet.inExchange.item, -(itemYouGet.inExchange.amount*parseInt(a[1])))
                        send(`you got ${a[1]} *${itemYouGet.item_name}* for ${(itemYouGet.inExchange.amount*parseFloat(a[1])).toFixed(2)} *${itemYouGet.inExchange.item}*`)
                        itemYouGet.amountForSale -= parseInt(a[1])
                    }
                    send("*seller*: thanks for trading with me!")
                    state.playerTags.offerMarketAsk.state = false
                } else {
                    send("*seller*: oops, looks like you're short on what I've asked for.")
                    state.playerTags.offerMarketAsk.state = false
                }
            } else {
                send("*seller*: uhm, you don't have what I'm asking for...")
                state.playerTags.offerMarketAsk.state = false
            }
        } else {
            send("*seller*: oops, i cancelled your transaction, we are out of the item!")
            state.playerTags.offerMarketAsk.state = false
        }
        send("**type commands again to interact with the seller!**")
        return true
    }
    if (state.playerTags?.chooseTalk?.state&&state.playerTags.chooseTalk.arr){
        let c = a[0].toLowerCase()
        let arr = state.playerTags.chooseTalk.arr
        if (arr[parseInt(c)]){
            let n = arr[parseInt(c)]
            send(`you approached *${n.name}* hoping to have a talk with them`)
            state.playerTags.talk.state = true
            state.playerTags.talk.obj = n.id
            state.playerTags.chooseTalk.state = false
            state.playerTags.chooseTalk.arr = null
            let greet = "hey"
            let ntpRel = relation(n, state.player)
            let cont = true
            if (ntpRel){
                if (ntpRel.level<0.1){
                    greet = random(["you disgust me!", "get lost!"])
                    cont = false
                    send(`*${n.name}*: ${greet}`)
                }
            }
            if (cont){
                if (state.settings.images){
                    //async ()=>{
                    if (!n.image){
                        genImg(n).then(n=>{
                            send(`[align: center]---<img width=100>${n.image}<img>---*name*: *${n.name}*`)
                            send(`*${n.name}*: ${greet}`)
                            initTalk(n)
                        })
                        return true
                    } 
                }
                send(`*${n.name}*: ${greet}`)
                initTalk(n)
                //send("you are now talking to someone")
                //talkOptions(n)
                //checkCmd("hey yo!")
                return true
            }
        } else {
            send("you abandoned the idea of talking to someone.")
            state.playerTags.chooseTalk.state = false
            state.playerTags.chooseTalk.arr = null
        }
    }
    if (state?.playerTags?.buyingMarket?.state&&state.playerTags.buyingMarket.marketObj){
        send("you approached the seller.")
        if (a[0]&&a[0]==="1"){
            send("you asked what the seller could offer...")
            send("*seller*: alright.")
            send(`the seller began to rummage through ${look(state.playerTags.buyingMarket.marketObj.ownedBy).gender==="male"?"his":"her"} barrels`)
            if (state.playerTags.buyingMarket.marketObj.itemsForSale.filter(e=>e.amountForSale>0).length>0){
                send("*seller*: here's what i could offer")
                let txt = `[align: center]*seller's offer*---${state.playerTags.buyingMarket.marketObj.itemsForSale.map(e=>` • ${e.item_name} - i have ${e.amountForSale.toFixed(2)}, and i expect to get ${e.inExchange.amount.toFixed(2)} ${e.inExchange.item}s per 1 unit!`).join("---")}`
                /*for (const item of state.playerTags.buyingMarket.marketObj.itemsForSale){
                    txt += `• *${item.item_name}* - i have ${item.amountForSale.toFixed(2)} for sale, and i expect to get ${item.inExchange.amount.toFixed(2)} ${item.inExchange.item}s per 1 unit!<br>`
                }*/
                send(txt)
            } else {
                send("*seller*: shucks, no stocks! maybe come back later?")
                state.playerTags.buyingMarket.state = false
                state.playerTags.buyingMarket.marketObj = null
            }
        } else if (a[0]&&a[0]==="2"){
            send("*seller*: alright! what are you gonna buy? <50%>item [quantity]<a>")
            state.playerTags.offerMarketAsk = {
                state: true
            }
        } else if (a[0]&&a[0]==="3"){
            send(`my name is ${look(state.playerTags.buyingMarket.marketObj.placedBy).name}!`)
        } else if (a[0]&&a[0]==="4"){
            send(`*seller*: alright, see ya!`)
            state.playerTags.buyingMarket.state = false
            state.playerTags.buyingMarket.marketObj = null
        }
        return true
    }
}
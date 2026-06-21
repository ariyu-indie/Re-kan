import { state } from "./STATE.js"
import { getImg } from "./IMAGES.js"
import { place } from "./CLASSES.js"
import { terrainType, generateResources, locId } from "./LOC.js"
import { translate } from "./LANGUAGES.js"
import { meanings } from "./DICTIONARY.js"
import { random } from "./UTILS.js"
import { sleep } from "./HELPER.js"
import { send, format } from "./SEND.js"
import { getRng } from "./SEED.js"

const tiles = {
    "mountain": "#B9B9B9",
    "jungle": "#63B765",
    "forest": "#00DE4D",
    "grassland": "#3EFF41",
    "plains": "#F6FF4F",
    "water": "#2E96FF"
}

const tileset = {}
const structs = {}
const cnv = document.getElementById("mapEngine")
//const secL = document.getElementById("secLayer")
const ctx = cnv.getContext("2d")
//cnv.width = state.genSettings
let tileSize = 200

async function loadA(){
    await getImg("mountain.png").then((blob)=>{
        tileset["mountain"] = blob
    })
    await getImg("jungle.png").then((blob)=>{
        tileset["jungle"] = blob
    })
    await getImg("forest.png").then((blob)=>{
        tileset["forest"] = blob
    })
    await getImg("grasslands.png").then((blob)=>{
        tileset["grassland"] = blob
    })
    await getImg("plains.png").then((blob)=>{
        tileset["plains"] = blob
    })
    await getImg("water.png").then((blob)=>{
        tileset["water"] = blob
    })
    await getImg("deepwater.png").then((blob)=>{
        tileset["deepwater"] = blob
    })
    await getImg("STRUCT_LV1.png").then((blob)=>{
        structs["LV1"] = blob
    })
    await getImg("STRUCT_LV2.png").then((blob)=>{
        structs["LV2"] = blob
    })
    await getImg("STRUCT_LV3.png").then((blob)=>{
        structs["LV3"] = blob
    })
    await getImg("STRUCT_LV4.png").then((blob)=>{
        structs["LV4"] = blob
    })
    await getImg("STRUCT_LV5.png").then((blob)=>{
        structs["LV5"] = blob
    })
    //genLoca(20, 20)
}

function purify(x){
    let res = 0
    let reach = Math.abs(x)
    for (res=0;res<reach;res+=tileSize){
        //res = i
    }
    if (x<0){
        return -res
    }
    //console.log(res)
    return res
}

function drawPixel(x, y, width, height, color="white", opacity=1){
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
    ctx.globalAlpha = 1
}

export async function viewMap(){
    await ctx.clearRect(0, 0, cnv.width, cnv.height)
    let map = null
    if (state.MAP.imageObj){
        map = state.MAP.imageObj
        await ctx.drawImage(map, 0, 0, cnv.width, cnv.height)
        for (const i of state.groups){
            console.log("group", i)
            for (const ter of i.territory){
                let ob = locId(ter.loc)
                if (ob){
                    drawPixel(ob.pos[0]*tileSize, ob.pos[1]*tileSize, tileSize, tileSize, i.color, 0.8)
                    drawTxt(`(${ob.name})`,ob.pos[0]*tileSize+(tileSize/2), ob.pos[1]*tileSize+(tileSize-20), "italic bold 9px Serif")
                    drawTxt(`${i.name}`,ob.pos[0]*tileSize+(tileSize/2), ob.pos[1]*tileSize+tileSize, "italic bold 12px Serif")
                }
                
            }
        }
        if (state.player?.location){
            let loc = locId(state.player.location)
            await drawTxt("you are here", loc.pos[0]*tileSize+(tileSize/2), (loc.pos[1]*tileSize+(tileSize/2))-20, "bold 15px Arial")
        }
        for (const i of state.locations){
            let asse = "LV"
            if (i.structures.length>30){
                asse += "5"
            }
            else if (i.structures.length>20){
                asse += "4"
            }
            else if (i.structures.length>15){
                asse += "3"
            }
            else if (i.structures.length>10){
                asse += "2"
            }
            else if (i.structures.length>5){
                asse += "1"
            }
            if (structs[asse]){
                await ctx.drawImage(structs[asse], i.pos[0]*tileSize, i.pos[1]*tileSize, tileSize, tileSize)
            }
        }
        let result = await new Promise((resolve, reject)=>{
            cnv.toBlob((blob)=>{
                let url = URL.createObjectURL(blob)
                if (url){
                    resolve(url)
                }
            })
        })
        console.log("generated")
        return result
    }
}

function noise(w, h/*, seed=1, bit=32, constant=1*/){
    if (w<=0) return
    if (h<=0) return
    /*let constantsA = [
        5,
        1664525,
        6364136223846793005
    ]
    let constantsB = [
        1,
        1013904223,
        1442695040888963407
    ]*/
    let arr = {}
    /*let s = seed
    let bits = 2**bit
    function TOSEED(min=-1.0, max=1.0){ //using LGC lol
        let A = constantsA[constant]
        let B = constantsB[constant]
        s = (A * s + B) % bits
        return min+((s/bits)*(max-min))
    }
    if (seed===0){
        s = Math.random()*bits
    }*/
    for (let i=0;i<h;i++){
        arr[i] = []
        for (let o=0;o<w;o++){
            let l = getRng(1, -1.0, 1.0)
            arr[i].push(l)
        }
    }
    //console.log(arr)
    if (w<=1&&h<=1){
        arr[0][0] = 0.6+getRng()*0.4
    }
    //let nArr = {}
    for (let i in arr){
        for (let o in arr[i]){
            let m = arr[i][o]
            if (o>0){
                if (arr[i][+o-1]<m){ //left
                    arr[i][+o-1] = (m+arr[i][+o-1])/2
                }
                if (arr[+i+1]){//bottom
                    if (arr[+i+1][+o-1]<m){ //left
                        arr[+i+1][+o-1] = (m+arr[+i+1][+o-1])/2
                    }
                }
                 if (arr[+i-1]){ //top
                    if (arr[+i-1][+o-1]<m){ //left
                        arr[+i-1][+o-1] = (m+arr[+i-1][+o-1])/2
                    }
                }
            }
            if (o<arr[i].length-1){
                if (arr[i][+o+1]<m){ //right
                    arr[i][+o+1] = (m+arr[i][+o+1])/2
                }
                if (arr[+i-1]){ //top
                    if (arr[+i-1][+o+1]<m){//right
                        arr[+i-1][+o+1] = (m+arr[+i-1][+o+1])/2
                    }
                }
                if (arr[+i+1]){ //bottom 
                    if (arr[+i+1][+o+1]<m){//right
                        arr[+i+1][+o+1] = (m+arr[+i+1][+o+1])/2
                    }
                }
            }
            if (arr[+i+1]){ //bottom middle
                if (arr[+i+1][o]>m){
                    arr[+i+1][o] = (m+arr[+i+1][o])/2
                }
            }
            if (arr[+i-1]){ //top middle
                if (arr[+i-1][o]>m){
                    arr[+i-1][o] = (m+arr[+i-1][o])/2
                }
            }
        }
    }
    //console.log(arr)
    return arr
}

//let m = noise(30, 30)

function drawTile(x, y, tile="water"){
    if (!tiles[tile]) return
    if (state.settings.images){
        let img = tileset[tile]
        if (img){
            ctx.drawImage(img, x*tileSize, y*tileSize, tileSize, tileSize)
            return
        }
    }
    ctx.fillStyle = tiles[tile]+"FF"
    ctx.fillRect(Math.floor(x)*tileSize, Math.floor(y)*tileSize, tileSize, tileSize)
}

function drawTxt(txt, x, y, style="24px Arial", color="white", opacity=1){
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.font = style
    ctx.textAlign = "center"
    ctx.fillText(txt, x, y)
    ctx.globalAlpha = 1
}

export async function genFromDat(data){
    let m = send("generating...")
    for (let k=0;k<data.length;k++){
        let raw = data[k]
        let o = data[k].difficulty
        let y = raw.pos[1]
        let x = raw.pos[0]
        console.log(data[k])
        drawTile(x, y, "grassland")
        if (o > 0.8) {
            drawTile(x, y, "mountain")
        } else if (o > 0.7) {
            drawTile(x, y, "jungle")
        } else if (o > 0.5) {
            drawTile(x, y, "forest")
        } else if (o > 0.4) {
            drawTile(x, y, "grassland")
        } else if (o > 0.2) {
            drawTile(x, y, "plains")
        } else {
            drawTile(x, y, "water")
        }
        //drawPixel(x*tileSize, y*tileSize, tileSize, tileSize)
        let loca = data.find(e => e && e.pos[0] === x && e.pos[1] === y)
        if (loca) {
            drawTxt(loca.name, x * tileSize+(tileSize/2), y * tileSize + (tileSize / 2), "bold 8px serif", "white", 0.7)
        }
        m.innerHTML = format(`generating images loc [ *${x}*, *${y}* ]`)
        await sleep(0)
    }
    for (const i of state.MAP.landmass){
        let txtSize = Math.min(Math.max(i.locs.length, 20), 50)
        drawTxt(i.name, i.pos[0]*tileSize+(tileSize/2), i.pos[1]*tileSize+(tileSize/2), `italic bold ${txtSize}px Courier New`, "white", 0.9)
    }
    for (const i of  state.MAP.ocean){
        let txtSize = Math.min(Math.max(i.locs.length, 20), 50)
        drawTxt(i.name, i.pos[0]*tileSize+(tileSize/2), i.pos[1]*tileSize+(tileSize/2), `italic bold ${txtSize}px Courier New`, "white", 0.9)
    }
    m.innerHTML = format(`done! [1/1]`)
}

export async function genLoca(w, h){
    let n = noise(w, h)
    state.MAP.size = [w, h]
    //console.log(n)
    cnv.width = w*tileSize
    cnv.height = h*tileSize
    /*secL.width = cnv.width
    secL.height = cnv.height*/
    let loc = {}
    let dL = state.languages[Math.floor(state.GenSettings.domLang*state.languages.length)]
    for (let y in n){
        loc[y] = []
        for (let x=0;x<n[y].length;x++){
            let l = new place()
            l.difficulty = n[y][x]
            l.type = terrainType(l.difficulty)
            l.id = Math.floor(10**9+getRng()*10**10)
            l.resources = generateResources(l.difficulty)
            l.pos = [x, parseInt(y)]
            let semantics = (l.type?l.type:random(random(dL.lexicon).meaning))+" of "+random(random(dL.lexicon).meaning)
            if (dL){
                l.name = translate(semantics, dL).translation
            } else {
                l.name = `loc ${x}`
            }
            loc[y].push(l)
            await sleep(0)
        }
    }
    //console.log(loc)
    let result = []
    
    for (let y in loc){
        for (let x in loc[y]){
            let m = loc[y][x]
            if (x>0){ //left
                if (loc[y][+x-1]?.type!=="water"){
                    m.connections.push(loc[y][+x-1].id)
                } else if (loc[y][+x-1]){
                    m.ocean.push(loc[y][+x-1].id)
                }
            }
            if (x<loc[y].length-1){ //right
                if (loc[y][+x+1]?.type!=="water"){
                    m.connections.push(loc[y][+x+1].id)
                } else if (loc[y][+x+1]){
                    m.ocean.push(loc[y][+x+1].id)
                }
            }
            if (y>0){ //up
                if (loc[+y-1]){
                    if (loc[+y-1][x].type!=="water"){
                        m.connections.push(loc[+y-1][x].id)
                    } else if (loc[+y-1][x]){
                        m.ocean.push(loc[+y-1][x].id)
                    }
                    if (x>0){ //left
                        if (loc[+y-1][+x-1]?.type!=="water"){
                            m.connections.push(loc[+y-1][+x-1].id)
                        } else if (loc[+y-1][+x-1]){
                            m.ocean.push(loc[+y-1][+x-1].id)
                        }
                    }
                    if (x<loc[+y-1].length-1){ //right
                        if (loc[+y-1][+x+1]?.type!=="water"){
                            m.connections.push(loc[+y-1][+x+1].id)
                        } else if (loc[+y-1][+x+1]){
                            m.ocean.push(loc[+y-1][+x+1].id)
                        }
                    }
                }
            }
            //console.log(+y+1)
            if (y<h){ //down
                if (loc[+y+1]){
                    if (loc[+y+1][x]?.type!=="water"){
                        m.connections.push(loc[+y+1][x].id)
                    } else if (loc[+y+1][x]){
                        m.ocean.push(loc[+y+1][x].id)
                    }
                    if (x>0){ //left
                        if (loc[+y+1][+x-1]?.type!=="water"){
                            m.connections.push(loc[+y+1][+x-1].id)
                        } else if (loc[+y+1][+x-1]){
                            m.ocean.push(loc[+y+1][+x-1].id)
                        }
                    }
                    if (x<loc[+y+1].length-1){ //right
                        if (loc[+y+1][+x+1]?.type!=="water"){
                            m.connections.push(loc[+y+1][+x+1].id)
                        } else if (loc[+y+1][+x+1]){
                            m.ocean.push(loc[+y+1][+x+1].id)
                        }
                    }
                }
            }
            result.push(m)
        }
    }
    let land = result.filter(e=>e&&e.type!=="water")
    let water = result.filter(e=>e&&e.type==="water")
    let done = []
    let doneWater = []
    function lid(x){
        return result.find(e=>e&&e.id===x)
    }
    if (land){
        while (land.length>done.length){
            let mass = {
                name: "",
                type: "",
                id: Math.floor(10**9+getRng()*10**10),
                neighbors: [],
                pos: [0,0],
                locs: [],
            }
            let start = random(land.filter(e=>e&&!done.some(o=>o&&o===e.id)))
            if (start){
                let pos = [start.pos[0],start.pos[1]] //x y
                let vis = [start.id]
                let queue = [start.id]
                done.push(start.id)
                //console.log(queue)
                while (queue.length>0){
                    let obj = lid(queue.pop())
                    for (const c of obj.connections){
                        if (!done.some(e=>e&&e===c)&&!queue.some(e=>e&&e===c)&&!vis.some(e=>e&&e===c)){
                            let cObj = lid(c)
                            if (cObj?.type!=="water"){
                                queue.push(c)
                                vis.push(c)
                                done.push(c)
                                pos[0] += cObj.pos[0]
                                pos[1] += cObj.pos[1]
                            }
                        } else {
                            let neighbor = state.MAP.landmass.find(e=>e&&e.locs.find(o=>o&&o===c))
                            if (neighbor){
                                if (!mass.neighbors.some(o=>o&&o===neighbor.id)){
                                    mass.neighbors.push(neighbor.id)
                                    if (!neighbor.neighbors.some(o=>o&&o===mass.id)){
                                        neighbor.neighbors.push(mass.id)
                                    }
                                }
                            }
                        }
                    }
                    if (vis.length>state.GenSettings.continentS){
                        queue = []
                    }
                }
                mass.locs = vis
                if (mass.locs.length>state.GenSettings.continentS/2){
                    mass.type = "continent"
                } else if (mass.locs.length>state.GenSettings.continentS/3){
                    mass.type = "sub-continent"
                } else if (mass.neighbors.length<=0) {
                    mass.type = "island"
                } else {
                    mass.type = "peninsula"
                }
                let semantics = `the ${mass.type} of ${random(random(dL.lexicon).meaning)}`
                mass.name = translate(semantics, dL).translation
                mass.pos = [pos[0]/mass.locs.length, pos[1]/mass.locs.length]
                //console.log(mass)
            }
            state.MAP.landmass.push(mass)
        }
    }
    if (water){
        while (water.length>doneWater.length){
            let mass = {
                name: "",
                type: "ocean",
                pos: [0,0],
                locs: [],
            }
            let start = random(water.filter(e=>e&&!done.some(o=>o&&o===e.id)))
            if (start){
                let pos = [start.pos[0], start.pos[1]]
                let vis = [start.id]
                let queue = [start.id]
                doneWater.push(start.id)
                //console.log(queue)
                while (queue.length>0){
                    let obj = lid(queue.pop())
                    for (const c of obj.ocean){
                        if (!doneWater.some(e=>e&&e===c)&&!queue.some(e=>e&&e===c)&&!vis.some(e=>e&&e===c)){
                            let cObj = lid(c)
                            if (cObj?.type==="water"){
                                queue.push(c)
                                vis.push(c)
                                doneWater.push(c)
                                /*pos[0] += cObj.pos[0]
                                pos[1] += cObj.pos[1]*/
                            }
                        }
                    }
                }
                mass.locs = vis
                
                let semantics = `the ${mass.type} of ${random(random(dL.lexicon).meaning)}`
                mass.name = translate(semantics, dL).translation
                mass.pos[0] = pos[0]//Math.abs(mass.locs.length>0?mass.locs.length-1:mass.locs.length)
                mass.pos[1] = pos[1]//Math.abs(mass.locs.length>0?mass.locs.length-1:mass.locs.length)
                //console.log(mass)
            }
            if (mass.locs.length>state.GenSettings.oceanS){
                state.MAP.ocean.push(mass)
            } 
        }
    }
    /*console.log("s",state.MAP.landmass)
    console.log("ocean",state.MAP.ocean)*/
    await genFromDat(result)
    //let mapImage = null
    await cnv.toBlob((blob)=>{
        let url = URL.createObjectURL(blob)
        state.MAP.image = url
        let obj = new Image()
        obj.src = url
        obj.onload = ()=>{
            state.MAP.imageObj = obj
            console.log("generated images...")
        }
        //state.MAP.size = [h, w]
    })
    
    //console.log(result)
    return result
}

/*ctx.fillStyle = tiles["plains"]+"FF"
ctx.fillRect(0, 0, 10, 10)*/
/*for (let i in m){
    for (let k=0;k<m[i].length;k++){
        let o = m[i][k]
        if (o>0.8){
            drawTile(k, parseInt(i), "mountains")
        } else if(o>0.6) {
            drawTile(k, parseInt(i), "jungle")
        } else if(o>0.4) {
            drawTile(k, parseInt(i), "forest")
        } else if(o>0.2) {
            drawTile(k, parseInt(i), "plains")
        } else {
            drawTile(k, parseInt(i), "water")
        }
    }
}*/
//genLoca(20, 20)
//drawTile(2, 0)
loadA()
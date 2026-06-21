import { state } from "./STATE.js"
import { $, sleep } from "./HELPER.js"
import { locId } from "./LOC.js"
const bgImg = $("bgImg")
bgImg.height = window.innerHeight+1
const weatherImg = $("weatherImg")
weatherImg.height = window.innerHeight+1

let images = {}
export function getImg(x){
    if (images[x]){
        return images[x]
    } else {
        let n = new Image()
        images[x] = new Promise((resolve, reject)=>{
            n.src = "/main/assets/"+x
            n.onload = ()=>{
                //console.log(`asset ${x} Loaded`)
                resolve (n)
            }
            n.onerror = ()=>{reject("can't find image")}
        })
        return images[x]
    }
}
const TWI = [
    "mountain"
]
export function updWeatherImg(x){
    if (x&&locId(x.location)?.rain?.state&&locId(x.location).rain.strength){
        if (locId(x.location).rain.strength>=0.90){
            getImg("rainLV5.png").then((img)=>{
                weatherImg.src = img.src
            })
        } else if (locId(x.location).rain.strength>=0.60){
            getImg("rainLV4.png").then((img)=>{
                weatherImg.src = img.src
            })
        } else if (locId(x.location).rain.strength>=0.40){
            getImg("rainLV3.png").then((img)=>{
                weatherImg.src = img.src
            })
        } else if (locId(x.location).rain.strength>0){
            getImg("rainLV2.png").then((img)=>{
                weatherImg.src = img.src
            })
        } else {
            getImg("rainLV1.png").then((img)=>{
                weatherImg.src = img.src
            })
        } 
    } else {
        getImg("rainLV1.png").then((img)=>{
            weatherImg.src = img.src
        })
    }
}
export async function updBg(x){
    //console.log("eh")
    if (x?.location){ //TWI === types with images
        if (state.cal.h>=18){
            getImg(`${locId(x.location).type}_night.png`).then((img) => {
                bgImg.src = img.src
            })
        } else if (state.cal.h>=12){
            getImg(`${locId(x.location).type}_afternoon.png`).then((img) => {
                bgImg.src = img.src
            })
        } else if (state.cal.h>=10){
            getImg(`${locId(x.location).type}_noon.png`).then((img)=>{
                bgImg.src = img.src
            })
        } else if (state.cal.h>=6){
            getImg(`${locId(x.location).type}_morning.png`).then((img)=>{
                bgImg.src = img.src
            })
        } else {
            getImg(`${locId(x.location).type}_night.png`).then((img) => {
                bgImg.src = img.src
            })
        }
    } else {
        //console.log("oopsie")
        getImg("cover_rekan.png").then((img)=>{
            bgImg.src = img.src
        })
    }
}
export function loadImgs(){
    getImg("cover_rekan.png")
    getImg("rainLV1.png")
    getImg("rainLV2.png")
    getImg("rainLV3.png")
    getImg("rainLV4.png")
    getImg("rainLV5.png")
    
    getImg("mountain_morning.png")
    getImg("mountain_noon.png")
    getImg("mountain_afternoon.png")
    getImg("mountain_night.png")
    
    getImg("jungle_morning.png")
    getImg("jungle_noon.png")
    getImg("jungle_afternoon.png")
    getImg("jungle_night.png")
    
    getImg("forest_morning.png")
    getImg("forest_noon.png")
    getImg("forest_afternoon.png")
    getImg("forest_night.png")
    
    getImg("grassland_morning.png")
    getImg("grassland_noon.png")
    getImg("grassland_afternoon.png")
    getImg("grassland_night.png")
    
    getImg("plains_morning.png")
    getImg("plains_noon.png")
    getImg("plains_afternoon.png")
    getImg("plains_night.png")
}

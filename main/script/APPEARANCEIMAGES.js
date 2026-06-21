import { send } from "./SEND.js"
import { $, sleep } from "./HELPER.js"
import { getImg } from "./IMAGES.js"
import { bioColorsRgb } from "./HUMANS.js"

const cnv = $("charEngine")
cnv.width = 1111
cnv.height = 1919/1.4
let ctx = cnv.getContext("2d")
let bodyFem
let bodyMale
let bodyFemOut
let bodyMaleOut
let bmS
let bfS
let hairs = {}
let front = {}
let back = {}
let nose = {}

export async function bootRekAssets(){
    await getImg("BODYFEM.png").then((blob)=>{
        bodyFem = blob
    })
    await getImg("BODYMALE.png").then((blob)=>{
        bodyMale = blob
    })
    await getImg("BODYFEM_OUTLINE.png").then((blob)=>{
        bodyFemOut = blob
    })
    await getImg("BODYMALE_OUTLINE.png").then((blob)=>{
        bodyMaleOut = blob
    })
    await getImg("BODYFEM_SHADOW.png").then((blob)=>{
        bfS = blob
    })
    await getImg("BODYMALE_SHADOW.png").then((blob)=>{
        bmS = blob
    })
    await getImg("TOP1.png").then((blob)=>{
        hairs["TOP1"] = blob
    })
    await getImg("TOP2.png").then((blob)=>{
        hairs["TOP2"] = blob
    })
    await getImg("BACK_short.png").then((blob)=>{
        hairs["BACK_short"] = blob
    })
    await getImg("BACK_medium.png").then((blob)=>{
        hairs["BACK_medium"] = blob
    })
    await getImg("BACK_long.png").then((blob)=>{
        hairs["BACK_long"] = blob
    })
    await getImg("FM_CURVY.png").then((blob)=>{
        hairs["FM_CURVY"] = blob
    })
    await getImg("FM_outward.png").then((blob)=>{
        hairs["FM_outward"] = blob
    })
    await getImg("FM_inward.png").then((blob)=>{
        hairs["FM_inward"] = blob
    })
    await getImg("FM_SPIKY_DOWNWARD.png").then((blob)=>{
        hairs["FM_SPIKY_DOWNWARD"] = blob
    })
    await getImg("FM_LONG.png").then((blob)=>{
        hairs["FM_LONG"] = blob
    })
    await getImg("M_curly.png").then((blob)=>{
        hairs["M_curly"] = blob
    })
    await getImg("M_messy.png").then((blob)=>{
        hairs["M_messy"] = blob
    })
    await getImg("M_spiky.png").then((blob)=>{
        hairs["M_spiky"] = blob
    })
    await getImg("EYEMALE.png").then((blob)=>{
        front["EYEMALE"] = blob
    })
    await getImg("EYEFEM.png").then((blob)=>{
        front["EYEFEM"] = blob
    })
    await getImg("WINGS.png").then((blob)=>{
        back["WINGS"] = blob
    })
    await getImg("NOSE_SHARP.png").then((blob)=>{
        nose["N_SHARP"] = blob
    })
    await getImg("NOSE_CURVY1.png").then((blob)=>{
        nose["N_CURVY1"] = blob
    })
    await getImg("NOSE_CURVY2.png").then((blob)=>{
        nose["N_CURVY2"] = blob
    })
    console.log(hairs)
}

console.log(bodyMale)


function replaceCol(color=[0,0,0,0], replace=[0,0,0], tol=1){
    let imgData = ctx.getImageData(0, 0, cnv.width, cnv.height)
    let data = imgData.data
    for (let i=0;i<data.length;i+=4){
        let r = data[i]
        let g = data[i+1]
        let b = data[i+2]
        let alpha = data[i+3]
        let Dr = Math.abs(r-color[0])
        let Dg = Math.abs(g-color[1])
        let Db = Math.abs(b-color[2])
        //console.log(Dr)
        if (Dr<=tol&&Dg<=tol&&Db<=tol&&alpha===color[3]){
            data[i] = replace[0]
            data[i+1] = replace[1]
            data[i+2] = replace[2]
            //data[i+3] = replace[3]
        }
    }
    ctx.putImageData(imgData, 0, 0)
}

function skinColor(x){
    let baseR = 255
    let baseG = 210
    let baseB = 173
    let mod = x.appearance.skin.color*100
    return [
        Math.min(255, baseR-mod),
        Math.min(255, baseG-mod),
        Math.min(255, baseB-mod),
    ]
}

export async function createImagePerson(x){
    ctx.clearRect(0, 0, cnv.width, 1919)
    let ap = x.appearance
    let ex = 1.6
    let sexuality = x.gender==="male"?"MALE":"FEM"
    let wings = x.level==="god"?back["WINGS"]:null
    let backH = 
    ap.hair.back==="short"?
    "BACK_short":
    ap.hair.back==="medium"?
    "BACK_medium":
    ap.hair.back==="long"?
    "BACK_long":null
    if (wings){
        await ctx.drawImage(wings, 0, 0, cnv.width*1.1, cnv.height*ex)
    }
    if (backH){
        await ctx.drawImage(hairs[backH], 0, 0, cnv.width*1.1, cnv.height*ex)
    }
    let img = x.gender==="male"?bodyMale:bodyFem
    let imgOut = x.gender==="male"?bodyMaleOut:bodyFemOut
    let imgShad = x.gender==="male"?bmS:bfS
    //img.src = `./assets/BODY${x.gender==="male"?"MALE":"FEM"}.png`
    await ctx.drawImage(img, 0, 0, cnv.width*1.1, cnv.height*ex)
    let sk = await skinColor(x)
    await replaceCol([255, 255, 255, 255], sk)
    await replaceCol([207, 207, 207, 255], [sk[0]-30, sk[1]-30, sk[2]-30], 10)
    await ctx.drawImage(imgOut, 0, 0, cnv.width*1.1, cnv.height*ex)
    await ctx.drawImage(imgShad, 0, 0, cnv.width*1.1, cnv.height*ex)
    let top = ap.hair.top==="top"?"TOP1":"TOP2"
    if (top){
        await ctx.drawImage(hairs[top], 0, 0, cnv.width*1.1, cnv.height*ex)
    }
    /*let gender = x.gender==="male"?"HM":"HF"
    let length = ap.hair.length>0.8?"LONG":ap.hair.length>0.4?"MEDIUM":"SHORT"
    let hair = hairs[`${gender}_${length}`]*/
    //await ctx.drawImage(top, 0, 0, cnv.width*1.1, cnv.height*1.6)
    let eyeshape = front[`EYE${sexuality}`]
    await ctx.drawImage(eyeshape, 0, 0, cnv.width*1.1, cnv.height*ex)
    await replaceCol([197, 197, 197, 255], bioColorsRgb[ap.eye.color])
    let n = 
    ap.nose.shape==="sharp"?
    "SHARP":ap.nose.shape==="curvy"?
    "CURVY1":ap.nose.shape==="bumped"?
    "CURVY2":"SHARP"
    await ctx.drawImage(nose[`N_${n}`], 0, 0, cnv.width*1.1, cnv.height*ex)
    let frontH
    if (x.gender==="female"){
        frontH = 
        ap.hair.front==="curvy"?"FM_CURVY":
        ap.hair.front==="inward"?"FM_inward":
        ap.hair.front==="outward"?"FM_outward":
        ap.hair.front==="long"?"FM_LONG":
        ap.hair.front==="spiky downward"?"FM_SPIKY_DOWNWARD":null
    } else {
        frontH =
        ap.hair.front==="curly"?"M_curly":
        ap.hair.front==="messy"?"M_messy":
        ap.hair.front==="spiky"?"M_spiky":null
    }
    await ctx.drawImage(hairs[frontH], 0, 0, cnv.width*1.1, cnv.height*ex)
    await replaceCol([171,171,171,255], bioColorsRgb[ap.hair.color])
    let object = await new Promise(resolve => {
        cnv.toBlob((blob) => {
            let url = URL.createObjectURL(blob)
            let image = new Image()
            image.src = url
            resolve(url)
        }, "image/png")
    })
    return object
}

//createImagePerson("ok")
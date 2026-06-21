import { state } from "./STATE.js"
import { $ } from "./HELPER.js"

export function TextToNum(x){
    let z = ""
    let vowels = ["a", "e", "i", "o", "u"]
    let consonants= ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"]
    for (const c of x){
        if (vowels.includes(c)){
            z += vowels.indexOf(c)
        } else if(consonants.includes(c)){
            z += consonants.indexOf(c)
        }
    }
    return z
}

const alignment = [
    "center",
    "left",
    "right"
]
let shortcuts = null

export function format(t){
    let res = t
    const bold = /\*([^\*]+)\*/g
    const long = /\-\-\-/g
    const string = /\"([^\"]+)\"/g
    const string2 = /'([^']+)'/g
    const italic = /\*\*([^\*]+)\*\*/g
    const image = /\<img\s?(width=\d+)?\s?(height=\d+)?\s?(border=\w+)?\>([^<>]+)\<img\>/g
    const float = /\[f\]([^(\[\])]+)\[f\]/g
    const opacity = /<(\d+)%>([^<>]+)<a>/g
    const colortags = /\[([^\[\]]+)\]([^\[\]]+)\[c\]/g
    const settings = /\[([^\[\]]+)\s?:\s?([^\[\]]+)\]/g
    const bars = /\[(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\]/g
    let setting, style
    const processSettings = ()=>{
        setting = [...t.matchAll(settings)]
        style = []
        for (let i in setting){
            if (setting[i][1]==="align"){
                style.push("text-align: ")
                if (alignment.includes(setting[i][2])){
                    style[style.length-1] += setting[i][2]
                } else {
                    style.pop()
                }
            }
        }
    }
    //console.log(image.exec(res))
    const parse = () =>{ 
        res = t.replace(italic, `<i>$1</i>`)
        .replace(bold, `<b>$1</b>`)
        .replace(string, `<span style="color:#9E4DFFB8">"$1"</span>`)
        .replace(image, (l, width, height, border, src)=>{
            let w = String(width).match(/(\d+)/g)
            let h = String(height).match(/(\d+)/g)
            let b = String(border).match(/(\w+)/g)[1]
            //console.log(b)
            return `
            <img 
            style="${b!=="false"?"border: 1px solid var(--sec);":""}
            ${b!=="false"?"background: var(--prim)":""}"
            ${w?`width=${w[0]}`:""}
            ${h?`height=${h[0]}`:""}
            src="${src}">
            `
        })
        .replace(long, `
        <div style="
        height: 1px;
        overflow: hidden;
        position: relative;
        padding: 0;
        background: var(--sec);
        border: transparent 
        ">
        </div>`)
        //.replace(string2, `<span style='color:#9E4DFFB8'>'$1'</span>`)
        .replace(opacity, `<span style='opacity: $1%'>$2</span>`)
        .replace(float, `<span class='float'>$1</span>`)
        .replace(colortags, `<span style='color: $1'>$2</span>`)
        .replace(settings, "")
        .replace(bars, (l, cur, max)=>{
            let per = (cur/max)*100
            if (cur===max){
                return `<div class='bar'><span style="opacity: 0">[raw bar value] : ${cur}/${max}</span><div class='bar-line-comp' style='width: ${per}%'></div></div>`
            } else if (cur<0) {
                return `<div class='bar'><span style="opacity: 0">[raw bar value] : ${cur}/${max}</span></div>`
            } else {
                return `<div class='bar'><span style="opacity: 0">[raw bar value] : ${cur}/${max}</span><div class='bar-line' style='width: ${per}%'></div></div>`
            }
        })
    }
    const process = ()=>{
        let s = ""
        for (let i in style){
            s += style[i]+";"
        }
        if (s){
            let m = res
            res = `<div style="${s} padding: 4px">`+m+`</div>`
        }
    }
    processSettings()
    parse()
    process()
    return res
}

export function send(txt){
    function rmtc(x){
        let a = x.split(/\s+/g)
        if (a[a.length-1].match(/\d+×/g)){
            a.pop()
            return a.join(" ")
        }
        return x
    }
    if (txt.length<=0){return}
    const msg = document.createElement("div")
    msg.classList.add("message")
    msg.innerHTML = format(txt)
    /*msg.addEventListener("touchstart", (e)=>{
        //if (shortcuts) document.body.removeChild(shortcuts)
        shortcuts=dBox(msg, e.touches[0].clientX, e.touches[0].clientY)
        //$("TypeBox").value = msg.innerText
        //$("TypeBox").focus()
    })*/
    //state.msgHistory.push(msg)
    if (state.latest && rmtc(state.latest.innerText)===msg.innerText){
       state.rpt++
       state.latest.innerHTML = format(txt)+" "+state.rpt+"×"
       return state.latest
    } else {
        $("chatbox").appendChild(msg)
        $("chatbox").scrollTo({
            top: $("chatbox").scrollHeight
        })
        state.latest = msg
        state.rpt = 1
        return msg
    }
}
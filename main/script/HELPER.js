export const $ = (id) => document.getElementById(id)
export const sleep = (time) => new Promise(resolve=>{
    setTimeout(resolve, time)
})
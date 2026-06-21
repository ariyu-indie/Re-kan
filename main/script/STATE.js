import {observable} from "./OBSERVABLES.js"
//import { getRng } from "./SEED.js"
//after adding stuff, immediately add to state var below
export let version = "1.0.5"
export const author = "Nico M Tinidora" //hope it stays this way.
export let msgHistory = []
export let met = [] //ids
export let GameStarted = false

export let topics = []
export let attacks = []

//export let majorCharacters = []

export let seedCur = 0
export let bits = 2**32
export let constants = [
    [5, 1],
    [1664525, 1013904223],
    [6364136223846793005, 1442695040888963407]
]

export let STATICANIMALS = []
export let animalPopulation = []
export let population = []
export let languages = []
export let translations = [] //cache
export let races = []
export let groups = []
export let locations = []
export let STATICPOPULATION = [] 
export let fights = []
export let structures = []
export let settings = {
    languages: true,
    images: true,
    buildRarity: [
        {
            building: "house", 
            score: 23
        },
        {
            building: "port", 
            score: 12
        },
        {
            building: "market", 
            score: 12
        },
        {
            building: "farm", 
            score: 9
        },
        {
            building: "library", 
            score: 4
        },
    ]
}
export let MAP = {
    landmass: [],
    ocean: [],
    imageObj: null,
    image: null,
    size: [1,1] //4,4, etc
}
export let GenSettings = {
    seed: 0,
    femaleRat: 1,
    maleRat: 1, //can be any value, 49/50 = 0.98 female per 1 male or 1.02 male per 1 female.
    numOfHumans: 300, //300
    numOfAnimals: 10, //200
    numOfLocations: 12, //6
    continentS: 128, //5 tiles
    oceanS: 20, //5 tiles
    numOfLang: 3, //2
    pruning: false, //false
    timelapseLength: 1, //5
    domLang: 0 //dominant language
}
export let playerTags = {
    generating: {
        state: false
    },
    modifySettings:{
        state: false
    },
    buyingMarket: {
        state: false,
        marketObj: null
    },
    offerMarketAsk: {
        state: false
    },
    askWhereToGo: {
        state: false
    },
    timelapsing: {
        state: false
    },
    askToTame: {
        state: false,
        animalObj: null
    },
    whoAtk: {
        arr: null
    },
    methodOfAtk: {
        state: false
    },
    focusedAtk: {
        who: null
    },
    chooseTalk: {
        state: false,
        arr: null,
        page: 1
    },
    talk: {
        state: false,
        obj: null
    },
    choseTopic: {
        state: false
    },
    chooseTalkMode: {
        state: false
    },
    rekanianTalkPlayer: {
        state: false,
        question: null, 
        obj: null //rekanian
    },
    customChar: {
        state: false
    },
    enterBuilding: {
        state: false,
        arr: []
    }
}
export let glt = {
    pickModes: false,
    askRole: observable(false),
    askTimeskip: observable(false),
    timesAskedTime: 0,
    cutscenes: false,
    chosenStart: "commoner"
}
export let cal = {
    h: 1,
    m: 1,
    d: 1,
    y: 0
}
export let era = []
export let player = null
export let events = []
export const GAMEHINTS = [
    "survive, you'll need it.",
    "be wise when talking to others.",
    "NPCs remember more than you think.",
    "Pride shapes destiny.",
    "Gods inspire fear before faith.",
    "Faith sustains gods."
]
export let GID = 1 // global id
export let AID = 1 // animal id
export let GLID = 1 // global location id
export let HPU = 1 // hour per update 
export let rpt = 1 // repeat
export const usable = [
    "water", "fruit"
]
export const itemDictv2 = [
    
]
export const itemDict = [
    "beer",
    "water", "ice", "fruit", "meat",
    "wood", "crystal", "metal", "divineCrystal"
]
export let globalLib = []
export let latest = null
export const state = {
    GameStarted,
    settings,
    structures,
    
    topics,
    attacks,
    
    seedCur,
    constants,
    bits,
    
    MAP,
    met,
    fights,
    version,
    languages,
    translations,
    author,
    STATICANIMALS,
    animalPopulation,
    population,
    groups,
    locations,
    STATICPOPULATION,
    GenSettings,
    playerTags,
    glt,
    cal,
    era,
    player,
    events,
    //GID,
    //AID,
    //GLID,
    HPU,
    rpt,
    usable,
    itemDict,
    itemDictv2,
    globalLib,
    GAMEHINTS,
    latest
}
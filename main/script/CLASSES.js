import { getRng } from "./SEED.js"

export class structure{
    constructor(){
        this.name = null
        this.id = 0
        this.state = "unfinished"
        this.materials = []
        this.timeFinish = null
        this.type = null
        this.placedBy = null
        this.ownedBy = null
        this.hp = 100
    }
}

export class fight{
    constructor(){
        this.id = Math.round(10**9+getRng()*10**10)
        this.color = null
        this.turn = 1,
        this.turnEs = 1,
        this.raw = []
        this.log = null
        this.participants = []
        this.STATICPART = []
    }
}

export class place{
    constructor(){
        this.id = null
        this.name = null
        this.visit = 0
        this.difficulty = null
        this.rain = {
            state: false,
            strength: 0
        }
        this.pos = []
        this.resources = []
        this.type = null
        this.connections = []
        this.ocean = []
        this.structures = []
    }
}

export class group{
    constructor(){
        this.name = null
        this.id = Math.round(10**9+getRng()*10**10)
        this.establishedBy = null
        this.stability = 0.8
        this.color = null
        this.relations = []
        this.history = []
        this.territory = []
        this.groupMembers = []
    }
}

export class word{
    constructor(){
        this.word = ""
        this.structure = ""
        this.roots = [] //leave none if unique or is a root
        this.id = ""
        this.POS = ""
        this.meaning = []
        this.archaic = []
    }
}

export class language{
    constructor(){
        this.name = ""
        this.id = ""
        this.alphabet = {
            consonants: [],
            vowels: []
        }
        this.syllables = [] //patterns
        this.lexicon = []
        this.compounds = [] //phrases that means something.
        this.roots = []
        this.functions = []
        this.grammar = {
            inversions: [],
            pluralization: {
                type: null,
                word: null
            }, //suffix, prefix
            endingSentence: {
                exclaim: {
                    word: null,
                    type: null
                }, 
                question: {
                    word: null,
                    type: null
                }
            },
            verb: {
                past: null,
                future: null
            },
            ownerShip: null
        }
    }
}

export class person{
    constructor(){
        this.name = null
        this.nextTurn = null
        this.cause = "bleeding"
        this.image = null
        this.race = null
        this.id = null
        this.gossip = []
        this.inside = {
            state: false,
            structure: null
        }
        this.areaInterest = 0
        this.murder = 0
        this.commands = []
        this.condition = []
        this.victories = []
        this.mood = 0.8 /*
        let me visualize this
        if mood <= 0.2, the NPC won't talk to anyone, nor eat, etc.
        if mood <= 0.5, the NPC will rarely talk to anyone, pushes anyone away.
        else they're fine
        */
        this.isInWomb = false
        this.isBuried = {
            state: false,
        }
        this.knowledgeOfPeers = []
        this.familiarLoc = []
        this.species = ""
        this.fight = {
            id: null,
            side: null
        }
        this.knows = [] //if name is knew
        this.pregnant = {
            state: false,
            fetus: null,
            time: 0 //in hours
        }
        this.fertile = false
        this.relationships = []
        this.languages = []
        this.tamedAnimals = []
        this.alias = []
        this.fame = 0
        this.famous = false
        this.worship = {
            god: null, //id
            faith: 0.0
        }
        this.adrenaline = 0
        this.home = {
            loc: null,
            structure: null
        }
        this.social = {
            pride: getRng(),
            friendliness: 0,
            approachability: 0
        }
        this.appearance = {
            hair: {
                top: null,
                back: null,
                front: null,
                length: null,
                color: null
            },
            eye: {
                size: null, //0.0 small eyes, 1.0 huge eyes,
                color: null //color
            },
            skin: {
                color: 0.0 //color
            },
            height: {
                cur: 0,
                max: 0
            },
            nose: {
                shape: null
            }
        }
        this.naturalSkills = {
            taming: getRng(),
            reading: getRng(),
            writing: getRng(),
            singing: getRng(),
            dancing: getRng(),
            learning: getRng(),
            sports: getRng(),
            combat: getRng(),
        }
        this.deals = []
        this.justDrank = 0
        this.justEaten = 0
        this.group = {
            id: null,
            rank: null
        }
        this.state = "alive"
        this.hobbies = {
        }
        this.job = {
            name: null,
            pattern: [] 
        }
        this.level = "commoner"
        //this.journey = []
        this.curGoal = null
        this.goals = [] //queues
        this.gender = null
        this.inventory = []
        this.relatives = []
        this.location = null
        this.age = null
        this.ageLimit = 90+getRng()*50
        this.combat = {
            damage: 10+getRng()*5,
            baseDamage: 10,
            style: null,
            stance: null,
            dodgeCH: 0.25,
            critCH: 0.02, //2%
            crit: 1.2 //120%
        }
        this.attacks = [
            
        ]
        this.memory = []
        this.stats = {
            hp: {
                head: {
                    val: 100,
                    max: 100,
                    weight: 24,
                    bleeding: 0.0
                },
                torso: {
                    val: 100,
                    max: 100,
                    weight: 24,
                    bleeding: 0.0
                },
                leftArm: {
                    val: 100,
                    max: 100,
                    weight: 3.5,
                    bleeding: 0.0
                },
                rightArm: {
                    val: 100,
                    max: 100,
                    weight: 3.5,
                    bleeding: 0.0
                },
                leftLeg: {
                    val: 100,
                    max: 100,
                    weight: 10.5,
                    bleeding: 0.0
                },
                rightLeg: {
                    val: 100,
                    max: 100,
                    weight: 10.5,
                    bleeding: 0.0
                },
                meta: {
                    bleeding: {
                        parts: {}
                    }
                }
            },
            tremble: {
                val: 0.0,
                max: 1.0
            },
            intoxication: {
                val: 0.0,
                max: 1.0
            },
            poison: {
                val: 0
            },
            stamina: {
                val: 100,
                max: 100+getRng()*100
            },
            hydration: {
                val: 100,
                max: 100
            },
            saturation: {
                val: 100,
                max: 100
            },
        }
    }
}
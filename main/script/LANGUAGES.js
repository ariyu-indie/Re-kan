import { language, word } from "./CLASSES.js"
import { random } from "./UTILS.js"
import { meanings, functionDefinition, verbs, sevenkeiwords } from "./DICTIONARY.js"
import { send } from "./SEND.js"
import { state } from "./STATE.js"
import { getRng } from "./SEED.js"
//import { stem } from "./STEMMING.js"

let lexLevel = 0.3
export let totalCost = 0
export let intelCache = []

export const commonConsonants = [
    "q", "w", "r", "t", "y",
    "p", "s", "d", "f", "g",
    "h", "j", "k", "l", "z",
    "x", "c", "v", "b", "n",
    "m"
]

export let countOfLangs = 0

export const advanceConsonants = [
    "ŵ", "ŗ", "ř", "ŕ", "ţ",
    "ť", "ț", "ŧ", "ÿ", "ý",
    "ŷ", "þ", "ş", "ś", "ș",
    "š", "ß", "ŝ", "đ", "ð",
    "ď", "ġ", "ĝ", "ğ", "ģ",
    "ĥ", "ħ", "ĵ", "ķ", "ĸ",
    "ł", "ŀ", "ľ", "ľ", "ļ",
    "ĺ", "ž", "ź", "ż", "ċ",
    "ć", "ç", "ĉ", "č", "ŋ",
    "ň", "ŉ", "ņ", "ñ", "ń",
]

export const commonVowels = [
    "a", "e", "i", "o", "u"
]

export const advanceVowels = [
    "ă", "ą", "æ", "ã", "å",
    "ā", "à", "á", "â", "ä",
    "ę", "ē", "ě", "ė", "ê",
    "é", "è", "ë", "ı", "į",
    "y", "ĩ", "ì", "ī", "ï",
    "í", "î", "ő", "õ", "ō",
    "ø", "œ", "ò", "ö", "ô", 
    "ó", "ű", "ų", "ů", "ū", 
    "ŭ", "ũ", "ü", "ú", "û", 
    "ù"
]

export function langId(x){
    return state.languages.find(e=>e.id===x)
}

function genId(){
    return Math.floor(10**9+getRng()*10**10)
}

function genAlphabet(vowelCount=5+getRng()*0, consCount=25+getRng()*3){
    let vowelsOfLng, consonantsOfLng
    if (vowelCount>5){
        const allVow = [...commonVowels, ...advanceVowels]
        vowelsOfLng = []
        for (let i=0;i<vowelCount;i++){
            let a = random(allVow)
            if (!vowelsOfLng.includes(a)){
                vowelsOfLng.push(a)
            }
        }
    } else {
        vowelsOfLng = []
        for (let i=0;i<vowelCount;i++){
            let a = random(commonVowels)
            if (!vowelsOfLng.includes(a)){
                vowelsOfLng.push(a)
            }
        }
    }
    if (consCount>21){
        const allCon = [...commonConsonants, ...advanceConsonants]
        consonantsOfLng = []
        for (let i=0;i<consCount;i++){
            let a = random(allCon)
            if (!consonantsOfLng.includes(a)){
                consonantsOfLng.push(a)
            }
        }
    } else {
        consonantsOfLng = []
        for (let i=0;i<consCount;i++){
            let a = random(commonConsonants)
            if (!consonantsOfLng.includes(a)){
                consonantsOfLng.push(a)
            }
        }
    }
    return {
        consonants: consonantsOfLng,
        vowels: vowelsOfLng
    }
}

function genSyllables(alp){
    if (!alp?.vowels.length>0&&!alp.consonants.length>0) return
    function genPat(){
        let a = ""
        for (let i=0;i<(getRng()*2);i++){
            a += random(["VC", "CV", "CVC"])
        }
        return a
    }
    let syllablePatterns = []
    for (let i=0;i<(2+getRng()*10);i++){
        let pattern = genPat()
        if (!syllablePatterns.includes(pattern)){
            syllablePatterns.push(pattern)
        }
    }
    return syllablePatterns
}

function toCoVo(lang, x){ //turns C/V into consonants or vowels
    if (x==="C"){
        return random(lang.alphabet.consonants)
    } else if (x==="V"){
        return random(lang.alphabet.vowels)
    }
    return ""
}

function processCode(lang, code){
    let a = code.match(/(\w)/g)
    //console.log(a)
    let n = ""
    for (const o of a){
        n += toCoVo(lang, o)
    }
    return n
}

export function genText(lang, sn=0){ //syllable number
    let wordSyllCount = sn
    if (sn<=0){
        wordSyllCount = 1+getRng()*2
    }
    let syll = ""
    let txt = ""
    for (let i=0;i<wordSyllCount;i++){
        let s = random(lang.syllables)
        syll += s
        txt += processCode(lang, s)
    }
    return {text: txt, struct: syll}
}

export function createWord(lang, sn=0){
    let w = new word()
    let wordTxt = genText(lang, sn)
    w.POS = random(["noun"])
    w.id = Math.floor(10**9+getRng()*10**10)
    w.word = wordTxt.text
    w.structure = wordTxt.struct
    return w
}

function genMeaning(n=1+(-1+getRng()*4)){
    let mo = [...meanings, ...sevenkeiwords]
    let m = []
    for (let i=0;i<n;i++){
        let a = random(mo)
        if (!m.includes(a)){
            m.push(a)
        }
    }
    return m
}

function genRoots(lang){
    let numOfRoots = getRng()*10000*lexLevel
    let words = []
    for (let i=0;i<numOfRoots;i++){
        let w = createWord(lang, 1)
        w.meaning = genMeaning()
        words.push(w)
    }
    return words
}

function combineRoots(lang, roots){
    let w = null
    let wordTxt = ""
    let meaning = []
    let struct = ""
    if (roots.length>1){
        w = createWord(lang)
        for (const a of roots){
            wordTxt += a.word
            meaning = [...meaning, ...a.meaning]
            struct += a.structure
        }
        let n = []
        for (const i of meaning){
            if (!n.includes(i)){
                n.push(i)
            }
        }
        w.word = wordTxt
        w.meaning = n
        w.structure = struct
        w.roots = roots
    }
    return w
}

function generateFunctions(lang){
    let l = []
    for (let i=0;i<(100+getRng()*500)*lexLevel;i++){
        let f = createWord(lang, 1)
        f.POS = "function"
        for (let o=0;o<getRng()*3;o++){
            let funcMe = random(functionDefinition)
            if (!f.meaning.includes(funcMe)){
                f.meaning.push(funcMe)
            }
        }
        l.push(f)
    }
    return l
}

function process(word, lang){
    let a = word.split("")
    let b = ""
    for (const i of a){
        if (lang.alphabet.vowels.includes(i)||lang.alphabet.consonants.includes(i)){
            b += i
        } else if(getRng()<0.8) {
            b += [...advanceVowels, ...commonVowels].find(e=>e&&e===i)?random(lang.alphabet.vowels):random(lang.alphabet.consonants)
        }  else {
            if (!lang.alphabet.vowels.includes(i)){
                b += genText(lang, 1).text
            }
        }
    }
    return b
}

function numToNative(w, lang){
    let wo = w.split("")
    //console.log(wo)
    let a = ""
    let roots = []
    for (const b of wo){
        let m = lang.lexicon.find(e=>e&&e.meaning.includes(b))
        if (m){
            roots.push(m)
            a += m.word
        }
    }
    return {
        res: a,
        root: roots
    }
}

function checkStruct(word){
    let a = ""
    for (const i of word){
        if (commonVowels.includes(i)||advanceVowels.includes(i)){
            a += "V"
        } else {
            a += "C"
        }
    }
    return a
}

function checkForComp(string, lang){
    let a = lang.compounds.map(e=>[e.detect, e.meaning, e.word])
    let res = string
    //console.log(res)
    //console.log(string)
    for (const comp of a){
        if (string.includes(comp[0])){
            res = res.replace(comp[0], comp[2])
            //console.log("yes:", string)
        }
    }
    return [res, string]
}

export function closeCognates(langA, langB){
    if (!langA||!langB) return
    let highest = null
    let highP = 0
    for (let i=0;i<100;i++){
        if (meanings[i]){
            let wordA = langA.lexicon.find(e=>e&&e.meaning.some(o=>o===meanings[i]))
            let wordB = langB.lexicon.find(e=>e&&e.meaning.some(o=>o===meanings[i]))
            if (!wordA||!wordB) continue
            let p = match(wordA, wordB)
            if (p>highP){
                highest = [wordA, wordB]
                highP = p
            }
        }
    }
    return highest
}

export function translate(sentence, lang){
    if (!state.settings.languages) return {
        translating: sentence,
        translation: sentence,
        structure: null,
        used: null,
        POS: null,
        language: lang.name
    }
    let transCache = state.translations.find(e=>e.language.name===lang.name&&e.translating===sentence)
    let toEng = state.translations.find(e=>e.translation===sentence)
    //console.log(toEng)
    if (toEng) return toEng
    if (transCache) return transCache.translated
    let splitted = sentence.match(/(,|\?|\!|\.|\||[^\s,\?\!\.]+)/g)
    let allWords = [...lang.functions, ...lang.lexicon, ...lang.roots]
    let allMeanings = [...meanings, ...functionDefinition]
    let translated = ""
    let underneath = []
    let meaningUsage = []
    //console.log(splitted)
    for (const w of splitted){
        let wo = w.toLowerCase()
        if (wo&&wo.endsWith("\'s")){
            let word = allWords.find(e=>e.meaning.find(o=>o===wo.slice(0, wo.length-2)))
            if (word){
                let wordObj = createWord(lang)
                wordObj.word = word.word+lang.grammar.ownerShip.text
                wordObj.structure = word.structure+lang.grammar.ownerShip.struct
                wordObj.meaning = [wo]
                lang.lexicon.push(wordObj)
                allWords.push(wordObj)
            }
        } if (wo&&wo.endsWith("ed")){
            let word = allWords.find(e=>e.meaning.find(o=>o===wo.slice(0, wo.length-2)))
            if (word){
                let wordObj = createWord(lang)
                wordObj.word = word.word+lang.grammar.verb.past.text
                wordObj.structure = word.structure+lang.grammar.verb.past.struct
                wordObj.meaning = [wo]
                lang.lexicon.push(wordObj)
                allWords.push(wordObj)
            }
        } if (wo&&wo.endsWith("d")){
            let word = allWords.find(e=>e.meaning.find(o=>o===wo.slice(0, wo.length-1)))
            if (word){
                let wordObj = createWord(lang)
                wordObj.word = word.word+lang.grammar.verb.past.text
                wordObj.structure = word.structure
                wordObj.meaning = [wo]
                lang.lexicon.push(wordObj)
                allWords.push(wordObj)
            }
        } else if (wo&&wo.endsWith("s")){
            let word = allWords.find(e=>e.meaning.find(o=>o===wo.slice(0, wo.length-1)))
            if (word&&lang.grammar.pluralization){
                let wordText = ""
                if (lang.grammar.pluralization.type==="suffix"){
                    wordText = word.word+lang.grammar.pluralization.word.text
                } else
                if (lang.grammar.pluralization.type==="prefix"){
                    wordText = lang.grammar.pluralization.word.text+word.word
                } else
                if (lang.grammar.pluralization.type==="suffixGapped"){
                    wordText = word.word+" "+lang.grammar.pluralization.word.text
                } else
                if (lang.grammar.pluralization.type==="prefixGapped"){
                    wordText = lang.grammar.pluralization.word.text+" "+word.word
                }
                let wordObj = createWord(lang)
                wordObj.word = wordText
                wordObj.structure = word.structure
                wordObj.meaning = [wo]
                //console.log(wordObj)
                lang.lexicon.push(wordObj)
                allWords.push(wordObj)
            }
        } else if (!allWords.some(e=>e&& e.meaning.includes(wo))&&wo.match(/(\d+|(one|two|three|four|five|six|seven|eight|nine|zero)+)/g)){
            let word = createWord(lang, 1)
            let n = numToNative(wo, lang)
            word.word = n.res
            word.meaning = [wo]
            word.roots = n.root
            //console.log(word)
            lang.lexicon.push(word)
            allWords.push(word)
        } else if (!allWords.some(e=>e.meaning.includes(wo))&&(!["!", "?", ".", ","].includes(wo))){
            let word = createWord(lang)
            word.word = wo
            let rep = random(wo.split("").filter(e=>e&&!lang.alphabet.vowels.includes(e)))
            word.word = word.word.replace(rep, random(lang.alphabet.consonants))
            word.word = process(word.word, lang)
            if (word.word.length<4){
                word.word = word.word+genText(lang, 1).text
            }
            if (!functionDefinition.includes(wo)){
                word.POS = "borrowed" 
                word.meaning = [wo]
                word.structure = checkStruct(word.word)
                meanings.push(wo)
                lang.lexicon.push(word)
                allWords.push(word)
            }
            //console.log(word)
        }
    }
    for (const wp of splitted){
        let word = wp.toLowerCase()
        if (allWords.some(e=>e.meaning.includes(word)&&!e.archaic.includes(word))){
            if (verbs.filter(e=>e&&e===word)){
                let w = allWords.find(e=>e.meaning.includes(word)&&!e.archaic.includes(word)&&e.POS==="verb")
                if (!w){
                    w = allWords.find(e=>e.meaning.includes(word)&&!e.archaic.includes(word))
                    translated += w.word
                    let k = w.word
                    underneath.push(w)
                    meaningUsage.push({
                        "word": k, 
                        "meaning": word
                    })
                } else {
                    translated += w.word
                    let k = w.word
                    underneath.push(w)
                    meaningUsage.push({
                        "word": k, 
                        "meaning": "to "+word
                    })
                }
            } else {
                let w = allWords.find(e=>e.meaning.includes(word))
                translated += w.word
                let k = w.word
                underneath.push(w)
                meaningUsage.push({
                    "word": k, 
                    "meaning": word
                })
            }
        } else if ([",", "."].includes(word)){
            translated += word+" "
        }
        let a = splitted.indexOf(word)
        if ([",", ".", "!", "?"].includes(word)){
            let exc = lang.grammar.endingSentence.exclaim
            let que = lang.grammar.endingSentence.question
            if (word==="!"&&exc.word){
                translated += exc.word+"! "
                underneath.push(exc.word)
            } else if (word==="?"&&que.word){
                translated += que.word+"? "
                underneath.push(que.word)
            } else if (word==="!"&&!exc.word){
                translated += "! "
            } else if (word==="?"&&!que.word){
                translated += "? "
                //underneath.push("question mark")
            }
        } else if (allWords.some(e=>e.meaning.includes(word))&&splitted[+a+1]&&![",", ".", "!", "?"].includes(splitted[+a+1])){
            translated += " "
        }
    }
    /*send(
        `       *translated*:<br>${splitted.map(e=>e).join(" ")}<br>
        *translation*:<br>${translated}<br>
        *structure*:<br>${underneath.map(e=>"• "+e.word+` - ${e.meaning.map((a, index)=>`${index}. ${e.archaic.includes(a)?"(archaic) ":""}${(e.POS==="verb"?"concept of ":"")}${a}`).join("; ")}`).join("<br>")}<br>
        *used*:<br>${meaningUsage.map(e=>"• "+e.word+": "+e.meaning).join(", <br>")}<br>
        *POS*:<br>${underneath.map(e=>"• "+e.word+` - ${e.POS}`).join("<br>")}`
    )*/
    //console.log(underneath )
    let res = {
        language: lang.name,
        translating: sentence/*splitted.map(e=>e).join(" ")*/,
        translation: translated,
        structure: underneath.map(e=>"• "+e.word+` - ${e.meaning?.length>0?e.meaning.map((a, index)=>`${index}. ${e.archaic.includes(a)?"(archaic) ":""}${(e.POS==="verb"?"concept of ":"")}${a}`).join("; "):""}`).join("<br>\n"),
        used: meaningUsage.map(e=>"• "+e.word+": "+e.meaning).join(", <br>\n"),
        POS: underneath.map(e=>"• "+e.word+` - ${e.POS}`).join("<br>\n")
    }
    if (state.translations.length<100){
        state.translations.push(res)
    } else {
        let n = state.translations.length
        while (n>100){
            state.translations.shift()
            n = state.translations.length
        }
    }
    return res
}

function createCompound(words, lang){
    let b = createWord(lang)
    b.POS = "phrase"
    //b.meaning = [words.meaning]
    b.structure = ""
    b.detect = ""
    let a = ""
    let c = ""
    for (const w of words){
        if (!w) break
        a += w.word
        b.structure += w.structure
        c += w.word+" "
        b.meaning = [...b.meaning, w.meaning[0]]
        //console.log(w)
    }
    b.word = a
    b.detect = c
    //b.meaning.push(a)
    return b
}

function generateCompounds(lang){
    let com = []
    for (let i=0;i<(lang.roots.length*0.1*lexLevel);i++){
        if (lang.functions.some(e=>e.meaning.includes("i"))){
            com.push(createCompound([lang.functions.find(e=>e.meaning[0]==="i"), lang.lexicon.find(e=>e.meaning.includes(random(verbs)))], lang))
        }
        if (lang.functions.some(e=>e.meaning.includes("you"))){
            com.push(createCompound([lang.functions.find(e=>e.meaning[0]==="you"), lang.lexicon.find(e=>e.meaning.includes(random(verbs)))], lang))
        }
    }
    //console.log(com)
    return com
}

function generateLex(lang){
    let lex = []
    for (let i=0;i<((lang.roots.length*lexLevel));i++){
        let roots = []
        for (let o=0;o<(2);o++){
            roots.push(random(lang.roots))
        }
        let combined = combineRoots(lang, roots)
        if (getRng()<0.7){
            for (let o=0;o<(1+getRng()*combined.meaning.length);o++){
                combined.archaic.push(random(combined.meaning))
            }
        }
        //combined.meaning = [...combined.meaning, ...combined.word]
        lex.push(combined)
    }
    for (let i=0;i<(1000*lexLevel)+(getRng()*3000*lexLevel);i++){
        let w = createWord(lang)
        w.meaning.push(random(verbs))
        //w.meaning.push(w.word)
        w.POS = "verb"
        lex.unshift(w)
    }
    //console.log(lex)
    return lex
}

function genNums(lang){
    for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]){
        let w = createWord(lang, 1)
        w.meaning = [String(i)]
        lang.lexicon.push(w)
    }
    for (const i of ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "zero"]){
        let w = createWord(lang, 1)
        w.meaning = [i]
        lang.lexicon.push(w)
    }
}

export function createLanguage(){
    let lang = new language()
    lang.id = genId()
    lang.alphabet = genAlphabet()
    lang.syllables = genSyllables(lang.alphabet)
    lang.roots = genRoots(lang)
    lang.lexicon = generateLex(lang)
    lang.functions = generateFunctions(lang)
    if (getRng()<0.9){
        lang.grammar.endingSentence.exclaim = createWord(lang, 1)
        if (getRng()<0.5){
            lang.grammar.endingSentence.exclaim.word = "'"+lang.grammar.endingSentence.exclaim.word
        }
        lang.grammar.endingSentence.exclaim.POS = "exclaim"
        lang.grammar.endingSentence.exclaim.meaning = ["exclaim"]
    }
    if (getRng()<0.9){
        lang.grammar.endingSentence.question = createWord(lang, 1)
        if (getRng()<0.5){
            lang.grammar.endingSentence.question.word = "'"+lang.grammar.endingSentence.question.word
        }
        lang.grammar.endingSentence.question.POS = "question"
        lang.grammar.endingSentence.question.meaning = ["question"]
    }
    lang.grammar.pluralization = {
        word: genText(lang, 1),
        type: random(["prefix", "suffix", "prefixGapped", "suffixGapped"])
    }
    lang.grammar.ownerShip = genText(lang, 1)
    lang.grammar.verb.past = genText(lang, 1)
    //console.log(lang.grammar.pluralization)
    let engLangName = /*random(["language", "voice", "utters", "whispers", "dreams", "vocals"])+" of "+*/random(random(lang.lexicon.filter(e=>e.meaning.length>0)).meaning)
    let langName = translate(engLangName, lang)
    let langAsWor = String(langName.translation)+genText(lang, 2).text/*.split(" ").map(e=>e).join("")
    for (let i=0;i<(langAsWor.length/2);i++){
        langAsWor = langAsWor.replace(random(langAsWor), "")
    }*/
    let struct = langAsWor.split("").map(e=>advanceVowels.includes(e)||commonVowels.includes(e)?"V":"C").join("")
    let langWord = createWord(lang)
    langWord.word = langAsWor
    langWord.structure = struct
    langWord.meaning = [langWord.word, engLangName, "language name"]
    lang.lexicon.push(langWord)
    genNums(lang)
    lang.name = langAsWor
    //translate("do you speak the beautiful language of "+lang.name+"?", lang)
    //translate("do you speak the beautiful language of "+lang.name+"?", lang)
    //translate("what is apple in the language of "+lang.name+"? well, i have no idea!", lang)
    //translate("one two three four five six seven eight nine zero 1 2 3 4 5 6 7 8 9 0", lang)
    //translate("the history of, "+lang.name+", our language is soo vast, and complex... that's what we assumed it was, turns out it's just an instance generated by one complex generator.", lang)
    //translate("betty bought a bit of butter but the butter betty bought was a bit bitter.", lang)
    //translate("i need to eat.", lang)
    //translate("there are 11 apples here", lang)
    //translate("the cats are such a pain in the ass!", lang)
    //translate("cat, cats, dog, dogs, house, houses", lang)
    //translate("2 kids are playing in the field for 3 hours, but unfortunately, they were told to stop by their parents.", lang)
    //translate("it took 23 years to make this work!", lang)
    //translate("they're just ones and zeros!", lang)
    //translate("plural words", lang)
    //translate("3 cats from 2 houses are playing in 4 fields under 5 trees for 6 hours", lang)
    //lang.compounds = generateCompounds(lang)
    //console.log(checkForComp(random(lang.compounds).detect, lang))
    //translate("human intelligence", lang)
    //console.log(JSON.stringify(lang).length)
    //console.log(combineRoots(lang, [lang.roots[0], lang.roots[1]]))
    totalCost += (JSON.stringify(lang).length/1048576)
    countOfLangs++
    return lang
}

export function seperate(lang, intensity=2){
    let newL = structuredClone(lang)
    newL.id = genId()
    newL.seperatedFrom = {
        language: lang,
        date: state.cal.m+"m / "+state.cal.d+"dy / "+state.cal.y+"yr / "+state.cal.h+" hr"
    }
    if (intensity>=0.5){
        for (let i=0;i<intensity;i++){
            if (getRng()<0.01){
                let toRep = newL.alphabet.vowels.indexOf(random(newL.alphabet.vowels))
                newL.alphabet.vowels[toRep] = random(advanceVowels)
            } else {
                let toRep = newL.alphabet.consonants.indexOf(random(newL.alphabet.consonants))
                newL.alphabet.consonants[toRep] = random(advanceConsonants)
            }
        }
        if (getRng()<(0.01+(intensity*100))&&newL.grammar.endingSentence.question.word){
            newL.grammar.endingSentence.question.word =
            process(String(newL.grammar.endingSentence.question.word), newL)
        } if (getRng()<(0.01+(intensity*100))&&!newL.grammar.endingSentence.exclaim.word){
            newL.grammar.endingSentence.exclaim.word = genText(newL, 1).text
            //newL.grammar.endingSentence.exclaim.type = random("prefix", "suffix", "prefixGapped", "suffixGapped")
        } if (getRng()<(0.01+(intensity*100))&&!newL.grammar.endingSentence.question.word){
            newL.grammar.endingSentence.question.word = genText(newL, 1).text
            //newL.grammar.endingSentence.question.type = random("prefix", "suffix", "prefixGapped", "suffixGapped")
        } if (getRng()<(0.01+(intensity*100))&&newL.grammar.endingSentence.exclaim.word){
            newL.grammar.endingSentence.exclaim.word =
            process(String(newL.grammar.endingSentence.exclaim.word), newL)
        }
        newL.lexicon.forEach(e=>e.word=process(e.word, newL))
        newL.functions.forEach(e=>e.word=process(e.word, newL))
        newL.functions.forEach(e=>(getRng()<=(0.001*intensity))?e.word="":e)
        newL.lexicon = newL.lexicon.filter(e=>e.word.length>0)
        newL.functions = newL.functions.filter(e=>e.word.length>0)
        let engLname = random(random(newL.lexicon.filter(e=>e.meaning.length>0)).meaning)
        let name = translate(engLname, newL)
        let langAsWor = String(name.translation)+genText(newL, 2).text/*.split(" ").map(e=>e).join("")
        for (let i=0;i<(langAsWor.length/2);i++){
            langAsWor = langAsWor.replace(random(langAsWor), "")
        }*/
        let struct = langAsWor.split("").map(e=>advanceVowels.includes(e)||commonVowels.includes(e)?"V":"C").join("")
        let langWord = createWord(newL)
        langWord.word = langAsWor
        langWord.structure = struct
        langWord.meaning = [langWord.word, engLname, "language name"]
        newL.lexicon.push(langWord)
        newL.name = process(langAsWor, newL)
    }
    if (intensity>1.5){
        newL.functions.forEach(
            e=>getRng()<0.1&&e.meaning.length>1?e.meaning.splice(e.meaning.indexOf(random(e.meaning)), 1):e=e
        )
    }
    //send(translate("how are you? I'm fine", newL).translation+" : langName- "+newL.name)
    //console.log(newL)
    return newL
}

function match(a, b){
    let p = 0
    if (!b||!a) return 0
    for (const letter of String(a.word)){
        if (b.word.includes(letter)){
            p++
        }
    }
    return p
}

export function intellV2(a, b){
    let c = intelCache.find(e=>e&&e.langA===a&&e.langB===b||e.langA===b&&e.langB===a)
    if (c) return c.intelligibility
    let m = meanings
    let tot = 0
    let points = 0
    for (let P=0;P<200;P++){
        if (!meanings[P]) break
        let i = meanings[P]
        let wordA = a.lexicon.find(e=>e.meaning.some(o=>o&&o===i))
        let wordB = b.lexicon.find(e=>e.meaning.some(o=>o&&o===i))
        points += match(wordA, wordB)
        tot += wordA?wordA.word.length:wordB?wordB.word.length:1
    }
    for (let P=0;P<200;P++){
        if (!functionDefinition[P]) break
        let i = functionDefinition[P]
        let wordA = a.functions.find(e=>e.meaning.some(o=>o&&o===i))
        let wordB = b.functions.find(e=>e.meaning.some(o=>o&&o===i))
        points += match(wordA, wordB)
        tot += wordA?wordA.word.length:wordB?wordB.word.length:0
    }
    intelCache.push({
        langA: a,
        langB: b,
        intelligibility: points/tot
    })
    return (points/tot)
}

export function intelligibility(a, b) {
    if (a.name===b.name) return 1.0
    let points = 1
    let tot = (a.lexicon.length+b.lexicon.length+a.functions.length+b.functions.length)/2
    let aS = [...a.functions, ...a.lexicon]
    let bS = [...b.functions, ...b.lexicon]
    for (const word of aS){
        let c = bS[aS.indexOf(word)]
        if (c){
            for (const i of c.word){
                if (word.word.startsWith(c.word[0])&&word.word.endsWith(c.word[c.word.length-1])){
                    points += 1-Math.abs(word.word.length-c.word.length)/Math.max(word.word.length, c.word.length)
                    break
                }
            }
        }
    }
    //console.log(((points/tot)*100)+"%")
    return points/tot
}

export function borrowR(langA, langB, numOfWords=1){
    for (let i=0;i<numOfWords;i++){
        let word = random(langA.lexicon)
        let w = structuredClone(word)
        if (!langB.lexicon.includes(w)){
            langB.lexicon.push(w)
        }
    }
}
//console.log(createLanguage())
//send(countOfLangs+" language(s) is equal to "+totalCost.toFixed(2)+"MB")
/*console.log(
    (297898+
1300039+
1809305+
618337+
2037730+
1276280)/6
)*/
//console.log(meanings)
//console.log("["+meanings.map(e=>"\""+e+"\"").join(", \n")+"]") //for mass producing word
//console.log(Math.floor(10**9+Math.random()*10**10))
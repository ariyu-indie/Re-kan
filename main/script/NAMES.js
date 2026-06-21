export function GFN(gender = "neutral", { syllables = 3 } = {}) {
    const baseConsonants = ["b","c","d","f","g","h","k","l","m","n","p","r","s","t","v","z"]
    const softConsonants = ["l","m","n","r","s","v"]
    const hardConsonants = ["b","d","g","k","t","z"]
    const clusters = ["th","sh","dr","tr","kr","gr","br","cl","fl","gl","pr"]
    const vowels = ["a","e","i","o","u"]
    const longVowels = ["ae","ia","io","oa"]
    const femaleEndings = ["a","ia","eth","iel","yn"]
    const maleEndings = ["or","en","ir","eth","ar"]
    const neutralEndings = ["a","en","iel","or","eth","ir","yn"]
    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }
    function pickConsonant() {
        if (gender === "female") return pick(softConsonants)
        if (gender === "male") return pick(hardConsonants)
        return pick(baseConsonants)
    }
    function syllable() {
        const patterns = ["CV", "VC"]
        const pattern = pick(patterns)
        let s = ""
        let usedCluster = false
        for (const ch of pattern) {
            if (ch === "C") {
                if (!usedCluster && Math.random() < 0.25) {
                    s += pick(clusters)
                    usedCluster = true
                } else {
                    s += pickConsonant()
                }
            } else {
                if (gender === "female" && Math.random() < 0.45) {
                    s += ""//pick(longVowels)
                } else {
                    s += pick(vowels)
                }
            }
        }
        return s
    }
    let name = ""
    for (let i = 0; i < syllables; i++) {
        name += syllable()
    }
    if (!/[aeiou]$/.test(name)) {
        if (gender === "female") name += pick(femaleEndings)
        else if (gender === "male") name += pick(maleEndings)
        else name += pick(neutralEndings)
    }
    name = name.replace(/(.)\1{2,}/g, "$1$1")

    return name.charAt(0).toUpperCase() + name.slice(1)
}
export function GFFN(gender = "neutral") {
    return `${GFN(gender, { syllables: 2 })} ${GFN(gender, { syllables: 3 })}`
}
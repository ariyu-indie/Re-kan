import { look } from "./HUMANS.js"
import { state } from "./STATE.js"
import { getRng } from "./SEED.js"

const genres = [
    "biography"
]

export function bookId(x){
    return state.globalLib.find(e=>e.id===x)
}

function getHighestRandom(obj) {
    let max = -Infinity //so i can get neg
    let topKeys = []
    for (const [key, value] of Object.entries(obj)) {
        if (value > max) {
            max = value
            topKeys = [key]
        } else if (value === max) {
            topKeys.push(key)
        }
    }
    const randomIndex = Math.floor(getRng() * topKeys.length)
    return topKeys[randomIndex]
}

function random(x){
    return x[Math.floor(getRng()*x.length)]
}

export function genBookTitle(book){
    if (book.genre === "biography"){
        return random(
            ["life of",
             "inspiring life of",
             "interesting life of",
             "awful life of",
             "influential life of",
             "happy life of",
             "adventures of"
            ]
        )+" "+look(book.subject).name
    }
}

export function genBookDesc(book){
    if (book.genre === "biography"){
        return random([
            "it is a biographical story about",
            "it is a biographical novel centered around",
            "it is a book centered around",
            "it is a literature about"
        ])+` "the ${book.title}," it features ${look(book.subject).name} as said in the title, and is compassionate at ${getHighestRandom(look(book.subject).hobbies)}`
    }
}

export function genBook(x, subject=null){
    let book = {}
    book.genre = random(genres)
    book.id = Math.floor(10**9+getRng()*10**10)
    book.subject = subject.id
    book.releaseDate = state.cal.m+"m / "+state.cal.d+"dy / "+state.cal.y+"yr / "+state.cal.h+" hr"
    book.opinions = {
    }
    book.read = 0
    book.author = x.id
    book.title = genBookTitle(book)
    book.description = genBookDesc(book)
    book.quality = getRng()*x.hobbies.writing
    return book
}

export function distribute(libA, libB){
    let a = random(libA.books.filter(e=>e&&bookId(e).read>10))
    if (a){
        libB.books.push(a)
        return bookId(a)
    }
}
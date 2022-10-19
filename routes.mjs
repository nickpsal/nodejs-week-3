import express, { response } from 'express'
//import { booklist } from "./booklist_sqlite.mjs"
import { booklist } from './booklist_postgres.mjs'
import { body, validationResult } from 'express-validator'


const router = express.Router()

router.get('/books', 
    checkifAuth,
    showbooklist
)

router.get('/', (req,res) => {
    res.render('home')
})

router.post('/books', (req,res, next) =>  {
    req.session.username = req.body["username"]
    console.log(req.body["username"])
    next()
},
showbooklist
)

router.get('/addbookform', checkifAuth, (req,res) => {
    res.render('addbookform')
})

router.get('/logout', checkifAuth, 
    (req,res) => {
        req.session.destroy()
        res.redirect('/')
    }
)

router.post(
    '/addbook',
    checkifAuth, 
    body('newBookTitle')
    .isAlphanumeric('el-GR', {ignore: ' '}).trim().escape()
    .withMessage("Πρέπει νά γραμμένος στα ελληνικά")
    .isLength({ min:5 })
    .withMessage("Το μήκος Χαρακτήρων πρέπει νά είναι απο 5 και πάνω"),
    async (req,res, next) => {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const newbook = {
                "title": req.body['newBookTitle'],
                "author": req.body['newBookAuthor']
            }
            try {
                const bookList = new booklist(req.session.username)
                await bookList.addBook(newbook)
            }catch (error) {
                next
            }
            console.log(newbook)
            res.redirect('/books')
        }else {
            console.log("Σφάλμα")
            console.log(errors)
            res.render('addbookform', {
                mess: errors.mapped(),
                title : req.body['newBookTitle'], 
                author: req.body['newBookAuthor']
            })
        }
        
})

async function showbooklist(req,res, next) {
    res.locals.username = req.session.username
    try {
        const bookList = new booklist(req.session.username)
        await bookList.loadBooks()
        res.render("booklist", {books:bookList.myBooks})
    }catch(error) {
        next(error)
    }
}

function checkifAuth (req,res,next) {
    if (req.session.username) {
        next()
    }else {
        res.redirect("/")
    }
}

export { router }

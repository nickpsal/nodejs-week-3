import 'dotenv/config'
import express, { response, urlencoded } from 'express'
import session  from 'express-session'
import createMemoryStore from 'memorystore'
import { engine } from 'express-handlebars'
import { router } from "./routes.mjs"

const app = new express()
const memorystore = createMemoryStore(session)
const myBooksSession = session({
    secret: process.env.SESSION_SECRET,
    store: new memorystore( { checkPeriod: 86400*1000 }),
    resave: false,
    saveUninitialized: false,
    name: "mybooksSessoinID",
    cookie: {
        maxAge: 1080*60*20 // 20 λπετα
    }
})
app.use(myBooksSession)
app.use(express.static("public"))
// for post method
app.use(express.urlencoded({extended: false}))
// for working with hbs files
app.engine('.hbs', engine({extname: '.hbs'}))
app.set('view engine', '.hbs')


app.use("/", router)
app.use((req,res) => {
    res.redirect("/")
})

app.use((error, req, res, next) => {
    console.log(error.message)
    res.render("error", {message: error.message})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log("Η εφαρμογή ξεκίνησε χωρίς σφάλματα στην θύρα " + PORT)
})


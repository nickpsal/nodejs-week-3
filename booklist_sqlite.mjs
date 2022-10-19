import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const db_name = "./db.sqlite"

class booklist {
    myBooks = []

    constructor(username) {
        this.username = username;
    }

    async loadBooks() { 
        try {
            this.db = await this.openDB()
            const query = "SELECT title, authors FROM Books JOIN Books_Users on books.title = Books_Users.booktitle WHERE username = ?;"
            this.myBooks = await this.db.all(query, [this.username])
            console.log('load...... ',this.myBooks)
            this.db.close()
        }catch (error) {
            this.db.close()
            console.log(error)
            throw error
        }
    }

    async addBook(newbook) { 
        try {
            await this.addUser(this.username);
            this.db = await this.openDB()
            const query1 = "INSERT OR IGNORE INTO Books (title, authors) VALUES (?,?);"
            await this.db.run(query1, [newbook.title, newbook.authors]);
            await db.close()
        }catch(error) {
            this.db.close()
            console.log(error)
            throw error
        }
        try {
            await this.addUser(this.username);
            this.db = await this.openDB()
            const query2 = "INSERT OR IGNORE INTO Books_Users VALUES (?,?);"
            await this.db.run(query2, [newbook.title, this.username]);
            await db.close()
        }catch(error) {
            this.db.close()
            console.log(error)
            throw error
        }
     }

    async deleteBook(book) { 
        try {
            this.db = await this.openDB()
            const query1 = "DELETE FROM Book_Users WHERE booktitle=? and username=?"
            await this.db.run(query1, [book.title, this.username]);
            await db.close()
        }catch (error) {
            this.db.close()
            console.log(error)
            throw error
        }
        try {
            this.db = await this.openDB()
            const query2 = "SELECT * FROM Book_Users WHERE booktitle=?"
            const rows = await this.db.run(query2, [book.title]);
            if (rows.length === 0) {
                const query3 = "DELETE FROM Books WHERE title=?"
                await this.db.run(query3, [book.title]);
            }
            await db.close()
        }catch (error) {
            this.db.close()
            console.log(error)
            throw error
        }
     }

    async addUser(username) { 
        try {
            this.db = await this.openDB()
            const query = "INSERT OR IGNORE INTO Users VALUES (?, NULL);"
            await this.db.run(query, {username})
            await this.db.close()
        }catch (error) {
            console.log(error)
            throw error
        }
     }

    async openDB() {
        return await open( { filename: db_name, driver: sqlite3.Database})
    }
}

export {booklist}

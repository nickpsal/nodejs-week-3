import { Sequelize, DataTypes } from "sequelize";
const db_name = "./model/books3.sqlite";

const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    define: {
        timestamps: false
    },
    //sqlite only
    storage: db_name
});

//define model
const Book = sequelize.define(
    'Book', {
        title: {
            type: DataTypes.TEXT,
            primaryKey: true,
            unique: true
        },
        author: {
            type: DataTypes.TEXT,
            allowNull: false
        },
});

const User = sequelize.define(
    'User', {
        username: {
            type: DataTypes.TEXT,
            primaryKey: true
        },
        password: {
            type: DataTypes.TEXT
        },
});


const Book_User = sequelize.define(
    'Book_User', {
        comment: {
            type: DataTypes.TEXT
        },
});

Book.belongsToMany(User, {through: Book_User})
User.belongsToMany(Book, {through: Book_User})

await  sequelize.sync({alter: true});


class booklist {
    myBooks = []

    constructor(username) {
        if (username == undefined) {
            throw new Error ("Δεν έχει οριστεί ο χρήστης")
        }
        this.username = username;
    }

    async loadBooks() {
        try {
            await this.findorAddUser()
            this.myBooks = await this.user.getBooks({raw:true})
        }catch (error) {
            throw error
        }
    }

    async addBook(newbook) { 
        try {
            await this.findorAddUser()
            let book = await Book.findOne({where: {title:newbook.title}}) 
            console.log(book)
            if (!book) {
                book = await Book.create({
                    title: newbook.title,
                    author: newbook.author
                })
            }
            await this.user.addBook(book)
        }catch (error){
            throw new Error(error.errors[0].message)
        }
    }

    async deleteBook(book) {
        try {
            await this.findorAddUser()
            const booktoRemove = await Book.findOne({where: {title: book.title}})
            await booktoRemove.removeUser(this.user)
            const numofUsers = await booktoRemove.countUsers()
            if (numofUsers == 0) {
                Book.destroy({where: {title: book.title}})
            }
        }catch (error) {
            throw error
        }
    }

    async findorAddUser() {
        if (this.user == undefined) {
            try {
                const [user, created] = await User.findOrCreate({where: {username: this.username}})
                this.user = user
            }catch (error) {
                throw error
            }
        }
    }

}

export {booklist}
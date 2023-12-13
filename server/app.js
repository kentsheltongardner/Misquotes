const express = require('express')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const { MongoClient } = require('mongodb')

async function run() {
    const uri = `mongodb+srv://kentsheltongardner:${process.env.ATLAS_PASSWORD}@misquotes.txufi7u.mongodb.net/?retryWrites=true&w=majority`
    const client = new MongoClient(uri)
    await client.connect()
    const database = client.db('Misquotes')
    async function randomQuote() {
        return (await database.collection('Quotes').aggregate(
            [ 
                { "$unwind": "$quotes" }, 
                { "$sample": { "size": 1 } } 
            ]
        ).toArray())[0].quotes
    }
    async function randomCharacter() {
        return (await database.collection('Characters').aggregate(
            [ 
                { "$unwind": "$characters" }, 
                { "$sample": { "size": 1 } } 
            ]
        ).toArray())[0].characters
    }
    function randomImageURL() {
        const files = fs.readdirSync(path.join('__dirname', '..', 'public', 'images'))
        const number = Math.floor(Math.random() * files.length)
        return `http://localhost:3000/images/${files[number]}`
    }
    
    const app = express()
    const port = 3000
    app.use(express.static('public/'))
    app.get('/misquote', async (req, res) => {
        const quote = await randomQuote()
        const character = await randomCharacter()
        res.send(`<img src="${randomImageURL()}"/>
            <p>${quote}<br><br><cite>- ${character}</cite></p>
        `)
    })
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

run()
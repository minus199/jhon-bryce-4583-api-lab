
const express = require('express')
const cors = require('cors')
const app = express()
const fetch = require('node-fetch');

const PORT = 8899

const supportedLangs = {
    en_US: "English (US)",
    hi: "Hindi",
    es: "Spanish",
    fr: "French",
    ja: "Japanese",
    ru: "Russian",
    en_GB: "English (UK)",
    de: "German",
    it: "Italian",
    ko: "Korean",
    'pt-BR': "Brazilian Portuguese",
    ar: "Arabic",
    tr: "Turkish",
}


app.use(express.static('./'))

app.use(cors())

//https://api.dictionaryapi.dev/api/v2/entries/en_US/hello

app.get('/api/v2/langs', function (req, res, next) {
    res.json(supportedLangs)
})

{
    const baseURL = 'https://api.dictionaryapi.dev/api/v2/entries'

    app.get('/api/v2/entries/:langCode/:searchTerm', function (req, res, next) {
        const { langCode, searchTerm } = req.params;
        if (!searchTerm) {
            res.status(400).send("Search term is empty")
            return
        }

        if (!langCode || !Object.keys(supportedLangs).includes(langCode)) {
            res.status(400).send("Language code is empty")
            return
        }

        fetch(`${baseURL}/${langCode}/${searchTerm}`)
            .then(dictRes => dictRes.json())
            .then(payload => setTimeout(() => res.json(payload), parseInt(Math.random() * 5000))) // simulate a slow connection

    })
}
app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT} - localhost:${PORT}`)
})
{
    //https://api.dictionaryapi.dev/api/v2/entries/en_US/hello
    const baseURL = "/api/v2"
    const $lookup = document.querySelector("#lookup-field");
    const $searchBtn = document.querySelector("#search");
    $searchBtn.addEventListener("click", search)

    const $langs = document.querySelector("#supported-langs");
    const $dictContainer = document.querySelector("#dict-container");

    const createLang = ([code, display]) => {
        const $option = document.createElement("option")
        $option.value = code
        $option.innerText = display

        return $option
    }

    function populateLangs() {
        fetch("/api/v2/langs")
            .then(res => res.json())
            .then(langs => {
                const options = Object.entries(langs).map(createLang);
                $langs.append(...options);
            })
    }

    const createWord = word => {
        const $word = document.createElement("span")
        $word.innerText = word
        $word.classList.add("word")
        return $word
    }

    const createPhonetic = phonetic => {
        const $phoneticContainer = document.createElement("span")
        $phoneticContainer.classList.add("phonetic-container")

        const $phonetic = document.createElement("audio")
        $phonetic.setAttribute("controls", true)
        if (phonetic.audio) {
            const $audioSource = document.createElement("source")
            $audioSource.src = phonetic.audio
            $phonetic.append($audioSource)
        }

        const $phoneticText = document.createElement("span")
        $phoneticText.innerText = phonetic.text
        $phoneticText.classList.add("phonetic-text")
        $dictContainer.append($phoneticText)

        $phoneticContainer.append($phonetic)

        return $phoneticContainer
    }

    const createExample = example => {
        const $example = document.createElement("div")
        $example.classList.add("example")
        $example.innerText = example

        return $example
    }

    const createSynonyms = (synonyms) => {
        const $synonyms = document.createElement("ol")
        $synonyms.classList.add("synonyms")
        $synonyms.append(...(synonyms || []).map(syn => {
            const $syn = document.createElement("li");
            $syn.classList.add("synonym")
            $syn.innerText = syn
            return $syn
        }))

        return $synonyms
    }

    const createDefinition = ($definitionContainer, { definition, example, synonyms }) => {
        const $definition = document.createElement("div")
        $definition.classList.add("definition")
        $definition.innerText = definition
        $definitionContainer.append($definition)

        if (example) {
            const $example = createExample(example)
            $definitionContainer.append($example)
        }

        if (synonyms && synonyms.length > 0) {
            const $synonyms = createSynonyms(synonyms)
            $definitionContainer.append($synonyms)
        }

        $definitionContainer.append(document.createElement("hr"))
    }

    const validateResponse = async res => {
        const payload = await res.json();
        if (!res.ok || "message" in payload) {
            throw payload
        }
        return payload
    }

    const createDictionaryItem = payload => {
        $dictContainer.innerHTML = "" // clear the previous results

        payload.forEach(({ word, meanings, phonetics }) => {
            $dictContainer.append(createWord(word))
            $dictContainer.append(...phonetics.map(createPhonetic))

            meanings.forEach(({ definitions, partOfSpeech }) => {
                const $definitionContainer = document.createElement("div")
                $definitionContainer.classList.add("definition-container")
                $dictContainer.append($definitionContainer)

                definitions.forEach(data => createDefinition($definitionContainer, data))
            })
        })
    }

    function search() {
        const searchTerm = $lookup.value;
        if (!searchTerm) {
            alert("Cannot search an empty string");
            return;
        }

        const langCode = $langs.value;

        fetch(`${baseURL}/entries/${langCode}/${searchTerm}`)
            .then(validateResponse)
            .then(createDictionaryItem)
            .catch(reason => alert(reason.message))
    }
}
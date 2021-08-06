{
    //notice that everything related to this feature is under a dedicated scope.
    /*
        Notice that this file only exposes two functions - populateLangs and search. 
        Try loading this page, and checking the console what we have in the global scope
    */

    // api docs    - https://dictionaryapi.dev/ 
    // api example - https://api.dictionaryapi.dev/api/v2/entries/en_US/hello

    const baseURL = "/api/v2" // It's good practice to store the start of the api url in a variable so we can change it easily later on(no hard coding!)

    //Due to the nature of our app, we do not need to query for these elements again since they are only created once.
    const $langs = document.querySelector("#supported-langs");
    const $lookup = document.querySelector("#lookup-field");
    const $searchBtn = document.querySelector("#search");
    $searchBtn.addEventListener("click", search) // search is defined here due to hoisting

    const $dictContainer = document.querySelector("#dict-container");
    const $dictSearchIndicator = document.querySelector("#dict-search-indicator");

    // we set our variables in the top of the file, the rest is only functions

    const createLang = ([code, display]) => {
        const $option = document.createElement("option")
        $option.value = code
        $option.innerText = display

        return $option
    }

    function populateLangs() {
        fetch(`${baseURL}/langs`)
            .then(res => res.json())
            .then(langs => {
                const options = Object.entries(langs).map(createLang);
                $langs.append(...options);
            })
            .catch(reason => alert(reason.message))
    }

    // We have a function to create each element/componenet that is used dynamically when creating a dictionary entry
    // We are storing these functions as consts since we want to limit their exposre 
    const createWord = word => {
        const $word = document.createElement("span")
        $word.innerText = word
        $word.classList.add("word")
        return $word
    }

    const createPartOfSpeech = pos => {
        const $pos = document.createElement("span")
        $pos.innerText = pos
        $pos.classList.add("part-of-speech")
        return $pos
    }

    const createPhonetic = phonetic => {
        const $phoneticContainer = document.createElement("span")
        $phoneticContainer.classList.add("phonetic-container")

        const $phonetic = document.createElement("audio")
        $phonetic.setAttribute("controls", true) //When we see an an attribute without a value, it means that the value is 'true'. If the attribute is missing the value is false. We can also specify true/false explicitly
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

        // Since we do not always have examples and synonyms, we use 'conditional rendering'. We only create the elements if the conditions are met.
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

    // notice the async/await on an arrow function(just like a regular async function)
    const validateResponse = async res => {
        const payload = await res.json();
        if (!res.ok || "message" in payload) { //The dictionary api sends a different json schema when error happens. But none 200 status code can also happen.
            throw payload // payload is already an object, so we use it as an exception. We could have defined a specific type for this excpeption, which would have been even better.
        }
        return payload
    }

    const createDictionaryItem = payload => {
        $dictContainer.innerHTML = "" // clear the previous results

        //Once we understand the payload(the json object), we can start traversing it. Then we can call the appropriate functions when needed.
        payload.forEach(({ word, meanings, phonetics }) => {
            $dictContainer.append(createWord(word))
            $dictContainer.append(...phonetics.map(createPhonetic))

            meanings.forEach(({ definitions, partOfSpeech }) => {
                $dictContainer.append(createPartOfSpeech(partOfSpeech))

                const $definitionContainer = document.createElement("div")
                $definitionContainer.classList.add("definition-container")
                $dictContainer.append($definitionContainer)

                definitions.forEach(data => createDefinition($definitionContainer, data))
            })
        })
    }

    /*
        In order to chaneg styles for an element, we only need to apply a different class name
            (instead of playing with the style attribute). 
        Its much more easy, efficient and overall better approach to always control the styles with css+class names 
            (instead of the style attribute)
    */
    const startLoadingAnimation = () => $dictSearchIndicator.classList.remove("inactive-search-indicator")
    const stopLoadingAnimation = () => $dictSearchIndicator.classList.add("inactive-search-indicator")

    function search() {
        const searchTerm = $lookup.value;

        if (!searchTerm) {
            alert("Cannot search an empty string");
            return;
        }

        const langCode = $langs.value;

        startLoadingAnimation();

        fetch(`${baseURL}/entries/${langCode}/${searchTerm}`)
            .finally(() => stopLoadingAnimation()) //Once we got a response(and before we handle it), we indicate to the user that the request had finished.
            .then(validateResponse)
            .then(createDictionaryItem)
            .catch(reason => alert(reason.message))
    }
}
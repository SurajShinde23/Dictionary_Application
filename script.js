const dictionaryApiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const translateApiUrl = 'https://api.mymemory.translated.net/get';
let lastSearchedWord = '';

async function searchWord() {
    const wordInput = document.getElementById('wordInput');
    const languageSelect = document.getElementById('languageSelect');
    const resultDiv = document.getElementById('result');
    const word = wordInput.value.trim();
    const targetLanguage = languageSelect.value;

    if (!word) {
        resultDiv.textContent = 'Please enter a word or sentence.';
        return;
    }


    if (word !== lastSearchedWord) {
        lastSearchedWord = word;
        resultDiv.textContent = 'Searching...';

        try {
            // Translate to the target language
            const translateResponse = await fetch(`${translateApiUrl}?q=${encodeURIComponent(word)}&langpair=en|${targetLanguage}`);
            if (!translateResponse.ok) {
                throw new Error(`HTTP error! status: ${translateResponse.status}`);
            }
            const translateData = await translateResponse.json();

            // Get English definition
            const dictionaryResponse = await fetch(dictionaryApiUrl + encodeURIComponent(word));
            let dictionaryData = [];
            if (dictionaryResponse.ok) {
                dictionaryData = await dictionaryResponse.json();
            }

            let result = `Word/Phrase: ${word}\n`;
            result += `Translation (${getLanguageName(targetLanguage)}): ${translateData.responseData.translatedText}\n\n`;

            if (dictionaryData && dictionaryData.length > 0) {
                dictionaryData[0].meanings.forEach((meaning, index) => {
                    result += `Meaning ${index + 1} (${meaning.partOfSpeech}):\n`;
                    meaning.definitions.forEach((def, defIndex) => {
                        result += `  ${defIndex + 1}. ${def.definition}\n`;
                        if (def.example) {
                            result += `     Example: ${def.example}\n`;
                        }
                    });
                    result += '\n';
                });
            } else {
                result += 'No additional definitions found for this word.\n';
            }

            resultDiv.textContent = result;



        }
    

        catch (error) {
            console.error('Error:', error);
            resultDiv.textContent = `An error occurred: ${error.message}`;
        }
    } else {
        location.reload();
    }
}




function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'hi': 'Hindi',
        'mr': 'Marathi',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'ko': 'Korean'
    };
    return languages[code] || code;
}














// Function to toggle speech recognition modal
function toggleSpeechRecognition() {
    const modal = document.getElementById('speechModal');
    modal.style.display = 'flex';

    // Start speech recognition process
    startSpeechRecognition();
}

// Function to close speech recognition modal
function closeSpeechModal() {
    const modal = document.getElementById('speechModal');
    modal.style.display = 'none';
}

// Function to handle speech recognition
function startSpeechRecognition() {
    const selectedLanguage = document.getElementById('languageSelect').value;
    
    const recognition = new webkitSpeechRecognition(); // Create a new instance of SpeechRecognition
    recognition.lang = selectedLanguage; // Set language based on user selection
    recognition.interimResults = false; // Disable interim results

    recognition.onresult = function(event) {
        const result = event.results[0][0].transcript; // Get the transcribed speech
        document.getElementById('wordInput').value = result; // Set the input field value
        closeSpeechModal(); // Close the speech modal once speech is recognized
    }

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        closeSpeechModal(); // Close the speech modal on error
    }

    recognition.onend = function() {
        console.log('Speech recognition ended.');
    }

    recognition.start(); // Start speech recognition
}

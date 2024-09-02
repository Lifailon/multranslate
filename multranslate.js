const blessed = require('blessed')
const axios = require('axios')

const screen = blessed.screen()

// Панель для ввода текста
const inputBox = blessed.textarea({
    label: 'Input',
    top: 'top',
    left: 'center',
    width: '100%',
    height: '25%',
    inputOnFocus: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от MyMemory
const outputBox1 = blessed.textarea({
    label: `Output (MyMemory)`,
    top: '25%',
    left: 'left',
    width: '100%',
    height: '25%',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от DeepLX
const outputBox2 = blessed.textarea({
    label: `Output (DeepLX)`,
    top: '50%',
    left: 'left',
    width: '100%',
    height: '25%',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от Google
const outputBox3 = blessed.textarea({
    label: `Output (Google)`,
    top: '75%',
    left: 'left',
    width: '100%',
    height: '25%',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Добавление панелей на экран
screen.append(inputBox)
screen.append(outputBox1)
screen.append(outputBox2)
screen.append(outputBox3)

// Установить фокус на поле ввода
inputBox.focus()

// Функция определения исходного языка
function detectFromLanguage(text) {
    const russianPattern = /[а-яА-Я]/g
    const englishPattern = /[a-zA-Z]/g
    const russianMatches = text.match(russianPattern) || []
    const englishMatches = text.match(englishPattern) || []
    const russianCount = russianMatches.length
    const englishCount = englishMatches.length
    if (russianCount > englishCount) {
        return 'ru'
    } else {
        return 'en'
    }
}

// Функция определения целевого языка
function detectToLanguage(lang) {
    if (lang === 'ru') {
        return 'en'
    } else {
        return 'ru'
    }
}

// Функция перевода через MyMemory API
// Source: https://mymemory.translated.net/doc/spec.php
async function translateMyMemory(text) {
    const fromLang = detectFromLanguage(text)
    const toLang = detectToLanguage(fromLang)
    const apiUrl = 'https://api.mymemory.translated.net/get'
    try {
        const response = await axios.get(apiUrl, {
            timeout: 3000,
            params: {
                q: text,
                langpair: `${fromLang}|${toLang}`
            }
        })
        return response.data.responseData.translatedText
    } catch (error) {
        return error.message
    }
}

// Функция перевода через DeepLX API
// Source: https://github.com/bropines/Deeplx-vercel
async function translateDeepLX(text) {
    const fromLang = detectFromLanguage(text)
    const toLang = detectToLanguage(fromLang)
    const apiUrl = 'https://deeplx-vercel-phi.vercel.app/api/translate'
    try {
        const response = await axios.post(apiUrl, {
            timeout: 3000,
            text: text,
            source_lang: fromLang,
            target_lang: toLang
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data.data
    } catch (error) {
        return error.message
    }
}

// Функция перевода через Google API
// Source: https://github.com/olavoparno/translate-serverless-vercel
async function translateGoogle(text) {
    const fromLang = detectFromLanguage(text)
    const toLang = detectToLanguage(fromLang)
    const apiUrl = 'https://translate-serverless.vercel.app/api/translate'
    try {
        const response = await axios.post(apiUrl, {
            timeout: 3000,
            message: text,
            from: fromLang,
            to: toLang
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data.translation.trans_result.dst
    } catch (error) {
        return error.message
    }
}

// Функция обработки перевода
async function handleTranslation() {
    const textToTranslate = inputBox.getValue().trim()
    if (textToTranslate) {
        const [
            translatedText1,
            translatedText2,
            translatedText3
        ] = await Promise.all([
            translateMyMemory(textToTranslate),
            translateDeepLX(textToTranslate),
            translateGoogle(textToTranslate)
        ])
        outputBox1.setContent(translatedText1)
        outputBox2.setContent(translatedText2)
        outputBox3.setContent(translatedText3)
        screen.render()
        // Вернуть фокус на inputBox
        inputBox.focus()
    }
}

// Обработка нажатия Enter
inputBox.key(['enter'], async () => {
    await handleTranslation()
})

// Обработка очистки экрана
screen.key(['Ctrl-l'], function () {
    inputBox.clear
    outputBox1.setContent('')
    outputBox2.setContent('')
    outputBox3.setContent('')
    screen.render()
    inputBox.focus()
})

// Обработка нажатия клавиш выхода
screen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0)
})

// Отображение интерфейса
screen.render()

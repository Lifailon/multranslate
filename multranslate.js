const blessed = require('blessed')
const axios = require('axios')

// Аргументы по умолчанию
let fromLang = 'en'
let toLang = 'ru'

// Обработка аргументов командной строки
const args = process.argv.slice(2)
args.forEach(arg => {
    const [key, value] = arg.split('=')
    if (key === '--fromLang') {
        fromLang = value
    } else if (key === '--toLang') {
        toLang = value
    }
})

// Создание экрана
const screen = blessed.screen()

// Панель для ввода текста
const inputBox = blessed.textbox({
    label: 'Input',
    top: 'top',
    left: 'center',
    width: '100%',
    height: '50%',
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

// Панель для отображения перевода
const outputBox = blessed.box({
    label: 'Output',
    top: '50%',
    left: 'center',
    width: '100%',
    height: '50%',
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
screen.append(outputBox)

// Устанавливаем фокус на поле ввода
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
    } else if (englishCount > russianCount) {
        return 'en'
    } else if (russianCount === 0 && englishCount === 0) {
        return 'unknown'
    } else {
        return 'equal'
    }
}

// Функция определения исходного языка
function detectToLanguage(lang) {
    if (lang === "ru") {
        return 'en'
    } else {
        return 'ru'
    }
}

// Функция перевода через MyMemory API
async function translateText(text) {
    fromLang = detectFromLanguage(text)
    toLang = detectToLanguage(fromLang)
    try {
        const response = await axios.get('https://api.mymemory.translated.net/get', {
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

// Функция обработки перевода
async function handleTranslation() {
    const textToTranslate = inputBox.getValue().trim()
    if (textToTranslate) {
        const translatedText = await translateText(textToTranslate)
        outputBox.setContent(translatedText)
        screen.render()
        // Вернуть фокус на inputBox
        inputBox.focus()
    }
}

// Обработка нажатия Enter
inputBox.key(['enter'], async () => {
    await handleTranslation()
})

// Обработка нажатия клавиш для выхода
screen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0)
})

// Отображение интерфейса
screen.render()

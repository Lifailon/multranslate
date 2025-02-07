#!/usr/bin/env node

import blessed from 'blessed'
import axios from 'axios'
import clipboardy from 'clipboardy'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'
import { Command } from 'commander'

// Определяем текущий путь для доступа к файлу БД, ключу OpenAI и конфигурации package
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const apiKeyPath = path.join(__dirname, 'openai-key.txt')

// Читаем файл конфигурации для получения описания и версии приложения
const pkg = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'))

// Определяем статические параметры
const languages = [
    'ru', // Russian (Русский)
    'ja', // Japanese (Японский)
    'zh', // Chinese (Китайский)
    'ko', // Korean (Корейский)
    'ar', // Arabic (Арабский)
    'tr', // Turkish (Турецкий)
    'uk', // Ukrainian (Украинский)
    'sk', // Slovak (Словацкий)
    'pl', // Polish (Польский)
    'de', // German (Немецкий)
    'fr', // French (Французский)
    'it', // Italian (Итальянский)
    'es', // Spanish (Испанский)
    'el', // Greek (Греческий)
    'hu', // Hungarian (Венгерский)
    'nl', // Dutch (Нидерландский)
    'sv', // Swedish (Шведский)
    'ro', // Romanian (Румынский)
    'cs', // Czech (Чешский)
    'da', // Danish (Датский)
    'pt', // Portuguese (Португальский) to 0.5.2 (#1)
    'vi', // Vietnam (Вьетнамский) to 0.6.0 (#2)
]
// Language default
let selectedLanguage = 'ru'

// Карта для определения языка
const mapLanguages = {
        'en': 'English',
        'ru': 'Russian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'sk': 'Slovak',
        'pl': 'Polish',
        'de': 'German',
        'fr': 'French',
        'it': 'Italian',
        'es': 'Spanish',
        'el': 'Greek',
        'hu': 'Hungarian',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'ro': 'Romanian',
        'cs': 'Czech',
        'da': 'Danish',
        'pt': 'Portuguese',
        'vi': 'Vietnam',
}

const translators = [
    'all',
    'Google',
    'DeepL',
    'Reverso',
    'MyMemory',
    'OpenAI'
]
// Translator default
let selectedTranslator = 'all'

// Режим ответов OpenAI (перевод или чат)
let selectedModeOpenAI = "translate"

// Обработка аргументов
const program = new Command()
program
    .description(pkg.description)
    .version(pkg.version)
    .option(
        '-l, --language <name>',
        `Select the language: ${languages.join(', ')}`,
        'ru'
    )
    .option(
        '-t, --translator <name>',
        `Select the translator: ${translators.join(', ')}`,
        'all'
    )
    .option(
        '-k, --key <value>',
        'API key parameter for OpenAI (high priority) or using the environment "OPENAI_API_KEY"'
    )
    .option(
        '-o, --openaiUrl <url>',
        'Url address for OpenAI API or local LLM (default: "https://api.openai.com" or the environment "OPENAI_URL")'
    )
    .option(
        '-m, --model <name>',
        'Select the LLM model (default: "gpt-4o-mini" or the environment "OPENAI_MODEL")'
    )
    .option(
        '-e, --temp <number>',
        'Select the temperature for LLM (default: "0.7" or the environment "OPENAI_TEMP")'
    )
    .parse(process.argv)
    
// Language
const inputLanguage = program.opts().language.toLowerCase()
const languagesLowerCase = languages.map(t => t.toLowerCase())
if (!languagesLowerCase.includes(inputLanguage)) {
    console.error(`Invalid parameter value. Choose one of: ${languages.join(', ')}`)
    process.exit(1)
}
selectedLanguage = languages[languagesLowerCase.indexOf(inputLanguage)]

// Translator
const inputTranslator = program.opts().translator.toLowerCase()
const translatorsLowerCase = translators.map(t => t.toLowerCase())
if (!translatorsLowerCase.includes(inputTranslator)) {
    console.error(`Invalid parameter value. Choose one of: ${translators.join(', ')}`)
    process.exit(1)
}
selectedTranslator = translators[translatorsLowerCase.indexOf(inputTranslator)]

// Проверяем параметры и переменные окружения для настройки подключения к OpenAI
let apiKey = program.opts().key
if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY
}

// Если не передан через параметр, то проверяем переменную окружения или определяем значение по умолчанию
let openaiUrl = program.opts().openaiUrl
if (!openaiUrl) {
    openaiUrl = process.env.OPENAI_URL ? process.env.OPENAI_URL : "https://api.openai.com"
}

let openaiModel = program.opts().model
if (!openaiModel) {
    openaiModel = process.env.OPENAI_MODEL ? process.env.OPENAI_MODEL : "gpt-4o-mini"
}

let openaiTemp = program.opts().temp
if (!openaiTemp) {
    openaiTemp = process.env.OPENAI_TEMP ? process.env.OPENAI_TEMP : "0.7"
    openaiTemp = parseFloat(openaiModel)
}

// Если ключ передан, сохраняем его в файл
// if (apiKey) {
//     try {
//         writeFileSync(apiKeyPath, apiKey, { encoding: 'utf8' })
//     } catch (error) {
//         console.error(`Error saving API key to file: ${error.message}`)
//         process.exit(1)
//     }
// }
// Если ключ не передан, загружаем его из файла
// else {
//     try {
//         apiKey = readFileSync(apiKeyPath, 'utf8').trim()
//     } catch (error) {
//         if (selectedTranslator === 'OpenAI') {
//             console.error('API key not found.')
//             process.exit(1)
//         }
//     }
// }

// blessed => screen
var screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    title: 'multranslate',
    // Добавить кастомный курсор Blessed
    cursor: {
        artificial: true,
        shape: {
            bg: 'white',
            fg: 'white',
            bold: true,
            ch: ''
        },
        blink: false
    }
})

// Панель для ввода текста
const inputBox = blessed.textarea({
    // label: `Input (Alt+C)`,
    top: '0%',
    width: '100%',
    height: '20%',
    inputOnFocus: false, // отключить ввод текста для управления через TextBuffer
    wrap: true, // false для отключения автоматического переноса слов (от 0 до 10 в конце строки после пробела)
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        inverse: true
    },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        },
        scrollbar: {
          bg: 'white'
        }
    }
})

// Панель для отображения перевода из Google
const outputBox1 = blessed.textarea({
    label: `Google (Alt+1)`,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        inverse: true
    },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        },
        scrollbar: {
          bg: 'white'
        }
    }
})

// Панель для отображения перевода из DeepLX
const outputBox2 = blessed.textarea({
    label: `DeepL (Alt+2)`,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        inverse: true
    },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        },
        scrollbar: {
          bg: 'white'
        }
    }
})

// Панель для отображения перевода из Reverso
const outputBox3 = blessed.textarea({
    label: `Reverso (Alt+3)`,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        inverse: true
    },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        },
        scrollbar: {
          bg: 'white'
        }
    }
})

// Панель для отображения перевода из MyMemory
const outputBox4 = blessed.textarea({
    label: `MyMemory (Alt+4)`,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        inverse: true
    },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        },
        scrollbar: {
          bg: 'white'
        }
    }
})

// Панель для отображения перевода из OpenAI (#4)
const outputBox5 = blessed.textarea({
    top: '60%',
    left: '50.5%',
    width: '50%',
    height: '39%',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        inverse: true
    },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'blue'
        },
        scrollbar: {
          bg: 'white'
        }
    }
})

let infoContent = '\x1b[32mCtrl+S\x1b[37m: Translation. \x1b[32mF1\x1b[37m: Get help on Hotkeys.'

// Информация по навигации внизу формы
const infoBox = blessed.text({
    content: infoContent, 
    bottom: 0,
    left: 1,
    right: 0,
    align: 'center',
    style: {
        fg: 'blue',
        bg: 'black'
    }
})

// Информация по горячим клавишам
const hotkeysBox = blessed.box({
    hidden: true, // Скрыть форму
    tags: true, // включить поддержку тегов для разметки
    top: 'center',
    left: 'center',
    right: 'center',
    width: '70%',
    height: '50%',
    border: {
        type: 'line',
    },
    style: {
        fg: 'white',
        bg: 'gray',
        border: {
            fg: 'green',
        },
    }
})

hotkeysBox.setContent(`
  Hotkeys:

    {green-fg}Ctrl+<Enter/S>{/green-fg}:     Translation of text without breaking to a new line
    {cyan-fg}Ctrl+V{/cyan-fg}:             Pasting text from the clipboard
    {cyan-fg}Alt+C{/cyan-fg}:              Copy text from the input field to clipboard
    {cyan-fg}Alt+<1/2/3/4/5>{/cyan-fg}:    Copy translation results to clipboard
    {yellow-fg}Ctrl+<P/Z>{/yellow-fg}:         Move to the previous entry in the translation history
    {yellow-fg}Ctrl+<N/X>{/yellow-fg}:         Move to the next entry in the translation history
    {blue-fg}Shift+<Up/Down>{/blue-fg}:    Simultaneous scrolling of all output panels
    {blue-fg}Ctrl+<Up/Down>{/blue-fg}:     Scrolling the text input panel without changing the cursor position
    {blue-fg}Ctrl+<Left/Right>{/blue-fg}:  Fast cursor navigation through words
    {blue-fg}Ctrl+<A/E>{/blue-fg}:         Move the cursor to the ahead or end of text input
    {blue-fg}Ctrl+<C/U/L>{/blue-fg}:       Clear text input field
    {blue-fg}Ctrl+W/Alt+Back{/blue-fg}:    Delete the word before the cursor
    {blue-fg}Del/Ctrl+K{/blue-fg}:         Deletes one letter or character after the cursor
    {magenta-fg}F2{/magenta-fg}:                 Switch to OpenAI with a preset translation prompt
    {magenta-fg}F3{/magenta-fg}:                 Switch to OpenAI in chat mode
    {red-fg}Escape{/red-fg}:             Exit the program

  * {cyan-fg}Alt{/cyan-fg} = {cyan-fg}Meta{/cyan-fg}/{cyan-fg}Option{/cyan-fg} & {cyan-fg}Ctrl{/cyan-fg} = {cyan-fg}Command{/cyan-fg}/{cyan-fg}Cmd{/cyan-fg} (⌘)

  Version: ${pkg.version}
    
  GitHub Source: https://github.com/Lifailon/multranslate
`)

// Функция для динамической настройки размера окна с переводчиком
function selectWindow(selectedTranslatorHidden) {
    if (selectedTranslatorHidden === "Google") {
        outputBox1.width = '100%'
        outputBox1.height = '79%'
        outputBox1.top = '20%'
        outputBox1.left = '0%'
        outputBox1.hidden = false
        outputBox2.hidden = true
        outputBox3.hidden = true
        outputBox4.hidden = true
        outputBox5.hidden = true
    }
    else if (selectedTranslatorHidden === "DeepL") {
        outputBox2.width = '100%'
        outputBox2.height = '79%'
        outputBox2.top = '20%'
        outputBox2.left = '0%'
        outputBox1.hidden = true
        outputBox2.hidden = false
        outputBox3.hidden = true
        outputBox4.hidden = true
        outputBox5.hidden = true
    }
    else if (selectedTranslatorHidden === "Reverso") {
        outputBox3.width = '100%'
        outputBox3.height = '79%'
        outputBox3.top = '20%'
        outputBox3.left = '0%'
        outputBox1.hidden = true
        outputBox2.hidden = true
        outputBox3.hidden = false
        outputBox4.hidden = true
        outputBox5.hidden = true
    }
    else if (selectedTranslatorHidden === "MyMemory") {
        outputBox4.width = '100%'
        outputBox4.height = '79%'
        outputBox4.top = '20%'
        outputBox4.left = '0%'
        outputBox1.hidden = true
        outputBox2.hidden = true
        outputBox3.hidden = true
        outputBox4.hidden = false
        outputBox5.hidden = true
    }
    else if (selectedTranslatorHidden === "OpenAI") {
        // Иключить перезатирание панели
        outputBox1.height = '0%'
        outputBox2.height = '0%'
        outputBox3.height = '0%'
        outputBox4.height = '0%'
        // Настройка окна
        outputBox5.width = '100%'
        outputBox5.height = '79%'
        outputBox5.top = '20%'
        outputBox5.left = '0%'
        outputBox1.hidden = true
        outputBox2.hidden = true
        outputBox3.hidden = true
        outputBox4.hidden = true
        outputBox5.hidden = false
    }
    else if (selectedTranslatorHidden === "all") {
        selectedTranslator = 'all'
        // Иключить отрисовку 5-й панели
        outputBox5.width = '0%'
        // Настройка окна
        outputBox1.width = '49.5%'
        outputBox1.height = '40%'
        outputBox1.top = '20%'
        outputBox1.left = '0%'
        outputBox2.width = '50%'
        outputBox2.height = '40%'
        outputBox2.top = '20%'
        outputBox2.left = '50.5%'
        outputBox3.width = '49.5%'
        outputBox3.height = '39%'
        outputBox3.top = '60%'
        outputBox3.left = '0%'
        outputBox4.width = '50%'
        outputBox4.height = '39%'
        outputBox4.top = '60%'
        outputBox4.left = '50.5%'
        outputBox1.hidden = false
        outputBox2.hidden = false
        outputBox3.hidden = false
        outputBox4.hidden = false
        outputBox5.hidden = true
    }
    screen.render()
}

selectWindow(selectedTranslator)
outputBox5.setLabel(`OpenAI Translator (Alt+5 or Alt+X)`)

// Добавление панелей на экран
screen.append(inputBox)
screen.append(outputBox1)
screen.append(outputBox2)
screen.append(outputBox3)
screen.append(outputBox4)
screen.append(outputBox5)
screen.append(infoBox)
screen.append(hotkeysBox)

// Вызов окна справки
screen.key(['f1'], function() {
    if (hotkeysBox.hidden === true) {
        hotkeysBox.show()
    } else {
        hotkeysBox.hide()
    }
})

// F2: OpenAI Translator (#4)
screen.key(['f2'], function() {
    if (outputBox5.hidden === true || selectedModeOpenAI === "chat") {
        selectedModeOpenAI = "translate"
        outputBox5.setLabel('OpenAI Translator (Alt+5 or Alt+X)')
        selectedTranslator = "OpenAI"
        selectWindow(selectedTranslator)
    } else {
        selectedTranslator = "all"
        selectWindow(selectedTranslator)
    }
})

// F3: OpenAI Chat
screen.key(['f3'], function() {
    if (outputBox5.hidden === true || selectedModeOpenAI === "translate") {
        selectedModeOpenAI = "chat"
        outputBox5.setLabel('OpenAI Chat (Alt+5 or Alt+X)')
        selectedTranslator = "OpenAI"
        selectWindow(selectedTranslator)
    } else {
        selectedTranslator = "all"
        selectWindow(selectedTranslator)
    }
})

// ------------------------------- Auto-detect Language ---------------------------------

// Функция определения исходного языка
function detectFromLanguage(text) {
    const nonLanguagePattern = /[\s\n\r.,;:!?()\-"']/g
    const englishPattern = /[a-zA-Z]/g
    const cleanText = text.replace(nonLanguagePattern, '')
    const englishMatches = cleanText.match(englishPattern) || []
    const englishCount = englishMatches.length
    const otherLanguageCount = cleanText.length-englishCount
    if (otherLanguageCount >= englishCount) {
        return selectedLanguage
    } else if (otherLanguageCount <= englishCount) {
        return 'en'
    } else {
        return ''
    }
}

// Функция определения целевого языка
function detectToLanguage(lang) {
    if (lang === 'en') {
        return selectedLanguage
    } else if (lang === selectedLanguage) {
        return 'en'
    } else {
        return ''
    }
}

// -------------------------------------- SQLite ----------------------------------------

const dbPath = path.join(__dirname, 'translation-history.db')
const clearHistory = 500 // Количество объектов истории для хранения в базе данных
let maxID = 0
let curID = 0

// Функция для записи в БД
function writeHistory(inputData, googleData, deeplxData, reversoData, mymemoryData, openaiData) {
    const db = new Database(dbPath)
    db.exec(`
        CREATE TABLE IF NOT EXISTS translationTable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inputText TEXT NOT NULL,
            googleText TEXT,
            deeplxText TEXT,
            reversoText TEXT,
            mymemoryText TEXT,
            openaiText TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
    const insert = db.prepare('INSERT INTO translationTable (inputText, googleText, deeplxText, reversoText, mymemoryText, openaiText) VALUES (?, ?, ?, ?, ?, ?)')
    insert.run(
        inputData,
        googleData,
        deeplxData,
        reversoData,
        mymemoryData,
        openaiData
    )
    db.close()
}

// Функция для получения всех уникальных id в БД
function getAllId() {
    const db = new Database(dbPath)
    let result
    const tableExists = db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='translationTable'
    `).get()
    if (tableExists) {
        const data = db.prepare('SELECT * FROM translationTable').all()
        result = data.map(row => row.id)
    }
    else {
        db.close()
        result = []
    }
    db.close()
    return result
}

// Функция для чтения из истории
function readHistory(id) {
    const db = new Database(dbPath)
    const query = `SELECT inputText,googleText,deeplxText,reversoText,mymemoryText,openaiText,created_at FROM translationTable WHERE id = ?`
    const get = db.prepare(query)
    const data = get.get(id)
    db.close()
    return data
}

// Функция для преобразования даны из БД
function parseData(inputDate) {
    const [datePart, timePart] = inputDate.split(' ')
    const [year, month, day] = datePart.split('-')
    return `${timePart} ${day}.${month}.${year}`
}

// Функция для удаления из истории
function deleteHistory(id) {
    const db = new Database(dbPath)
    const query = 'DELETE FROM translationTable WHERE id = ?'
    const del = db.prepare(query)
    del.run(id)
    db.close()
}

// ------------------------------------- TextBuffer -------------------------------------

// Класс для управления текстовым буфером и курсором
class TextBuffer {
    // Инициализация свойств объекта
    constructor() {
        // Содержимое буфера
        this.text = ''
        // Начальная позиция курсора
        this.cursorPosition = 0
    }
    // Метод для перемещения курсора влево в буфере
    moveLeft() {
        // Проверяем, что курсор не находится в начале текста
        if (this.cursorPosition > 0) {
            this.cursorPosition--
        }
    }
    // Метод для перемещения курсора вправо в буфере
    moveRight() {
        // Проверяем, что курсор не находится в конце текста
        if (this.cursorPosition < this.text.length) {
            this.cursorPosition++
        }
    }
    // Метод перемещения курсора для отображения на экране
    viewDisplayCursor() {
        return this.text.slice(0, this.cursorPosition) + '\u2591' + this.text.slice(this.cursorPosition)
    }
    // Метод автонавигации скролла
    navigateScroll(box) {
        // Фиксируем текущее максимальное количество строк и длинну символов в строке с учетом размеров окна
        const maxLines = box.height - 2
        const maxChars = box.width - 4
        // Разбиваем текст на массив из строк
        const bufferLines = this.text.split('\r')
        // Массив из строк (index) и их длинны (value) для определения номера строки текущего положения курсора
        let arrayLinesAndChars = []
        // Проверяем длинну всех строк в массиве
        for (let line of bufferLines) {
            let remainingLine = line
            // Если строка пустая (например, новая пустая строка), добавляем её в массив как отдельную строку
            if (remainingLine === '') {
                arrayLinesAndChars.push(0) // Длина строки - 0 символов
                continue
            }
            while (remainingLine.length > 0) {
                if (remainingLine.length > maxChars) {
                    // Найти последний пробел в пределах maxChars
                    let breakPoint = remainingLine.lastIndexOf(' ', maxChars)
                    // Если пробел не найден, разрываем по количеству символов
                    if (breakPoint === -1) {
                        breakPoint = maxChars
                    }
                    // Вырезаем подстроку до точки разрыва и добавляем в массив
                    let subLine = remainingLine.slice(0, breakPoint).trim()
                    arrayLinesAndChars.push(subLine.length)
                    // Убираем обработанную часть строки
                    remainingLine = remainingLine.slice(breakPoint + 1)
                } else {
                    // Если строка помещается, добавляем её целиком
                    arrayLinesAndChars.push(remainingLine.length)
                    break
                }
            }
        }
        // Определяем строку, на которой располагается курсор в текущей момент
        let lengthCharsAllLines = 0 // длинна всех строк
        let currentLine = 0 // текущая строка
        // Прогоняем все строки сверху вниз
        for (let i in arrayLinesAndChars) {
            // Увеличиваем длинну строки
            lengthCharsAllLines = lengthCharsAllLines + arrayLinesAndChars[i]
            // Проверяем, что текущая позиция курсора (за вычетом длинны массива ?) меньше или равна текущей длинны строки с учетом предыдущих
            if (this.cursorPosition - i <= lengthCharsAllLines) {
                currentLine = parseInt(i) + 1
                break
            }
        }
        // Текущее положение скролла
        const getScroll = box.getScroll()
        // Общее количество строк для скролла
        const getScrollHeight = box.getScrollHeight()
        // Проверяем, выходит ли курсор за пределы видимого диапазона строк
        if (currentLine === 0) {
            box.scrollTo(arrayLinesAndChars.length)
        }
        // Если курсор больше или равен текущей области видимости, поднимаем вверх на 2 строки (-3 ?)
        else if (getScroll >= currentLine) {
            box.scrollTo(currentLine - 3)
        }
        else if (currentLine >= (getScroll + maxLines)) {
            // Опускаем вниз
            const newScrollPos = Math.min(currentLine - maxLines + 1, getScrollHeight)
            box.scrollTo(newScrollPos)
        }
        // Debug output
        // outputBox1.setContent(`currentLine: ${currentLine}\ngetScroll: ${getScroll}`)
    }
    // Метод быстрого перемещения курсора через словосочетания
    navigateFastCursor(type) {
        // Разбиваем буфер на массив из букв
        let charsArray = this.text.split('\r').join(' ').split('')
        if (type === 'left' || type === 'back') {
            if (this.cursorPosition > 0) {
                // Обратный массив от начала буфера до положения курсора
                const charsBeforCursorArray = charsArray.slice(0,this.cursorPosition).reverse()
                let count = charsBeforCursorArray.length
                for (let char of charsBeforCursorArray) {
                    // Уменьшаем позицию курсора, если это не пробел
                    if (char !== ' ') {
                        count--
                    }
                    // Уменьшаем позицию, если курсора уже находится на пробеле
                    else if (count === charsBeforCursorArray.length) {
                        count--
                    }
                    // Уменьшаем позицию, если следующий символ в строке пробел
                    else if (char === ' ' && charsArray[count] === ' ') {
                        count--
                    }
                    else {
                        if (count <= 0) {
                            count = 0
                        } else {
                            count - 1
                        }
                        break
                    }
                }
                // Отдаем значение смещения для удаления словосочетания
                if (type === 'back') {
                    return charsBeforCursorArray.length - count
                }
                else {
                    this.cursorPosition = count
                }
            }
        }
        else if (type === 'right') {
            if (this.cursorPosition < this.text.length) {
                // Массив от позиции курсора до конца текста
                const charsBeforCursorArray = charsArray.slice(this.cursorPosition)
                let count = this.cursorPosition
                for (let char of charsBeforCursorArray) {
                    if (char !== ' ') {
                        count++
                    }
                    else if (count === this.cursorPosition) {
                        count++
                    }
                    else if (char === ' ' && charsArray[count-1] === ' ') {
                        count++
                    }
                    else {
                        if (count >= this.text.length) {
                            count = this.text.length
                        } else {
                            count + 1
                        }
                        break
                    }
                }
                this.cursorPosition = Math.min(count, this.text.length)
            }
        }
    }
    // Метод навигации вверх и вниз
    navigateUpDown(box,type) {
        const maxChars = box.width - 4
        // Массив из строк
        const bufferLines = this.text.split('\r')
        // Массив из длинны всех строк
        let linesArray = []
        // Зафиксировать длинну только реальных строк
        // for (let line of bufferLines) {
        //     linesArray.push(line.length)
        // }
        // Добавляем виртуальные строки при использовании встроенного wrap
        // Фиксируем длинну всех строк
        for (let line of bufferLines) {
            // Добавляем виртуальные строки
            if (line.length > maxChars) {
                // Стартовая позиция для среза
                let startCount = 0
                // Конец строки для среза из максимальной длинны
                let endCount = maxChars
                // Узнаем длинну строк с учетом автопереноса
                while (true) {
                    // Срез текущей строки
                    let count = line.slice(startCount, endCount)
                    // Если достигли конца всех строк (длинна всей строки минус начальная позиция текущего среза меньше длинны строки с учетом переноса), добавляем остаток и завершаем цикл
                    if ((line.length - startCount) < maxChars) {
                        linesArray.push(line.length - startCount)
                        break
                    }
                    // Если достигли конца строки для автопереноса (в 10 символов), добавляем длинну строки целиком, обновляем начальную позицию и конец строки среза для проверки следующей строки 
                    else if (endCount === maxChars-10) {
                        linesArray.push(maxChars - 1) // -1 из за смещения пробелом курсора
                        startCount = startCount + maxChars
                        endCount = endCount + maxChars
                    }
                    // Если последний символ в строке не является пробелом, увеличиваем счетчик конца среза текущей строки
                    else if (count[count.length-1] !== ' ') {
                        endCount--
                    }
                    // Если последний символ в строке содержит пробел, то добавляем строку текущей длинны среза
                    else {
                        linesArray.push(count.length - 1) // -1 из за смещения пробелом курсора
                        startCount = startCount + count.length
                        endCount = endCount + maxChars
                    }
                }
            }
            else {
                linesArray.push(line.length)
            }
        }
        // Счетчик начинается с длинны первой строки
        let charsArray = linesArray[0]
        let cursorLine = 1
        let charToLine = 0
        // Фиксируем на какой строке находится курсор
        for (let lineIndex in linesArray) {
            // Проверяем, что курсор находится в пределах текущей строки
            if (this.cursorPosition <= charsArray) {
                break
            }
            else {
                // Фиксируем позицию курсора в текущей строке
                charToLine = this.cursorPosition - charsArray - 1
                // Увеличиваем длинну символов курсора на длинну символов следующей строки + длинна одного символа переноса строки
                charsArray += linesArray[parseInt(lineIndex) + 1] + 1
                // Увеличиваем счетчик строки
                cursorLine++
            }
        }
        let positionToLine
        if (type === 'up') {
            if (cursorLine > 1) {
                // Фиксируем позицию в строке выше
                if (linesArray[cursorLine-2] >= charToLine) {
                    positionToLine = charToLine
                } else {
                    positionToLine = linesArray[cursorLine-2]
                }
                const linesArraySlice = linesArray.slice(0, cursorLine-2)
                for (let l of linesArraySlice) {
                    positionToLine = positionToLine + l + 1
                }
                this.cursorPosition = positionToLine
            }
        }
        else if (type === 'down') {
            if (cursorLine < linesArray.length) {
                // Если первая строка, обновляем значение текущей позиции в строке
                if (cursorLine === 1) {
                    charToLine = this.cursorPosition
                }
                // Фиксируем позицию в строке ниже
                if (linesArray[cursorLine] >= charToLine) {
                    positionToLine = charToLine
                }
                else {
                    positionToLine = linesArray[cursorLine]
                }
                const linesArraySlice = linesArray.slice(0, cursorLine)
                for (let l of linesArraySlice) {
                    positionToLine = positionToLine + l + 1
                }
                // Корректируем позицию курсора, чтобы она не выходила за пределы текста
                this.cursorPosition = Math.min(positionToLine, this.text.length)
            }
        }
    }
    // Метод отключения нативного курсора
    disableNativeCursor() {
        process.stdout.write('\x1B[?25l')
    }
    // Метод Включения нативного курсора
    enableNativeCursor() {
        process.stdout.write('\x1B[?25h')
    }
    // Метод получения текущей позиции курсора
    getCursorPosition() {
        return this.cursorPosition
    }
    // Метод изменения текущей позиции курсора
    setCursorPosition(int) {
        return this.cursorPosition = int
    }
    // Метод получения содержимого текста из буфера
    getText() {
        return this.text
    }
    // Метод изменения (перезаписи) текста в буфер
    setText(newText) {
        this.text = newText
        // Корректируем позицию курсора, чтобы она не выходила за пределы нового текста
        this.cursorPosition = Math.min(this.cursorPosition, this.text.length)
    }
    // Метод автоматического переноса строки при добавлении нового текста
    autoWrap(newText, box) {
        const maxChars = box.width - 5
        let textArray = newText.split('\r')
        let textString = []
        for (let line of textArray) {
            if (line.length > maxChars) {
                let currentLines = Math.ceil(line.length / maxChars)
                const indices = [...Array(currentLines).keys()]
                for (let i of indices) {
                    let start = i * maxChars
                    let end = start + maxChars
                    let addText = line.slice(start, end)
                    textString.push(addText)
                }
            }
            else {
                textString.push(line)
            }
        }
        this.text = textString.join('\r')
        this.cursorPosition = Math.min(this.cursorPosition, this.text.length)
    }
}

// Создаем экземпляр класса
const buffer = new TextBuffer()

// Скрыть нативный курсор терминала
buffer.disableNativeCursor()

// Обработка нажатий клавиш для управления буфером
inputBox.on('keypress', async function (ch, key) {
    // Debug: вывод комбинации
    // outputBox1.setContent("Name: " + key.name + "\r" + "Full Name: " + key.full + "\r" + "Ctrl: " + key.ctrl + "\r" + "Shift: " + key.shift + "\r" + "Alt: " + key.meta)
    // Перевести курсор в самое начало (A)head или конец (E)nd (like vim #3)
    if (key.name === 'a' && key.ctrl === true || key.name === 'a' && key.Command === true) {
        buffer.setCursorPosition(0)
    }
    else if (
        key.name === 'e' && key.ctrl === true || key.name === 'e' && key.Command === true
    ) {
        buffer.setCursorPosition(buffer.getText().length)
    }
    // Быстрая навигация курсора через слова (Ctrl/Command/Shift/Alt+Left/Right)
    else if (
        key.name === 'left' && key.ctrl === true  || key.name === 'left' && key.Command === true  || key.name === 'left' && key.shift === true  || key.name === 'left' && key.meta === true  || key.full === 'M-left' ||
        key.name === 'right' && key.ctrl === true || key.name === 'right' && key.Command === true || key.name === 'right' && key.shift === true || key.name === 'right' && key.meta === true || key.full === 'M-right'
    ) {
        let replaceKey = key.name.replace("M-","")
        buffer.navigateFastCursor(replaceKey)
    }
    // Назначить методы перемещения курсора на стрелочки (classic Left/Right)
    else if (key.name === 'left' && key.ctrl === false || key.name === 'left' && key.Command === false) {
        buffer.moveLeft()
    }
    else if (key.name === 'right' && key.ctrl === false || key.name === 'right' && key.Command === false) {
        buffer.moveRight()
    }
    // Обработчик событий пролистывания всех панелей вывода (Shift+Up/Down)
    else if (key.name === 'up' && key.shift === true) {
        outputBox1.scroll(-1)
        outputBox2.scroll(-1)
        outputBox3.scroll(-1)
        outputBox4.scroll(-1)

    }
    else if (key.name === 'down' && key.shift === true) {
        outputBox1.scroll(1)
        outputBox2.scroll(1)
        outputBox3.scroll(1)
        outputBox4.scroll(1)

    }
    // Поднимаем поле ввода текста вверх для ручного скроллинга (Ctrl/Alt+Up/Down)
    else if (
        key.name === 'up' && key.ctrl === true || key.name === 'up' && key.Command === true ||
        key.name === 'up' && key.meta === true || key.full === 'M-up'
    ) {
        inputBox.scroll(-1)
    }
    // Опускаем поле ввода текста вниз (Ctrl/Alt+Down)
    else if (
        key.name === 'down' && key.ctrl === true || key.name === 'down' && key.Command === true ||
        key.name === 'down' && key.meta === true || key.full === 'M-down'
    ) {
        inputBox.scroll(1)
    }
    // Навигация курсора между строками (classic Up/Down)
    else if (key.name === 'up') {
        buffer.navigateUpDown(inputBox,'up')
    }
    else if (key.name === 'down') {
        buffer.navigateUpDown(inputBox,'down')
    }
    // Удалить словосочетание перед курсором (Ctrl+W и Alt+Backspace)
    else if (
        key.name === 'w' && key.ctrl === true      || key.name === 'w' && key.Command === true ||
        key.name === 'backspace' && key.meta === true
    ) {
        const backCursorPosition = buffer.navigateFastCursor('back')
        if (buffer.getCursorPosition() > 0) {
            const newText = buffer.getText().slice(0, buffer.getCursorPosition() - backCursorPosition) + buffer.getText().slice(buffer.getCursorPosition())
            buffer.setCursorPosition(buffer.getCursorPosition() - backCursorPosition)
            buffer.setText(newText)
        }
    }
    // Удалить один символ перед курсором (only classic backspace)
    else if (key.name === 'backspace' && key.ctrl === false || key.name === 'backspace' && key.Command === false) {
        // Проверяем, что курсор не находится в начале содержимого буфера
        if (buffer.getCursorPosition() > 0) {
            // Извлекаем текст с первого (нулевого) индекса по порядковый номер положения курсора без последней буквы для ее удаления (-1) и добавляем остаток после курсора до конца содержимого буфера
            const newText = buffer.getText().slice(0, buffer.getCursorPosition() - 1) + buffer.getText().slice(buffer.getCursorPosition())
            // Перемещаем курсор влево после удаления символа
            buffer.moveLeft()
            // Обновляем текст в буфере
            buffer.setText(newText)
        }
    }
    // Удалить один символ после курсора (Del/Ctrl+K)
    else if (
        key.name === 'delete' || 
        key.name === 'k' && key.ctrl === true || key.name === 'k' && key.Command === true
    ) {
        // Проверяем, что курсор не находится в конце содержимого буфера
        if (buffer.getCursorPosition() < buffer.getText().length) {
            const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + buffer.getText().slice(buffer.getCursorPosition() + 1)
            buffer.setText(newText)
        }
    }
    // Переопределяем нажатие Tab, для добавления 4 пробелов
    else if (key.name === 'tab') {
        const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + '    ' + buffer.getText().slice(buffer.getCursorPosition())
        buffer.setCursorPosition(buffer.getCursorPosition() + 4)
        buffer.setText(newText)
    }
    // Обрабатываем перенос строки для Enter (перенос строки добавляется автоматически) без комбинаций с зажатыми клавишами
    else if (key.name === 'return' && key.ctrl === false && key.shift === false && key.meta === false) {
        const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + "" + buffer.getText().slice(buffer.getCursorPosition())
        buffer.setText(newText)
        buffer.moveRight()
    }
    // Асинхронный перевод текста через Ctrl+S/Ctrl+Enter (linefeed) или Enter (return) с любой из зажатых комбинаций клавиш
    else if (
            key.name === 'linefeed' || key.name === 'return' ||
            key.name === 's' && key.ctrl === true
        ) {
            // Debug (отключить перевод для отладки интерфейса)
            await handleTranslation()
            // Сбрасываем покраску после перевода
            inputBox.style.border.fg = 'blue'
            outputBox1.style.border.fg = 'blue'
            outputBox2.style.border.fg = 'blue'
            outputBox3.style.border.fg = 'blue'
            outputBox4.style.border.fg = 'blue'
            outputBox5.style.border.fg = 'blue'
            screen.render()
            inputBox.focus()
    }
    // Обработка очистки буфера текста (Ctrl+C/U/L) - (C)lear
    else if (
        key.name === 'c' && key.ctrl === true || key.name === 'c' && key.Command === true ||
        key.name === 'u' && key.ctrl === true || key.name === 'u' && key.Command === true ||
        key.name === 'l' && key.ctrl === true || key.name === 'l' && key.Command === true
    ) {
        buffer.setText("")
    }
    // Обработка вставки текста из буфера обмена в поле ввода (Ctrl+V)
    else if (key.name === 'v' && key.ctrl === true) {
        let clipboardText = clipboardy.readSync()
        // Обновляем экранирование переноса строки для фиксации при перемещении нативного курсора и обрезаем пробелы в конце строки
        clipboardText = clipboardText.replace(/\n/g, '\r').trim()
        let newText = buffer.getText().slice(0, buffer.getCursorPosition()) + clipboardText + buffer.getText().slice(buffer.getCursorPosition())
        // Добавляем текст из буфера обмена к текущему тексту
        buffer.setText(newText)
        // Перемещаем курсор в конец текста
        buffer.setCursorPosition(buffer.getCursorPosition() + clipboardText.length)
    }
    // Чтение из истории с конца (Ctrl+P/Z) - (P)revious (like vim #3)
    else if (
        key.name === 'p' && key.ctrl === true || key.name === 'p' && key.Command === true ||
        key.name === 'z' && key.ctrl === true || key.name === 'z' && key.Command === true
    ) {
        const allId = getAllId()
        if (allId.length !== 0) {
            let lastId
            if (maxID === 0) {
                lastId = allId[allId.length-1]
                curID = allId.length-1
                maxID = allId.length-1
            }
            else {
                if (curID !== 0) {
                    curID--
                }
                lastId = allId[curID]
            }
            if (lastId) {
                // Извлекаем данные из БД по id
                const lastText = readHistory(lastId)
                const newText = lastText.inputText.replace(/\n/g, '\r')
                // Обновляем статус
                infoBox.content = `${infoContent} History: \x1b[32m${curID+1}\x1b[37m/\x1b[32m${maxID+1}\x1b[37m (${parseData(lastText.created_at)})`
                // Обновляем текст в поле ввода, курсор и текст в окнах вывода
                buffer.setText(newText)
                buffer.setCursorPosition(newText.length)
                outputBox1.setContent(
                    lastText.googleText?.replace(/\n/g, '\r')
                )
                outputBox2.setContent(
                    lastText.deeplxText?.replace(/\n/g, '\r')
                )
                outputBox3.setContent(
                    lastText.reversoText?.replace(/\n/g, '\r')
                )
                outputBox4.setContent(
                    lastText.mymemoryText?.replace(/\n/g, '\r')
                )
                outputBox5.setContent(
                    lastText.openaiText?.replace(/\n/g, '\r')
                )
            }
        }
    }
    // Чтение из истории в обратном порядке (Ctrl+N/X) - (N)ext (like vim #3)
    else if (
        key.name === 'n' && key.ctrl === true || key.name === 'n' && key.Command === true ||
        key.name === 'x' && key.ctrl === true || key.name === 'x' && key.Command === true
    ) {
        const allId = getAllId()
        if (allId.length !== 0) {
            let nextId
            if (maxID === 0) {
                nextId = allId[allId.length-1]
                curID = allId.length-1
                maxID = allId.length-1
            }
            else {
                if (curID !== allId.length-1) {
                    curID++
                }
                nextId = allId[curID]
            }
            if (nextId) {
                const lastText = readHistory(nextId)
                const newText = lastText.inputText.replace(/\n/g, '\r')
                infoBox.content = `${infoContent} History: \x1b[32m${curID+1}\x1b[37m/\x1b[32m${maxID+1}\x1b[37m (${parseData(lastText.created_at)})`
                buffer.setText(newText)
                buffer.setCursorPosition(newText.length)
                outputBox1.setContent(
                    lastText.googleText?.replace(/\n/g, '\r')
                )
                outputBox2.setContent(
                    lastText.deeplxText?.replace(/\n/g, '\r')
                )
                outputBox3.setContent(
                    lastText.reversoText?.replace(/\n/g, '\r')
                )
                outputBox4.setContent(
                    lastText.mymemoryText?.replace(/\n/g, '\r')
                )
                outputBox5.setContent(
                    lastText.openaiText?.replace(/\n/g, '\r')
                )
            }
        }
    }
    // Если нажата любая другая клавиша и она не пустая, добавляем символ в текстовый буффера
    else if (ch) {
        // Обновляем текст, добавляя символом следом за текущей позицией курсора
        const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + ch + buffer.getText().slice(buffer.getCursorPosition())
        // Устанавливаем новый текст в буфер
        buffer.setText(newText)
        // Перемещаем курсор вправо после добавления символа
        buffer.moveRight()
    }
    // Возврат автоматического скроллинга
    if (!(
        (key.name === 'up' && key.ctrl === true)   || (key.name === 'up' && key.Command === true)   || (key.name === 'up' && key.meta === true) ||
        (key.name === 'down' && key.ctrl === true) || (key.name === 'down' && key.Command === true) || (key.name === 'down' && key.meta === true) 
    )) {
        // Обновляем поле ввода текста
        inputBox.setValue(buffer.viewDisplayCursor())
        // Включить автоматический скроллинг
        buffer.navigateScroll(inputBox)
    }
    screen.render()
})

// ----------------------------------- API functions ------------------------------------

// Функция перевода через Google API
// https://github.com/matheuss/google-translate-api
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

// Функция перевода через DeepLX API
// https://github.com/OwO-Network/DeepLX
// https://github.com/LegendLeo/deeplx-serverless
// Source: https://github.com/bropines/Deeplx-vercel
async function translateDeepLX(text) {
    const fromLang = detectFromLanguage(text)
    // Заменяем символы переноса строки (не воспринимается API) на временный символ (©) или экранирование (\\n)
    text = text.replace(/\n/g, '©')
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
        // Обновляем временный символ на перенос строки
        return response.data.data.replace(/©/g, '\n')
        // Нескольк ответов
        // console.log(response.data.alternatives)
    } catch (error) {
        return error.message
    }
}

// Функция перевода через Reverso API (ошибка: Parse Error: Invalid header value char)
async function translateReverso(text) {
    const fromLang = detectFromLanguage(text)
    const toLang = detectToLanguage(fromLang)
    const apiUrl = 'https://api.reverso.net/translate/v1/translation'
    try {
        const response = await axios.post(apiUrl, {
            format: 'text',
            from: fromLang,
            to: toLang,
            input: text,
            options: {
                sentenceSplitter: true,
                origin: 'translation.web',
                contextResults: true,
                languageDetection: true
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
        })
        return response.data.translation.join('')
    } catch (error) {
        return error.message
    }
}

// Функция перевода через Reverso API с использованием Fetch
async function translateReversoFetch(text) {
    const fromLang = detectFromLanguage(text)
    const toLang = detectToLanguage(fromLang)
    const apiUrl = 'https://api.reverso.net/translate/v1/translation'
    // Создаем Promise для timeout в 3 секунды
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 3000)
    )
    try {
        // Выполняем запрос и применяем тайм-аут
        const response = await Promise.race([
            fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    format: 'text',
                    from: fromLang,
                    to: toLang,
                    input: text,
                    options: {
                        sentenceSplitter: true,
                        origin: 'translation.web',
                        contextResults: true,
                        languageDetection: true
                    }
                }),
                headers: {
                    'content-type': 'application/json'
                }
            }),
            timeoutPromise
        ])
        const data = await response.json()
        return data.translation.join('')
    } catch (error) {
        return error.message
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
        // Вернуть несколько ответов
        let results = ''
        if (response.data.matches) {
            response.data.matches.forEach(element => {
                results += element.translation + "\n"
            })
            return results
        }
        // Вернуть один результат перевода
        else {
            return response.data.responseData.translatedText
        }
    } catch (error) {
        return error.message
    }
}

// Функция формирующая system prompt для перевода в LLM
function getPrompt(text) {
    const fromLang = detectFromLanguage(text)
    const toLangCode = detectToLanguage(fromLang)
    const toLang = mapLanguages[toLangCode]
    return `You are a translator. Do not analyze the questions and do not give the answers to them! Translate the text to ${toLang} language. Respond ONLY the contents of the translated text. Do not include other explanations, context or comments in response.`
}

// Функция для отображения статуса загрузки
function loader(action) {
    const loadingStates = ['','.', '..', '...'] 
    let currentIndex = 0
    if (action) {
        global.loadingInterval = setInterval(() => {
            infoBox.content = `${infoContent} Loading${loadingStates[currentIndex]}`
            screen.render()
            currentIndex = (currentIndex + 1) % loadingStates.length
        },
        500
    )
    }
    else if (!action) {
        clearInterval(global.loadingInterval)
    }
}

// Заглушка (mock) для проверки однопоточных ответов OpenAI
// https://github.com/nock/nock
// npm install nock
// import nock from 'nock'
// nock('https://api.openai.com')
//     .persist() // отключить удаление из списка перехватчиков
//     .post('/v1/chat/completions')
//     .reply(200,
//         (uri, requestBody) => {
//             const userMessage = requestBody.messages?.[1]?.content // извлекаем содержимое из тела запроса
//             return {
//                 choices: [
//                     {
//                         message: {
//                             role: 'assistant',
//                             content: `Response from Nock:\n${userMessage}`,
//                         }
//                     }
//                 ]
//             }
//         }
//     )

// https://github.com/typicode/json-server
// npm install -g json-server@0.17.4
// cd mock
// json-server --watch openai.json --routes routes.json

// Функция перевода через OpenAI official API (#4)
// OpenAI API Docs: https://platform.openai.com/docs/api-reference/introduction
// LM Studio: https://lmstudio.ai (0.6.1)
// LM Studio API Docs (OpenAI Compatibility): https://lmstudio.ai/docs/api/endpoints/openai
// npm start -- -o "http://127.0.0.1:1234" -m "deepseek-r1-distill-llama-8b"
// npm start -- -o "http://127.0.0.1:1234" -m "llama-3.2-3b-instruct"
// npm start -- -o "http://127.0.0.1:1234" -m "llama-3-8b-gpt-4o-ru1.0"
async function translateOpenAI(text) {
    const apiUrl = `${openaiUrl}/v1/chat/completions`
    let prompt = ""
    if (selectedModeOpenAI == "translate") {
        prompt = getPrompt(text)
    }
    try {
        // Debug: использовать метод get для заглушки через json-server
        const response = await axios.post(
            apiUrl,
            {
                model: openaiModel,
                messages: [
                    {
                        role: 'system',
                        content: prompt
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                // Температура ответов (от 0.0 до 2.0)
                temperature: openaiTemp,
                // Включаем потоковую передачу ответа (Debug: отключить для заглушки)
                stream: true
            },
            {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                },
                // Debug: отключить для заглушки
                responseType: 'stream'
            }
        )
        // return response.data.choices[0]?.message?.content
        // Собираем ответ из потока
        let fullResponse = ''
        try {
            for await (const data of response.data) {
                // Разбиваем на массив строк (с проверкой закрывающий скобки)
                const dataArray = data.toString().split(/(?<=\})\n\n/)
                // Проходим по каждому элементу массива
                for (const d of dataArray) {
                    // Парсим строки
                    const parsedData = d.replace(/^data:\s*/, '').trim()
                    if (parsedData) {
                        try {
                            // Парсим JSON
                            const parsedJson = JSON.parse(parsedData)
                            const content = parsedJson?.choices[0]?.delta?.content || ''
                            fullResponse += content
                            // Выводим ответ по частям
                            outputBox5.setContent(fullResponse)
                            screen.render()
            
                        } catch (error) {
                            // Игнорируем ошибки парсинга JSON и [DONE] в конце ответа
                        }
                    }
                }
            }
        }
        finally {
            return fullResponse.trim()
        }
    }
    catch (error) {
        // Ошибка при ответе запроса
        if (error.response) {
            let errorData = ''
            try {
                // Обрабатываем поток данных с ошибкой
                errorData = await new Promise((resolve, reject) => {
                    let data = ''
                    error.response.data.on('data', (chunk) => {
                        data += chunk
                    })
                    error.response.data.on('end', () => resolve(data))
                    error.response.data.on('error', (err) => reject(err))
                })
                const parsedError = JSON.parse(errorData)
                const errorMessage = parsedError.error?.message || 'Unknown error'
                return `\x1b[31mError response\x1b[0m: ${errorMessage}\nResponse status: ${error.response.status}`
            } catch (parsingError) {
                // Ошибка при парсинге ошибки json
                return `\x1b[31mError response\x1b[0m: ${errorData}\nResponse status: ${error.response.status}`
            }
        }
        // Ошибка запроса или его обработки
        return `\x1b[31mError\x1b[0m: ${error.message}`
    }
}

// Ollama: https://github.com/ollama/ollama
async function translateOllama(text) {
    const apiUrl = `http://${openaiUrl}/api/generate`
    let prompt
    if (selectedModeOllama == "translate") {
        prompt = getPrompt(text)
    }
    else if (selectedModeOllama == "chat") {
        prompt = text
    }
    try {
        const response = await axios.post(
            apiUrl,
            {
                model: openaiModel,
                prompt: prompt
            },
            {
                headers: {
                  'Content-Type': 'application/json'
                },
                responseType: 'stream'
            }
        )
        // Читаем поток данных (stream) и собираем ответ
        let fullResponse = ''
        for await (const chunk of response.data) {
            const parsedChunk = JSON.parse(chunk.toString())
            fullResponse += parsedChunk.response || ''
        }        
        return fullResponse.trim()
    } catch (error) {
        return `\x1b[31mError\x1b[0m: ${error.message}`
    }
}

// Функция обработки перевода и сохранения в историю
async function handleTranslation() {
    // Заменяем символ возврата каретки на перенос строки без экранирования
    const textToTranslate = buffer.getText().trim().replace(/\r/g, '\n')
    try {
        if (textToTranslate.length > 1) {
            // Запускаем интерфейс загрузки
            loader(true)
            // Вызываем асинхронные запросы к API на перевод
            if (selectedTranslator === "Google") {
                const [
                    translatedText,
                ] = await Promise.all([
                    translateGoogle(textToTranslate)
                ])
                outputBox1.setContent(translatedText)
                writeHistory(textToTranslate,translatedText,null,null,null)
            }
            else if (selectedTranslator === "DeepL") {
                const [
                    translatedText,
                ] = await Promise.all([
                    translateDeepLX(textToTranslate)
                ])
                outputBox2.setContent(translatedText)
                writeHistory(textToTranslate,null,translatedText,null,null,null)
            }
            else if (selectedTranslator === "Reverso") {
                const [
                    translatedText,
                ] = await Promise.all([
                    translateReversoFetch(textToTranslate)
                ])
                outputBox3.setContent(translatedText)
                writeHistory(textToTranslate,null,null,translatedText,null,null)
            }
            else if (selectedTranslator === "MyMemory") {
                const [
                    translatedText,
                ] = await Promise.all([
                    translateMyMemory(textToTranslate)
                ])
                outputBox4.setContent(translatedText)
                writeHistory(textToTranslate,null,null,null,translatedText,null)
            }
            else if (selectedTranslator === "OpenAI") {
                const [
                    translatedText,
                ] = await Promise.all([
                    translateOpenAI(textToTranslate)
                ])
                outputBox5.setContent(translatedText)
                writeHistory(textToTranslate,null,null,null,null,translatedText)
            }
            // else if (selectedTranslator === "Ollama") {
            //     const [
            //         translatedText,
            //     ] = await Promise.all([
            //         translateOllama(textToTranslate)
            //     ])
            //     outputBox5.setContent(translatedText)
            //     writeHistory(textToTranslate,null,null,null,null,translatedText)
            // }
            else if (selectedTranslator === "all") {
                const [
                    translatedText1,
                    translatedText2,
                    translatedText3,
                    translatedText4
                ] = await Promise.all([
                    translateGoogle(textToTranslate),
                    translateDeepLX(textToTranslate),
                    translateReversoFetch(textToTranslate),
                    translateMyMemory(textToTranslate)
                ])
                outputBox1.setContent(translatedText1)
                outputBox2.setContent(translatedText2)
                outputBox3.setContent(translatedText3)
                outputBox4.setContent(translatedText4)
                // Записываем содержимое запросов перевода в базу данных
                writeHistory(
                    textToTranslate,
                    translatedText1,
                    translatedText2,
                    translatedText3,
                    translatedText4,
                    null
                )
            }
            // Определяем id и удаляем старые записи из БД
            const allId = getAllId()
            maxID = allId.length-1
            curID = maxID
            const lastText = readHistory(allId[allId.length-1])
            if (curID >= clearHistory) {
                deleteHistory(allId[0])
                curID--
                maxID--
            }
            // Обновляем статус в интерфейсе
            infoBox.content = `${infoContent} History: \x1b[32m${curID+1}\x1b[37m/\x1b[32m${curID+1}\x1b[37m (${parseData(lastText.created_at)})`
            screen.render()
            inputBox.focus()
        }
    }
    finally {
        loader(false)
    }
}

// ---------------------------------- Clipboard output ----------------------------------

// Обработка копирования вывода в буфер обмена и подцветка выбранного поля вывода (Alt+Q/W/E/R)
inputBox.key(['M-1'], function() {
    const textToCopy = outputBox1.getContent()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'blue'
    outputBox1.style.border.fg = 'green'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

inputBox.key(['M-2'], function() {
    const textToCopy = outputBox2.getContent()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'blue'
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'green'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

inputBox.key(['M-3'], function() {
    const textToCopy = outputBox3.getContent()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'blue'
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'green'
    outputBox4.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

inputBox.key(['M-4'], function() {
    const textToCopy = outputBox4.getContent()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'blue'
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'green'
    screen.render()
    inputBox.focus()
})

inputBox.key(['M-5'], function() {
    const textToCopy = outputBox5.getContent()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'blue'
    outputBox5.style.border.fg = 'green'
    screen.render()
    inputBox.focus()
})

inputBox.key(['M-x'], function() {
    const textToCopy = outputBox5.getContent()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'blue'
    outputBox5.style.border.fg = 'green'
    screen.render()
    inputBox.focus()
})

// Обработка копирования из поля ввода текста в буфер обмена (Alt+C)
inputBox.key(['M-c'], function() {
    const textToCopy = buffer.getText()
    clipboardy.writeSync(textToCopy)
    inputBox.style.border.fg = 'green'
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'blue'
    outputBox5.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

// --------------------------------------------------------------------------------------

inputBox.key(['escape'], function () {
    if (hotkeysBox.hidden === false) {
        hotkeysBox.hide()
        screen.render()
    }
    else {
        return process.exit(0)
    }
})

screen.render()
inputBox.focus()

#!/usr/bin/env node

import blessed from 'blessed'
import axios from 'axios'
import clipboardy from 'clipboardy'

var screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
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
    top: '0%',
    left: 'left',
    width: '100%',
    height: '20%',
    inputOnFocus: false, // Отключаем ввод текста для управления через TextBuffer
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

// Панель для отображения перевода от Google
const outputBox1 = blessed.textarea({
    label: `Google (Ctrl+Q)`,
    top: '20%',
    left: 'left',
    width: '50%',
    height: '40%',
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

// Панель для отображения перевода от DeepLX
const outputBox2 = blessed.textarea({
    label: `DeepL (Ctrl+W)`,
    top: '20%',
    right: 'right',
    left: '51%',
    width: '50%',
    height: '40%',
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

// Панель для отображения перевода от MyMemory
const outputBox3 = blessed.textarea({
    label: `MyMemory (Ctrl+E)`,
    top: '60%',
    left: 'left',
    width: '50%',
    height: '40%',
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

// Панель для отображения перевода от Reverso
const outputBox4 = blessed.textarea({
    label: `Reverso (Ctrl+R)`,
    top: '60%',
    right: 'right',
    left: '51%',
    width: '50%',
    height: '40%',
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

// Информация по навигации внизу формы
const textInfo = blessed.text({
    content: 'Ctrl+C: clear input, Ctrl+<⬆/⬇>: scroll output, Ctrl+<Q/W/E/R>: copy to clipboard, Escape: exit', // ⬅/➡: input navigation
    bottom: 0,
    left: 0,
    right: 0,
    align: 'center',
    style: {
        fg: 'blue',
        bg: 'black'
    }
})

// Добавление панелей на экран
screen.append(inputBox)
screen.append(outputBox1)
screen.append(outputBox2)
screen.append(outputBox3)
screen.append(outputBox4)
screen.append(textInfo)

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
    // Метод для перемещения курсора влево
    moveLeft() {
        // Проверяем, что курсор не находится в начале текста
        if (this.cursorPosition > 0) {
            this.cursorPosition--
        }
    }
    // Метод для перемещения курсора вправо
    moveRight() {
        // Проверяем, что курсор не находится в конце текста
        if (this.cursorPosition < this.text.length) {
            this.cursorPosition++
        }
    }
    // Метод для отображения перемещения курсора
    viewDisplayCursor(box) {
        this.navigateNativeCursor(box)
        return this.text
    }
    // Метод обновления позиции нативного курсора
    navigateNativeCursor(box) {
        // Определяем ширину формы для виртуального переноса строки
        // const maxWidth = process.stdout.columns - 4
        const maxWidth = box.width - 4
        // Разбиваем текст на массив из строк
        let linesArray = this.text.split('\r')
        // Массив для хранения строк с учетом переноса
        // Массив для хранения строк с учетом переноса
        let wrappedLines = []
        // Массив для хранения информации о том, был ли перенос строки виртуальным
        let isVirtualWrap = []
        // Разбиваем каждую строку на виртуальные строки по ширине box
        for (const line of linesArray) {
            let remainingLine = line
            // Разбиваем строку на части, если длина превышает максимальную ширину формы
            while (remainingLine.length > maxWidth) {
                wrappedLines.push(remainingLine.slice(0, maxWidth))
                isVirtualWrap.push(true) // Помечаем, что это был виртуальный перенос
                remainingLine = remainingLine.slice(maxWidth)
            }
            // Добавлять остаток строки
            wrappedLines.push(remainingLine)
            isVirtualWrap.push(false) // Это остаток строки, и здесь может быть настоящий перенос
        }
        // Определяем строку, в которой находится курсор буфера (cursorPosition)
        let currentLine = 0
        let totalChars = 0
        for (let i in wrappedLines) {
            // Если строка была перенесена виртуально, не добавлять +1 за символ новой строки
            let lineLength = wrappedLines[i].length
            if (!isVirtualWrap[i]) {
                lineLength += 1 // +1 для символа \r только для реальных переносов
            }
            totalChars += lineLength
            // Если позиция курсора попадает в текущую строку
            if (this.cursorPosition < totalChars) {
                currentLine = Number(i)
                break
            }
        }
        // Рассчитываем позицию курсора в пределах текущей строки
        let charPositionInLine = this.cursorPosition - (totalChars - wrappedLines[currentLine].length)
        if (isVirtualWrap[currentLine]) {
            // Для виртуальных строк (перенесенных) не нужно учитывать символ новой строки
            charPositionInLine = this.cursorPosition - (totalChars - wrappedLines[currentLine].length)
        } else {
            // Для реальных строк добавить -1, чтобы скорректировать расчёт
            charPositionInLine = this.cursorPosition - (totalChars - wrappedLines[currentLine].length - 1)
        }
        // Если позиция вышла за пределы строки, корректируем её
        if (charPositionInLine < 0) {
            currentLine--
            charPositionInLine = wrappedLines[currentLine].length + charPositionInLine
        }
        // Узнаем максимальное количество отображаемых строк формы
        const maxLine = box.height - 3
        const bottomVisibleLine = maxLine + maxLine - 2
        // Скроллим вверх вверх или вниз
        if (currentLine < maxLine) {
            box.scrollTo(Math.max(0, currentLine))
        } else if (currentLine > bottomVisibleLine) {
            box.scrollTo(currentLine - maxLine + 1)
        }
        // Синхронизируем нативный курсор с текущей позицией
        const visibleBase = box.childBase || 0
        const adjustedLine = currentLine - visibleBase
        // Ограничиваем текущую строку в пределах видимой области
        if (adjustedLine >= maxLine) {
            currentLine = maxLine - 1
        }
        // Добавляем отступы по умолчанию (по два сверху и слева), чтобы курсор не выходил за пределы формы
        const line = adjustedLine + 2
        const char = charPositionInLine + 2
        // Перемещаем нативный курсор
        process.stdout.write(`\x1B[${line};${char}H`)
        return
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
    // Метод для изменения (перезаписи) текста в буфер
    setText(newText) {
        this.text = newText
        // Корректируем позицию курсора, чтобы она не выходила за пределы нового текста
        this.cursorPosition = Math.min(this.cursorPosition, this.text.length)
    }
}

// Создаем экземпляр класса
const buffer = new TextBuffer()

// Отключить магиние нативного курсора
process.stdout.write('\x1B[?12l')
// Скрыть нативный курсор терминала для использования только кастомного курсора
// buffer.disableNativeCursor()

// Обновляем поле ввода текста для имитации мигания кастомного курсора или смена фокуса при перемещении для нативного курсора
setInterval(
    () => {
        inputBox.setValue(buffer.viewDisplayCursor(inputBox))
        screen.render()
  },
  1 // 1 для нативного курсора или 500 для кастомного курсора
)

// Обработка нажатий клавиш для управления буфером
inputBox.on('keypress', function (ch, key) {
    // Назначить методы перемещения курсора на стрелочки
    if (key.name === 'left') {
        buffer.moveLeft()
    }
    else if (key.name === 'right') {
        buffer.moveRight()
    }
    else if (key.name === 'backspace') {
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
    else if (key.name === 'delete') {
        // Проверяем, что курсор не находится в конце содержимого буфера
        if (buffer.getCursorPosition() < buffer.getText().length) {
            const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + buffer.getText().slice(buffer.getCursorPosition() + 1)
            buffer.setText(newText)
        }
    }
    // Переопределяем нажатие Enter, не добавляя дополнительный символ переноса строки
    else if (key.name === 'enter') {
        const newText = buffer.getText()
        buffer.setText(newText)
    }
    // Если нажата любая другая клавиша и она не пустая, добавляем символ в текст
    else if (ch) {
        // Обновляем текст, добавляя символом следом за текущей позицией курсора
        const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + ch + buffer.getText().slice(buffer.getCursorPosition())
        // Устанавливаем новый текст в буфер
        buffer.setText(newText)
        // Перемещаем курсор вправо после добавления символа
        buffer.moveRight()
    }
    // Обновляем поле ввода текста
    inputBox.setValue(buffer.viewDisplayCursor(inputBox))
    screen.render()
})

// Перевести курсор в самое начало или конец текст
inputBox.key(['C-left', 'C-right'], function(ch, key) {
    // Скроллим вверх
    if (key.name === 'left') {
        buffer.setCursorPosition(0)
    }
    // Скроллим вниз
    else if (key.name === 'right') {
        buffer.setCursorPosition(buffer.getText().length)
    }
})

// --------------------------------------------------------------------------------------

// Функция определения исходного языка
function detectFromLanguage(text) {
    const russianPattern = /[а-яА-Я]/g
    const englishPattern = /[a-zA-Z]/g
    const russianMatches = text.match(russianPattern) || []
    const englishMatches = text.match(englishPattern) || []
    const russianCount = russianMatches.length
    const englishCount = englishMatches.length
    if (russianCount >= englishCount) {
        return 'ru'
    } else if (russianCount <= englishCount) {
        return 'en'
    } else {
        return ''
    }
}

// Функция определения целевого языка
function detectToLanguage(lang) {
    if (lang === 'ru') {
        return 'en'
    } else if (lang === 'en') {
        return 'ru'
    } else {
        return ''
    }
}

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

// Функция обработки перевода
async function handleTranslation() {
    // Заменяем символ возврата каретки на перенос строки без экранирования
    const textToTranslate = buffer.getText().trim().replace(/\r/g, '\n')
    if (textToTranslate) {
        const [
            translatedText1,
            translatedText2,
            translatedText3,
            translatedText4
        ] = await Promise.all([
            translateGoogle(textToTranslate),
            translateDeepLX(textToTranslate),
            translateMyMemory(textToTranslate),
            translateReversoFetch(textToTranslate)
        ])
        outputBox1.setContent(translatedText1)
        outputBox2.setContent(translatedText2)
        outputBox3.setContent(translatedText3)
        outputBox4.setContent(translatedText4)
        screen.render()
        // Вернуть фокус на inputBox
        inputBox.focus()
    }
}

// --------------------------------------------------------------------------------------

// Обработка нажатия Enter для перевода текста вместе с переносом на новую строку
inputBox.key(['enter'], async () => {
    // Debug (отключить вызов функций перевода для отладки интерфейса)
    await handleTranslation()
})

// Обработка вставка текста из буфера обмена в поле ввода
inputBox.key(['C-v'], function() {
    clipboardy.read().then(text => {
        // Обновляем экранирование переноса строки для фиксации при перемещении нативного курсора
        text = text.replace(/\n/g, '\r')
        // Добавляем текст из буфера обмена к текущему тексту
        buffer.setText(buffer.getText() + text)
        // Перемещаем курсор в конец текста
        buffer.cursorPosition = buffer.getText().length
        inputBox.setValue(buffer.viewDisplayCursor(inputBox))
        screen.render()
    })
})

// Обработка копирования вывода в буфер обмена
inputBox.key(['C-q'], function() {
    const textToCopy = outputBox1.getContent()
    clipboardy.writeSync(textToCopy)
    outputBox1.style.border.fg = 'green'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

inputBox.key(['C-w'], function() {
    const textToCopy = outputBox2.getContent()
    clipboardy.writeSync(textToCopy)
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'green'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

inputBox.key(['C-e'], function() {
    const textToCopy = outputBox3.getContent()
    clipboardy.writeSync(textToCopy)
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'green'
    outputBox4.style.border.fg = 'blue'
    screen.render()
    inputBox.focus()
})

inputBox.key(['C-r'], function() {
    const textToCopy = outputBox4.getContent()
    clipboardy.writeSync(textToCopy)
    outputBox1.style.border.fg = 'blue'
    outputBox2.style.border.fg = 'blue'
    outputBox3.style.border.fg = 'blue'
    outputBox4.style.border.fg = 'green'
    screen.render()
    inputBox.focus()
})

// Обработчик событий клавиш для пролистывания экрана панелей вывода: Ctrl+<Up/Down>
inputBox.key(['C-up', 'C-down'], function(ch, key) {
    // Скроллим вверх
    if (key.name === 'up') {
        outputBox1.scroll(-1)
        outputBox2.scroll(-1)
        outputBox3.scroll(-1)
        outputBox4.scroll(-1)
    }
    // Скроллим вниз
    else if (key.name === 'down') {
        outputBox1.scroll(1)
        outputBox2.scroll(1)
        outputBox3.scroll(1)
        outputBox4.scroll(1)
    }
})

// Обработка очистки экрана
inputBox.key(['C-c'], function () {
    buffer.setText("")
    inputBox.setValue(buffer.viewDisplayCursor(inputBox))
    screen.render()
})

// Обработка выхода
inputBox.key(['escape'], function () {
    return process.exit(0)
})

// Отображение интерфейса
screen.render()

// Установить фокус на поле ввода
inputBox.focus()
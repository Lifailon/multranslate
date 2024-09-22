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

const infoText = 'Ctrl+C: clear input, Ctrl+<A/D>: go to start or end, Ctrl+<Q/W/E/R>: copy to clipboard, Escape: exit'
// ⬆/⬇: scroll output, ⬅/➡: input navigation, Ctrl+<⬅/➡>: fast navigation

// Информация по навигации внизу формы
const textInfo = blessed.text({
    content: infoText, 
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
        // Забираем реальное количество строк
        let viewLines = bufferLines.length
        // Массив из строк (index) и их длинны (value) для определения номера строки текущего положения курсора
        let arrayLinesAndChars = []
        // Проверяем длинну всех строк в массиве
        for (let line of bufferLines) {
            // Увеличиваем количество видимых строк, если длина реальной строки больше максимальной
            if (line.length > maxChars) {
                // Получаем целое число строк максимальной длинны без остатка текущей строки, которая уже присутствует
                let viewCurrentLines = Math.floor(line.length / (maxChars))
                // Добавляем дополнительные видимые строки к реальным
                viewLines = viewLines + viewCurrentLines
                // Формируем массив количества строк из дополнительных строк и основной (+1)
                let viewCurrentLinesArray = Array(viewCurrentLines+1).fill().map((_, i) => i)
                // Добавляем длинну всех строк в массив
                for (let l of viewCurrentLinesArray) {
                    // Добавляем во все строки максимальное количество строк, если это не последняя строка
                    if (l !== viewCurrentLinesArray[viewCurrentLinesArray.length-1]) {
                        arrayLinesAndChars.push(maxChars)
                    }
                    // Добавляем остаток символов в последнюю строку
                    else {
                        arrayLinesAndChars.push(line.length-(maxChars*viewCurrentLinesArray[viewCurrentLinesArray.length-1]))
                    }
                }
            }
            else {
                // Добавляем длинну строки в массив
                arrayLinesAndChars.push(line.length)
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
        if (currentLine <= getScroll) {
            // Если курсор выше или равен текущей области видимости, поднимаем вверх на 2 строки (-3 ?)
            box.scrollTo(currentLine - 3)
        } else if (currentLine >= (getScroll + maxLines)) {
            // Опускаем вниз
            const newScrollPos = Math.min(currentLine - maxLines + 1, getScrollHeight)
            box.scrollTo(newScrollPos)
        }
        // Debug output
        // outputBox1.setContent(`${maxLines} ${maxChars} | ${viewLines} ${currentLine}`)
        // outputBox2.setContent(box.getScroll())
        // outputBox3.setContent(box.getScrollHeight())
        // outputBox4.setContent(box.getScrollPerc())
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
                this.cursorPosition = count
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
    // Метод для изменения (перезаписи) текста в буфер
    setText(newText) {
        this.text = newText
        // Корректируем позицию курсора, чтобы она не выходила за пределы нового текста
        this.cursorPosition = Math.min(this.cursorPosition, this.text.length)
    }
}

// Создаем экземпляр класса
const buffer = new TextBuffer()

// Скрыть нативный курсор терминала
buffer.disableNativeCursor()

// Обработка нажатий клавиш для управления буфером
inputBox.on('keypress', function (ch, key) {
    // Перевести курсор в самое начало или конец текст
    if (key.name === 'a' && key.ctrl === true) {
        buffer.setCursorPosition(0)
    }
    else if (key.name === 'd' && key.ctrl === true) {
        buffer.setCursorPosition(buffer.getText().length)
    }
    // Быстрая навигация курсора через слова
    else if (key.name === 'left' && key.ctrl === true) {
        buffer.navigateFastCursor('left')
    }
    else if (key.name === 'right' && key.ctrl === true) {
        buffer.navigateFastCursor('right')
    }
    // Назначить методы перемещения курсора на стрелочки
    else if (key.name === 'left' && key.ctrl === false) {
        buffer.moveLeft()
    }
    else if (key.name === 'right' && key.ctrl === false) {
        buffer.moveRight()
    }
    // Поднимаем поле ввода текста вверх для ручного скроллинга
    // else if (key.name === 'up') {
    //     inputBox.scroll(-1)
    // }
    // Опускаем поле ввода текста вниз
    // else if (key.name === 'down') {
    //     inputBox.scroll(1)
    // }
    // Удалить словосочетание перед курсором
    else if (key.name === 'delete' && key.ctrl === true) {
        const backCursorPosition = buffer.navigateFastCursor('back')
        if (buffer.getCursorPosition() > 0) {
            const newText = buffer.getText().slice(0, buffer.getCursorPosition() - backCursorPosition) + buffer.getText().slice(buffer.getCursorPosition())
            buffer.setCursorPosition(buffer.getCursorPosition() - backCursorPosition)
            buffer.setText(newText)
        }
    }
    // Удалить символ перед курсором
    else if (key.name === 'backspace' && key.ctrl === false) {
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
    
    // Удалить символ после курсором
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
    // Фиксируем текущую позицию для ручного скроллинга
    let currentScrollIndex = inputBox.getScroll()
    // Обновляем поле ввода текста
    inputBox.setValue(buffer.viewDisplayCursor())
    // Включить ручной скроллинг
    // if (key.name !== 'up' && key.name !== 'down') {
    //     // Если это не скролл вручную, скролим назад к текущей позиции после обновления текста
    //     inputBox.scrollTo(currentScrollIndex)
    //     // Если длина буфера и положение курсора совпадают, скролим в самый низ
    //     if (buffer.getText().length === buffer.getCursorPosition()) {
    //         inputBox.setScrollPerc(100)
    //     }
    //     // Если курсор в самом начале буфера, поднимаем в самый вверх
    //     else if (buffer.getCursorPosition() === 0) {
    //         inputBox.setScrollPerc(1)
    //     }
    // }
    // Включить автоматический скроллинг
    buffer.navigateScroll(inputBox)
    screen.render()
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
    // Debug (отключить для отладки интерфейса)
    // await handleTranslation()
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
        inputBox.setValue(buffer.viewDisplayCursor())
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

// Обработчик событий клавиш для пролистывания экрана панелей вывода: <Up/Down> или Ctrl+<Up/Down>
// inputBox.key(['C-up', 'C-down'], function(ch, key) {
inputBox.key(['up', 'down'], function(ch, key) {
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
    inputBox.setValue(buffer.viewDisplayCursor())
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
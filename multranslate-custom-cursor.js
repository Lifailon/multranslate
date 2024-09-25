#!/usr/bin/env node

import blessed from 'blessed'
import axios from 'axios'
import clipboardy from 'clipboardy'
import * as sqlite from 'sqlite'
import sqlite3 from 'sqlite3'

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
    wrap: true, // Откоючить автоматический перенос слов для управления через метод autoWrap()
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

const infoText = 'Ctrl+C: clear input, Ctrl+<A/D>: go to start or end, Shift+<⬆/⬇>: scroll output, Ctrl+<Q/W/E/R>: copy to clipboard, Escape: exit'
// Enter: translate, <⬅/➡/⬆/⬇>: input navigation, Ctrl+<⬆/⬇> - scroll input, Ctrl+<⬅/➡>: fast navigation, Ctrl+Del: delete word before cursor

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
                for (let i = 0; i < currentLines; i++) {
                    let start = i * maxChars
                    let end = start + maxChars
                    let addText = line.slice(start, end)
                    textString.push(addText)
                }
            } else {
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
    // Обработчик событий пролистывания панелей вывода
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
    // Поднимаем поле ввода текста вверх для ручного скроллинга
    else if (key.name === 'up' && key.ctrl === true) {
        inputBox.scroll(-1)
    }
    // Опускаем поле ввода текста вниз
    else if (key.name === 'down' && key.ctrl === true) {
        inputBox.scroll(1)
    }
    // Навигация курсора между строками
    else if (key.name === 'up') {
        buffer.navigateUpDown(inputBox,'up')
    }
    else if (key.name === 'down') {
        buffer.navigateUpDown(inputBox,'down')
    }
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
    // Переопределяем нажатие Tab, для добавления 4 пробелов
    else if (key.name === 'tab') {
        const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + '    ' + buffer.getText().slice(buffer.getCursorPosition())
        buffer.setCursorPosition(buffer.getCursorPosition() + 4)
        buffer.setText(newText)
    }
    // Переопределяем нажатие Enter, не добавляя дополнительный символ переноса строки
    else if (key.name === 'enter') {
        const newText = buffer.getText()
        buffer.setText(newText)
    }
    // Обработка очистки бефра
    else if (key.name === 'c' && key.ctrl === true) {
        buffer.setText("")
    }
    // Обработка вставки текста из буфера обмена в поле ввода
    else if (key.name === 'v' && key.ctrl === true) {
        let clipboardText = clipboardy.readSync()
        // Обновляем экранирование переноса строки для фиксации при перемещении нативного курсора
        clipboardText = clipboardText.replace(/\n/g, '\r')
        let newText = buffer.getText().slice(0, buffer.getCursorPosition()) + clipboardText + buffer.getText().slice(buffer.getCursorPosition())
        // Добавляем текст из буфера обмена к текущему тексту
        buffer.setText(newText)
        // Перемещаем курсор в конец текста
        buffer.setCursorPosition(buffer.getCursorPosition() + clipboardText.length)
    }
    // Если нажата любая другая клавиша и она не пустая, добавляем символ в текст
    else if (ch) {
        // Обновляем текст, добавляя символом следом за текущей позицией курсора
        const newText = buffer.getText().slice(0, buffer.getCursorPosition()) + ch + buffer.getText().slice(buffer.getCursorPosition())
        // Устанавливаем новый текст в буфер
        buffer.setText(newText)
        // // Используем метод автоматического переноса строки для записи нового текста
        // const beforeText = buffer.getText().split('\r').length
        // buffer.autoWrap(newText,inputBox)
        // const afterText = buffer.getText().split('\r').length
        // // Добавить сдвиг курсора, если это перенос вызван добавлением новой строки за исключением Enter
        // if (afterText > beforeText && key.name !== 'return') {
        //     buffer.setCursorPosition(buffer.getCursorPosition()+1)
        // }
        // Перемещаем курсор вправо после добавления символа
        buffer.moveRight()
    }
    // Добавить ручной скроллинг
    if (!((key.name === 'up' && key.ctrl === true) || (key.name === 'down' && key.ctrl === true))) {
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
    if (textToTranslate.length > 1) {
        // Записываем содержимое запросов перевода в базу данных
        writeHistory(textToTranslate)
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
        inputBox.focus()
    }
}

// Обработка нажатия Enter для перевода текста вместе с переносом на новую строку
inputBox.key(['enter'], async () => {
    // Debug (отключить перевод для отладки интерфейса)
    await handleTranslation()
})

// -------------------------------------- SQLite ----------------------------------------

async function writeHistory(data) {
    const db = await sqlite.open({
        filename: './translation-history.db',
        driver: sqlite3.Database
    })
    await db.exec(`
        CREATE TABLE IF NOT EXISTS translationTable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inputText TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
    await db.run('INSERT INTO translationTable (inputText) VALUES (?)', [data])
    await db.close()
}

async function readHistory(id) {
    const db = await sqlite.open({
        filename: './translation-history.db',
        driver: sqlite3.Database
    })
    const query = 'SELECT inputText FROM translationTable WHERE id = ?'
    const data = await db.get(query, [id])
    await db.close()
    return data
}

async function getAllId() {
    const db = await sqlite.open({
        filename: './translation-history.db',
        driver: sqlite3.Database
    })
    const data = await db.all('SELECT * FROM translationTable')
    await db.close()
    return data.map(row => row.id)
}

// else if (key.name === 'z' && key.ctrl === true) {
//     (async () => {
//         const allId = await getAllId()
//         const lastId = allId[allId.length-1]
//         const lastText = await readHistory(lastId)
//         const newText = lastText.inputText.replace(/\n/g, '\r')
//         // console.log(newText)
//         buffer.setText(newText)
//         buffer.setCursorPosition(newText.length)
//     })()
// }

async function getHistory() {
    const allId = await getAllId()
    const lastId = allId[allId.length-1]
    const lastText = await readHistory(lastId)
    const newText = lastText.inputText.replace(/\n/g, '\r')
    buffer.setText(newText)
    buffer.setCursorPosition(newText.length)
}

// Обработка нажатия Enter для перевода текста вместе с переносом на новую строку
inputBox.key(['C-z'], async () => {
    await getHistory()
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

// Обработка копирования вывода в буфер обмена и подцветка выбранного поля вывода
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

inputBox.key(['escape'], function () {
    return process.exit(0)
})

screen.render()
inputBox.focus()
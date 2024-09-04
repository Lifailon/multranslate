const blessed = require('blessed')
const axios = require('axios')

const screen = blessed.screen()

// Панель для ввода текста
const inputBox = blessed.textarea({
    top: '0%',
    left: 'left',
    width: '100%',
    height: '20%',
    inputOnFocus: true,
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
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от Google
const outputBox1 = blessed.textarea({
    label: `Output (Google)`,
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
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от DeepLX
const outputBox2 = blessed.textarea({
    label: `Output (DeepLX)`,
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
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от MyMemory
const outputBox3 = blessed.textarea({
    label: `Output (MyMemory)`,
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
        bg: 'transparent',
        border: {
            fg: 'white'
        }
    }
})

// Панель для отображения перевода от Reverso
const outputBox4 = blessed.textarea({
    label: `Output (Reverso)`,
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
screen.append(outputBox4)

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
    const textToTranslate = inputBox.getValue().trim()
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

// Обработка нажатия Enter
inputBox.key(['enter'], async () => {
    await handleTranslation()
})

// Обработчик событий клавиш для перемотки экрана
inputBox.key(['up', 'down', 'left', 'right'], function(ch, key) {
    const value = inputBox.getValue()
    // Прокрутка вверх
    if (key.name === 'up') {
        outputBox1.scroll(-1)
        outputBox2.scroll(-1)
        outputBox3.scroll(-1)
        outputBox4.scroll(-1)
    }
    // Прокрутка вниз
    else if (key.name === 'down') {
        outputBox1.scroll(1)
        outputBox2.scroll(1)
        outputBox3.scroll(1)
        outputBox4.scroll(1)
    }
    // else if (key.name === 'left') {
    //     const currentPos = inputBox.getValue().length
    //     inputBox.setValue(inputBox.getValue().slice(0, currentPos - 1))
    //     screen.render()
    // }
    // else if (key.name === 'right') {
    //     const currentPos = inputBox.getValue().length
    //     inputBox.setValue(inputBox.getValue().slice(0, currentPos + 1))
    //     screen.render()
    // }
})

// Обработка нажатия клавиши для очистки экрана и выхода
screen.key(['escape'], function () {
    if (inputBox.getValue().length > 0) {
        inputBox.clearValue()
        screen.render()
        inputBox.focus()
    } else {
        // Выйти из приложения, если inputBox пустой
        return process.exit(0)
    }
})

// Отображение интерфейса
screen.render()
// Установить фокус на поле ввода
inputBox.focus()
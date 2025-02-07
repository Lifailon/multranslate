<h2 align="center">
    multranslate
</h2>

<p align="center">
<a href="https://www.npmjs.com/package/multranslate"><img title="NPM"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
<a href="https://www.npmjs.com/package/multranslate"><img title="Language"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
<a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
 <a href="README.md">English</a> | <strong>Русский</strong>
</h4>

Кроссплатформенный терминальный пользовательский интерфейс на базе библиотеки [Blessed](https://github.com/chjj/blessed) для одновременного перевода текста с использованием нескольких популярных источников перевода и `LLM`. Все источники не требуют токена доступа к API (за исключением официального OpenAI). Поддерживает автоматическое определение исходного и целевого языка на уровне кода между английским и любым из поддерживаемых языков (русский по умолчанию), а также доступ к истории переводов через [SQLite](https://github.com/WiseLibs/better-sqlite3) (до 500 запросов, после чего используется автоматическая очистка старых записей из истории).

![interface](/image/interface.jpg)

## Источники перевода

- [Google](https://translate.google.com) - бесплатный и безлимитный [API](https://github.com/vitalets/google-translate-api) с использованием [serverless](https://github.com/olavoparno/translate-serverless-vercel) размещенный на платформе Vercel. Доступно для перевода более 5000 символов.
- [DeepL](https://www.deepl.com) - бесплатный `API` через [DeepLX](https://github.com/OwO-Network/DeepLX) с использованием [serverless](https://github.com/LegendLeo/deeplx-serverless) размещенный на платформе [Vercel](https://github.com/bropines/Deeplx-vercel). Присутствуют ограничения на частое количество запросов перевода, а также может иметь ограничение при использование большого количества символов (официальное ограничение в 5000 символов на запрос).
- [Reverso](https://www.reverso.net) - самый стабильный, бесплатный и без ограничений на количество символов (версия на сайте ограничена 2000 символам и 900 в приложение, через `API` возможно получить до 8000). Не содержит официальной документации, запрос был получен с официального сайта через *DevTools*.
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - бесплатный и открытый `API` (ограничение в 500 символов на запрос). Поддерживает до 3 вариантов ответа для коротких запросов.
- [OpenAI](https://platform.openai.com/docs/overview) - использование `LLM` с предустановленным ситемным `prompt` через официальный OpenAI (необходимо передать ключ `API` через параметр `--key` или переменную окружения `OPENAI_API_KEY`) или [LM Studio](https://lmstudio.ai) для использования локальных моделей в автономном режиме (схема запросов и ответов `API` соответствуют OpenAI). Рекомендуется выбрать модель, предварительно обученную на нужном языке (например, используя фильтр `translation` на [Hugging Face](https://huggingface.co/models?pipeline_tag=translation)).

## Установка

Используйте менеджер пакетов [npm](https://www.npmjs.com/package/multranslate) для установки стабильной версии:

```shell
npm install -g multranslate
```

Или установите из репозитория GitHub:

```shell
npm install -g https://github.com/Lifailon/multranslate
```

Запустите приложение:

```shell
multranslate
```

Получите справку:

```shell
multranslate --help

Usage: multranslate [options]

Cross-platform TUI for translating text in multiple translators simultaneously and LLM, with support for
translation history and automatic language detection.

Options:
  -V, --version            output the version number
  -l, --language <name>    Select the language: ru, ja, zh, ko, ar, tr, uk, sk, pl, de, fr, it, es, el, hu, nl,
  sv, ro, cs, da, pt, vi (default: "ru")
  -t, --translator <name>  Select the translator: all, Google, DeepL, Reverso, MyMemory, OpenAI (default: "all")
  -k, --key <value>        API key parameter for OpenAI (high priority) or using the environment "OPENAI_API_KEY"
  -o, --openaiUrl <url>    Url address for OpenAI API or local LLM (default: "https://api.openai.com" or the environment "OPENAI_URL")
  -m, --model <name>       Select the LLM model (default: "gpt-4o-mini" or the environment "OPENAI_MODEL")
  -e, --temp <number>      Select the temperature for LLM (default: "0.7" or the environment "OPENAI_TEMP")
  -h, --help               display help for command
```

Для использования OpenAI необходимо передать параметры для подключения к `API` (имеет высокий приоритет) или использовать переменные окружения.

Пример для Linux и OpenAI:

```Bash
export OPENAI_API_KEY="sk-proj-..."
multranslate
```

Вы можете сохранить переменную окружения для дальнейшего использования после переподключения к текущей сессии терминала.

```Bash
echo 'export OPENAI_API_KEY="sk-proj-..."' >> ~/.bashrc
source ~/.bashrc
```

Рекомендуется вносить изменения в файл профиля через любой текстовый редактор, например, `nano`, что бы содержимое ключа не сохранялось в истории команд.

Пример для Windows и LM Studio:

```PowerShell
$env:OPENAI_URL = "http://127.0.0.1:1234"
$env:OPENAI_MODEL = "llama-3-8b-gpt-4o-ru1.0"
multranslate
```

## Сборка

Клонируйте репозиторий:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Установите зависимости и запустите приложения:

```shell
npm install
npm start
```

## Поддерживаемые языки

Вы можете изменить язык, для автоматического определения между английским и любым из тех, что представлен в таблице ниже:

| Параметр  | Язык                      |
| -         | -                         |
| ru        | Русский (по умолчанию)    |
| ja        | Японский                  |
| zh        | Китайский                 |
| ko        | Корейский                 |
| ar        | Арабский                  |
| tr        | Турецкий                  |
| uk        | Украинский                |
| sk        | Словацкий                 |
| pl        | Польский                  |
| de        | Немецкий                  |
| fr        | Французский               |
| it        | Итальянский               |
| es        | Испанский                 |
| el        | Греческий                 |
| hu        | Венгерский                |
| nl        | Нидерландский             |
| sv        | Шведский                  |
| ro        | Румынский                 |
| cs        | Чешский                   |
| da        | Датский                   |
| pt        | Португальский ([#1](https://github.com/Lifailon/multranslate/issues/1))        |
| vi        | Вьетнамский ([#2](https://github.com/Lifailon/multranslate/issues/2))          |

Производится анализ всех переданных букв для их сравнения между английским алфавитом и указанным языком в параметре `--language`.

Вы также можете использовать любой из переводчиков по отдельности, указав соответствующий параметр при запуске:

<table>
    <tr>
        <td><code>multranslate --translator Google --language tr</code>
        </td>
        <td><code>multranslate --translator DeepL --language de</code>
        </td>
    </tr>
    <tr>
        <td><img src=/image/google-tr.jpg width=600/></td>
        <td><img src=/image/deepl-de.jpg width=600/></td>
    </tr>
    <tr>
        <td><code>multranslate --translator Reverso --language it</code>
        </td>
        <td><code>multranslate --translator MyMemory --language es</code>
        </td>
    </tr>
    <tr>
        <td><img src=/image/reverso-it.jpg width=600/></td>
        <td><img src=/image/mymemory-es.jpg width=600/></td>
    </tr>
</table>

## Горячие клавиши

- `Ctrl+<Enter/S>` - перевод текста без переноса на новую строку.
- `Ctrl+V` - вставка текста из буфера обмена (определено на уровне кода).
- `Alt+C` - скопировать текст из поля ввода в буфер обмена.
- `Alt+<1/2/3/4/5>` - копирования результатов перевода из окна вывода в буфер обмена (для каждого переводчика комбинация клавиш указана в скобках), при этом выбранная форма изменит свой цвет на зеленый.
- `Ctrl+<N/Z>` - перейти к предыдущей записи истории переводов.
- `Ctrl+<P/X>` - перейти к следующей записи в истории переводов.
- `Shift+<Up/Down>` - одновременный скроллинг всех панелей вывода.
- `Ctrl+<Up/Down>` - скроллинг панели ввода текста без изменения положения курсора.
- `Ctrl+<Left/Right>` - быстрая навигация курсора через словосочетания.
- `Ctrl+<A/E>` - переместить курсор в начало или конец ввода текста.
- `Ctrl+<C/U/L>` - очистить поле ввода текста.
- `Ctrl+W/Alt+Back` - удалить словосочетание перед курсором.
- `Del/Ctrl+K` - удалить одну букву или символ после курсора.
- `f2` - переключиться на OpenAI с предустановленным prompt для перевода.
- `f3` - переключиться на OpenAI в режиме чата.
- `Escape` - выход из программы.

Используйте клавишу `F1`, для получения справки по доступным сочетаниям клавиш:

![interface](/image/hotkeys.jpg)

## Вклад и участники

Если ваш язык отсутствует в списке или у вас возникли проблемы с переводом, откройте запрос в разделе [Issues](https://github.com/Lifailon/multranslate/issues).

Вы также можете предложить другой источник для перевода текста через `API`, который не требует ключа доступа.

Если вам нравится использовать данный интерфейс, вы можете сделать вклад, просто переведите этот README файл на свой родной язык и передайте его через [Pull Request](https://github.com/Lifailon/multranslate/pulls).

## Задачи

- Переписать код на TypeScript.
- Упаковать приложение в исполняемый файл.
- Написать тесты для проверки функций перевода.
- Реализовать поддержку нативного курсора (наработки в [multranslate-native-cursor](multranslate-native-cursor.js)).
- Добавить проверку текста на стиль и грамматику (орфографии) через [LanguageTool](https://languagetool.org/http-api).

## Текстовый буфер

Библиотека Blessed прекрасна и не имеет аналогов по своему функционалу для `JavaScript` или `TypeScript` (и даже превосходит некоторые библиотеки в других языках), но является устаревшей (не поддерживается с 2015 года) и имеет ряд технических ограничений, например, отсутствует возможность навигации курсора в поле ввода текста. По этой причине был реализован механизм управления содержимым ввода через текстовый буфер, который позволяет использовать пользовательский курсор для навигации с помощью стрелочек клавиатуры и автоматическое пролистывание.

Если вы планируете использовать данную библиотеку для схожих задач где требуется ввод текста, то добавьте в свой код `class TextBuffer` и управление корячими клавишами (`keypress`) через `inputBox.on()`. Мне понадобилось несколько недель, что бы добиться полноценной возможности работы с текстом, ключевая проблема, это встренный перенос строки (`autowrap`) и сдвиг пользовательского курсора.

На протяжение ежедневного использования в течении 6 месяцев могу подтвердить, что это работает стабильно. 

## License

Этот проект лицензирован по лицензии **MIT**. См. файл [лицензии](LICENSE) для получения подробной информации.

Copyright (C) 2024 Lifailon (Alex Kup)

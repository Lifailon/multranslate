<h2 align="center">
    multranslate
</h2>

<p align="center">
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
<a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="GitHub License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
 <a href="README.md">English</a> | <strong>Русский</strong>
</h4>

Терминальный пользовательский интерфейс (TUI) на базе библиотеки [Blessed](https://github.com/chjj/blessed) для одновременного перевода текста с использованием нескольких источников перевода. Все источники не требуют токена доступа или других настроек. Поддерживает **автоматическое определение исходного и целевого языка** на уровне кода между английским и любым из поддерживаемых языков (русский по умолчанию), а также доступ к **истории переводов** через [SQLite](https://github.com/WiseLibs/better-sqlite3) (до 500 запросов, после чего применяется автоматическая чистка старых значений из истории).

![interface](/image/interface.jpg)

## 📚 Источники перевода

- [Google](https://translate.google.com) - бесплатный и безлимитный [API](https://github.com/vitalets/google-translate-api) с использованием [serverless](https://github.com/olavoparno/translate-serverless-vercel) размещенный на Vercel. Доступно для перевода более 5000 символов.
- [DeepL](https://www.deepl.com) - бесплатный API через [DeepLX](https://github.com/OwO-Network/DeepLX) с использованием [serverless](https://github.com/LegendLeo/deeplx-serverless) размещенный на [Vercel](https://github.com/bropines/Deeplx-vercel). Присутствуют ограничения на частое количество запросов перевода, может иметь ограничения при использование большого количества символов (официальное ограничение в 5000 символов на запрос).
- [Reverso](https://www.reverso.net) - самый стабильный, бесплатный и без ограничений на количество символов (версия на сайте ограничена 2000 символам и 900 через приложение, через `API` возможно получить до 8000). Не содержит официальной документации, запрос был получен с официального сайта через *DevTools*.
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - бесплатный и открытый API (ограничение в 500 символов на запрос). Поддерживает до 3 вариантов ответа для коротких запросов.

> ⚠ **Reverso** не поддерживает работу через **Axios** (ошибка: `Invalid header value char`), вместо этого используется **Fetch**.

## 🚀 Установка

Используйте менеджер пакетов [npm](https://www.npmjs.com/package/multranslate):

```shell
npm install -g multranslate
```

Запустите приложение:

```shell
multranslate
```

Получите справку:

```shell
multranslate --help

Usage: multranslate [options]

Cross-platform TUI for translating text in multiple translators simultaneously, with support for translation
history and automatic language detection.

Options:
  -V, --version            output the version number
  -l, --language <name>    select language: ru, ja, zh, ko, ar, tr, uk, sk, pl, de, fr, it, es, pt, el, hu, nl, sv,
                           ro, cs, da (default: "ru")
  -t, --translator <name>  select translator: all, Google, DeepL, Reverso, MyMemory (default: "all")
  -h, --help               display help for command
```

## 🔨 Сборка

Клонируйте репозиторий:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Запустите приложения:

```shell
npm start
```

## 💬 Поддерживаемые языки

Вы можете изменить язык, для автоматического определения языка между английским и любым из тех, что представлен ниже в таблице:

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
| pt        | Португальский             |
| el        | Греческий                 |
| hu        | Венгерский                |
| nl        | Нидерландский             |
| sv        | Шведский                  |
| ro        | Румынский                 |
| cs        | Чешский                   |
| da        | Датский                   |

Если кого-то языка нет в списке или у вас возникли проблемы с переводом, откройте запрос в разделе [Issues](https://github.com/Lifailon/multranslate/issues).

Вы также можете использовать любой из переводчиков по отдельности, указав соответствующий параметр при запуске:

<table>
    <tr>
        <td><code>multranslate --translator Google --language tr</code>
        </td>
        <td><code>multranslate --translator DeepL --language de</code>
        </td>
    </tr>
    <tr>
        <td><img src=/image/google-fr.jpg width=600/></td>
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

## ⌨ Горячие клавиши

- `Enter`: используется каждый раз для перевода текста одновременно с переносом на новую строку.

- `Ctrl+<Q/W/E/R>`: копирования результатов перевода из форм вывода в буфер обмена (для каждого переводчика комбинация клавиш указана в скобках), при этом выбранная форма изменит свой цвет на зеленый.

- `Ctrl+V`: вставка текста из буфера обмена (определено на уровне кода).

- `Ctrl+Z`: Навигация по истории запросов на переводы с конца.

- `Ctrl+X`: Навигация по истории переводов в обратном порядке.

- `Shift+<⬆/⬇>`: одновременный скроллинг всех панелей вывода.

- `Ctrl+<⬆/⬇>`: скроллинг панели ввода текста без навигации.

- `Ctrl+<⬅/➡>`: быстрая навигация курсора через словосочетания.

- `Ctrl+<A/D>`: перевести курсор к началу или концу ввода текста.

- `Ctrl+Del`: удалить словосочетание перед курсором.

- `Ctrl+C`: очистить поле ввода текста.

- `Escape`: выход из программы.

Что бы получить справку по горячим клавишам, используйте комбинацию клавиш: `Ctrl+S`

![interface](/image/hotkeys.jpg)

## 💡 Текстовый буфер

Библиотека Blessed является устаревшей (более не поддерживается) и имеет ряд технических ограничений, например, отсутствует возможность навигации курсора в поле ввода текста. По этой причине был реализован механизм управления содержимым ввода через текстовый буфер, который позволяет использовать кастомный курсор для навигации с помощью стрелочек клавиатуры и автоматический скроллинг для пролистывания.

Если вы планируете использовать данную библиотеку для схожих задач где требуется ввод текста, то добавьте в свой код `class TextBuffer` и управление корячими клавишами `keypress` через `inputBox.on()`.

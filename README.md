<h2 align="center">
    multranslate
</h2>

<p align="center">
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
<a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="GitHub License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
    <strong>English</strong> | <a href="README_RU.md">Русский</a>
</h4>

A terminal user interface (TUI) based on the [Blessed](https://github.com/chjj/blessed) library for simultaneous text translation using multiple translation sources. All sources do not require an access token or other settings. Supports **automatic source and target language** definition at code level between English and any of the [supported languages](#-supported-languages), as well as access to **translation history** via [SQLite](https://github.com/WiseLibs/better-sqlite3) (up to 500 queries, after which the old values from history are automatically cleared).

![interface](/image/interface.jpg)

## 📚 Translation providers

- [Google](https://translate.google.com) - free and unlimited [API](https://github.com/vitalets/google-translate-api) using [serverless](https://github.com/olavoparno/translate-serverless-vercel) hosted on Vercel. Available for translation more than 5000 characters.
- [DeepL](https://www.deepl.com) - free API via [DeepLX](https://github.com/OwO-Network/DeepLX) using [serverless](https://github.com/LegendLeo/deeplx-serverless) hosted on [Vercel](https://github.com/bropines/Deeplx-vercel). There are limitations on the number of frequent requests for translation, can have limitations when using a large number of
- [Reverso](https://www.reverso.net) - the most stable, free and without any limitation on the number of characters (version on the site is limited to 2000 characters and 900 through the application, through the API can get up to 8000). Does not contain official documentation, request was received from official site via *DevTools*.characters (official limit of 5000 characters per request).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - free and open API (limit of 500 characters per request). Supports up to 3 response options for short queries.

> ⚠ **Reverso** does not support working via **Axios** (error: `Invalid header value char`), **Fetch** is used instead.

## 🚀 Install

Use the [npm](https://www.npmjs.com/package/multranslate) package manager:

```shell
npm install -g multranslate
```

Run the application:

```shell
multranslate
```

Get help:

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

## 🔨 Build

Clone the repository:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Run the application:

```shell
npm start
```

## 💬 Supported languages

You can change the language to automatically detect the language between English and any of those in the table below:

| Parameter | Language          |
| -         | -                 |
| ru        | Russian (default) |
| ja        | Japanese          |
| zh        | Chinese           |
| ko        | Korean            |
| ar        | Arabic            |
| tr        | Turkish           |
| uk        | Ukrainian         |
| sk        | Slovak            |
| pl        | Polish            |
| de        | German            |
| fr        | French            |
| it        | Italian           |
| es        | Spanish           |
| pt        | Portuguese        |
| el        | Greek             |
| hu        | Hungarian         |
| nl        | Dutch             |
| sv        | Swedish           |
| ro        | Romanian          |
| cs        | Czech             |
| da        | Danish            |

If a language is not on the list or if you have problems with translation, please open a request under [Issues](https://github.com/Lifailon/multranslate/issues).

You can also use any of the translators individually by specifying the appropriate option at startup:

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

## ⌨ Hotkeys

- `Enter` - is used each time to translate the text simultaneously with moving to a new line.

- `Ctrl+<Q/W/E/R>` - copying translation results from output forms to the clipboard (for each translator, the key combination is indicated in brackets), and the selected form will change its color to green.

- `Ctrl+V` - paste text from the clipboard (defined at the code level).

- `Ctrl+Z`: Navigate through the history of translation requests from the end.

- `Ctrl+X`: Navigate through the translation history in reverse order.

- `Shift+<⬆/⬇>` - simultaneous scrolling of all output panels.

- `Ctrl+<⬆/⬇>` - scrolling the text input panel without navigation.

- `Ctrl+<⬅/➡>` - quick cursor navigation through phrases.

- `Ctrl+<A/D>` - move the cursor to the beginning or end of text input.

- `Ctrl+Del` - delete the phrase before the cursor.

- `Ctrl+C` - clear the text input field.

- `Escape` - exit the program.

To get hotkey help, use the keyboard shortcut: `Ctrl+S`

![interface](/image/hotkeys.jpg)

## 💡 Text buffer

The Blessed library is outdated (no longer supported) and has a number of technical limitations, such as not being able to navigate the cursor in the input field. For this reason, a mechanism for managing input text via text buffer has been implemented, which allows using a custom cursor for navigation using keyboard arrows and automatic scrolling for swiping.

If you plan to use this library for similar tasks where text input is required, then add `class TextBuffer` and control of `keypress` shortcuts to your code via `inputBox.on()`.

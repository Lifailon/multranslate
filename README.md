<h2 align="center">
    multranslate
</h2>

<p align="center">
<a href="https://www.npmjs.com/package/multranslate"><img title="NPM"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
<a href="https://www.npmjs.com/package/multranslate"><img title="Language"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
<a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
    <strong>English</strong> | <a href="README_RU.md">Русский</a>
</h4>

Cross-platform terminal user interface (TUI) based on the [Blessed](https://github.com/chjj/blessed) library for simultaneous text translation using several popular translation sources, as well as LLM via [OpenAI](https://openai.com). All sources do not require an access token (API key, with the *exception of OpenAI*) or other settings. Supports automatic source and target language definition at code level between English and any of the [supported languages](#-supported-languages), as well as access to translation history via [SQLite](https://github.com/WiseLibs/better-sqlite3) (up to 500 requests, after which old records from the history are automatically cleared).

![interface](/image/interface.jpg)

## Translation providers

- [Google](https://translate.google.com) - free and unlimited [API](https://github.com/vitalets/google-translate-api) using [serverless](https://github.com/olavoparno/translate-serverless-vercel) hosted on the Vercel platform. Available for translation more than 5000 characters.
- [DeepL](https://www.deepl.com) - free API via [DeepLX](https://github.com/OwO-Network/DeepLX) using [serverless](https://github.com/LegendLeo/deeplx-serverless) hosted on [Vercel](https://github.com/bropines/Deeplx-vercel) platform. There are limits on the number of translation requests that can be made frequently, and there may also be a limit on the number of characters that can be used (the official limit is 5000 characters per request).
- [Reverso](https://www.reverso.net) - the most stable, free and without any limitation on the number of characters (version on the site is limited to 2000 characters and 900 in the application, through the API can get up to 8000). Does not contain official documentation, request was received from official site via *DevTools*.
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - free and open API (limit of 500 characters per request). Supports up to 3 response options for short queries.
- [OpenAI](https://platform.openai.com/docs/overview) - translate text using LLM (you need to pass the API key via a parameter, which is saved in a file for later use).

## Install

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

Cross-platform TUI for translating text in multiple translators simultaneously and LLM via OpenAI, with support for
translation history and automatic language detection.

Options:
  -V, --version            output the version number
  -l, --language <name>    select language: ru, ja, zh, ko, ar, tr, uk, sk, pl, de, fr, it, es, el, hu, nl, sv, ro,
  cs, da, pt, vi (default: "ru")
  -t, --translator <name>  select translator: all, Google, DeepL, Reverso, MyMemory, OpenAI (default: "all")
  -k, --key <value>        API key for using the OpenAI translator (will be saved for future use)
  -h, --help               display help for command
```

## Build

Clone the repository:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Install dependencies and run the application:

```shell
npm install
npm start
```

## Supported languages

You can change the language for automatic definition between English and any of those presented in the table below:

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
| el        | Greek             |
| hu        | Hungarian         |
| nl        | Dutch             |
| sv        | Swedish           |
| ro        | Romanian          |
| cs        | Czech             |
| da        | Danish            |
| pt        | Portuguese ([#1](https://github.com/Lifailon/multranslate/issues/1))   |
| vi        | Vietnam ([#2](https://github.com/Lifailon/multranslate/issues/2))      |

All passed letters are analyzed to compare them between the English alphabet and the language specified in the `--language` parameter.

You can also use any of the translators individually by specifying the appropriate option at startup:

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

## Hotkeys

- `F2` - switch between all translators and OpenAI.
- `Ctrl+<Enter/S>` - translation of text without breaking to a new line.
- `Ctrl+V` - paste text from the clipboard (defined at the code level).
- `Alt+C` - copy text from the input field to clipboard.
- `Alt+<1/2/3/4/5>` - copying translation results from output window to the clipboard (for each translator, the key combination is indicated in brackets), and the selected form will change its color to green.
- `Ctrl+<N/Z>` - move to the previous entry in the translation history.
- `Ctrl+<P/X>` - move to the next entry in the translation history.
- `Shift+<Up/Down>` - simultaneous scrolling of all output panels.
- `Ctrl+<Up/Down>` - scrolling the text input panel without changing the cursor position.
- `Ctrl+<Left/Right>` - quick cursor navigation through phrases.
- `Ctrl+<A/E>` - move the cursor to the ahead or end of text input.
- `Ctrl+<C/U/L>` - clear the text input field.
- `Ctrl+W/Alt+Back` - delete the word before the cursor.
- `Del/Ctrl+K` - deletes one letter or character after the cursor.
- `Escape` - exit the program.

Use the `F1` key to get help on available keyboard shortcuts:

![interface](/image/hotkeys.jpg)

## Contributing

If your language is not listed or you have problems with translation, please open an issue in the [Issues](https://github.com/Lifailon/multranslate/issues).

You can also offer another source for translating the text through `API`, which does not require an access key.

If you like to use this interface, you can make a contribution, just translate this readme file to your own language and pass it through [Pull Request](https://github.com/Lifailon/multranslate/pulls).

## Backlog

- Rewrite code to TypeScript.
- Implement native cursor support (developments in [multranslate-native-cursor](multranslate-native-cursor.js)).
- Check texts for style and grammar (spelling) via [LanguageTool](https://languagetool.org/http-api).

## Text buffer

The Blessed library is great and has no analogues in its functionality for `JavaScript` or `TypeScript` (and even surpasses some libraries in other languages), but it is outdated (not supported since 2015) and has a number of technical limitations, for example, there is no ability to navigate the cursor in the text input field. For this reason, a mechanism for managing the input content through a text buffer was implemented, which allows you to use a custom cursor for navigation using keyboard arrows and automatic scrolling.

If you plan to use this library for similar tasks where text input is required, then add `class TextBuffer` and control of hotkeys (`keypress`) via `inputBox.on()` to your code. It took me several weeks to achieve full functionality for working with text, the key problem is the built-in line break (`autowrap`) and the shift of the custom cursor.

Over the course of daily use for 6 months, I can confirm that it works stably.

<h1 align="center">
    multranslate
</h1>

<p align="center">
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
<a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="GitHub License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
    <strong>English</strong> | <a href="README_RU.md">Русский</a>
</h4>

Terminal user interface based on the [Blessed](https://github.com/chjj/blessed) library for simultaneous text translation using multiple translation sources. All sources do not require an access token or any settings. Supports **automatic detection of source and target languages** between English and Russian at the code level.

![Example](/example.jpg)

## 📚 Translation providers

- Google via free and unlimited [API](https://github.com/matheuss/google-translate-api) using [serverless](https://github.com/olavoparno/translate-serverless-vercel) hosted on Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - free [DeepL](https://deepl.com) API using [serverless](https://github.com/LegendLeo/deeplx-serverless) hosted on [Vercel](https://github.com/bropines/Deeplx-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - free and open api (usage is limited to 5000 chars/day).
- [Reverso](https://www.reverso.net) - free api (does not contain official documentation, request was received from official site through DevTools).

> ⚠ **Reverso** does not support working via **Axios** (error: `Invalid header value char`), **Fetch** is used instead.

## 🚀 Installation

Use the [npm](https://www.npmjs.com/package/multranslate) package manager:

```shell
npm install -g multranslate
```

Run the application:

```shell
multranslate
```

## 🔧 Build

Clone the repository:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Run the application:

```shell
npm start
```

To debug the interface:

```shell
npm run dev
```

## 💡 Text buffer

The Blessed library is deprecated (no longer supported) and has a number of technical limitations, such as cursor navigation in a text input field. For this reason, a mechanism for managing input text via text buffer has been implemented, which allows using a custom cursor for navigation using keyboard arrows and automatic scrolling for swiping.

If you plan to use this library for similar tasks where text input is required, then add `class TextBuffer` and control of `keypress` shortcuts to your code via `inputBox.on()`.

## ⌨ Hotkeys

- `Enter` - is used each time to translate the text simultaneously with moving to a new line.

- `Shift+<⬆/⬇>` - simultaneous scrolling of all output panels.

- `Ctrl+<Q/W/E/R>` - copying translation results from output forms to the clipboard (for each translator, the key combination is indicated in brackets), and the selected form will change its color to green.

- `Ctrl+V` - paste text from the clipboard (defined at the code level).

- `Ctrl+C` - clear the text input field.

- `Ctrl+<⬆/⬇>` - scrolling the text input panel without navigation.

- `Ctrl+<⬅/➡>` - quick cursor navigation through phrases.

- `Ctrl+DEL` - delete the phrase before the cursor.

- `Ctrl+<A/D>` - move the cursor to the beginning or end of text input.

- `Escape` - exit the program.

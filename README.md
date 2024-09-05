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

Terminal user interface based on [blessed library](https://github.com/chjj/blessed) for translating text using multiple translation providers simultaneously. All sources do not require an access token or any settings. Supports **automatic detection of the source and destination language** between English and Russian.

![Example](/example.jpg)

## Translation providers

- Google via free and unlimited [API](https://github.com/matheuss/google-translate-api) using [serverless](https://github.com/olavoparno/translate-serverless-vercel) hosted on Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - free [DeepL](https://deepl.com) API using [serverless](https://github.com/LegendLeo/deeplx-serverless) hosted on [Vercel](https://github.com/olavoparno/translate-serverless-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - free and open api (usage is limited to 5000 chars/day).
- [Reverso](https://www.reverso.net) - free api (does not contain official documentation, request was received from official site through DevTools).

## Installation

Use the [npm](https://www.npmjs.com/package/multranslate) package manager (stable version):

```shell
npm install -g multranslate
```

Run the application without parameters:

```shell
multranslate
```

### Build

Clone the repository:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Run the application:

```shell
npm start
```

### Executable

To build the executable, you can use [pkg](https://github.com/vercel/pkg) from [Vercel](https://github.com/vercel) (unstable).

Install the [pkg](https://www.npmjs.com/package/pkg) package and use one command to build for all platforms:

```shell
npm install -g pkg
pkg .
```

Supports Windows, Linux and MacOS. The executable file already includes all dependencies for its operation and does not require installation of the `node.js` platform.

> Since the Reverso provider does not support working via Axios (error: `Invalid header value char`), Fetch is used instead. The pkg tool supports node.js version 18 and higher (version 20 is not supported), where Fetch is considered experimental, so on the first request after running the application in the input field you will get an error: `The Fetch API is an experimental feature`.

## Hotkeys

Using the `up` and `down` buttons you can scroll through all output panels at once.

The `escape` button is used to clear the text input field, as well as to exit the program if the input field is already empty.

> The blessed library has a number of limitations, so I was unable to implement cursor movement using the left and right arrows.

To capture all text in one of the output panels for copying, use the key combination `Shift+Alt` when selecting text.

If you are using [Windows Terminal](https://github.com/microsoft/terminal), add a parameter in the `settings.json` configuration file that will remove trailing spaces from text in a rectangular (block) selection when copying to the clipboard:

```json
"trimBlockSelection": true
```

To paste text from the clipboard, use the keyboard shortcut `Shift+Ctrl+V` or `Ctrl+V` depending on the terminal you are using.
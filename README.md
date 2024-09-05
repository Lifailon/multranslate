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

> **Reverso** does not support working via **Axios** (error: `Invalid header value char`), **Fetch** is used instead.

## Installation

Use the [npm](https://www.npmjs.com/package/multranslate) package manager:

```shell
npm install -g multranslate
```

Run the application:

```shell
multranslate
```

## Build

Clone the repository:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Run the application:

```shell
npm start
```

## Hotkeys

The text is translated every time after pressing the `Enter` button. The `Ctrl+C` keyboard shortcut is used to clear the text input field. The `escape` button is used to exit the program.

To copy text to the clipboard from the selected output form, you can use the key combination `Ctrl+<Q/W/E/R>` (for each translator it is indicated in brackets), and the selected form will change its color to green. To paste text into an input field from the clipboard, use `Ctrl+V`.

Using the `up` and `down` buttons you can scroll through all output panels at the same time.

> The blessed library has a number of limitations, so I was unable to implement cursor movement using the left and right arrows.

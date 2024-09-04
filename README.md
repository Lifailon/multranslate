<h1 align="center">
    multranslate
</h1>

<h4 align="center">
    <strong>English</strong> | <a href="README_RU.md">Русский</a>
</h4>

Terminal user interface based on [blessed library](https://github.com/chjj/blessed) for translating text using multiple translation providers simultaneously. Supports **automatic detection of the source and destination language** between English and Russian.

![Example](/example.jpg)

### Translation providers

- Google via [google-translate-api](https://github.com/matheuss/google-translate-api) using [serverless](https://github.com/olavoparno/translate-serverless-vercel) hosted on Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - free [DeepL](https://deepl.com) API (no token required) using [serverless](https://github.com/LegendLeo/deeplx-serverless) hosted on [Vercel](https://github.com/olavoparno/translate-serverless-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - free api (no token required, usage is limited to 5000 chars/day).
- [Reverso](https://www.reverso.net) - free api (does not contain official documentation, request was received from official site through DevTools).

### Hotkeys

Using the `up` and `down` buttons you can scroll through all output panels at once.

The `escape` button is used to clear the text input field, as well as to exit the program if the input field is already empty.

> The blessed library has a number of limitations, so I was unable to implement cursor movement using the left and right arrows.

To capture all text in one of the output panels for copying, use the key combination `Shift+Alt` when selecting text.

If you are using [Windows Terminal](https://github.com/microsoft/terminal), add a parameter in the `settings.json` configuration file that will remove trailing spaces from text in a rectangular (block) selection when copying to the clipboard:

```json
"trimBlockSelection": true
```

To paste text from the clipboard, use the keyboard shortcut `Shift+Ctrl+V` or `Ctrl+V` depending on the terminal you are using.
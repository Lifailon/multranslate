<h2 align="center">
    multranslate
</h2>

<p align="center">
    <a href="https://www.npmjs.com/package/multranslate"><img title="NPM"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
    <a href="https://hub.docker.com/r/lifailon/multranslate"><img title="Docker" src="https://img.shields.io/docker/image-size/lifailon/multranslate/latest?logo=docker&color=blue&label=docker"></a>
    <a href="https://www.npmjs.com/package/multranslate"><img title="Language"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
    <a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
    <strong>English</strong> | <a href="README_RU.md">Русский</a>
</h4>

Cross-platform terminal user interface based on the [Blessed](https://github.com/chjj/blessed) library for simultaneous text translation using several popular translation sources and `LLM`. All sources do not require an API access token (with the exception of official OpenAI or OpenRouter). Supports automatic source and target language definition at code level between English and any of the [supported languages](#supported-languages), as well as access to translation history via [SQLite](https://github.com/WiseLibs/better-sqlite3) (up to 500 requests, after which old records from the history are automatically cleared).

![interface](/image/interface.jpg)

## Translation providers

- [Google](https://translate.google.com) - free and unlimited [API](https://github.com/vitalets/google-translate-api) using [serverless](https://github.com/olavoparno/translate-serverless-vercel) hosted on the Vercel platform. Available for translation more than 5000 characters.
- [DeepL](https://www.deepl.com) - free `API` via [DeepLX](https://github.com/OwO-Network/DeepLX) using [serverless](https://github.com/LegendLeo/deeplx-serverless) hosted on [Vercel](https://github.com/bropines/Deeplx-vercel) platform. There are limits on the number of translation requests that can be made frequently, and there may also be a limit on the number of characters that can be used (the official limit is 5000 characters per request).
- [Reverso](https://www.reverso.net) - the most stable, free and without any limitation on the number of characters (version on the site is limited to 2000 characters and 900 in the application, through the `API` can get up to 8000). Does not contain official documentation, request was received from official site via *DevTools*.
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - free and open `API` (limit of 500 characters per request). Supports up to 3 response options for short queries.
- [LLM](https://en.wikipedia.org/wiki/Large_language_model) - using large language models with a pre-installed system `prompt` for text translation or in chat mode with support for streaming responses.
- - [OpenAI](https://platform.openai.com/docs/overview) is the official provider of the `ChatGPT` model. To use, you must pass the `API` key via the `--key` parameter (has a higher priority) or use the `OPENAI_API_KEY` environment variable (similarly for `OpenRouter`).
- - [OpenRouter](https://openrouter.ai) is a universal provider that provides unified access to different models. Supports free models (e.g. [DeepSeek R1](https://openrouter.ai/deepseek/deepseek-r1:free)), allowing you to use it without replenishing your account immediately after registration. To use, you need to pass the url and the `API` key via parameters or environment variables, similar to `OpenAI`.
- - [LM Studio](https://lmstudio.ai) is an interface for running and using local models in offline mode (the `API` request and response scheme corresponds to `OpenAI`). It is recommended to choose a model pre-trained in the desired language (for example, using the `translation` filter on [Hugging Face](https://huggingface.co/models?pipeline_tag=translation)).

## Install

Use the [NPM](https://www.npmjs.com/package/multranslate) package manager to install a stable version:

```shell
npm install -g multranslate
```

Or install from the GitHub repository:

```shell
npm install -g https://github.com/Lifailon/multranslate
```

Run the application:

```shell
multranslate
```

Get help:

```shell
multranslate --help

Usage: multranslate [options]

Cross-platform TUI for translating text in multiple translators simultaneously and LLM, with support for
translation history and automatic language detection.

Options:
  -V, --version            output the version number
  -l, --language <name>    Select the language: ru, ja, zh, ko, ar, tr, uk, sk, pl, de, fr, it, es, el, hu, nl,
  sv, ro, cs, da, pt, vi (default: "ru" or the environment "TRANSLATE_LANGUAGE")
  -t, --translator <name>  Select the translator: all, Google, DeepL, Reverso, MyMemory, OpenAI (default: "all")
  -k, --key <value>        API key parameter for OpenAI (high priority) or using the environment "OPENAI_API_KEY"
  -u, --urlOpenai <url>    Url address for OpenAI, OpenRouter or local LLM API (default: "https://api.openai.com"
  or the environment "OPENAI_URL")
  -m, --model <name>       Select the LLM model (default: "gpt-4o-mini" or the environment "OPENAI_MODEL")
  -e, --temp <number>      Select the temperature for LLM (default: "0.7" or the environment "OPENAI_TEMP")
  -h, --help               display help for command
```

To use `OpenAI`, you need to pass parameters to connect to `API` (has high priority) or use environment variables (recommended).

### OpenAI

Using environment variables in **Linux**:

```Bash
export OPENAI_API_KEY="sk-proj-..."
multranslate
```

You can save the environment variable for later use after reconnecting to the current terminal session.

```Bash
echo 'export OPENAI_API_KEY="sk-proj-..."' >> ~/.bashrc
source ~/.bashrc
multranslate
```

It is recommended to make changes to the profile file through any text editor, for example, `nano`, so that the key content is not saved in the command history.

### OpenRouter

Using the `DeepSeek R1` free model via parameters:

```Bash
multranslate -u "https://openrouter.ai/api" -m "deepseek/deepseek-r1:free" -k "sk-or-v1-..."
```

Note that the default `/v1/chat/completions` append path is used for all requests.

### LM Studio

Using environment variables in **Windows**:

```PowerShell
$env:OPENAI_URL = "http://127.0.0.1:1234"
$env:OPENAI_MODEL = "llama-3-8b-gpt-4o-ru1.0"
multranslate
```

Save variables in the current user's environment via `PowerShell` for later use:

```PowerShell
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-or-v1-...", "User")
[System.Environment]::SetEnvironmentVariable("OPENAI_URL", "https://openrouter.ai/api", "User")
[System.Environment]::SetEnvironmentVariable("OPENAI_MODEL", "deepseek/deepseek-r1:free", "User")
```

To apply, restart the terminal.

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

## Docker

Configure the [env](.env) environment variable file for language selection and connection to the LLM.

Build the image and run a temporary container (`volume` is used to store history between runs):

```shell
docker build -t multranslate .
docker run --env-file .env -it --rm -v multranslate:/multranslate multranslate
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
- `F2` - switch to OpenAI with a preset translation prompt.
- `F3` - switch to OpenAI in chat mode.
- `Escape` - exit the program.

Use the `F1` key to get help on available keyboard shortcuts:

![interface](/image/hotkeys.jpg)

## Contributing

If your language is not listed or you have problems with translation, please open an issue in the [Issues](https://github.com/Lifailon/multranslate/issues).

You can also offer another source for translating the text through `API`, which does not require an access key.

If you like to use this interface, you can make a contribution, just translate this readme file to your own language and pass it through [Pull Request](https://github.com/Lifailon/multranslate/pulls).

## Backlog

- Rewrite code to `TypeScript`.
- Write tests to check the functions of translation.
- Implement native cursor support (developments in [multranslate-native-cursor](multranslate-native-cursor.js)).
- Check texts for style and grammar (spelling) via [LanguageTool](https://languagetool.org/http-api).
- Add support for storing and clearing history via `SQLite` for `LLM` in chat mode.

## Text buffer

The Blessed library is great and has no analogues in its functionality for `JavaScript` or `TypeScript` (and even surpasses some libraries in other languages), but it is outdated (not supported since 2015) and has a number of technical limitations, for example, there is no ability to navigate the cursor in the text input field. For this reason, a mechanism for managing the input content through a text buffer was implemented, which allows you to use a custom cursor for navigation using keyboard arrows and automatic scrolling.

If you plan to use this library for similar tasks where text input is required, then add `class TextBuffer` and control of hotkeys (`keypress`) via `inputBox.on()` to your code. It took me several weeks to achieve full functionality for working with text, the key problem is the built-in line break (`autowrap`) and the shift of the custom cursor.

Over the course of daily use for 6 months, I can confirm that it works stably.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Copyright (C) 2024 Lifailon (Alex Kup)

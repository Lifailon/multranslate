<h1 align="center">
    multranslate
</h1>

<h4 align="center">
    <strong>Русский</strong> | <a href="README.md">English</a>
</h4>

Кроссплатформенный терминальный пользовательский интерфейс на основе библиотеки [blessed](https://github.com/chjj/blessed) для одновременного перевода текста с использованием нескольких источников перевода. Все источники не требуют токена доступа или каких-либо настроек. Поддерживает **автоматическое определение исходного и целевого языка** между английским и русским.

![Example](/example.jpg)

## Источники перевода

- Google через бесплатный и безлимитный [API](https://github.com/matheuss/google-translate-api) с использованием [serverless](https://github.com/olavoparno/translate-serverless-vercel), размещенный на Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - бесплатный [DeepL](https://deepl.com) API с использованием [serverless](https://github.com/LegendLeo/deeplx-serverless), размещенный на [Vercel](https://github.com/olavoparno/translate-serverless-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - бесплатный и открытый API (использование ограничено 5000 символами/день).
- [Reverso](https://www.reverso.net) - бесплатный API (не содержит официальной документации, запрос был получен с официального сайта через DevTools).

## Установка

Вы можете [загрузить](https://github.com/Lifailon/multranslate/releases) исполняемый файл из файлов к релизу или установить через менеджер пакетов [npm](https://www.npmjs.com/package/multranslate):

```shell
npm install -g multranslate
multranslate
```

### Сборка:

Клонируйте репозиторий:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Запуск приложения:

```shell
npm start
```

Для сборки исполняемого файла используется пакет [pkg](https://github.com/vercel/pkg) от [Vercel](https://github.com/vercel).

```shell
npm install -g pkg
```

- Windows:

```shell
pkg . --targets node18-win-x64 --output multranslate.exe
```

- Linux:

```shell
pkg . --targets node18-linux-x64 --output multranslate
```

Исполняемый файл уже включает в себя все зависимости для своей работы.

## Горячие клавиши

Кнопками `вверх` и `вниз` можно пролистывать все панели вывода одновременно.

Кнопка `escape` используется для очистки поля ввода текста, а также для выхода из программы, если поле ввода уже очищено.

> Библиотека blessed имеет ряд ограничений, поэтому мне не удалось реализовать перемещение курсора с помощью стрелочек влево и вправо.

Чтобы захватить весь текст в одной из панелей вывода для копирования, используйте сочетание клавиш `Shift+Alt` при выделении текста.

Если вы используете [Windows Terminal](https://github.com/microsoft/terminal), добавьте в файл конфигурации `settings.json` параметр, которая будет удалять конечные пробелы из текста в прямоугольном (блочном) выделении при копировании в буфер обмена:

```json
"trimBlockSelection": true
```

Чтобы вставить текст из буфера обмена, используйте сочетание клавиш `Shift+Ctrl+V` или `Ctrl+V` в зависимости от используемого вами терминала.
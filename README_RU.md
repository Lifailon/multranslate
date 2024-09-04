<h1 align="center">
    multranslate
</h1>

<h4 align="center">
    <strong>Русский</strong> | <a href="README.md">English</a>
</h4>

Терминальный пользовательский интерфейс на основе библиотеки [blessed](https://github.com/chjj/blessed) для одновременного перевода текста с использованием нескольких источников перевода. Поддерживает **автоматическое определение исходного и целевого языка** между английским и русским языком.

![Example](/example.jpg)

### Источники перевода

- Google через [google-translate-api](https://github.com/matheuss/google-translate-api) с использованием [serverless](https://github.com/olavoparno/translate-serverless-vercel), размещенный на Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - бесплатный [DeepL](https://deepl.com) API (токен не требуется) с использованием [serverless](https://github.com/LegendLeo/deeplx-serverless), размещенный на [Vercel](https://github.com/olavoparno/translate-serverless-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - бесплатный API (токен не требуется, использование ограничено 5000 символами/день).
- [Reverso](https://www.reverso.net) - бесплатный API (не содержит официальной документации, запрос был получен с официального сайта через DevTools).

### Горячие клавиши

Кнопками `вверх` и `вниз` можно прокручивать все панели вывода одновременно.

Кнопка `escape` используется для очистки поля ввода текста, а также для выхода из программы, если поле ввода уже очищено.

> Библиотека blessed имеет ряд ограничений, поэтому мне не удалось реализовать перемещение курсора с помощью стрелок влево и вправо.

Чтобы захватить весь текст в одной из панелей вывода для копирования, используйте сочетание клавиш `Shift+Alt` при выделении текста.

Если вы используете [Windows Terminal](https://github.com/microsoft/terminal), добавьте в файл конфигурации `settings.json` параметр, которая будет удалять конечные пробелы из текста в прямоугольном (блочном) выделении при копировании в буфер обмена:

```json
"trimBlockSelection": true
```

Чтобы вставить текст из буфера обмена, используйте сочетание клавиш `Shift+Ctrl+V` или `Ctrl+V` в зависимости от используемого вами терминала.
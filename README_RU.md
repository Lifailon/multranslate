<h1 align="center">
    multranslate
</h1>

<p align="center">
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/npm/v/multranslate?logo=npm&logoColor=red"></a>
<a href="https://www.npmjs.com/package/multranslate"><img title="GitHub License"src="https://img.shields.io/github/languages/top/Lifailon/multranslate?logo=JavaScript&color=yellow"></a>
<a href="https://github.com/Lifailon/multranslate/blob/rsa/LICENSE"><img title="GitHub License"src="https://img.shields.io/github/license/Lifailon/multranslate?logo=readme&logoColor=white&color=white"></a>
</p>

<h4 align="center">
 <a href="README.md">English</a> | <strong>Русский</strong>
</h4>

Терминальный пользовательский интерфейс на основе библиотеки [blessed](https://github.com/chjj/blessed) для одновременного перевода текста с использованием нескольких источников перевода. Все источники не требуют токена доступа или каких-либо настроек. Поддерживает **автоматическое определение исходного и целевого языка** между английским и русским.

![Example](/example.jpg)

## Источники перевода

- Google через бесплатный и безлимитный [API](https://github.com/matheuss/google-translate-api) с использованием [serverless](https://github.com/olavoparno/translate-serverless-vercel), размещенный на Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - бесплатный [DeepL](https://deepl.com) API с использованием [serverless](https://github.com/LegendLeo/deeplx-serverless), размещенный на [Vercel](https://github.com/olavoparno/translate-serverless-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - бесплатный и открытый API (использование ограничено 5000 символами в день).
- [Reverso](https://www.reverso.net) - бесплатный API (не содержит официальной документации, запрос был получен с официального сайта через *DevTools*).

> **Reverso** не поддерживает работу через **Axios** (ошибка: `Invalid header value char`), вместо этого используется **Fetch**.

## Установка

Используйте менеджер пакетов [npm](https://www.npmjs.com/package/multranslate):

```shell
npm install -g multranslate
```

Запустите приложение:

```shell
multranslate
```

## Сборка

Клонируйте репозиторий:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Запустите приложения:

```shell
npm start
```

## Горячие клавиши

Перевод текста производится каждый раз, после нажатия кнопки `Enter`. Сочетание клавиш `Ctrl+C` используется для очистки поля ввода текста. Кнопка `escape` используется для выхода из программы.

Для копирования текста в буфер обмена из выбранной формы вывода возможно использовать сочетание клавиш `Ctrl+<Q/W/E/R>` (для каждого переводчика указано в скобках), при этом выбранная форма изменит свой цвет на зеленый. Для вставки текста в поле ввода из буфера обмена используйте `Ctrl+V`.

Кнопками `вверх` и `вниз` можно пролистывать все панели вывода одновременно.

> Библиотека blessed имеет ряд ограничений, поэтому мне не удалось реализовать перемещение курсора с помощью стрелочек влево и вправо.

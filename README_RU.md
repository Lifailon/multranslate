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

Терминальный пользовательский интерфейс (TUI) на базе библиотеки [Blessed](https://github.com/chjj/blessed) для одновременного перевода текста с использованием нескольких источников перевода. Все источники не требуют токена доступа или каких-либо настроек. Поддерживает **автоматическое определение исходного и целевого языка** на уровне кода между английским и русским и доступ к **истории переводов** через [SQLite](https://github.com/WiseLibs/better-sqlite3).

![interface](/image/interface.jpg)

## 📚 Источники перевода

- Google через бесплатный и безлимитный [API](https://github.com/matheuss/google-translate-api) с использованием [serverless](https://github.com/olavoparno/translate-serverless-vercel), размещенный на Vercel.
- [DeepLX](https://github.com/OwO-Network/DeepLX) - бесплатный [DeepL](https://deepl.com) API с использованием [serverless](https://github.com/LegendLeo/deeplx-serverless), размещенный на [Vercel](https://github.com/bropines/Deeplx-vercel).
- [MyMemory](https://mymemory.translated.net/doc/spec.php) - бесплатный и открытый API (использование ограничено 5000 символами в день).
- [Reverso](https://www.reverso.net) - бесплатный API (не содержит официальной документации, запрос был получен с официального сайта через *DevTools*).

> ⚠ **Reverso** не поддерживает работу через **Axios** (ошибка: `Invalid header value char`), вместо этого используется **Fetch**.

## 🚀 Установка

Используйте менеджер пакетов [npm](https://www.npmjs.com/package/multranslate):

```shell
npm install -g multranslate
```

Запустите приложение:

```shell
multranslate
```

## 🔧 Сборка

Клонируйте репозиторий:

```shell
git clone https://github.com/Lifailon/multranslate
cd multranslate
```

Запустите приложения:

```shell
npm start
```

Для отладки интерфейса:

```shell
npm run dev
```

## 💡 Текстовый буфер

Библиотека Blessed является устаревшей (более не поддерживается) и имеет ряд технических ограничений, например, навигация курсора в поле ввода текста. По этой причине был реализован механизм управления содержимым ввода через текстовый буфер, который позволяет использовать кастомный курсор для навигации с помощью стрелочек клавиатуры и автоматический скроллинг для пролистывания.

Если вы планируете использовать данную библиотеку для схожих задач где требуется ввод текста, то добавьте в свой код `class TextBuffer` и управление корячими клавишами `keypress` через `inputBox.on()`.

## ⌨ Горячие клавиши

- `Enter`: используется каждый раз для перевода текста одновременно с переносом на новую строку.

- `Ctrl+V`: вставка текста из буфера обмена (определено на уровне кода).

- `Ctrl+<Q/W/E/R>`: копирования результатов перевода из форм вывода в буфер обмена (для каждого переводчика комбинация клавиш указана в скобках), при этом выбранная форма изменит свой цвет на зеленый.

- `Ctrl+Z`: Навигация по истории запросов на переводы с конца.

- `Ctrl+X`: Навигация по истории переводов в обратном порядке.

- `Shift+<⬆/⬇>`: одновременный скроллинг всех панелей вывода.

- `Ctrl+<⬆/⬇>`: скроллинг панели ввода текста без навигации.

- `Ctrl+<⬅/➡>`: быстрая навигация курсора через словосочетания.

- `Ctrl+<A/D>`: перевести курсор к началу или концу ввода текста.

- `Ctrl+Del`: удалить словосочетание перед курсором.

- `Ctrl+C`: очистить поле ввода текста.

- `Escape`: выход из программы.

Что бы получить справку по горячим клавишам, используйте комбинацию клавиш: `Ctrl+S`

![interface](/image/hotkeys.jpg)

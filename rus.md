# `<template>`, новый тег HTML: введение стандарта шаблонизации на стороне клиента

## Введение

Понятие шаблонизации не является новым в веб-разработке. Более того, серверные 
[языки шаблонов и шаблонизаторы][1] вроде Django (Python), ERB/Haml (Ruby), и 
Smarty (PHP) существуют уже далеко не первый день. Последние несколько лет можно 
наблюдать волну возникновения MVC-фреймворков. Они все немного отличаются друг 
от друга, но в большинстве своем в их основе лежит общий механизм 
воспроизведения слоя представления: шаблоны. 

Посмотрим правде в глаза. Шаблоны — это прекрасно. Не стесняйтесь, 
порасспрашивайте мнение коллег на их счет. Даже само [определение][2] шаблона 
оставляет тёплые и приятные чувства:

> **шаблон** (сущ.) — документ или файл с заданным форматом, который 
используется в качестве отправной точки для определённой цели, чтобы избежать 
необходимости воссоздания формата при повторном использовании. 

«…чтобы избежать необходимости воссоздания формата при повторном использовании…» 
Не знаю как вы, но я люблю избегать лишней работы. Почему же в веб-платформе 
отсутствует встроенная поддержка того, что очевидно является таким важным для 
разработчиков?

[Спецификация для HTML-шаблонов от W3C][3] должна заполнить этот пробел. В ней 
определён новый элемент `<template>`, который является реализацией стандарта 
шаблонизации для DOM на стороне клиента. Шаблоны позволяют объявлять фрагменты 
разметки, которые парсятся как HTML, игнорируются при загрузке страницы, но 
могут быть инстанциированы позже. Цитата от [Рафаеля Вайнштайна (Rafael 
Weinstein)][4] (автора спецификации):

> «Они обозначают место, куда можно поместить большой кусок HTML, который вы 
хотите оградить от какого-либо влияния со стороны браузера…какой бы ни была 
причина для этого»

### Выявление признаков

Для выявления поддержки `<template>`, создайте объект DOM и проверьте наличие 
свойства `.content`:

    function supportsTemplate() {
      return 'content' in document.createElement('template');
    }

    if (supportsTemplate()) {
      // Всё в норме.
    } else {
      // Используйте старые приёмы или библиотеки шаблонизации 
    }

## Объявление содержимого шаблона

Элемент HTML `<template>` в вашей разметке представляет шаблон. В него помещено 
«содержимое шаблона»; по сути **инертные куски DOM, которые можно использовать 
многократно**. Шаблоны можно рассматривать как фрагменты скаффолдинга, которые 
можно многократно использовать в приложении.

Чтобы создать шаблонный контент, напишите код разметки и оберните его в элемент 
`<template>`:

    <template id="mytemplate">
      <img src="" alt="красивая картинка">
      <div class="comment"></div>
    </template>

> Наблюдательный читатель должно быть заметил что изображение пустое. Это нас 
вполне устраивает и было сделано преднамеренно. Мы не получим ошибку 404 или 
ошибки в консоли потому, что ссылка на изображение битая, так как изображение не 
будет вызвано при загрузке страницы. Позже можно динамически сгенерировать 
URL-адрес изображения. Читайте [основные принципы][5]. 

## Основные принципы

Помещение содержимого в `<template>` даёт нам несколько важных свойств:

1. **Содержимое `<template>` фактически инертно, пока его не активировать.** По 
сути, соответствующая разметка спрятана и не воспроизводится.
2. Содержимое шаблона не может привести к каким-либо побочным эффектам. 
**Скрипты не выполняются, изображения не загружаются, аудио не проигрывается**… 
пока шаблон не активирован.
3. **Содержимое шаблона не считается частью страницы.** Использование 
`document.getElementById()` или `querySelector()` на странице не возвратит 
дочерние элементы шаблона.
4. Шаблоны можно помещать куда угодно: в `<head>`, `<body>` или `<frameset>`; и 
помещать в них любой тип содержимого, который может располагаться в этих частях 
страницы. Обратите внимание что «куда угодно» значит что `<template>` можно без 
проблем использовать в местах, запрещённых парсером HTML… всех кроме дочерних 
элементов [модели содержимого][6].

Его также можно поместить в качестве дочернего элемента `<table>` или `<select>`:

    <table>
    <tr>
      <template id="cells-to-repeat">
        <td>какое-то содержимое</td>
      </template>
    </tr>
    </table>

## Активация шаблона

Чтобы использовать шаблон, нужно его активировать. Иначе его содержимое не будет 
воспроизводиться. Наиболее простой способ — это создать глубокую копию его 
содержимого `.content` используя `cloneNode()`. `.content` — это неизменимое 
свойство, которое обозначает фрагмент документа с содержимым шаблона. 

    var t = document.querySelector('#mytemplate');
    // Во время выполнения заполняем src.
    t.content.querySelector('img').src = 'logo.png';
    document.body.appendChild(t.content.cloneNode(true));

После извлечения шаблона, его содержимое начинает функционировать. В этом 
конкретном примере, содержимое копируется, выполняется запрос изображения и 
воспроизводится конечная разметка.

## Демо

### Пример: инертный скрипт

В этом примере продемонстрировано бездействие содержимого шаблона. `<script>` 
выполняется только после нажатия на кнопку и извлечения шаблона.

    <button onclick="useIt()">Нажми на меня</button>
    <div id="container"></div>
    <script>
      function useIt() {
        var content = document.querySelector('template').content;
        // Обновление чего-нибудь в DOM шаблона.
        var span = content.querySelector('span');
        span.textContent = parseInt(span.textContent) + 1;
        document.querySelector('#container').appendChild(
            content.cloneNode(true));
      }
    </script>

    <template>
      <div>Шаблон использован: <span>0</span></div>
      <script>alert('Спасибо!')</script>
    </template>

<style>
.demoarea {
    padding: 10px;
    background: none repeat scroll 0% 0% rgb(255, 255, 255);
    border: 1px dashed rgb(0, 0, 0);
    display: inline-block;
    position: relative;
button {
    display: inline-block;
    background: linear-gradient(rgb(249, 249, 249) 40%, rgb(227, 227, 227) 70%) repeat scroll 0% 0% transparent;
    border: 1px solid rgb(153, 153, 153);
    border-radius: 3px 3px 3px 3px;
    padding: 5px 8px;
    outline: 0px none;
    white-space: nowrap;
    -moz-user-select: none;
    cursor: pointer;
    text-shadow: 1px 1px rgb(255, 255, 255);
    font-weight: 700;
    font-size: 10pt;
}
</style>
<div class="demoarea">
<button onclick="useIt()">Use me</button>
<div id="container"></div>
<template id="inert-demo">
  <div>Template used <span>0</span></div>
  <script>if ('HTMLTemplateElement' in window) {alert('Thanks!')}</script>
</template>
<script>
  function useIt() {
    var content = document.querySelector('#inert-demo').content;
    var span = content.querySelector('span');
    span.textContent = parseInt(span.textContent) + 1;
    document.querySelector('#container').appendChild(content.cloneNode(true));
  }
</script>
</div>

### Пример: Создание теневого дерева из шаблона

Большинство разработчиков прикрепляет теневое дерево к ведущему элементу изменяя 
строку разметки через `.innerHTML`:

    <div id="host"></div>
    <script>
      var shadow = document.querySelector('#host').webkitCreateShadowRoot();
      shadow.innerHTML = '<span>Ведущий элемент</span>';
    </script>

Проблема такого подхода состоит в том, что чем сложнее становится ваш теневой 
DOM, тем чаще вам приходится прибегать к конкатенации строк. Он не 
масштабируется, очень быстро получается путаница, все в печали. Благодаря именно 
таким подходам возник межсайтовый скриптинг! `<template>` приходит на помощь.

Более разумным было бы напрямую присоединять содержимое шаблона к корневому 
элементу теневого дерева:

    <template>
    <style>
      @host {
        * {
          background: #f8f8f8;
          padding: 10px;
          -webkit-transition: all 400ms ease-in-out;
          box-sizing: border-box;
          border-radius: 5px;
          width: 450px;
          max-width: 100%;
        } 
        *:hover {
          background: #ccc;
        }
      }
      div {
        position: relative;
      }
      header {
        padding: 5px;
        border-bottom: 1px solid #aaa;
      }
      h3 {
        margin: 0 !important;
      }
      textarea {
        font-family: inherit;
        width: 100%;
        height: 100px;
        box-sizing: border-box;
        border: 1px solid #aaa;
      }
      footer {
        position: absolute;
        bottom: 10px;
        right: 5px;
      }
    </style>
    <div>
      <header>
        <h3>Добавление комментария</h3>
      </header>
      <content select="p"></content>
      <textarea></textarea>
      <footer>
        <button>Опубликовать</button>
      </footer>
    </div>
    </template>

    <div id="host">
      <p>Здесь должны быть инструкции</p>
    </div>

    <script>
      var shadow = document.querySelector('#host').webkitCreateShadowRoot();
      shadow.appendChild(document.querySelector('template').content);
    </script>

## Нюансы

Вот несколько нюансов, с которыми я столкнулся используя `<template>` в полевых 
условиях:

* Используя модуль [modpagespeed][8], берегитесь этой [ошибки][9]. CSS-правила 
PageSpeed могут переместить шаблоны, в которых определяется строчный 
`<style scoped>`, в шапку. 
* Предварительный запуск шаблона невозможен, это значит что нельзя 
предварительно загрузить ресурсы, выполнить JS, загрузить исходный CSS, и т.д. 
Это касается и стороны сервера, и клиента. Шаблон воспроизводится только когда 
он активирован. 
* Будьте осторожны с вложенными шаблонами. Они ведут себя не так, как вы можете
ожидать. 

Например:

    <template>
      <ul>
        <template>
          <li>Всякая всячина</li>
        </template>
      </ul>
    </template>

Активация внешнего шаблона не означает активацию внутренних. То есть, во 
вложенных шаблонах дочерние шаблоны должны быть активированы вручную.

## Путь к стандарту

Не стоит забывать с чего всё начиналось. Путь к стандартизации HTML-шаблонов был 
долгим. На протяжении многих лет мы придумывали ловкие способы создания шаблонов 
многократного использования. Ниже представлены два из них, с которыми столкнулся 
я. Они представлены в этой статье для сравнения.

### Метод 1: Скрытый DOM

Один из подходов, который использовался разработчиками продолжительное время 
предусматривает создание «скрытого» DOM, который не отображается благодаря 
атрибуту `hidden` или `display:none`.

    <div id="mytemplate" hidden>
      <img src="logo.png">
      <div class="comment"></div>
    </div>

Хотя этот приём работает, у него есть ряд недостатков. Вот краткий обзор этого 
приёма:

<style>
label.good {
    background-color: green;
}
label.bad {
    background-color: red;
}
label.bad, label.good, label.sortof {
    padding: 4px;
    line-height: 1.7;
    border-radius: 50% 50% 50% 50%;
    color: white;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    transform: rotateZ(90deg);
    box-shadow: -2px 2px 3px 3px rgba(0, 0, 0, 0.25) inset;
    width: 20px;
    height: 20px;
    font-size: 16px;
}
label {
    cursor: pointer;
}
</style>

* <div class="good"></div>*Использование DOM* — браузер понимает DOM. Причём 
очень хорошо. Его легко можно клонировать.
* <div class="good"></div>*Ничто не отображается* — добавление `hidden` 
предотвращает отображение блока.
* <div class="bad"></div>*Брак инертности* — хотя содержимое скрыто, на 
изображение всё равно происходит запрос. 
* <div class="bad"></div>*Трудности стилизации и оформления* — все CSS-правила 
документа, в который вставлен скрытый DOM, должны содержать приставку 
`#mytemplate` для того, чтобы они применялись только внутри шаблона. Это 
ненадёжно и не даёт гарантии, что в будущем не возникнет конфликтов названий. 
Например, если на странице уже есть элемент с таким `id`, то мы влипли.

### Метод 2: Перегрузка скрипта

Ещё один приём предусматривает перегрузку `<script>` и управление его содержимым 
как строкой. Первым кто так сделал был Джон Резиг (John Resig), представивший в 
2008 году свой [микро-шаблонизатор][10]. Сегодня их существует множество, в том 
числе шаблонизаторы нового поколения вроде [handlebars.js][11].

Пример:

    <script id="mytemplate" type="text/x-handlebars-template">
      <img src="logo.png">
      <div class="comment"></div>
    </script>

Обзор этого приёма:

* <div class="good"></div>*Ничто не отображается* — браузер не отображает этот 
блок, потому что для `<script>` установлено `display:none` по умолчанию.
* <div class="good"></div>*Инертность* — браузер не парсит содержимое `<script>` 
как скрипт JS, потому что для него установлен тип отличный от "text/javascript".
* <div class="bad"></div>*Проблемы с безопасностью* — поощряется использование 
`.innerHTML`. Строчный парсинг предоставляемых пользователем данных может 
привести к уязвимости к межсайтовому скриптингу.

## Заключение

Помните как упростилась работа с DOM благодаря jQuery? В результате в платформу 
был добавлен `querySelector()`/`querySelectorAll()`. Безусловная победа, не так 
ли? Благодаря этой библиотеке обращения к DOM с помощью CSS-селекторов стали 
общепринятыми и затем были включены в стандарты. Так происходит не всегда, но я 
*обожаю* такие случаи. 

Думаю с `<template>` дело обстоит так же. Он стандартизирует шаблонизацию на 
стороне клиента, и что более важно, исключает необходимость в [сумасшедших 
трюках, которые мы использовали в 2008 году][12]. На мой взгляд привнесение в 
процесс веб-разработки большей доли здравомыслия, возможностей поддержки кода и 
большей функциональности — это в любом случае хорошо.

## Дополнительные материалы

* [Спецификация W3C][13]
* [Введение в Веб-компоненты][14]
* [<web>компоненты</web>][15] ([видео][16]) — невероятно полная презентация от 
вашего покорного слуги.

[1]: http://en.wikipedia.org/wiki/Template_engine_%28web%29
[2]: http://www.thefreedictionary.com/template
[3]: https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html
[4]: https://plus.google.com/111386188573471152118/posts
[5]: http://www.html5rocks.com/en/tutorials/webcomponents/template/#toc-pillars
[6]: http://www.w3.org/TR/html5-diff/#content-model
[7]: http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/
[8]: http://code.google.com/p/modpagespeed/
[9]: http://code.google.com/p/modpagespeed/issues/detail?id=625
[10]: http://ejohn.org/blog/javascript-micro-templating/
[11]: http://handlebarsjs.com/
[12]: http://www.html5rocks.com/en/tutorials/webcomponents/template/#toc-old
[13]: https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html
[14]: https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html#template-section
[15]: http://html5-demos.appspot.com/static/webcomponents/index.html
[16]: http://www.youtube.com/watch?v=eJZx9c6YL8k
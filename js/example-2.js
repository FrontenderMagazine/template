document.getElementById('holder').innerHTML = '<template id="demo-sd-template"><style>  @host {    * {      background: #f8f8f8;      padding: 10px;      -webkit-transition: all 400ms ease-in-out;      box-sizing: border-box;      border-radius: 5px;      width: 450px;      max-width: 100%;    }     *:hover {      background: #ccc;    }  }  #unsupportedbrowsersneedscoping {    position: relative;  }  #unsupportedbrowsersneedscoping header {    padding: 5px;    border-bottom: 1px solid #aaa;  }  #unsupportedbrowsersneedscoping .title {    margin: 0 !important;  }  #unsupportedbrowsersneedscoping textarea {    font-family: inherit;    width: 100%;    height: 100px;    box-sizing: border-box;    border: 1px solid #aaa;  }  #unsupportedbrowsersneedscoping footer {    position: absolute;    bottom: 10px;    right: 5px;  }</style><section id="unsupportedbrowsersneedscoping">    <header>        <span class="title">Комментарий</span>    </header>    <content select="p"></content>    <textarea></textarea>    <footer>        <button>Добавить</button>    </footer></section></template>';

(function() {
  var host = document.querySelector('#demo-sd-host');
  var compat = HTMLElement.prototype.webkitCreateShadowRoot ||
               HTMLElement.prototype.createShadowRoot ? true : false;
  if (compat && 'HTMLTemplateElement' in window) {
    var shadow = host.webkitCreateShadowRoot();
    shadow.applyAuthorStyles = true;
    shadow.appendChild(document.querySelector('#demo-sd-template').content);
  } else {
    document.querySelector('#unsupportedbrowsersneedscoping').style.display = 'none';
    host.style.display = 'none';
  }
})();
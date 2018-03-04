# soyagaci-parser
Bu kütüphane e-devlet'in verdiği soy ağacı çıktısını hertürlü format'da işleyip, ortak bir formata dönüştürmek için yapılmıştır. Webpack ve Typescript ile NPM modülü oluşturma alıştırması için yapıldı.

## Kullanım
Projeyi node uygulamanızda veya frontend'de birden fazla yöntem ile kullanabilirsiniz. PDFParser hem node, hem frontend tarafında PDF.JS'ye gerek duymaktadır. HTMLParser ise node tarafında JSDOM'a gereksinim duymaktadır.

### Node modülü olarak
`npm install soyagaci-parser` yazarak kütüphaneyi projenize ekleyin. Eğer bir bundler kullanıyorsanız, bu şekilde kurulum yaptınızda, projeyi sıkıntısız bir şekilde frontend'de de kullanabilirsiniz.

Proje node modülü olarak olarak çalışabilmektedir. Tüm export'lar es7 modülü olarak yapılmaktadır. Bu yüzden `import` syntaxı veya `require` kullanabilirsiniz. Örnek kullanımlar;

```js
// Bu satırlardan sadece birini kullanın!
// import syntaxı ile
import { HTMLParser, TextParser, PDFParser } from `soyagaci-parser`;
import { HTMLParser } from `soyagaci-parser/format/html`;
import HTMLParser from `soyagaci-parser/format/html`;
// require syntaxı ile
const { HTMLParser, TextParser, PDFParser } = require('soyagaci-parser');
const { HTMLParser } = require('soyagaci-parser/format/html');
const HTMLParser = require('soyagaci-parser/format/html').default;

HTMLParser(htmlString).then(console.log);
TextParser(textString).then(console.log);
PDFParser(uint8Array).then(console.log);
```

Eğer PDFParser kullanırken hata alıyorsanız, node tarafında kullanıyor iseniz `npm install --save pdfjs-dist` yapın, frontend tarafında kullanıyor iseniz `pdfjs-dist` script'i ekleyin.

Eğer HTMLParser ile hata alıyorsanız, `npm install --save jsdom` yapınız.

### Standart script olarak kullanmak
Proje'yi web uygulamalarında `<script>` tag'ı ile kullanmak mümkündür. Bunun için projenin daha önceden build edilmiş bir scriptini, veya proje'yi clonelayıp, `node run build:web` yaptıktan sonra, webBuild'deki dosyaları web projenize ekleyiniz.

[Releases](/releases) bölümünde bu js dosyalarının build edilmiş halini bulabilirsiniz.

Aşağıdakilerden durumunuza göre 1 veya 1'den fazlasını kullanabilirsiniz. Eğer PDFParser kullanacaksanız, pdfjs'yi daha önceden `<script>` olarak eklemiş olmanız gerekmekte.

```html
<-- örnek pdfjs scripti -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.402/pdf.min.js" />

<-- html/text/pdf parsing tek dosyada -->
<script type="text/javascript" src="soyagaci-parser.js" />
<-- Sadece html parsing ve yardımcı fonksiyonları -->
<script type="text/javascript" src="soyagaci-parser-html.js" />
<-- Sadece pdf parsing ve yardımcı fonksiyonları -->
<script type="text/javascript" src="soyagaci-parser-pdf.js" />
<-- Sadece text parsing ve yardımcı fonksiyonları -->
<script type="text/javascript" src="soyagaci-parser-text.js" />
```

```js
soyagaciParser.HTMLParser(htmlString).then(console.log);
soyagaciParser.TextParser(textString).then(console.log);
soyagaciParser.PDFParser(uint8Array).then(console.log);
```

# 🕸️ NodeScraper

**NodeScraper** is a fast and flexible Node.js web scraping toolkit built using [Axios](https://www.npmjs.com/package/axios) and [Cheerio](https://www.npmjs.com/package/cheerio). It provides an intuitive interface for extracting structured HTML and metadata from websites — with clean and consistent outputs.

> Fast. Clean. JavaScript-style scraping. 🕸️⚡

---

## 🚀 Features

- ✅ Extract metadata: title, description, keywords, author, and more
- ✅ Built-in support for Open Graph, Twitter Card, canonical, and CSRF tags
- ✅ Extract HTML structures: `h1`–`h6`, `p`, `ul`, `ol`, `img`, links
- ✅ Powerful `filter()` method with class, ID, and tag-based selectors
- ✅ `returnHtml` toggle to return clean text or raw HTML
- ✅ Simple return values: string, array, or object
- ✅ Powered by Axios and Cheerio

---

## 📦 Installation

```bash
npm install @riodevnet/nodescraper
```

> Requires Node.js 14 or later

---

## 🛠️ Basic Usage

```js
const NodeScraper = require("@riodevnet/nodescraper");

(async () => {
  const scraper = new NodeScraper("https://example.com");
  await scraper.init();

  console.log(scraper.title()); // "Welcome to Example.com"
  console.log(scraper.description()); // "This is the example meta description."
  console.log(scraper.h1()); // ["Welcome", "Latest News"]
  console.log(scraper.open_graph()); // { "og:title": "...", "og:description": "...", ... }

  // Custom filter
  console.log(
    scraper.filter({
      element: "div",
      attributes: { class: "card" },
      multiple: true,
      extract: ["h1", "p", ".title", "#desc"],
    })
  );
})();
```

---

## 🧪 Available Methods

### 🔹 Page Metadata

```js
scraper.title();
scraper.description();
scraper.keywords();
scraper.keyword_string();
scraper.charset();
scraper.canonical();
scraper.content_type();
scraper.author();
scraper.csrf_token();
scraper.image();
```

### 🔹 Open Graph & Twitter Card

```js
scraper.open_graph();
scraper.open_graph("og:title");

scraper.twitter_card();
scraper.twitter_card("twitter:title");
```

### 🔹 Headings & Text

```js
scraper.h1();
scraper.h2();
scraper.h3();
scraper.h4();
scraper.h5();
scraper.h6();
scraper.p();
```

### 🔹 Lists

```js
scraper.ul();
scraper.ol();
```

### 🔹 Images

```js
scraper.images();
scraper.image_details();
```

### 🔹 Links

```js
scraper.links();
scraper.link_details();
```

---

## 🔍 Custom DOM Filtering

Use `filter()` to target specific DOM elements and extract nested content.

#### ▸ Single element

```js
scraper.filter({
  element: "div",
  attributes: { id: "main" },
  multiple: false,
  extract: [".title", "#description", "p"],
});
```

#### ▸ Multiple elements

```js
scraper.filter({
  element: "div",
  attributes: { class: "card" },
  multiple: true,
  extract: ["h1", ".subtitle", "#meta"],
});
```

> The `extract` array accepts tag names, class selectors (e.g., `.title`), or ID selectors (e.g., `#meta`).  
> Output keys are automatically normalized:  
> `.title` → `class__title`, `#meta` → `id__meta`

#### ▸ Clean Text Output

Disable raw HTML output:

```js
scraper.filter({
  element: "p",
  attributes: { class: "dark-text" },
  multiple: true,
  returnHtml: false,
});
```

---

## 📦 Output Example

```js
scraper.title();
// "Welcome to Example.com"

scraper.h1();
// ["Main Heading", "Another Title"]

scraper.open_graph("og:title");
// "Example OG Title"
```

---

## 📁 Project Structure (suggested)

```
nodescraper/
├── index.js
├── package.json
├── examples/
└── tests/
```

---

## 🧪 Testing

Testing support coming soon using:

- `jest`
- `nock` for HTTP mocking

---

## 🤝 Contributing

Contributions are welcome!  
Found a bug or want to request a feature? Please open an [issue](https://github.com/riodevnet/nodescraper/issues) or submit a pull request.

---

## 📄 License

MIT License © 2025 — NodeScraper

---

## 🔗 Related Projects

- [Axios](https://axios-http.com/)
- [Cheerio](https://cheerio.js.org/)
- [Node.js](https://nodejs.org/)

---

## 💡 Why NodeScraper?

> Think of it as your JavaScript web detective — fast, efficient, and precise.

const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class NodeScraper {
    constructor(url) {
        this.url = url;
        this.soup = null;
    }

    async init() {
        if (!this.url || typeof this.url !== 'string' || !this._isValidUrl(this.url)) {
            return;
        }
        try {
            const response = await axios.get(this.url, { timeout: 10000 });
            this.soup = cheerio.load(response.data);
        } catch {
            this.soup = null;
        }
    }

    _isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    title() {
        return this.soup ? this.soup('title').text() || null : null;
    }

    charset() {
        return this.soup ? this.soup('meta[charset]').attr('charset') || null : null;
    }

    viewport() {
        const content = this.viewport_string();
        return content ? content.split(',') : null;
    }

    viewport_string() {
        return this.soup ? this.soup('meta[name="viewport"]').attr('content') || null : null;
    }

    canonical() {
        return this.soup ? this.soup('link[rel="canonical"]').attr('href') || null : null;
    }

    content_type() {
        return this.soup ? this.soup('meta[http-equiv="Content-Type"]').attr('content') || null : null;
    }

    csrf_token() {
        if (!this.soup) return null;
        let tag = this.soup('meta[name="csrf-token"]');
        if (tag.length === 0) tag = this.soup('input[name="csrf-token"]');
        return tag.attr('content') || tag.attr('value') || null;
    }

    author() {
        return this.soup ? this.soup('meta[name="author"]').attr('content') || null : null;
    }

    description() {
        return this.soup ? this.soup('meta[name="description"]').attr('content') || null : null;
    }

    image() {
        return this.soup ? this.soup('meta[property="og:image"]').attr('content') || null : null;
    }

    keywords() {
        const content = this.keyword_string();
        return content ? content.split(',') : null;
    }

    keyword_string() {
        return this.soup ? this.soup('meta[name="keywords"]').attr('content') || null : null;
    }

    open_graph(prop = null) {
        if (!this.soup) return null;
        if (prop) {
            return this.soup(`meta[property="${prop}"]`).attr('content') || null;
        }

        const props = ['og:site_name', 'og:type', 'og:title', 'og:description', 'og:url', 'og:image'];
        const result = {};
        for (const p of props) {
            result[p] = this.soup(`meta[property="${p}"]`).attr('content') || null;
        }
        return result;
    }

    twitter_card(prop = null) {
        if (!this.soup) return null;
        if (prop) {
            return this.soup(`meta[name="${prop}"]`).attr('content') || null;
        }

        const props = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:url', 'twitter:image'];
        const result = {};
        for (const p of props) {
            result[p] = this.soup(`meta[name="${p}"]`).attr('content') || null;
        }
        return result;
    }

    _tagList(tagName) {
        if (!this.soup) return null;
        return this.soup(tagName).map((_, el) => this.soup(el).text().trim()).get();
    }

    h1() { return this._tagList('h1'); }
    h2() { return this._tagList('h2'); }
    h3() { return this._tagList('h3'); }
    h4() { return this._tagList('h4'); }
    h5() { return this._tagList('h5'); }
    h6() { return this._tagList('h6'); }
    p()  { return this._tagList('p'); }

    ul() {
        if (!this.soup) return null;
        const result = [];
        this.soup('ul').each((_, ul) => {
            this.soup(ul).find('li').each((_, li) => {
                result.push(this.soup(li).text().trim());
            });
        });
        return result;
    }

    ol() {
        if (!this.soup) return null;
        const result = [];
        this.soup('ol').each((_, ol) => {
            this.soup(ol).find('li').each((_, li) => {
                result.push(this.soup(li).text().trim());
            });
        });
        return result;
    }

    images() {
        if (!this.soup) return null;
        return this.soup('img').map((_, el) => this.soup(el).attr('src')).get();
    }

    image_details() {
        if (!this.soup) return null;
        return this.soup('img').map((_, el) => ({
            url: this.soup(el).attr('src'),
            alt_text: this.soup(el).attr('alt'),
            title: this.soup(el).attr('title')
        })).get();
    }

    links() {
        if (!this.soup) return null;
        return this.soup('a').map((_, el) => this.soup(el).attr('href')).get().filter(Boolean);
    }

    link_details() {
        if (!this.soup) return null;
        const result = [];
        this.soup('a').each((_, el) => {
            const $el = this.soup(el);
            const href = $el.attr('href') || '';
            const rel = ($el.attr('rel') || '').split(/\s+/);
            result.push({
                url: href,
                protocol: href.includes(':') ? href.split(':')[0] : '',
                text: $el.text().trim(),
                title: $el.attr('title') || '',
                target: $el.attr('target') || '',
                rel,
                is_nofollow: rel.includes('nofollow'),
                is_ugc: rel.includes('ugc'),
                is_noopener: rel.includes('noopener'),
                is_noreferrer: rel.includes('noreferrer')
            });
        });
        return result;
    }

    filter({ element, attributes = {}, multiple = false, extract = [], returnHtml = true }) {
        if (!this.soup || typeof attributes !== 'object') return null;

        const match = this.soup(element).filter((_, el) => {
            return Object.entries(attributes).every(([key, value]) => this.soup(el).attr(key) === value);
        });

        const extractContentFromTag = (el, selectors) => {
            const result = {};
            for (const sel of selectors) {
                let found;
                let key;
                if (sel.startsWith('.')) {
                    key = `class__${sel.slice(1)}`;
                    found = this.soup(el).find(`.${sel.slice(1)}`);
                } else if (sel.startsWith('#')) {
                    key = `id__${sel.slice(1)}`;
                    found = this.soup(el).find(`#${sel.slice(1)}`);
                } else {
                    key = sel;
                    found = this.soup(el).find(sel);
                }
                result[key] = found.text().trim() || null;
            }
            return result;
        };

        if (multiple) {
            return match.map((_, el) => {
                if (Array.isArray(extract) && extract.length > 0) {
                    return extractContentFromTag(el, extract);
                }
                return returnHtml ? this.soup.html(el) : this.soup(el).text().trim();
            }).get();
        } else {
            const el = match.get(0);
            if (!el) return null;
            if (Array.isArray(extract) && extract.length > 0) {
                return extractContentFromTag(el, extract);
            }
            return returnHtml ? this.soup.html(el) : this.soup(el).text().trim();
        }
    }
}

module.exports = NodeScraper;

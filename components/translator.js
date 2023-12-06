const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {

  constructor() {
    this.error = '';
  }

  resetState() {
    this.error = null;
  }

  firstLetterToUpperCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  extractWordsAndPunctuation(text) {
    return text.match(/(\w+'\w+|\w+|[^\w\s]|\d+|\s+)/g);
  }

  validate(text, locale) {

    if (text == undefined || locale == undefined) {
      return this.error = 'Required field(s) missing';
    }

    if (!text) {
      return this.error = 'No text to translate';
    }

    if (locale !== 'american-to-british' && locale !== 'british-to-american') {
      return this.error = 'Invalid value for locale field';
    }

    return;
  }

  translate(text, locale) {
    let translation = text.slice();
    translation = this.translateOnly(translation, locale);
    translation = this.translateSpelling(translation, locale);
    translation = this.translateTitles(translation, locale);
    translation = this.translateTime(translation, locale);

    return translation;
  }

  translateOnly(text, locale) {
    const termsToReplace = (locale === 'american-to-british') ? Object.entries(americanOnly) : Object.entries(britishOnly);

    termsToReplace.sort((a, b) => b[0].length - a[0].length);

    termsToReplace.forEach(([key, value]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      text = text.replace(regex, `<span class="highlight">${value}</span>`);
    });

    return text;
  }

  translateSpelling(text, locale) {
    const words = this.extractWordsAndPunctuation(text);
    
    if (locale === 'american-to-british') {
      words.forEach((word, index) => {
        if (/\w+/.test(word)) {
          if (americanToBritishSpelling[word]) {
            words[index] = `<span class="highlight">${americanToBritishSpelling[word]}</span>`;
          }
        }
      });
    } else if (locale === 'british-to-american') {
      words.forEach((word, index) => {
        if (/\w+/.test(word)) {
          if (Object.values(americanToBritishSpelling).includes(word)) {
            words[index] = `<span class="highlight">${Object.keys(americanToBritishSpelling).find((key) => americanToBritishSpelling[key] === word)}</span>`;
          }
        }
      });
    }
    return words.join('');
  }

  translateTitles(text, locale) {
    const words = text.split(' ');

    if (locale === 'american-to-british') {
      words.forEach((word, index) => {
        if (Object.keys(americanToBritishTitles).includes(word.toLowerCase())) {
          words[index] = `<span class="highlight">${this.firstLetterToUpperCase(americanToBritishTitles[word.toLowerCase()])}</span>`;
        }
      });
    } else if (locale === 'british-to-american') {
      words.forEach((word, index) => {
        if (Object.values(americanToBritishTitles).includes(word.toLowerCase())) {
          words[index] = `<span class="highlight">${this.firstLetterToUpperCase(Object.keys(americanToBritishTitles).find((key) => americanToBritishTitles[key] === word.toLowerCase()))}</span>`;
        }
      });
    }
    return words.join(' ');
  }

  translateTime(text, locale) {
    const match = (locale === 'american-to-british' ? text.match(/\d+:\d+/) : text.match(/\d+\.\d+/));
    
    if (match) {
      if (locale === 'american-to-british') {
        return text.replace(match[0], `<span class="highlight">${match[0].replace(':','.')}</span>`);
      } else if (locale === 'british-to-american') {
        return text.replace(match[0], `<span class="highlight">${match[0].replace('.',':')}</span>`);
      }
    }
    return text;
  }

}

module.exports = Translator;
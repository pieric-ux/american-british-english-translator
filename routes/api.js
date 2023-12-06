'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {

  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const { text, locale } = req.body;

      translator.resetState();

      translator.validate(text, locale);
      if (translator.error) {
        return res.json({ error: translator.error });
      }
      
      const translation = translator.translate(text, locale);
      if (translation === text) {
        return res.json({ text: text, translation: 'Everything looks good to me!' });
      }

      res.json({ text: text, translation: translation });
    });
};

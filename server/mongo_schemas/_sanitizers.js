/* server/mongo_schemas/_sanitizers.js */

function sanitizeShortText(str, MAX_LENGTH = 30) {
    if (!str) return '';
    return str
      .slice(0, MAX_LENGTH)
      .replace(/[^a-zA-Z0-9\s_\-\+\(\)\[\]ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
  }
  
  function sanitizeLongText(str, MAX_LENGTH = 1000) {
    if (!str) return '';
    return str
      .slice(0, MAX_LENGTH)
      .replace(/\./g, '．')  // U+FF0E fullwidth full stop
      .replace(/,/g, '，')   // U+FF0C fullwidth comma
      .replace(/\$/g, '＄')  // U+FF04 fullwidth dollar sign
      .replace(/&/g, '＆')   // U+FF06 fullwidth ampersand
      .replace(/[^a-zA-Z0-9\s,\.!?:;"'\(\)\-\–—\[\]\/=\*\_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
  }
  
  function sanitizeNumber(num, MAX_NUMBER = 5000) {
    if (typeof num !== 'number' || isNaN(num)) return 0;
    return Math.min(Math.abs(num), MAX_NUMBER);
  }
  
  module.exports = {
    sanitizeShortText,
    sanitizeLongText,
    sanitizeNumber
  };
  
var i18n = require('i18n');

i18n.configure({
  locales:['ko', 'en'],
  directory: './locales',
  defaultLocale: 'ko',
  cookie: 'lang',
  updateFiles: false,
  objectNotation: true,
});

module.exports = function(req, res, next) {
  i18n.init(req, res);
  res.locals.__ == res.__;
  var current_locale = i18n.getLocale();
  
  return next();
}
var logger = require('../../logger');
var fse = require('fs-extra');
var hljs = require('highlight.js'); 

var md = require('markdown-it')({
  html: true,
  langPrefix: 'language-',
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    return ''; // use external default escaping
  }

});


var getDocuemnt = async function (req, res) {
  logger.debug(req.method + ' : ' + req.url);
  var docName = (req.params.docname).toLowerCase();

  logger.debug('docName : ' + docName);

  var content = null;
  var mdContent = null;

  try {
    content = await fse.readFile("./doc/" + docName + '.md', "utf8");
    mdContent = md.render(content);

  } catch (e) {
    if (e.code == 'ENOENT') {
      mdContent = 'ENOENT: no such file or directory';
    } else {
      mdContent = 'exception accoured!';
    }

    logger.error(mdContent);
    logger.dir(e);
  }

  // logger.dir(content);

  return res.render('doc_markdown.ejs', {
    user: null,
    menuBarShrink: req.cookies.menuBarShrink,
    mdTitle: 'Documentation : ' + docName,
    mdContent: mdContent
    // strgStatus : strgMgr.getStrgStatus(),
  });




}

module.exports.getDocuemnt = getDocuemnt;
function pathExtractor(req) {
  return req.url;
//  return replaceAll(req.get('referer'), req.get('origin'), '');
}

// Escaping user input to be treated as a literal 
// string within a regular expression accomplished by 
// simple replacement
function escapeRegExp(str) {
  console.log('msg : str : ' + str);
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}
// Replace utility function
function replaceAll(str, find, replace) {
  console.log('msg : str : ' + str + ', find : ' + find + ', replasce : ' + replace) ;
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace); 
}


exports.pathExtractor = pathExtractor;
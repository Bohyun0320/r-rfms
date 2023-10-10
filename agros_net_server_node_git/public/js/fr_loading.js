
function startLoading($parent, classStr, center) {
//  console.log('start loading');
  var $loadingBlock = $('.loading-block').clone();
  
  $loadingBlock.addClass(classStr);
  $loadingBlock.css('display', 'inline-block');

  if (center != undefined && center == true) {
    $loadingBlock.addClass('loading-block-center');
  }
  
  if ($parent == null) {
    $parent = $('body');
  }
  $('.'+classStr).remove();
  $parent.append($loadingBlock);
}

function stopLoading(classStr) {
  $('.'+classStr).remove();
}
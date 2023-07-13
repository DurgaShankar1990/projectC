$('.mobile-menu-toggle').click(function(){
  if($(this).hasClass('close-menu')) {
    $('.mobile-menu').removeClass('open');
    $('html').removeClass('menu-is-open');
    $(this).removeClass('close-menu');
  } else {
    $(this).addClass('close-menu');
    $('.mobile-menu').addClass('open');
    $('html').addClass('menu-is-open');
  }
});

$(document).ready(function() {
  $('.mobile-menu .hs-menu-depth-1>.hs-menu-children-wrapper').slideUp();

  $('.hs-item-has-children.hs-menu-depth-1').click(function() {
    var child = $(this).children('.hs-menu-children-wrapper');
    if ($(this).hasClass('open')) {
      $(this).removeClass('open');
      child.slideUp();
    } else {
      $(this).addClass('open');
      child.slideDown();
    }
  });
});

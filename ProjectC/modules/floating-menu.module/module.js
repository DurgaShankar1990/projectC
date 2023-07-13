$('.floating-menu__open').click(function() {
  var parent = $(this).parent();
  if (parent.hasClass('open')) {
    parent.removeClass('open');
  } else {
    parent.addClass('open');
  }
});
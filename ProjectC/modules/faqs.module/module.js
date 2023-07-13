$(document).ready(function() {

  $('.faq__answer-content').each(function() {
    $(this).slideUp();
  });
  setTimeout(
    function() 
    {
      $('.faq__answer-content').addClass('loaded');
    }, 1000);

  $('.faq__question').click(function() {
    if ($(this).hasClass('open')) {
      $(this).siblings('.faq__answer-content').slideUp();
      $(this).removeClass('open');
    } else {
      $(this).siblings('.faq__answer-content').slideDown();
      $(this).addClass('open');
    }
  });
});
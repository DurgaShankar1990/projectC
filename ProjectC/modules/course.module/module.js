$('.lesson__play-icon').magnificPopup({
  type: 'iframe',
  iframe: {
    markup: '<div class="mfp-iframe-scaler">'+
    '<div class="mfp-close"></div>'+
    '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
    '</div>', // HTML markup of popup, `mfp-close` will be replaced by the close button
    patterns: {
      youtube: {
        index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).
        id: 'v=', // String that splits URL in a two parts, second part should be %id%
        // Or null - full URL will be returned
        // Or a function that should return %id%, for example:
        // id: function(url) { return 'parsed id'; }
        src: '//www.youtube.com/embed/%id%?autoplay=1' // URL that will be set as a source for iframe.
      },
      vimeo: {
        index: 'vimeo.com/',
        id: '/',
        src: '//player.vimeo.com/video/%id%?autoplay=1'
      },
      gmaps: {
        index: '//maps.google.',
        src: '%id%&output=embed'
      },
      wistia: {
        index: 'wistia.com',
        id: function(url) {        
          var m = url.match(/^.+wistia.com\/(medias)\/([^_]+)[^#]*(#medias=([^_&]+))?/);
          if (m !== null) {
            if(m[4] !== undefined) {
              return m[4];
            }
            return m[2];
          }
          return null;
        },
        src: '//fast.wistia.net/embed/iframe/%id%?autoPlay=1' // https://wistia.com/doc/embed-options#options_list
      }
    },
    srcAction: 'iframe_src', // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
  }
});


// quiz
$('.quiz__answer').on('click', function() {
  $('.quiz__answer').removeClass('quiz__answer--selected');
  $(this).addClass('quiz__answer--selected');
});

$('.quiz__check-answer').click(function() {
  var selected = $('.quiz__answer--selected');
  if (selected.data('correct') == true) {
    selected.find('.quiz__answer-description').show();
    if ($(this).hasClass('final-question')) {
        if (selected.hasClass('quiz__answer-description--correct') == false) {
            $('.quiz__button-row').before('<small>You\'ve answered all the questions correctly, please navigate to the next lesson or back to the course overview.</small>');
        }
    }
    selected.addClass('quiz__answer-description--correct');
    $('.quiz__next-question').show();
  } else {
    selected.find('.quiz__answer-description').show();
    selected.addClass('quiz__answer-description--incorrect');
  }
});

$('.quiz__next-question').click(function() {
  $(this).closest('.quiz__question').hide();
  $('.quiz__answer-description').hide();
  $('.quiz__answer-description--correct').removeClass('quiz__answer-description--correct');
  $('.quiz__answer-description--incorrect').removeClass('quiz__answer-description--incorrect');
  $('.quiz__answer').removeClass('quiz__answer--selected');
  $('.quiz__next-question').hide();
  $(this).hide();
  $(this).closest('.quiz__question').next().show();
});

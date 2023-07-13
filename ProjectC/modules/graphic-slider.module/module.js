$('.omega-video').magnificPopup({
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



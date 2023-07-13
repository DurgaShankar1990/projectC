$(document).ready(function(){
  $('.resource-wrapper').matchHeight();
});

matchHeight = function(){
  $('.resource-wrapper:visible').matchHeight();
};

var qsRegex;

var $grid = $('.resources__inner-wrapper').isotope({
  itemSelector: '.resource-wrapper',    
  layoutMode: 'fitRows',
  filter: function() {
    return qsRegex ? $(this).text().match( qsRegex ) : true;
  }
});

// trigger isotope on popular topic selection
$('.isotope-filter').click(function(){
  var filter = $(this).attr('data-filter');
  $grid.isotope({ filter: filter });
  $('.isotope-filter').removeClass('selected');
  $(this).addClass('selected');
  $('.quicksearch').val("");
  $('.select-filter').val(filter);
  $('.select-filter--type').val('*');
  // set filter in hash
  location.hash = 'filter=' + encodeURIComponent( filter );
});

// trigger isotope on topic selection
$('.select-filter').change(function() {
  var filter = $(this).children('option:selected').attr('data-filter');
  $grid.isotope({ filter: filter });
  $('.isotope-filter').removeClass('selected');
  $('.topics').find(`[data-filter='${filter}']`).addClass('selected');
  $('.quicksearch').val("");
  $('.select-filter--type').val('*');
  // set filter in hash
  location.hash = 'filter=' + encodeURIComponent( filter );
});

// trigger isotope on type selection
$('.select-filter--type').change(function() {
  var filter = $(this).children('option:selected').attr('data-filter');
  $grid.isotope({ filter: filter });
  $('.isotope-filter').removeClass('selected');
  $('.isotope-filter[data-filter="*"]').addClass('selected');
  $('.quicksearch').val("");
  $('.select-filter').val('*');
  // set filter in hash
  location.hash = 'filter=' + encodeURIComponent( filter );
});

// use value of search field to filter
var $quicksearch = $('.quicksearch').keyup( debounce( function() {
  $('.isotope-filter').removeClass('selected');
  $('.select-filter').val("*");
  $('.select-filter--type').val("*");
  $('.isotope-filter[data-filter="*"]').addClass('selected');
  
  qsRegex = new RegExp( $quicksearch.val(), 'gi' );
  $grid.isotope({
    filter: function() {
      return qsRegex ? $(this).text().match( qsRegex ) : true;
    }
  });
  
  if ( $grid.data('isotope').filteredItems.length > 0) {
    $('.resources__empty-list').hide();
  } else {
    $('.resources__empty-list').show();
  }
}, 200 ) );

// debounce so filtering doesn't happen every millisecond
function debounce( fn, threshold ) {
  var timeout;
  threshold = threshold || 1000;
  return function debounced() {
    clearTimeout( timeout );
    var args = arguments;
    var _this = this;
    function delayed() {
      fn.apply( _this, args );
    }
    timeout = setTimeout( delayed, threshold );
  };
}

// Filter Reset
function resetGrid() {
  $grid.isotope({ filter: '*' })
}
// Make sure they aren't in a single column
if (window.innerWidth > 620) {
  // Match height of the rows after filtering
  $grid.isotope( 'on', 'layoutComplete', matchHeight ); 
} else {
//   Calls filter reset to fix a bug on mobile where the height was being measured wrong for the first resource
  setTimeout(resetGrid, 200); // check again in a second
}

function getHashFilter() {
  var hash = location.hash;
  // get filter=filterName
  var matches = location.hash.match( /filter=([^&]+)/i );
  var hashFilter = matches && matches[1];
  return hashFilter && decodeURIComponent( hashFilter );
}

// Filter on page load if there is a filter in the url
$(document).ready(function() {
  if (window.location.href.indexOf("filter=") > -1) {
    var hashValue = location.hash.replace(/^#/, ''); 
    var filter = hashValue.replace('filter=', '');
    $grid.isotope({ filter: filter });
    $(".select-filter--type").val(filter);
  }
});
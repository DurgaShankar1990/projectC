const options = { 
  theme: "snow",
  modules: {
    "emoji-toolbar": true,
    "emoji-textarea": true,
    "emoji-shortname": true,
  } 
};
var initializeQuill = function (e) {
  if(!this.quill){
    this.target = e;
    this.quill = new Quill(this.target, options);
    this.target.children[0].onclick = function(et) { et.preventDefault(); };
    this.target.children[0].onblur = function(l) {
      l.target.parentElement.quill.close;
    };
  }
  this.quill.focus();
}
// Form to POJO
function formToPOJO(formEl) {
  var formData = new FormData( formEl );
  return Object.fromEntries( formData )
}
// Build reply obj body
function buildReplyObj(parent) {
  var topic_id = parent.find("[name='topic_id']").val();
  console.log( topic_id )
  var quillValue = parent.find('.ql-editor').html();
  console.log( quillValue )
  parent.find("[name='reply_body']").val( quillValue );
  var formEl = parent.find("[data-type='properties']")[0];
  console.log( formEl )
  return {
    properties: formToPOJO(formEl),
    member_profiles: [ parent.find("[name='member_profile']").val() ],
    contacts: [ parent.find("[name='contacts']").val() ],
    topicId: topic_id
  }
}
// Submit reply
async function submitTopic(obj) {
  return rawResponse = await fetch(`https://{{ request.domain }}/_hcms/api/reply/create?topic=${obj.topicId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  });
};
// Add submit handler for reply to replies
function addReplyHandler(el) {
  el.on('submit', function(e) {
    e.preventDefault();
    var $submitBtn = el.find('button');
    var $submitBtnTemplate = $submitBtn.clone();
    $submitBtn.replaceWith( '<div id="submitBtn" style="padding: 1rem;"><span style="display:inline-block;" class="h-spin"><svg heigth="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 422.74 390.33"><defs><style>.b{fill:#1f2040;}</style></defs><path class="b" d="M410.62,149.95l-60.47-104.73C334,17.24,304.14,0,271.83,0h-120.93c-32.31,0-62.17,17.24-78.32,45.22L12.12,149.95c-16.16,27.98-16.16,62.46,0,90.44l60.47,104.73c16.16,27.98,46.01,45.22,78.32,45.22h120.93c32.31,0,62.17-17.24,78.32-45.22l60.47-104.73c16.16-27.98,16.16-62.46,0-90.44Zm-79.69,76.45l-32.73,56.7c-11.16,19.32-31.78,31.23-54.09,31.23h-65.47c-22.31,0-42.93-11.9-54.09-31.23l-32.73-56.7c-11.16-19.32-11.16-43.13,0-62.46l32.73-56.7c11.16-19.32,31.78-31.23,54.09-31.23h65.47c22.31,0,42.93,11.9,54.09,31.23l32.73,56.7c11.16,19.32,11.16,43.13,0,62.46Z"/></svg></span> <span>loading…</span></div>')
    var $submitBtnAfter = el.find('#submitBtn');
    var $replyParentDiv = $(e.target).parent();
    var bodyObj = buildReplyObj($replyParentDiv);
    var response = submitTopic(bodyObj)
    .then(function(resp) {
      return resp.json();
    })
    .then(function(resp) {
      // redirect to the new topic page
      setTimeout(function() {
        window.location = `${window.location.hash = resp.response.slug }` ;
        window.location.reload()
      }, 2000)
    })
    .catch( function( error ) {
      console.log( error );
      $submitBtnAfter.replaceWith($submitBtnTemplate);
    })
    })
};

// Handle click reply
$(document).ready(function() {
  $('body').on('click', '.reply-to-reply', function(e) {
    var $this = $(this);
    var $replyId = $this.attr('data-reply-id');
    var replyDivString = `#replyto-${$replyId}`;
    var $quillWrapper = $(`#quill-wrapper-${$replyId}`);
    var $thisQuillEditor = $quillWrapper.find(`#quill-${$replyId}`);
    // Init form
    var $form = $quillWrapper.find('form');
    console.log( $form )
    // apply submit handler
    addReplyHandler($form)
    // Hide UI
    $this.parent().hide();
    // Show reply UI
    $quillWrapper.show();
    //console.log( $thisQuillEditor );
    initializeQuill( $thisQuillEditor[0] )
    
  });
});

// Handle Submit reply
$(document).ready(function() {
  
});
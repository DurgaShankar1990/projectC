// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;
// const memberProfileObjectTypeId = '2-6029965';
// const topicObjectTypeId = '2-4293954';
const contactObjectTypeId ='0-1';

// create Object
function createObj(endpoint, payload, headers) {
  return axios.post(
    endpoint,
    JSON.stringify({properties: payload}),
    headers,
  ).then(function(response) {
    return response;
  })
  .catch(error => {
    console.error( "ERROR!", error.response.data )
    return error
  });
}

// Batch Associate objects
function batchAssoc(endpoint, payload, headers) {
  return axios.post(
    endpoint,
    JSON.stringify({inputs: payload}),
    headers,
  ).then(function(response) {
    return response;
  })
  .catch(error => error);
}

// Build batch memeber_profile assoc body
function buildBatchAssocMemberBody(idArr,objId, assocType) {
  let inputs = {}
  return idArr.map( id => {
    return {
      from: {
        id: id
      },
      to: {
        id: objId
      },
      types:  [{associationCategory: "USER_DEFINED", associationTypeId: assocType}]
    }
  });
}

// Build batch memeber_profile assoc body
function buildBatchAssocContactBody(idArr,objId, assocType) {
  let inputs = {}
  return idArr.map( id => {
    return {
      from: {
        id: id
      },
      to: {
        id: objId
      },
      types:  [{associationCategory: "USER_DEFINED", associationTypeId: assocType}]
    }
  });
}

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// Generate unqiue base32 id
function base32Id() {
  return `-${(new Date().getTime()).toString(36)}`;
}

// Build topic properties body w/ unique topic_slug
function buildBody(props, locale = "") {
  const properties = props;
  console.log( typeof locale )
  console.log(locale.length)
  
  if ( locale.length > 0 ) {
    console.log(1)
    console.log(locale.length)
    properties.topic_slug = `${locale}/${slugify(props.name)}${base32Id()}`;
    return properties
  } else {
    console.log(locale.length)
    console.log(2)
    properties.topic_slug = `${slugify(props.name)}${base32Id()}`;
    return properties
  }
}

// This function is executed when a request is made to the endpoint associated with this file in the serverless.json file
exports.main = async (context, sendResponse) => {
  axios.defaults.baseURL = 'https://api.hubapi.com';
  const headers = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${COHORTIUM_KEY}`
    }
  };
  const body = context.body;
  const properties = body.properties;
  const contacts = body.contacts;
  const member_profiles = body.member_profiles;
  const params = context.params;
  const limits = context.limits;
  const locale = context.body.properties.locale;

  console.log(`locale = ${locale}`);
  
  /*
  console.warn("properties");
  console.log( properties );
  
  console.log( contacts );
  console.warn("member_profiles");
  console.log( member_profiles );
  console.warn("____________________");
  */
 try{
  const schemas = await axios.get('/crm/v3/schemas', headers);
  const memberProfileSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'member_profile');
  const memberProfileObjectTypeId = memberProfileSchema.objectTypeId;
  const topicSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'topic');
  const topicObjectTypeId = topicSchema.objectTypeId;
  const memberProfileSchemaAssociations = memberProfileSchema.associations;
  const topicSchemaAssociations = topicSchema.associations;

  const authorAssociationTypeId =
    topicSchemaAssociations.find(association =>
        association.fromObjectTypeId === contactObjectTypeId &&
        association.toObjectTypeId === topicObjectTypeId && 
        association.name === 'author').id;
  console.log(`authorAssociationTypeId = ${authorAssociationTypeId}`);

  const memberAuthorAssociationTypeId =
    memberProfileSchemaAssociations.find(association =>
        association.fromObjectTypeId === memberProfileObjectTypeId &&
        association.toObjectTypeId === topicObjectTypeId && 
        association.name === 'member_author').id;
  console.log(`memberAuthorAssociationTypeId = ${memberAuthorAssociationTypeId}`);
  
  // create topic
  const payload_createTopic = buildBody(properties,locale);
  // const endpoint_createTopic = `/crm/v3/objects/2-4293954/?hapikey=${API_KEY}`;
  const endpoint_createTopic = `/crm/v3/objects/${topicObjectTypeId}/`;
  const response_creatTopic = await createObj(endpoint_createTopic, payload_createTopic, headers);
  const newTopicId = response_creatTopic.data.id;

  // Associate newTopicId to provided member_profiles
  const payload_batchAssocMemberProfileIdToTopic = buildBatchAssocMemberBody(member_profiles, newTopicId, memberAuthorAssociationTypeId);
  // const endpoint_batchAssocMemberProfileIdToTopic = `/crm/v4/associations/${memberProfileObjectTypeId}/${topicObjectTypeId}/batch/create/?hapikey=${API_KEY}`;
  const endpoint_batchAssocMemberProfileIdToTopic = `/crm/v4/associations/${memberProfileObjectTypeId}/${topicObjectTypeId}/batch/create/`;
  const response_batchAssocMemberProfileIdToTopic = await batchAssoc(endpoint_batchAssocMemberProfileIdToTopic, payload_batchAssocMemberProfileIdToTopic, headers);
  // console.log( response_batchAssocMemberProfileIdToTopic.status );


  // Associate newTopicId to provided contact ids
  const payload_batchAssocContactIdToTopic = buildBatchAssocContactBody(contacts, newTopicId, authorAssociationTypeId);
  // const endpoint_batchAssocContactIdToTopic = `/crm/v4/associations/${contactObjectTypeId}/${topicObjectTypeId}/batch/create/?hapikey=${API_KEY}`;
  const endpoint_batchAssocContactIdToTopic = `/crm/v4/associations/${contactObjectTypeId}/${topicObjectTypeId}/batch/create/`;
  const response_batchAssocContactIdToTopic = await batchAssoc(endpoint_batchAssocContactIdToTopic, payload_batchAssocContactIdToTopic, headers);
  // console.log( response_batchAssocContactIdToTopic.data );

  sendResponse({
    body: {
      response: {
        topic: response_creatTopic.data,
        member_profiles: response_batchAssocMemberProfileIdToTopic.data,
        contacts: response_batchAssocContactIdToTopic.data,
        slug: payload_createTopic.topic_slug
      }
    },
    statusCode: 200
  });
} catch(error) {
  if (error.response) {
    // Axios request was made and the server responded with a status code
    // that falls out of the range of 2xx. It will respond with the same Axios status code.
    console.error(error.response.data);
    sendResponse({ body: error.response.data, statusCode: error.response.status });
  } else if (error.request) {
    // Axios request was made but no response was received
    console.error(error.request);
    sendResponse({ body: error.request, statusCode: 500 });
  } else {
    // Something happened in setting up the request that triggered an Error (might not be Axios related)
    console.error('Error!', error.message);
    sendResponse({ body: error.message, statusCode: 500 });
  }
}

};
// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;
const contactObjectTypeId = '0-1';
// const memberProfileObjectTypeId = '2-6029965';
// const topicObjectTypeId = '2-4293954';
// const replyObjectTypeId = '2-6231845';

// create Object
function createObj(endpoint, payload, headers) {
  return axios.post(
    endpoint,
    JSON.stringify({ properties: payload }),
    headers,
  ).then(function (response) {
    return response;
  })
    .catch(error => {
      console.error("ERRROR!!", error.response.data)
      return error;
    });
}

// Batch Associate objects
function batchAssoc(endpoint, payload, headers) {
  return axios.post(
    endpoint,
    JSON.stringify({ inputs: payload }),
    headers,
  ).then(function (response) {
    return response;
  })
    .catch(error => error);
}

// Build batch memeber_profile assoc body
function buildBatchAssocBody(idArr, objId, assocType) {
  let inputs = {}
  return idArr.map(id => {
    return {
      from: {
        id: id
      },
      to: {
        id: objId
      },
      type: assocType
    }
  });
}

// process recievedd properties
function processProperties(props) {
  props.subtitle = (props.subtitle) ? props.subtitle : "";
  if (props.hasOwnProperty('is_reply_child_id')) {
    props.is_nested_reply = true;
    return props;
  }
  return props;
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
  const topic_id = params.topic[0];
  console.log(topic_id);
  const limits = context.limits;

  try {
  const schemas = await axios.get('/crm/v3/schemas', headers);
  const memberProfileSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'member_profile');
  const memberProfileObjectTypeId = memberProfileSchema.objectTypeId;
  const topicSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'topic');
  const topicObjectTypeId = topicSchema.objectTypeId;
  const replySchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'reply');
  const replyObjectTypeId = replySchema.objectTypeId;

  // create reply object
  const payload_createReply = processProperties(properties);
  // const endpoint_createReply = `/crm/v3/objects/${reply_type}/?hapikey=${API_KEY}`;
  const endpoint_createReply = `/crm/v3/objects/${replyObjectTypeId}/`;
  const response_createReply = await createObj(endpoint_createReply, payload_createReply, headers);
  const newReplyId = response_createReply.data.id;

  // associate reply object with topic object
  const payload_assocTopicToReply = buildBatchAssocBody([topic_id], newReplyId, "reply_to_topic");
  // const endpoint_assocTopicToReply = `/crm/v3/associations/${topic_type}/${reply_type}/batch/create/?hapikey=${API_KEY}`;
  const endpoint_assocTopicToReply = `/crm/v3/associations/${topicObjectTypeId}/${replyObjectTypeId}/batch/create/`;
  const response_assocTopicToReply = await batchAssoc(endpoint_assocTopicToReply, payload_assocTopicToReply, headers);

  // Associate newReplyId to provided member_profile ids
  const payload_batchAssocMemberProfileIdToReply = buildBatchAssocBody(member_profiles, newReplyId, "member_profile_to_reply");
  // const endpoint_batchAssocMemberProfileIdToReply = `/crm/v3/associations/${member_profile_type}/${reply_type}/batch/create/?hapikey=${API_KEY}`;
  const endpoint_batchAssocMemberProfileIdToReply = `/crm/v3/associations/${memberProfileObjectTypeId}/${replyObjectTypeId}/batch/create/`;
  const response_batchAssocMemberProfileIdToReply = await batchAssoc(endpoint_batchAssocMemberProfileIdToReply, payload_batchAssocMemberProfileIdToReply, headers);

  if (params.followtopic && params.followtopic.indexOf('true') > -1) {
    // Associate newReplyId to provided contact ids
    const payload_batchAssocContactIdToReply = buildBatchAssocBody(contacts, topic_id, "topic_to_contact");
    // const endpoint_batchAssocContactIdToReply = `/crm/v3/associations/${contact_type}/${topic_type}/batch/create/?hapikey=${API_KEY}`;
    const endpoint_batchAssocContactIdToReply = `/crm/v3/associations/${contactObjectTypeId}/${topicObjectTypeId}/batch/create/`;
    const response_batchAssocContactIdToReply = await batchAssoc(endpoint_batchAssocContactIdToReply, payload_batchAssocContactIdToReply, headers);

    sendResponse({
      body: {
        response: {
          reply: response_createReply.data,
          member_profiles: response_batchAssocMemberProfileIdToReply.data,
          contacts: response_batchAssocContactIdToReply.data,
          slug: newReplyId
        }
      },
      statusCode: 200
    });
  }

  sendResponse({
    body: {
      response: {
        reply: response_createReply.data,
        member_profiles: response_batchAssocMemberProfileIdToReply.data,
        slug: newReplyId
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
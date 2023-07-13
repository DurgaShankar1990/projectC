// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;

// create Object
function updateObj(endpoint, payload, headers) {
  return axios.patch(
    endpoint,
    JSON.stringify({properties: payload}),
    headers,
  ).then(function(response) {
    return response.data;
  })
  .catch(error => {
    console.log( error )
    return error
  });
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
  const replyId = context.params.rid[0];
  // const replyObjectTypeId = '2-6231845';
  const schemas = await axios.get('/crm/v3/schemas', headers);

  const replySchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'reply');
  const replyObjectTypeId = replySchema.objectTypeId;
  
  // update reply
  // const endpoint_updateReply = `https://api.hubapi.com/crm/v3/objects/2-6231845/${replyId}?hapikey=${API_KEY}`;
  const endpoint_updateReply = `https://api.hubapi.com/crm/v3/objects/${replyObjectTypeId}/${replyId}`;
  const payload_updateReply = {mark_as_solution: true};
  const response_updateReply = await updateObj(endpoint_updateReply, payload_updateReply, headers);

  sendResponse({
    body: {
      response: {
        topic: response_updateReply,
      }
    },
    statusCode: 200
  });
  

};
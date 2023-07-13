// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;

// const topicObjectTypeId = '2-4293954';

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
    console.log( error.response.data )
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
  const body = context.body;
  const objectId = context.params.oid[0];

  const schemas = await axios.get('/crm/v3/schemas', headers);
  const topicSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'topic');
  const topicObjectTypeId = topicSchema.objectTypeId;
  
  // create reply object
  const payload_editObject = body;
  // const endpoint_editObject = `https://api.hubapi.com/crm/v3/objects/2-4293954/${objectId}?hapikey=${API_KEY}`;
  const endpoint_editObject = `/crm/v3/objects/${topicObjectTypeId}/${objectId}`;
  const response_editObject = await updateObj(endpoint_editObject, payload_editObject, headers);

  sendResponse({
    body: {
      response: {
        reply: response_editObject
      }
    },
    statusCode: 200
  });
};
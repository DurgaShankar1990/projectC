// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;

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
  // const replyObjId = '2-6231845'

  // create reply object
  const payload_editObject = { properties: body };
  // const endpoint_editObject = `https://api.hubapi.com/crm/v3/objects/${replyObjId}/${objectId}?hapikey=${API_KEY}`;

  try {

    const schemas = await axios.get('/crm/v3/schemas', headers);

    const replySchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'reply');
    const replyObjectTypeId = replySchema.objectTypeId;
    const endpoint_editObject = `/crm/v3/objects/${replyObjectTypeId}/${objectId}`;

    const response_editObject = await axios.patch(endpoint_editObject, JSON.stringify(payload_editObject), headers);
    const newReplyId = response_editObject.data.id;

    sendResponse({ body: { reply: response_editObject.data }, statusCode: 200 });
  } catch (error) {
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
      console.error('Error', error.message);
      sendResponse({ body: error.message, statusCode: 500 });
    }
  }
};

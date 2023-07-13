// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;

// Update object
async function updateObj(endpoint, headers, payload) {
  return axios
    .patch(
    endpoint,
    { properties: payload },
    headers
  )
    .then(function (response) {
    return response.data;
  })
    .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
};

// Get associations
async function getAssocs(endpoint, headers) {
  return axios
    .get(
    endpoint,
    headers
  )
    .then(function (response) {
    return response.data;
  })
    .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
};

// Associate Objects
async function assocObjs(endpoint, headers, payload) {
  return axios
    .put(
    endpoint,
    [payload],
    headers
  )
    .then(function (response) {
    return response.data;
  })
    .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
};

// get
async function axiosDelete(endpoint, headers) {
  return axios
    .delete(
    endpoint,
    headers
  )
    .then(function (response) {
    return response.data;
  })
    .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
};

// Build assoc body
function buildAssocBody(contactId, objId, assocType = "Follower") {
  return idArr.map( id => {
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

exports.main = async (context, sendResponse) => {
  axios.defaults.baseURL = 'https://api.hubapi.com';
  const headers = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${COHORTIUM_KEY}`
    }
  };
  const contactId = context.params.cid[0];
  const topicId = context.params.tid[0];
  const associationType = "Follower";
  // const topicObjectTypeId = '2-4293954';

  const schemas = await axios.get('/crm/v3/schemas', headers);

  const topicSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'topic');
  const topicObjectTypeId = topicSchema.objectTypeId;
  const topicSchemaAssociations = topicSchema.associations;
  // Storing Contacts Object ID, just for coding consistency.
  const contactObjectTypeId = '0-1';
  // Finding the association type from Contacts to referral_partner and storing its ID.
  const fromContactTotopicAssociationTypeId =
      topicSchemaAssociations.find(association =>
          association.fromObjectTypeId === contactObjectTypeId &&
          association.toObjectTypeId === topicObjectTypeId && 
          association.name === 'follower').id;
  
  // Get topic follower_count
  // const endpoint__getFollowerCount = `/crm/v3/objects/${topicObjectTypeId}/${topicId}?properties=follower_count&hapikey=${API_KEY}`;
  const endpoint__getFollowerCount = `/crm/v3/objects/${topicObjectTypeId}/${topicId}?properties=follower_count`;
  const response__getFollowerCount = await axios.get(endpoint__getFollowerCount, headers);
  let follower_count = response__getFollowerCount.data.properties.follower_count;
  if ( !follower_count ) {
    follower_count = 0
  } else {
    follower_count = parseInt(follower_count)
  }
  
  
  // check for existing association
  // const endpoint__readAssoc = `/crm/v3/objects/0-1/${contactId}/associations/${topicObjectTypeId}/?hapikey=${API_KEY}`;
  const endpoint__readAssoc = `/crm/v3/objects/${contactObjectTypeId}/${contactId}/associations/${topicObjectTypeId}/`;
  const response__readAssoc = await getAssocs(endpoint__readAssoc, headers);
  const readAssocFilteredResults = response__readAssoc.results.filter(el => {
    return el.type == "follower" && el.id == topicId
  });
  
  if ( readAssocFilteredResults.length <= 0 ) {
    follower_count = ++follower_count;
    // Associate contact to topic as follow
    // const endpoint_assocFollower = `/crm/v4/objects/0-1/${contactId}/associations/${topicObjectTypeId}/${topicId}?hapikey=${API_KEY}`;
    const endpoint_assocFollower = `/crm/v4/objects/${contactObjectTypeId}/${contactId}/associations/${topicObjectTypeId}/${topicId}`;
    const payload_assocFollower = {
      "associationCategory": "USER_DEFINED",
      // "associationTypeId": 557
      "associationTypeId": fromContactTotopicAssociationTypeId
    };
    const response__assocFollower = await assocObjs(endpoint_assocFollower, headers, payload_assocFollower);
    
    // update topic object
    // const endpoint__updateTopic = `/crm/v3/objects/${topicObjectTypeId}/${topicId}?hapikey=${API_KEY}`;
    const endpoint__updateTopic = `/crm/v3/objects/${topicObjectTypeId}/${topicId}`;
    const payload__updateTopic = {follower_count: follower_count};
    const response__updateTopic = await updateObj(endpoint__updateTopic, headers, payload__updateTopic);

    // response 
    sendResponse({
      body: {
        response: {
          value: true,
          count: follower_count,
          message: `The follower association between contact ID ${contactId} and topic ${topicId} was added`,
          response: response__assocFollower
        }
      },
      statusCode: 200
    })
  } else {
    follower_count = --follower_count;
    // remove follower association
    // const endpoint_deleteAssocFollower = `/crm/v3/objects/0-1/${contactId}/associations/${topicObjectTypeId}/${topicId}/${associationType}?hapikey=${API_KEY}`;
    const endpoint_deleteAssocFollower = `/crm/v3/objects/${contactObjectTypeId}/${contactId}/associations/${topicObjectTypeId}/${topicId}/${associationType}`;
    const response_deleteAssocFollower = await axiosDelete(endpoint_deleteAssocFollower, headers);
    
    // update topic object
    // const endpoint__updateTopic = `/crm/v3/objects/${topicObjectTypeId}/${topicId}?hapikey=${API_KEY}`;
    const endpoint__updateTopic = `/crm/v3/objects/${topicObjectTypeId}/${topicId}`;
    const payload__updateTopic = {follower_count: follower_count};
    const response__updateTopic = await updateObj(endpoint__updateTopic, headers, payload__updateTopic);

    // response
    sendResponse({
      body: {
        response: {
          value: false,
          count: follower_count,
          message: `The follower association between contact ID ${contactId} and topic ${topicId} was removed`,
          response: response_deleteAssocFollower
        }
      },
      statusCode: 200
    })
  }
  
  // response 
    sendResponse({
      body: "Something went wrong on the server",
      statusCode: 500
    })

};
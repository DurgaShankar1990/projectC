// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;


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
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }
    console.error(error.config);
  });
};
// table for comparispon
let typeTable = {
  topic: `2-4293954`,
  reply: `2-6231845`
}
// get value from table using type
function calcObjtype(val) {
  return typeTable[val]
}
// Build Update body
function buildUpdateBody(prop,value,obj = {}) {
  obj[prop] = value;
  console.log( obj )
  return obj
}
// remove leading and following "|"
function trimPipe(val) {
  let value = val;
  if ( value.charAt(0) == "|" ) {
    value = value.substring(1);
  }
  if ( value.charAt( value.length - 1 ) == "|" ) {
    value = value.substring(0, value.length - 1 );
  }
  return value.replace("||","|")
}
// handle count
function handleCount(current = 0,inc) {
  console.log( typeof current, typeof inc, current + inc)
  return current + inc
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
  const objId = context.params.oid[0];
  const type = context.params.type[0];

  const schemas = await axios.get('/crm/v3/schemas', headers);
  const topicSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'topic');
  const topicObjectTypeId = topicSchema.objectTypeId;
  const replySchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'reply');
  const replyObjectTypeId = replySchema.objectTypeId;
  typeTable = {
    topic: topicObjectTypeId,
    reply: replyObjectTypeId
  };
  const objectType = calcObjtype(type);
  
  // const endpoint_getCurrent = `https://api.hubapi.com/crm/v3/objects/${objectType}/${objId}?hapikey=${API_KEY}&properties=upvote_contacts,upvote,upvote_count`;
  const endpoint_getCurrent = `/crm/v3/objects/${objectType}/${objId}?properties=upvote_contacts,upvote,upvote_count`;
  const request_getCurrent = await axios.get(endpoint_getCurrent, headers);
  const currentValue = request_getCurrent.data.properties.upvote_contacts;
  let currentCount = request_getCurrent.data.properties.upvote_count;
  if ( !currentCount ) {
    currentCount = 0
  } else {
    currentCount = parseInt(currentCount)
  }

  if ( currentValue !== null && currentValue.includes( contactId ) ) {
    let value = currentValue.replace( contactId, "" );
    value.replace("||","|").trim();
    if ( value.charAt(0) == "|" ) {
      value = trimPipe(value);
      // update object
      // const endpoint_updateObj = `https://api.hubapi.com/crm/v3/objects/${objectType}/${objId}?hapikey=${API_KEY}`;
      const endpoint_updateObj = `/crm/v3/objects/${objectType}/${objId}`;
      const payload_updateObj = {
        upvote_contacts: value,
        upvote_count: handleCount(currentCount, -1)
      }
      console.log( payload_updateObj )
      const response_updateObj = await updateObj(endpoint_updateObj, headers, payload_updateObj);
      sendResponse({
        body: {
          response: {
            properties: response_updateObj.properties
          }
        },
        statusCode: 200
      });
    } else {
      value = trimPipe(value);
      // update object
      // const endpoint_updateObj = `https://api.hubapi.com/crm/v3/objects/${objectType}/${objId}?hapikey=${API_KEY}`;
      const endpoint_updateObj = `/crm/v3/objects/${objectType}/${objId}`;
      const payload_updateObj = {
        upvote_contacts: value,
        upvote_count: handleCount(currentCount, -1)
      }
      console.log( payload_updateObj )
      const response_updateObj = await updateObj(endpoint_updateObj, headers, payload_updateObj);
      sendResponse({
        body: {
          response: {
            properties: response_updateObj.properties
          }
        },
        statusCode: 200
      });
    }
  } else if ( currentValue == null || currentValue == "" ) {
    // update obj w/o "|"
    let value = contactId;
    value = trimPipe(value);
    // const endpoint_updateObj = `https://api.hubapi.com/crm/v3/objects/${objectType}/${objId}?hapikey=${API_KEY}`;
    const endpoint_updateObj = `/crm/v3/objects/${objectType}/${objId}`;
    const payload_updateObj = {
        upvote_contacts: value,
        upvote_count: handleCount(currentCount, 1)
      }
    console.log( payload_updateObj )
    const response_updateObj = await updateObj(endpoint_updateObj, headers, payload_updateObj);

    sendResponse({
      body: {
        response: {
          properties: response_updateObj.properties
        }
      },
      statusCode: 200
    });
    
  } else {
    let value = `${currentValue}|${contactId}`;
    value = trimPipe(value);
    // const endpoint_updateObj = `https://api.hubapi.com/crm/v3/objects/${objectType}/${objId}?hapikey=${API_KEY}`;
    const endpoint_updateObj = `/crm/v3/objects/${objectType}/${objId}`;
    const payload_updateObj = {
        upvote_contacts: value,
        upvote_count: handleCount(currentCount, 1)
      }
    console.log( payload_updateObj )
    const response_updateObj = await updateObj(endpoint_updateObj, headers, payload_updateObj);
    sendResponse({
      body: {
        response: {
          properties: response_updateObj.properties
        }
      },
      statusCode: 200
    });
    
  }
};
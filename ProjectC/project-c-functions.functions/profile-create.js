// Require axios library to make API requests
const axios = require('axios');
const { COHORTIUM_KEY = "" } = process.env;

// Contact Create
function createContact(payload, email, headers){
  //   console.log("creating contact")
  //   console.log(payload) //empty object
  //   console.log(email) //undefined
  //   console.log(headers) //good data
  return axios.post(
    // `/contacts/v1/contact/createOrUpdate/email/${email}/?hapikey=${API_KEY}`,
    `/contacts/v1/contact/createOrUpdate/email/${email}/`,
    {properties: [
      {
        property: "firstname",
        value: payload.firstname
      },
      {
        property: "lastname",
        value: payload.lastname
      }
    ]},
    headers,
  ).then(response => {
    return response.data
  }).catch(error => {
    //console.log( error )
    return error
  })
}

// create Object
function createObj(endpoint, headers, payload) {
  payload = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    username: payload.username
  }
  console.log(payload) 
  return axios.post(
    endpoint,
    {properties: payload},
    headers,
  ).then(function(response) {
    return response.data;
  })
    .catch(error => {
    //console.log( error )
    return error
  });
}

// build member profile body
function buildProfileBody(contactObj,profileObj, imgUrl) {
  return {
    ...profileObj,
    first_name: contactObj.firstname,
    last_name: contactObj.lastname
  }
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
  // const memberProfileObjectTypeId = '2-6029965';
  const contactObjectTypeId = '0-1';
  const memberProfileToContacttype = 462;
  const body = context.body;
  console.log(body)

  const schemas = await axios.get('/crm/v3/schemas', headers);
  const memberProfileSchema = schemas.data.results.find(returnedSchema => returnedSchema.name === 'member_profile');
  const memberProfileObjectTypeId = memberProfileSchema.objectTypeId;
  const memberProfileSchemaAssociations = memberProfileSchema.associations;

  const profileOwnerAssociationTypeId =
      memberProfileSchemaAssociations.find(association =>
          association.fromObjectTypeId === contactObjectTypeId &&
          association.toObjectTypeId === memberProfileObjectTypeId && 
          association.name === 'profile_owner').id;

  // create or update contact
  const payload_contactCreate = body;
  const response_contactCreate = await createContact(payload_contactCreate, payload_contactCreate.email, headers);
  // const contactId = response_contactCreate.vid;


  // create member_profile
  // const endpoint_createMember = `https://api.hubapi.com/crm/v3/objects/${memberProfiletype}?hapikey=${API_KEY}`;
  const endpoint_createMember = `/crm/v3/objects/${memberProfileObjectTypeId}`;
  const payload_createMember = body;
  const response_createMember = await createObj(endpoint_createMember, headers, payload_createMember);

  // associate member_profile to contact
  // //association ID 560 contact => profile owner
  let data = [{
    // associationTypeId: 560,
    associationTypeId: profileOwnerAssociationTypeId,
    associationCategory: "USER_DEFINED"
  }]
  let jsonData = JSON.stringify(data)
  

  try {
    // let association = await axios.put(`https://api.hubapi.com/crm/v4/objects/0-1/${response_contactCreate.vid}/associations/${memberProfiletype}/${response_createMember.id}?hapikey=${API_KEY}`, jsonData, {headers: {"content-type": "application/json", "accept": "application/json"}})
    let association = await axios.put(`/crm/v4/objects/${contactObjectTypeId}/${response_contactCreate.vid}/associations/${memberProfileObjectTypeId}/${response_createMember.id}`, jsonData, headers);

    sendResponse({
      body: {
        contact: response_contactCreate,
        memberProfile: response_createMember
      },
      statusCode: 200
    });
  } catch(err) {
    console.log("got an error creating association")
    console.log(err.response.data)
    sendResponse({
      body: {error: err.response.data, contact: response_contactCreate,
        memberProfile: response_createMember},
      statusCode: 500
    });
  }
};
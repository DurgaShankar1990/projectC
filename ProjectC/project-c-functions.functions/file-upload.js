// file-upload.js
const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

const { COHORTIUM_KEY = "" } = process.env;

exports.main = async (context, sendResponse) => {
  axios.defaults.baseURL = 'https://api.hubapi.com';

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${COHORTIUM_KEY}`
    }
  };

  const body = context.body;
  const key = body.key;

  const form = new FormData();
  const file_name = body.file_name;
  const fileB64Arr = body.profile_photo;
  let b64String = fileB64Arr[1];

  let buffer = Buffer.from(b64String, 'base64');

  console.log(`file_name = ${file_name}`);

  const file_options = {
    access: 'PUBLIC_NOT_INDEXABLE',
    overwrite: false,
    duplicateValidationStrategy: 'NONE',
    duplicateValidationScope: 'EXACT_FOLDER'
  };

  let uploadHeaders = form.getHeaders();
  config.headers = {...config.headers, ...uploadHeaders};

  form.append('file', buffer, file_name); // The base64 decoded file buffer
  form.append('fileName', `${crypto.randomBytes(16).toString('hex')}.${file_name.split('.').pop()}`);
  form.append('options', JSON.stringify(file_options)); // file options for storing
  // form.append('folderId', '96351662949'); // Folder ID for where the file is going
  form.append('folderPath', '/CohortiumProfileImages');

  // console.log(file_name);
  try {
    let response = await axios.post(`/files/v3/files`, form, config);
    let imageData = response.data;
    // console.log(response.data);
    sendResponse({ body: { url: imageData.url }, statusCode: 200 });
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

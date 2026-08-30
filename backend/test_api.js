const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testApi() {
    try {
        const form = new FormData();
        // create a dummy image
        fs.writeFileSync('dummy.jpg', 'fake image content');
        form.append('document', fs.createReadStream('dummy.jpg'));
        
        // We need an auth token. 
        // We can just bypass it by testing locally if protect middleware fails.
        // Wait, the endpoint is protected by protect & authorize.
        // I need a valid token to hit it. 
        console.log("Need a token to test the API.");
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}
testApi();

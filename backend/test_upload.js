const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  try {
    const form = new FormData();
    // just append a dummy text file
    fs.writeFileSync('dummy.txt', 'hello world');
    form.append('file', fs.createReadStream('dummy.txt'));
    
    console.log('Uploading to Render backend...');
    const response = await axios.post('https://smtbs-backend.onrender.com/api/ocr/extract', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    console.log('Success:', response.status);
  } catch (error) {
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}
testUpload();

const axios = require('axios');
(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/expense-tracking/dashboard?year=2026&month=All Months', { headers: { 'Authorization': 'Bearer ' + process.argv[2] } });
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
      console.error(err.response.data);
    }
  }
})();

const http = require('http');

function makeRequest(message, history = []) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ message, history });

        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: '/api/assistant/query',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

async function runTests() {
    try {
        console.log("Testing: show payroll");
        const res1 = await makeRequest('show payroll');
        console.log("Result type:", res1.type);
        console.log("Module:", res1.module);
        console.log("Columns:", res1.columns);
        console.log("Rows count:", res1.rows ? res1.rows.length : 0);
        
        console.log("\nTesting: show inventory");
        const res2 = await makeRequest('show inventory');
        console.log("Result type:", res2.type);
        console.log("Module:", res2.module);
        console.log("Columns:", res2.columns);
        console.log("Rows count:", res2.rows ? res2.rows.length : 0);

        console.log("\nTesting follow-up context: only low stock");
        const history = [
            { role: 'user', content: 'show inventory' },
            { role: 'assistant', content: res2.reply }
        ];
        const res3 = await makeRequest('only low stock', history);
        console.log("Result type:", res3.type);
        console.log("Module:", res3.module);
        console.log("Columns:", res3.columns);
        console.log("Rows count:", res3.rows ? res3.rows.length : 0);
        
    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTests();

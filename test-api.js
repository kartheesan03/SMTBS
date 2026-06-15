async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        
        const ordersRes = await fetch('http://localhost:5000/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await ordersRes.json();
        
        console.log("Orders type:", typeof data);
        console.log("Is array?", Array.isArray(data));
        console.log("Data keys:", Object.keys(data));
        if (data.message) {
            console.log("Message:", data.message);
        }
        if (Array.isArray(data)) {
            console.log("Length:", data.length);
            if (data.length > 0) {
                console.log("First order keys:", Object.keys(data[0]));
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();

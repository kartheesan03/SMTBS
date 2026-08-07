const AuditLog = require('./src/models/AuditLog');
AuditLog.find().sort({ createdAt: -1 }).limit(10).then(res => {
    console.log("Success, got", res.length, "rows via bridge");
    console.log(res);
}).catch(err => {
    console.error("Error fetching AuditLog via bridge:", err);
});

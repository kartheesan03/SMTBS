const fs = require('fs');
const file = 'src/pages/OrderTracking.jsx';
let content = fs.readFileSync(file, 'utf8');

const resolveFunc = `
    const handleManagerResolveStock = async (resolution) => {
        if (!remarks) {
            toast.error("Please provide remarks for resolution");
            return;
        }
        try {
            setSubmitting(true);
            await API.post(\`/orders/\${orderId}/manager-resolution\`, { resolution, remarks });
            toast.success("Stock issue resolved successfully");
            fetchData();
        } catch(err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };
`;

if (!content.includes('handleManagerResolveStock')) {
    content = content.replace('const handleEmployeeFinalApprove', resolveFunc + '\n    const handleEmployeeFinalApprove');
}

const managerResolveBlockRegex = /if \(\['Low Stock', 'Out of Stock', 'Waiting for Manager'\].includes\(currentStatus\)\) \{[\s\S]*?return renderEmptyPanel\(\);\s*\}/;

const newManagerResolveBlock = `if (['Low Stock', 'Out of Stock', 'Waiting for Manager'].includes(currentStatus)) {
                return (
                    <div className="action-form">
                        <h4 style={{ margin: '0 0 16px 0', color: '#d97706' }}>⚠ Stock Issue Reported</h4>
                        <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>The employee reported an inventory shortage for this order.</p>
                        <div className="form-group">
                            <label>Resolution Remarks</label>
                            <input type="text" placeholder="Explain how this issue was resolved..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                        </div>
                        <div className="button-group">
                            <button className="erp-btn btn-primary" disabled={submitting} onClick={() => handleManagerResolveStock('Allocate')}>
                                {submitting ? 'Processing...' : 'Allocate from other warehouse'}
                            </button>
                            <button className="erp-btn btn-success" disabled={submitting} onClick={() => handleManagerResolveStock('Approve Purchase')}>
                                {submitting ? 'Processing...' : 'Approve Purchase Request'}
                            </button>
                        </div>
                    </div>
                );
            }
            return renderEmptyPanel();
        }`;

content = content.replace(managerResolveBlockRegex, newManagerResolveBlock);

fs.writeFileSync(file, content);
console.log('OrderTracking Manager Resolution updated.');

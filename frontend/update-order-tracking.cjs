const fs = require('fs');
const file = 'src/pages/OrderTracking.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('itemsVerification')) {
    content = content.replace('const [submitting, setSubmitting] = useState(false);', 
    'const [submitting, setSubmitting] = useState(false);\n    const [itemsVerification, setItemsVerification] = useState({});');
}

if (!content.includes('// init itemsVerification')) {
    content = content.replace('setOrder(foundOrder);', 
    'setOrder(foundOrder);\n                // init itemsVerification\n                if (foundOrder.items) {\n                    const initVerif = {};\n                    foundOrder.items.forEach(i => {\n                        const id = i.materialId || (i.material ? i.material.id : i.material);\n                        initVerif[id] = { status: "In Stock", remarks: "" };\n                    });\n                    setItemsVerification(initVerif);\n                }');
}

const verifyFunc = `
    const handleVerifyInventory = async () => {
        try {
            setSubmitting(true);
            const payload = {
                itemsVerification: Object.keys(itemsVerification).map(key => ({
                    materialId: key,
                    ...itemsVerification[key]
                }))
            };
            await API.post(\`/orders/\${orderId}/inventory-verification\`, payload);
            toast.success("Inventory Verification Submitted");
            fetchData();
        } catch(err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleEmployeeFinalApprove = async () => {
        try {
            setSubmitting(true);
            await API.post(\`/orders/\${orderId}/employee-final-approval\`);
            toast.success("Order final approved by employee");
            fetchData();
        } catch(err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };
`;

if (!content.includes('handleVerifyInventory')) {
    content = content.replace('if (loading) {', verifyFunc + '\n    if (loading) {');
}

const employeeBlockRegex = /if \(loggedInRole === 'Employee'\) \{[\s\S]*?return renderEmptyPanel\(\);\s*\}/;

const newEmployeeBlock = `if (loggedInRole === 'Employee') {
            if (['Employee Verification', 'Inventory Verification', 'Awaiting Stock Check'].includes(currentStatus) || currentStage === 'Employee Verification') {
                const allVerified = Object.values(itemsVerification).every(v => v.status === 'In Stock');
                const hasIssue = Object.values(itemsVerification).some(v => ['Low Stock', 'Out of Stock'].includes(v.status));

                return (
                    <div className="action-form inventory-verify-form" style={{ width: '100%', maxWidth: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: 600 }}>Physical Stock Verification</h3>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Please physically verify the materials in the warehouse before proceeding. Select the actual stock status for each item.</p>
                        
                        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                                        <th style={{ padding: '12px' }}>MATERIAL</th>
                                        <th style={{ padding: '12px' }}>LOCATION</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>REQ. QTY</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>AVAIL. QTY</th>
                                        <th style={{ padding: '12px' }}>STATUS</th>
                                        <th style={{ padding: '12px' }}>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((item, idx) => {
                                        const mat = item.material || {};
                                        const matId = item.materialId || mat.id || mat._id;
                                        const vState = itemsVerification[matId] || { status: 'In Stock', remarks: '' };
                                        
                                        const setVState = (key, val) => {
                                            setItemsVerification(prev => ({
                                                ...prev,
                                                [matId]: { ...prev[matId], [key]: val }
                                            }));
                                        };

                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', fontWeight: 500 }}>{item.name || mat.name}</td>
                                                <td style={{ padding: '12px', color: '#64748b' }}>
                                                    {mat.warehouse ? \`\${mat.warehouse} / \${mat.shelf || 'No Shelf'}\` : 'Main Warehouse'}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#3b82f6' }}>{item.quantity}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{mat.quantity || 0}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <select 
                                                        value={vState.status} 
                                                        onChange={e => setVState('status', e.target.value)}
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            borderRadius: '4px', 
                                                            border: '1px solid #cbd5e1',
                                                            backgroundColor: vState.status === 'In Stock' ? '#ecfdf5' : vState.status === 'Low Stock' ? '#fffbeb' : '#fef2f2',
                                                            color: vState.status === 'In Stock' ? '#059669' : vState.status === 'Low Stock' ? '#d97706' : '#dc2626',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <option value="In Stock">🟢 In Stock</option>
                                                        <option value="Low Stock">🟡 Low Stock</option>
                                                        <option value="Out of Stock">🔴 Out of Stock</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Notes..." 
                                                        value={vState.remarks} 
                                                        onChange={e => setVState('remarks', e.target.value)}
                                                        style={{ padding: '6px 12px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            {hasIssue ? (
                                <button className="erp-btn btn-danger" disabled={submitting} onClick={handleVerifyInventory}>
                                    {submitting ? 'Processing...' : 'Submit Stock Alert'}
                                </button>
                            ) : (
                                <button className="erp-btn btn-primary" disabled={submitting || !allVerified} onClick={handleVerifyInventory}>
                                    {submitting ? 'Processing...' : 'Verify Inventory'}
                                </button>
                            )}
                        </div>
                    </div>
                );
            }
            
            if (currentStatus === 'Inventory Verified') {
                return (
                    <div className="action-form">
                        <h4 style={{ margin: '0 0 16px 0', color: '#10b981' }}>✔ Inventory Verified</h4>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>All materials are ready for processing. Please provide final approval to send this order to Sales.</p>
                        <button className="erp-btn btn-success" disabled={submitting} onClick={handleEmployeeFinalApprove}>
                            {submitting ? 'Processing...' : 'Approve Order'}
                        </button>
                    </div>
                );
            }

            return renderEmptyPanel();
        }`;

content = content.replace(employeeBlockRegex, newEmployeeBlock);

fs.writeFileSync(file, content);
console.log('OrderTracking updated for Inventory Verification.');

const fs = require('fs');
const path = 'c:/Users/Admin/Documents/project/frontend/src/pages/OrderTracking.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add formatters
content = content.replace('    return (', `    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDateOnly = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTimeOnly = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (`);

// 2. Replace Summary items
content = content.replace(`<div className="summary-item">
                            <span className="label">Delivery Date</span>
                            <span className="value">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'Pending'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Amount</span>
                            <span className="value">\${(order.totalAmount || order.grandTotal || 0).toLocaleString()}</span>
                        </div>`,
`<div className="summary-item">
                            <span className="label">Amount</span>
                            <span className="value">\${(order.totalAmount || order.grandTotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Delivery Date</span>
                            <span className="value">{order.deliveredAt ? formatDateOnly(order.deliveredAt) : 'Pending Delivery'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Delivery Time</span>
                            <span className="value">{order.deliveredAt ? formatTimeOnly(order.deliveredAt) : 'Pending Delivery'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Last Updated</span>
                            <span className="value">{formatDateTime(order.updatedAt || new Date())}</span>
                        </div>`);

// 3. Replace Last updated
content = content.replace(`<p>Last updated: {timeline.length > 0 ? new Date(timeline[timeline.length - 1].date).toLocaleString() : 'Just now'}</p>`,
`<p>Last updated: {timeline.length > 0 ? formatDateTime(timeline[timeline.length - 1].date) : 'Just now'}</p>`);

// 4. Replace timeline time
content = content.replace(`<Clock size={12} /> {new Date(update.date).toLocaleString()}`,
`<Clock size={12} /> {formatDateTime(update.date)}`);

// 5. Update CSS grid
content = content.replace(`display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;`,
`display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px;`);

fs.writeFileSync(path, content, 'utf8');
console.log('OrderTracking.jsx updated successfully.');

const fs = require('fs');

const globalStyles = `

/* =========================================
   GLOBAL COMPONENT REDESIGN (PREMIUM SAAS)
   ========================================= */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  -webkit-font-smoothing: antialiased;
  text-shadow: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  border: none;
  text-shadow: none !important; 
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.btn-secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  text-shadow: none !important;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px -4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02);
  padding: 24px;
  border: none;
}

.form-control, input[type='text'], input[type='email'], input[type='password'], select, textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.2s;
}

.form-control:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.table-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.table td {
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table tr:hover td {
  background: #f8fafc;
}

`;

fs.appendFileSync('c:/Users/Admin/Documents/project/frontend/src/index.css', globalStyles);
console.log('Done');

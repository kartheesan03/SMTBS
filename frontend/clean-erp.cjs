const fs = require('fs');
let content = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/pages/ERP.jsx', 'utf8');

// 1. Remove state variables
content = content.replace(/\s*const \[showModal, setShowModal\] = useState\(false\);/g, '');
content = content.replace(/\s*const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/g, '');

// 2. Remove functions
content = content.replace(/\s*const handleCreateOrder = async \(e\) => \{[\s\S]*?fetchData\(\);\s*\} catch \(err\) \{[\s\S]*?\}\s*\};/g, '');
content = content.replace(/\s*const addItem = \(\) => \{[\s\S]*?\};/g, '');
content = content.replace(/\s*const calculateTotal = \(\) => \{[\s\S]*?\};/g, '');

// 3. Remove Create Order Button
const btnRegex = /\s*\{\(userInfo\?\.role\?\.toLowerCase\(\) === 'admin' \|\| userInfo\?\.role\?\.toLowerCase\(\) === 'super admin'\)\} && \([\s\S]*?<button className="btn-primary-blue flex-center gap-8" onClick=\{\(\) => setShowModal\(true\)\}\>[\s\S]*?<Plus size=\{16\} \/> Create Order[\s\S]*?<\/button>[\s\S]*?\)\}/g;
content = content.replace(btnRegex, '');

// 4. Remove Modal
const startModal = content.indexOf('{/* Modal */}');
const endModal = content.indexOf('{/* Order Details Modal */}');
if (startModal !== -1 && endModal !== -1) {
    content = content.substring(0, startModal) + content.substring(endModal);
}

fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/pages/ERP.jsx', content);
console.log('ERP.jsx cleaned successfully!');

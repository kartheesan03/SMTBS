import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePayslipPDF = async (record, employeeName) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Create a temporary hidden div for the payslip layout
    const element = document.createElement('div');
    element.style.width = '595px'; // A4 width in pt
    element.style.padding = '40px';
    element.style.background = '#ffffff';
    element.style.color = '#1e293b';
    element.style.fontFamily = 'Arial, sans-serif';
    
    element.innerHTML = `
        <div style="border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="margin: 0; color: #6366f1; font-size: 24px;">SMTBMS</h1>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Smart Material Tracking & Business Management</p>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 18px;">OFFICIAL PAYSLIP</h2>
                <p style="margin: 5px 0 0 0; color: #64748b;">${record.month}</p>
            </div>
        </div>

        <div style="margin-bottom: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3 style="font-size: 12px; color: #64748b; margin-bottom: 10px; text-transform: uppercase;">Employee Details</h3>
                <p style="margin: 3px 0;"><strong>Name:</strong> ${employeeName}</p>
                <p style="margin: 3px 0;"><strong>Role:</strong> ${record.employee?.designation || 'Staff'}</p>
                <p style="margin: 3px 0;"><strong>Employee ID:</strong> ${record.employee?.employeeId || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
                <h3 style="font-size: 12px; color: #64748b; margin-bottom: 10px; text-transform: uppercase;">Payment Info</h3>
                <p style="margin: 3px 0;"><strong>Status:</strong> ${record.status}</p>
                <p style="margin: 3px 0;"><strong>Date:</strong> ${record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <th style="padding: 12px; text-align: left; font-size: 13px;">Description</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Basic Salary</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">$${record.basicSalary.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Allowances</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #10b981;">+ $${record.allowances.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Deductions & Taxes</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #ef4444;">- $${record.deductions.toLocaleString()}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr style="background: #f1f5f9;">
                    <td style="padding: 15px; font-weight: bold; font-size: 16px;">NET PAYABLE</td>
                    <td style="padding: 15px; font-weight: bold; font-size: 18px; text-align: right; color: #6366f1;">$${record.netSalary.toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>

        <div style="margin-top: 60px; border-top: 1px dashed #cbd5e1; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 10px;">
            <p>This is a computer-generated document and does not require a physical signature.</p>
            <p>© ${new Date().getFullYear()} SMTBMS Enterprise Portal</p>
        </div>
    `;

    document.body.appendChild(element);
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`Payslip_${employeeName.replace(' ', '_')}_${record.month.replace(' ', '_')}.pdf`);
    } catch (error) {
        console.error('PDF Generation failed:', error);
    } finally {
        document.body.removeChild(element);
    }
};

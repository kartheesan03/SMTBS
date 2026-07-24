import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Download, FileText, Filter, CheckCircle, Clock } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../components/ui';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const MaterialReports = () => {
    const [materials, setMaterials] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ totalValue: 0, items: 0, lowStock: 0, movementsCount: 0 });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const [matsRes, movesRes] = await Promise.all([
                    API.get('/materials'),
                    API.get('/materials/movements/all').catch(() => ({ data: [] }))
                ]);
                
                const matsData = matsRes.data || [];
                const movesData = movesRes.data || [];
                
                setMaterials(matsData);
                setMovements(movesData);

                let totalValue = 0;
                let lowStock = 0;

                matsData.forEach(item => {
                    totalValue += (item.quantity || 0) * (item.price || 0);
                    if (item.quantity <= (item.lowStockThreshold || 10)) {
                        lowStock += 1;
                    }
                });

                setSummary({
                    totalValue,
                    items: matsData.length,
                    lowStock,
                    movementsCount: movesData.length
                });
            } catch (error) {
                console.error("Failed to fetch reports:", error);
                toast.error("Failed to load material reports");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const columns = [
        {
            key: 'name',
            label: 'MATERIAL NAME',
            sortable: true,
            render: (val, row) => (
                <div>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{val}</span>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{row.sku || 'N/A'}</div>
                </div>
            )
        },
        {
            key: 'category',
            label: 'CATEGORY',
            sortable: true,
            render: (val) => <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569', borderRadius: 0 }}>{val || 'General'}</span>
        },
        {
            key: 'quantity',
            label: 'STOCK QTY',
            sortable: true,
            align: 'right',
            render: (val) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{val}</span>
        },
        {
            key: 'price',
            label: 'UNIT PRICE',
            sortable: true,
            align: 'right',
            render: (val) => `$${(val || 0).toFixed(2)}`
        },
        {
            key: 'totalValue',
            label: 'TOTAL VALUE',
            align: 'right',
            render: (_, row) => (
                <span style={{ fontWeight: 700, color: '#10b981' }}>
                    ${((row.quantity || 0) * (row.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: 'status',
            label: 'STOCK STATUS',
            render: (_, row) => {
                const stock = row.quantity || 0;
                const min = row.lowStockThreshold || 10;
                let status = 'Optimal';
                let color = '#10b981';
                let bg = '#ecfdf5';
                
                if (stock === 0) {
                    status = 'Out of Stock'; color = '#ef4444'; bg = '#fef2f2';
                } else if (stock <= min) {
                    status = 'Low Stock'; color = '#f59e0b'; bg = '#fffbeb';
                }
                
                return (
                    <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, background: bg, color: color, borderRadius: 0 }}>
                        {status}
                    </span>
                );
            }
        }
    ];

    const exportToCSV = () => {
        const headers = ['Material Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Status'];
        const csvRows = [headers.join(',')];
        
        materials.forEach(row => {
            const stock = row.quantity || 0;
            const min = row.lowStockThreshold || 10;
            const status = stock === 0 ? 'Out of Stock' : (stock <= min ? 'Low Stock' : 'Optimal');
            const totalValue = stock * (row.price || 0);
            
            const values = [
                `"${row.name}"`,
                `"${row.sku || ''}"`,
                `"${row.category || ''}"`,
                stock,
                row.price || 0,
                totalValue,
                status
            ];
            csvRows.push(values.join(','));
        });
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Material_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="rd-container">
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Material Reports</span>
                            <span className="rd-module-badge">ANALYTICS</span>
                        </div>
                    </div>
                </div>

                <StatGrid>
                    <StatCard
                        title="Total Inventory Value" value={`$${summary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        colorTheme="mint" icon={TrendingUp}
                        trendValue="Across all materials"
                        trendPositive={true}
                    />
                    <StatCard
                        title="Unique Materials" value={summary.items.toLocaleString()}
                        colorTheme="blue" icon={Package}
                        trendValue="Tracked SKUs"
                        trendPositive={true}
                    />
                    <StatCard
                        title="Low Stock Items" value={summary.lowStock}
                        colorTheme="peach" icon={AlertTriangle}
                        trendValue="Requires restocking"
                        trendPositive={false}
                    />
                    <StatCard
                        title="Total Movements" value={summary.movementsCount.toLocaleString()}
                        colorTheme="purple" icon={Clock}
                        trendValue="Recorded transactions"
                        trendPositive={true}
                    />
                </StatGrid>

                <div style={{ marginTop: '24px' }}>
                    <DataTable
                        title="Inventory Valuation Report"
                        subtitle="Comprehensive breakdown of stock value by material"
                        columns={columns}
                        data={materials}
                        loading={loading}
                        searchPlaceholder="Search materials..."
                        searchKeys={['name', 'sku', 'category']}
                        primaryAction={{
                            label: 'Export CSV',
                            icon: Download,
                            onClick: exportToCSV
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MaterialReports;

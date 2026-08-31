const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../src/controllers/materialcontroller.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the last clean line before the UTF-16 garbage
const cutMarker = '        const responseData = material.toJSON ? material.toJSON() : material;';
const cutIdx = content.indexOf(cutMarker);

if (cutIdx === -1) {
    console.error('Marker not found in file!');
    process.exit(1);
}

const cleanPart = content.substring(0, cutIdx);

const newEnd = `        const responseData = material.toJSON ? material.toJSON() : material;
        responseData.vendor = vendorData;
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMaterialSuppliers = async (req, res) => {
    try {
        const materialId = req.params.id;
        const Vendor = require('../models/Vendor');
        const VendorMaterial = require('../models/VendorMaterial');
        const junctionLinks = await VendorMaterial.sequelizeModel.findAll({ where: { materialId: materialId } });
        const vendorIds = junctionLinks.map(j => j.vendorId);
        let vendors = [];
        if (vendorIds.length > 0) {
            vendors = await Vendor.sequelizeModel.findAll({ where: { id: vendorIds } });
        }
        const mat = await Material.findById(materialId);
        if (mat && mat.vendorId) {
            const alreadyIncluded = vendors.find(v => String(v.id) === String(mat.vendorId));
            if (!alreadyIncluded) {
                const primaryVendor = await Vendor.sequelizeModel.findByPk(mat.vendorId);
                if (primaryVendor) vendors.push(primaryVendor);
            }
        }
        res.status(200).json(vendors);
    } catch (error) {
        console.error('getMaterialSuppliers error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTimeline, getMaterials, createMaterial, updateMaterial, updateMaterialLocation,
    deleteMaterial, getLowStockMaterials, recalculateStockStatus, getLowStockCount,
    getMaterialMovements, getAllMovements, getMaterialAnalytics, archiveMaterial,
    getMaterialList, getMaterialById, getLowStockCount, updateMovement, getMaterialSuppliers
};
`;

fs.writeFileSync(filePath, cleanPart + newEnd, 'utf8');
console.log('File fixed successfully! New size:', (cleanPart + newEnd).length, 'chars');

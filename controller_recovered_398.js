};

const approveOcrDocument = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only Admin can approve OCR documents." });
        }

        const doc = await OcrDocument.findById(req.params.id);
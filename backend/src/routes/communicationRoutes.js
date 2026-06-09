const express = require('express');
const router = express.Router();
const { getCustomerCommunications, createCommunication, updateCommunication, deleteCommunication } = require('../controllers/communicationcontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createCommunication);

router.route('/customer/:customerId')
    .get(protect, getCustomerCommunications);

router.route('/:id')
    .put(protect, updateCommunication)
    .delete(protect, deleteCommunication);

module.exports = router;

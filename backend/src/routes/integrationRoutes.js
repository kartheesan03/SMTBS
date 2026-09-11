const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const SystemSetting = require('../models/SystemSetting');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// GET all integrations and system settings
router.get('/', protect, async (req, res) => {
    try {
        const integrations = await Integration.find();
        
        // Ensure default integrations exist
        const defaultProviders = ['github', 'docker', 'aws', 'slack', 'whatsapp', 'sheets'];
        const existingProviders = integrations.map(i => i.provider);
        
        for (const provider of defaultProviders) {
            if (!existingProviders.includes(provider)) {
                const newInt = await Integration.create({ provider, isConnected: false });
                integrations.push(newInt);
            }
        }

        const apiKeySetting = await SystemSetting.findOne({ settingKey: 'apiKey' });
        const webhookUrlSetting = await SystemSetting.findOne({ settingKey: 'webhookUrl' });

        // Strip sensitive config details from API response
        const safeIntegrations = integrations.map(int => {
            const safeInt = int.toJSON ? int.toJSON() : int;
            if (safeInt.config) {
                delete safeInt.config.accessToken;
                delete safeInt.config.access_token;
                delete safeInt.config.refresh_token;
            }
            return safeInt;
        });

        res.json({
            integrations: safeIntegrations,
            apiKey: apiKeySetting ? apiKeySetting.settingValue : '',
            webhookUrl: webhookUrlSetting ? webhookUrlSetting.settingValue : ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
});

// ==========================================
// GENERIC CONNECT / DISCONNECT (WEBHOOK)
// ==========================================
router.post('/:provider/connect', protect, async (req, res) => {
    try {
        const { provider } = req.params;
        const { webhookUrl } = req.body;
        
        let integration = await Integration.findOne({ provider });
        
        if (!integration) {
            integration = await Integration.create({ provider, isConnected: true, config: { webhookUrl, connectedAt: new Date() } });
        } else {
            integration.isConnected = true;
            integration.config = { ...integration.config, webhookUrl, connectedAt: new Date() };
            await integration.save();
        }

        let safeInt = integration.toJSON ? integration.toJSON() : integration;
        if (safeInt.config) {
            delete safeInt.config.accessToken;
            delete safeInt.config.access_token;
            delete safeInt.config.refresh_token;
        }

        res.json({ success: true, integration: safeInt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to connect ${req.params.provider}` });
    }
});

// POST disconnect integration
router.post('/:provider/disconnect', protect, async (req, res) => {
    try {
        const { provider } = req.params;
        const integration = await Integration.findOne({ provider });
        
        if (integration) {
            integration.isConnected = false;
            integration.config = null;
            await integration.save();
        }
        
        res.json({ success: true, integration });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to disconnect integration' });
    }
});

// POST regenerate API Key
router.post('/system/apikey', protect, async (req, res) => {
    try {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const newApiKey = `sk-smtbms-${randomString}`;
        
        let setting = await SystemSetting.findOne({ settingKey: 'apiKey' });
        if (!setting) {
            setting = await SystemSetting.create({ settingKey: 'apiKey', settingValue: newApiKey });
        } else {
            setting.settingValue = newApiKey;
            await setting.save();
        }
        
        res.json({ success: true, apiKey: newApiKey });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to regenerate API key' });
    }
});

// POST save webhook URL
router.post('/system/webhook', protect, async (req, res) => {
    try {
        const { webhookUrl } = req.body;
        
        let setting = await SystemSetting.findOne({ settingKey: 'webhookUrl' });
        if (!setting) {
            setting = await SystemSetting.create({ settingKey: 'webhookUrl', settingValue: webhookUrl });
        } else {
            setting.settingValue = webhookUrl;
            await setting.save();
        }
        
        res.json({ success: true, webhookUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save webhook URL' });
    }
});

module.exports = router;

/**
 * companyInfo.js
 * Central source of truth for static company profile data shown in the
 * feed sidebar. Replace these with real API calls once the backend
 * exposes a /company/profile endpoint.
 */

const COMPANY_INFO = {
  name:     'SMTBMS Solutions',
  tagline:  'Official Company Updates & Network',
  industry: 'ERP Systems',
  location: 'India',
  members:  null, // always fetched live from /feed/company-stats
};

export default COMPANY_INFO;

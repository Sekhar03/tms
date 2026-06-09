// Server-side in-memory cache to retain state during warm starts.
// Initializes with the default configuration list.
let emails = [
    { email: 'ops-lead@iserveu.in', bank: 'Master' },
    { email: 'bank-audit@firstbank.com', bank: 'SBI' }
];

module.exports = (req, res) => {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            res.status(200).json(emails);
        } else if (req.method === 'POST') {
            const { email, bank } = req.body || {};
            if (!email || !bank) {
                res.status(400).json({ error: 'Email and Bank are required' });
                return;
            }
            // Check for duplicate
            const isDuplicate = emails.some(
                item => item.email.toLowerCase() === email.toLowerCase() && item.bank === bank
            );
            if (isDuplicate) {
                res.status(400).json({ error: `This email is already configured for ${bank}` });
                return;
            }
            emails.push({ email, bank });
            res.status(201).json(emails);
        } else if (req.method === 'DELETE') {
            // Can be passed via body or query params
            const email = (req.query.email || (req.body && req.body.email) || '').trim();
            const bank = (req.query.bank || (req.body && req.body.bank) || '').trim();

            if (!email || !bank) {
                res.status(400).json({ error: 'Email and Bank parameters are required' });
                return;
            }

            const index = emails.findIndex(
                item => item.email.toLowerCase() === email.toLowerCase() && item.bank === bank
            );
            if (index !== -1) {
                emails.splice(index, 1);
                res.status(200).json(emails);
            } else {
                res.status(404).json({ error: 'Recipient not found' });
            }
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

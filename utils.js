const fs = require('fs');
const dataFile = './accounts.json';

const adminId = '1145030539074600970';

function loadAccounts() {
    if (fs.existsSync(dataFile)) {
        const rawData = fs.readFileSync(dataFile);
        return JSON.parse(rawData);
    }
    return {};
}

function saveAccounts(accounts) {
    fs.writeFileSync(dataFile, JSON.stringify(accounts, null, 2));
}

module.exports = {
    adminId,
    loadAccounts,
    saveAccounts,
};

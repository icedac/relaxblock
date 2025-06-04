const path = require('path');

// Extension ID for testing (will be different when loaded unpacked)
global.EXTENSION_PATH = path.join(__dirname, '../..');
global.EXTENSION_ID = 'extensionidfortesting'; // This will be replaced by actual ID during test
module.exports = {
  launch: {
    headless: false, // Extensions require non-headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    defaultViewport: null
  }
};
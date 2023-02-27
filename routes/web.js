const express = require('express');
const router = express.Router()
const { getQr } = require('../controllers/web')
var path = require('path');

// router.use('/qr', getQr)
var staticFilesPath0 = path.resolve('./', 'public');
var staticFilesPath = path.resolve('./', 'public/index.html');
console.log(staticFilesPath)
router.use(express.static(staticFilesPath0));
router.get('/', (req, res) => {
  res.sendFile(staticFilesPath)
});

module.exports = router
var express = require('express');
var router = express.Router();

router.get('/select.json', function(req, res, next) {
    const result = {status: 200, result:'member'};
    res.send(result);
});

module.exports = router; 
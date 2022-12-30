var express = require('express');
var router = express.Router();
// index에서 제일 위 두줄과 제일 아래 한줄은 필수! 복사해옴.

router.get('/select.json', function(req, res, next) {
    const result = {status: 200, result:'board'};
    res.send(result);
});

module.exports = router;
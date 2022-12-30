var express = require('express');
var router = express.Router();

// DB에 추가, 수정, 삭제 가능함
var Book = require('../models/bookmodel');

// 수정 => 127.0.0.1:3000/api/book/update.json
// body = {_id:1004, title:'변경, author:'변경', price:1234}
router.put('/update.json', async function(req, res, next) {
    try { // _id는 한번 등록된건 못바꾼다. 이걸로 찾아서 이름, 작가, 가격만 변경가능. 조건1개 실제 변경항목 3개가 프론트에서 와야함. 
        // 먼저 데이터 베이스의 1004읽고 필요한 부분 다른 데이터로 만든다음에 저장해야함. 
        // 왜 먼저 가져오나? id와 등록일자 남아있어야하니까. 수정은 내용 가져온 다음에 다시 저장하는것. 바꾸는게 아니라 새로 저장하는것!
        
        // 조건에 해당하는 한줄 꺼내기
        const query = { _id : Number( req.body._id ) };
        const retObject = await Book.findOne(query);
        
        // 꺼낸 데이터에서 변경항목으로 대체
        retObject.title = String(req.body.title);
        retObject.author = String(req.body.author);
        retObject.price = Number(req.body.price);
        
        // 다시 저장하기
        const result = await retObject.save();
        
        // 결과값으로 조건 확인
        if(result !== null) {
            return res.send({status : 200});
        }
        return res.send({status : 0});
    }
    catch(e){
        console.error(e); // 개발자를 위한 용도
        res.send({ status : -1, result : e })
    }
});



// 삭제 => 127.0.0.1:3000/api/book/delete.json?code=1003 -> 덜 중요한 정보는 url에
// 127.0.0.1:3000/api/book/delete.json -> const body = {code : 1003} -> 중요한 정보는 body에 심어서
router.delete('/delete.json', async function(req, res, next) {
    try { // 삭제하려는 항목에 대한 정보를 줘야함. 여기서는 _id
        console.log(req.query.code);
        // 조건
        const query = { _id : Number(req.query.code) };
        const result = await Book.deleteOne( query );
        
        // { acknowledged: true, deletedCount: 1 } -> 카운트가 0이면 못지운것
        console.log('result => ', result);
        if(result.deletedCount === 1){
            return res.send({status : 200});
        }
        return res.send({status : 0});
    }
    catch(e){
        console.error(e); 
        res.send({ status : -1, result : e })
    }

});


// 책 추가(post)
// 주소 => 127.0.0.1:3000/api/book(여기까지는 app에서 정해진것)/insert.json
// req => 코드, 제목, 저자, 가격 {_id:1, title:'a', author:'b', price:1000} model에 있는걸 그대로 써야 안헷갈리지! 
// 등록일은 자동으로 주게 했으니까 안받아도됨
router.post('/insert.json', async function(req, res, next) {
    try{
        // { _id: 1001, title: 'b', author: 'c', price: 13980 }
        console.log(req.body);

        // 저장할 데이터를 model에 세팅
        const bookObject  = new Book(); // 데이터 저장하기 위한 object 생성
        bookObject._id    = Number(req.body._id);
        bookObject.title  = String(req.body.title);
        bookObject.author = String(req.body.author);
        bookObject.price  = Number(req.body.price);

        // 실제 DB에 저장됨(시간이 걸림)
        const result = await bookObject.save();
        console.log(result);
        
        if(result !== null) {
            return res.send({status: 200}); // 여기에 도달하면 정상 처리
        }
        return res.send({status: 0}); // DB 자체가 꺼진것!
        
    }
    catch(e){
        // 여기에 오면 오류난것임
        console.error(e); // 개발자를 위한 용도
        res.send({ status : -1, result : e })
    }
});

// 주소 => 127.0.0.1:3000/api/book/select.json
router.get('/select.json', async function(req, res, next) {
    try{
        const query = {}; // 조건 없음, 전체
        const sort = {_id : -1}; // 정렬기준 코드를 기준으로 내림차순
        const result = await Book.find(query);
        res.send({
            status:200,
            result:result,
        });
    }
    catch(e){
        console.error(e); 
        res.send({ status : -1, result : e })
    }
});

// 한개 조회 => 127.0.0.1:3000/api/book/selectone.json?_id=1004
router.get('/selectone.json', async function(req, res, next) {
    try{
        const query = {_id: Number(req.query._id)};
        const result = await Book.findOne(query);
        res.send({
            status:200,
            result:result,
        });
    }
    catch(e){
        console.error(e); 
        res.send({ status : -1, result : e })
    }
});

module.exports = router;
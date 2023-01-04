var express = require('express');
var router = express.Router();

// 시간 포맷 변경
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

// 파일 첨부 
var multer = require('multer') 
var upload = multer({storage : multer.memoryStorage()});

// 모델 객체
var Board = require('../models/boardmodel');

// 게시글 삭제 => 127.0.0.1:3000/api/board/delete.json?_id=15
router.delete('/delete.json', async function(req, res, next) {
    try{
        const query = { _id : Number(req.query._id)};
        const result = await Board.deleteOne(query);
        console.log(result);

        if(result.deletedCount === 1) {
            return res.send({status : 200});
        }
        return res.send({status : 0});
    }
    catch(e){
        console.error(e); 
        return res.send({status : -1, result : e});
    }
});


// 게시글 수정 => 127.0.0.1:3000/api/board/update.json?_id=15
// { "title" : "가", "content" : "나", "writer" : "다"}
// 수정 => 조건을 기존데이터 읽은 다음 변경항목 대체 => 저장
router.put('/update.json', upload.single("file"), async function(req, res, next) {
    try{
        const query = { _id : Number(req.query._id) };
        const obj = await Board.findOne(query);
        obj.title = req.body.title;
        obj.content = req.body.content;
        obj.writer = req.body.writer;

        const result = await obj.save();
        if(result !== null) {
            return res.send({status : 200});
        }
        return res.send({status : 0});
    }
    catch(e){
        console.error(e); 
        return res.send({status : -1, result : e});
    }
});


// 조회수 증가 => 127.0.0.1:3000/api/board/updatehit.json?_id=15
router.put('/updatehit.json', upload.single("file"), async function(req, res, next) {
    try{
        const query = {_id : Number(req.query._id)};
        const result = await Board.findOne(query);
        if(result !== null) {
            result.hit = result.hit +1;
            const result1 = await result.save();
            if(result1 !== null) {
                return res.send({status : 200});
            }
        }
        return res.send({status : 0});
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});

// 게시물 상세 => 127.0.0.1:3000/api/board/selectone.json?_id=15
router.get('/selectone.json', async function(req, res, next) {
    try{
        const no = Number(req.query._id); // URL에 쿼리가 _id라서 _id를 가져온것. no면 no를 가져와야함
        const query = { _id: no };
        const project = { 
            content : 0,
            filedata: 0, 
            filename: 0, 
            filesize: 0, 
            filetype: 0,
        };

        // 1개 조회 findOne => { }
        // 목록 find = > [{},{},{}]
        const result = await Board.findOne(query, project);

        if(result !== null) { // 조회한 결과가 있으면
            result.regdate1 = moment(result.regdate).format("YYYY-MM-DD");
            result.imageurl = `/api/board.image?_id=${no}&ts=${Date.now()}`;

            // 이전글
            // mongoDB에서.. $lt 작다, $gt 크다, $lte 작거나 같다, $gte 크거나 같다
            const query1 = {_id : {$lt : no}};
            const project1 = {_id: 1}; // 다 필요 없고 글번호만 알면되니까
            let prev = await Board.find(query1, project1)
                                  .sort({_id : -1}) // no보다 작은수들로 내림차순
                                  .limit(1); // 가장 먼저 나열된 1개만
            // find를 써서 원소가 하나라도 배열꼴로 출력됨 [ { _id: 14 } ] or [] 제일 첫번째글
            console.log(prev);
            if(prev.length > 0) {
                prev = prev[0]._id; // 14만 꺼내기!
            }
            else {
                prev = 0;
            }

            // 다음글
            const query2 = {_id : {$gt : no}};
            const project2 = {_id: 1};
            let next = await Board.find(query2, project2)
                                  .sort({_id : 1})
                                  .limit(1);
            console.log(next);
            if(next.length > 0) {
                next = next[0]._id;
            }
            else {
                next = 0;
            }

            return res.send({ 
                status : 200, 
                result : result, 
                prev   : prev, 
                next   : next,
            });
        }
        return res.send({ status : 0 });
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});

// 게시판목록 => 127.0.0.1:3000/api/board/select.json?page=1&text=검색어
router.get('/select.json', async function(req, res, next) {
    try{
        const text = req.query.text; // 검색어
        const page = Number(req.query.page); // 1
        
        // 전체 데이터에서 제목이 검색어가 포함된 것 가져오기
        // a => a123, bcadfw, 1234a => 정규식
        const query = { title : new RegExp( text, 'i' ) };
        const project = { 
            content : 0,
            filedata: 0, 
            filename: 0, 
            filesize: 0, 
            filetype: 0,
        } // 필요 없는거 빼면 속도 빨라진다!
        const result = await Board.find(query, project)
                                  .sort({ _id : -1 }) // 정렬
                                  .skip( (page-1)*10 ) // 스킵
                                  .limit( 10 ); // 조회할 개수

        // 목록에서 등록일, 이미지 URL 수동으로 생성하기
        for(let tmp of result) {
            // format("YYYY-MM-DD DD:mm:ss")
            tmp.regdate1 = moment(tmp.regdate).format("YYYY-MM-DD");
            tmp.imageurl = `/api/board/image?_id=${tmp._id}&ts=${Date.now()}`;
        }

        // 페이지네이션용 전체 개수(검색어가 포함된 개수)
        const total = await Board.countDocuments(query);

        return res.send({ status : 200, total:total, result:result });
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }

});

// 이미지 URL => 127.0.0.1:3000/api/board/image?_id=13
// <img src="/api/board/image?_id=13">
router.get('/image', async function(req, res, next) {
    try{
        const query     = { _id : Number(req.query._id) };
        const project   = { filedata : 1, filetype : 1 }; // 0을 쓰는건 기존의 걸 제거한다. 1을 쓰는건 기존의 걸 가져온다.
        const result    = await Board.findOne(query, project);
        // console.log(result);
        res.contentType(result.filetype);
        return res.send(result.filedata);
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});


// 글쓰기 => 127.0.0.1:3000/api/board/insert.json
// {"title":"a", "content":"b", "writer":"c", "file":"첨부파일"}
router.post('/insert.json', upload.single("file"), async function(req, res, next) {
    try{
        console.log('req.body=>', req.body);
        console.log('req.file=>', req.file);

        // 빈 게시판 객체 생성
        const board     = new Board();
        board.title     = req.body.title;
        board.content   = req.body.content;
        board.writer    = req.body.writer;
        board.filedata  = req.file.buffer;
        board.filename  = req.file.originalname;
        board.filesize  = Number(req.file.size);
        board.filetype  = req.file.mimetype;

        const result    = await board.save();
        if(result !== null) {
            return res.send({ status : 200 });
        }
        return res.send({ status : 0 });
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});



module.exports = router;
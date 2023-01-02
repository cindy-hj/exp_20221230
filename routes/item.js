var express = require('express');
var router = express.Router();

// 타임 존 설정하기
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

// 파일 첨부 라이브러리 가져오기
var multer = require('multer');
// 파일 첨부 후 저장 방식(파일 => 현재 PC에 저장, 메모리 => DB에 저장) 
var upload = multer({storage : multer.memoryStorage()});

// models 폴더의 itemmodel.js파일을 import시킨것
var Item = require('../models/itemmodel');

// 물품1개조회(이미지URL 포함) => http://127.0.0.1:3000/api/item/selectone?_id=3
router.get('/selectone', async function(req, res, next) {
    try{
        console.log('req.query->', req.query);
        const query = { _id : Number(req.query._id) };
        const project = { filedata:0, filesize:0, filetype:0, filename:0 };
        const result = await Item.findOne(query, project);
        
        result.imageurl = `/api/item/image?_id=${result._id}`;
        // 물품목록에서 타임존 추가했다고 물품1개조회에도 자동으로 추가되는것 아니다...! 똑같이 수동으로 추가해줘야함
        result.regdate1 = moment(result.regdate).format('YYYY-MM-DD HH:mm:ss');
        console.log('result ->', result);

        return res.send({status : 200, result : result});
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});




// 물품목록 => http://127.0.0.1:3000/api/item/select?page=1
router.get('/select', async function(req, res, next) {
    try{
        // GET, ?page=1
        const page = Number(req.query.page);
        const query = {};
        // file은 URL로 전송하기 때문에 데이터를 읽을 필요 없음!
        const project = {filedata:0, filesize:0, filetype:0, filename:0};
        const sort = { _id : -1 }; // 물품번호를 기준으로 1은 오름차순, -1은 내림차순  

        // 관계형 데이터베이스에서는 SQL문을 이용하여 조회
        // 몽고DB는 noSQL
        // skip은 page가 1일때는 0개 page 2일때는 10개 (한페이지에 글 10개 기준)

        // [{},{},{}...{}]
        const result = await Item.find(query, project) // 찾는다
                                 .sort(sort) // 정렬, 변수는 _id:1인것
                                 .skip( (page-1)*10 ) // 0이면 처음부터 가져오겠다. 몇 페이지인지에 따라서 스킵하는 갯수 달라짐
                                 .limit( 10 ); // 한페이지에 10개씩 뜨도록

        // 수동으로 이미지 URL 생성하기
        for(let obj of result) {
            obj.imageurl = `/api/item/image?_id=${obj._id}`;
            obj.regdate1 = moment(obj.regdate).format('YYYY-MM-DD HH:mm:ss');
        }

        // 등록된 물품의 전체 개수
        const total = await Item.countDocuments(query);
        
        return res.send({ 
            status : 200, 
            total  : total,
            result : result, 
        });
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});

// 이미지 URL 만들기 => http://127.0.0.1:3000/api/item/image?_id=3
// <img src="/api/item/image?_id=3" />
router.get('/image', upload.single("image"), async function(req, res, next) {
    try{             // 바깥에서 변수로 잡은 upload 사용
        console.log('req.query =>', req.query);
        const query = { _id : Number(req.query._id) };
        const result = await Item.findOne(query);
        console.log('result ->', result);
        
        // res => application/json 에서 타입을 바꾸는것
        res.contentType( result. filetype );
        return res.send( result.filedata ); // 파일 내용만 보내면 된다
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});

// 물품추가 => http://127.0.0.1:3000/api/item/insert
router.post('/insert', upload.single("image"), async function(req, res, next) {
    try{
        // req = { body:, file: ...}
        // console.log(req);
        // console.log('-------------------------------'); 헷갈리지 않게 구분하기 위한 방법...
        // console.log('req.body =>', req.body);
        // console.log('-------------------------------');
        // console.log('req.file =>', req.file);
        // console.log('-------------------------------');

        // 빈 모델 객체 생성 (데이터 베이스에 들어갈 수 있도록)
        const obj = new Item();

        obj.name = req.body.name;
        obj.price = Number(req.body.price);
        obj.content = req.body.content;
        obj.quantity = Number(req.body.quantity);
        obj.filedata = req.file.buffer;
        obj.filesize = Number(req.file.size);
        obj.filename = req.file.originalname;
        obj.filetype = req.file.mimetype;
        // key는 라이브러리에 따라서 다르다. 확인해야한다.
        

        const result = await obj.save();
        if(result !== null) {
            return res.send({status : 200});
        }
        return res.send({status : 0});
    }
    catch(e){
        console.error(e); 
        return res.send({ status : -1, result : e });
    }
});

module.exports = router;

// PC => app.js <= routes/item.js <= models/
// 제일 위 두줄과 제일 마지막 한줄 사이에 소스코드 작성.. 최종적으로는 app으로 들어감. 
// node는 원래 한개만 만든다 치면 app만 만드는것. 복잡해서 관리하기 힘드니 분할시켜서 require로 땡겨서 주소설정해서 등록하는것. 
// 따라서 라우터(routes) 만들면 app에 등록하는것을 잊지마시오
var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var ItemSchema = new mongoose.Schema({
    _id     : Number, // 물품번호, 숫자, 기본키(PK(primary key)) -> pk에는 빈값이 들어갈수없기 때문에 default 값 필요없음.
    name    : { type : String, default : '' }, // 물품명
    price   : { type : Number, default : 0 }, //가격
    content : { type : String, default : '' }, //물품내용
    quantity: { type : Number, default : 0 }, // 수량
    regdate : { type : Date, default : Date.now}, // 등록일자, 현재시간(UTC, 9시간 느림) 자동 저장
    regdate1: { type : String, default : ''}, // 현재시간 맞춰주기 위해 라이브러리 설치 후 만듬

    filedata: { type : Buffer, default : null }, // 파일 데이터, buffer는 숫자를 나열시켜놓은것(2진수를 10진수로?)
    filesize: { type : Number, default : 0 }, // 파일크기
    filename: { type : String, default : '' }, // 파일명 
    filetype: { type : String, default : '' }, // 파일종류, data만 가지고는 이미지인지 동영상이지 몰라. 숫자만 나열되어 있는거니까! 파일타입 보관해야한다.

    // DB에 보관용도 아님, vue로 URL을 담아서 전송하기 위한 용도
    imageurl: { type : String, default : '' },
});

// sequence 생성 (생성할 시퀀스 명칭, ItemSchema의 어떤항목을 시퀀스로 쓸것인가)
// 시퀀스로 쓴다는건 데이터 입력안받아도 자동으로 데이터베이스에서 넣어주겠다는것
ItemSchema.plugin(sequence, {id:'SEQ_ITEMS_NO', inc_field:'_id' }); // sequence가 원래 counters에 보관되는데 보관될때의 명칭을 id로 정하는것. 고유값.

module.exports = mongoose.model('items', ItemSchema); // 모델명

// 화면상에서 받아야하는건 5개 (이름, 가격, 내용, 수량, 파일)

// 이 페이지는 설계상에서 이뤄져야 하는것. er 다이어그램이라고 한다. 미리 잘 짜야함. 나중에 바꾸려면 일이 커진다.
// er다이어그램은 collection이름과 내용, pk, bigint(숫자형), timestamp(날짜형) varchar(문자).. 등으로 이루어짐 -> 오라클할때 자세히 할것
// 실제 일할때는 개발 6~7년차 되는 pm이 설계한다. 나는 직접 설계하는게 아니라 설계상에 있는걸 해석해서 schema를 만드는것. 프론트도 알아야 좋다. 내가 뭘 입력받아야 하는지 알수있으니..
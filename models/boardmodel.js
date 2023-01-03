var mongoose = require('mongoose');
var sequence = require('mongoose-sequence')(mongoose);

var BoardSchema = new mongoose.Schema({
    _id     : { type : Number }, // 글번호, 기본키
    title   : { type : String, default : '' }, // 제목
    content : { type : String, default : '' }, // 내용
    writer  : { type : String, default : '' }, // 작성자
    hit     : { type : Number, default : 1  }, // 조회수
    regdate : { type : Date,   default : Date.now }, // 등록일자(UTC)
    regdate1: { type : String, default : '' }, // 등록일자 포맷변경

    filedata : { type : Buffer, default : null }, // 파일데이터
    filename : { type : String, default : '' }, // 파일명
    filetype : { type : String, default : '' }, // 파일 종류
    filesize : { type : Number, default : 0  }, // 파일 크기
    imageurl : { type : String, default : '' }, // 이미지 URL
});

BoardSchema.plugin(sequence, {
    id          : 'SEQ_BOARDS_NO', // counters에 id값 
    inc_field   : '_id', // 위의 컬럼중에서 시퀀스 사용할 것
    start_seq   : 11 // 시퀀스 시작값
});

module.exports = mongoose.model('boards', BoardSchema);
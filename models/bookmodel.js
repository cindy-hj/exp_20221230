// DB에 어떤 컬렉션에 어떤 내용으로 저장할 것인지 설정
var mongoose = require('mongoose'); // 라이브러리 수동으로 가져와!

var bookSchema = new mongoose.Schema({
    _id   : Number, // 책 코드 고유(중복되지 않게)
    title : {type:String, default:''},
    author: {type:String, default:''},
    price : {type:Number, default:0},
    regdate : {type:Date, default:Date.now} // 현재시간 + 9시간 빠름
});

module.exports = mongoose.model('books', bookSchema);
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

student:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

exam:{
type:mongoose.Schema.Types.ObjectId,
ref:"Exam"
},

questions:[
{
questionText:String,
options:[String],
correctAnswer:Number
}
],

score:Number,
total:Number,
percentage:Number,

status:{
type:String,
default:"PENDING"
},

practice:{
type:Boolean,
default:false
}

},{timestamps:true});

module.exports = mongoose.model("Result", resultSchema);
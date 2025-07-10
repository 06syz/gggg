const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

// 格式化日期输出
exerciseSchema.methods.toDateString = function() {
  return this.date.toDateString();
};

module.exports = mongoose.model('Exercise', exerciseSchema);
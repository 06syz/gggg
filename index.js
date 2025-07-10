const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
// 新增代码开始
const mongoose = require('mongoose');
const User = require('./models/User');
const Exercise = require('./models/Exercise');

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exercise-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
// 新增代码结束

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })); // 新增：解析表单数据
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


// 创建用户
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    if (err.code === 11000) {
      // 处理用户名重复错误
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// 获取所有用户
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('username _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 添加锻炼记录
// 添加锻炼记录
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercise = new Exercise({
      user: userId,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });

    await exercise.save();

    // 修改响应格式，将锻炼信息放在exercise字段中
    res.json({
      _id: user._id,
      username: user.username,
      exercise: {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.toDateString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取用户锻炼日志
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 构建查询条件
    const query = { user: userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    // 执行查询
    const exercises = await Exercise.find(query)
      .limit(limit ? parseInt(limit) : 0)
      .sort({ date: 1 });

    // 格式化响应
    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.toDateString()
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

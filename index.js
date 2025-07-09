// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// 时间戳微服务 API 端点
app.get("/api/:date?", function (req, res) {
  let date;

  // 处理空日期参数的情况
  if (!req.params.date) {
    date = new Date();
  } else {
    // 尝试解析参数
    if (!isNaN(req.params.date)) {
      // 是数字，假设是 Unix 时间戳
      date = new Date(parseInt(req.params.date));
    } else {
      // 是字符串，尝试解析为日期
      date = new Date(req.params.date);
    }
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    res.json({ error: "Invalid Date" });
  } else {
    res.json({
      unix: date.getTime(),
      utc: date.toUTCString()
    });
  }
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
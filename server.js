const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/upload");
const PORT = 5000; // port 港の意味
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// データベース接続
mongoose.connect(process.env.MONGOURL).then(()=>{
    console.log("データベース接続中");
}).catch((err)=>{
    console.log(err);
});

// ミドルウェア
app.use("/images", express.static(path.join(__dirname, "public/images"))); //__dirname現在地
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);

// コールバック（reqでクライアントから受け取り、resでバックエンドから返す） /はエンドポイント
app.get("/", (req, res) => {
  res.send("hello express");
})

app.listen(PORT, () => console.log("サーバーが起動しました"));
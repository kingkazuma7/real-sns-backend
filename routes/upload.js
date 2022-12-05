const router = require("express").Router();
const multer = require("multer");


// img保存場所
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
})

const upload = multer({ storage });

// 画像アップロード用API
router.post("/", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("画像uploadに成功しました");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
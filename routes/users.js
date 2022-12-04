const router = require("express").Router(); //Router関数
const User = require("../models/User"); //スキーマが使える

/* CRUD */
// ユーザー情報の更新
router.put("/:id", async(req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ユーザー情報が更新されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("あなたは自分のアカウントのときだけ情報を更新できます");
  }
})

// ユーザー情報の削除
router.delete("/:id", async(req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("ユーザー情報が削除されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("あなたは自分のアカウントのときだけ情報を削除できます");
  }
})

// ユーザー情報の取得
// router.get("/:id", async(req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, updatedAt, ...other } = user._doc;
//     return res.status(200).json(other);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// })

// クエリでユーザー情報を取得
router.get("/", async(req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    // /xx/yy?userid=kjdfkjakdjfka ?以降をみている
    const user =  userId
    ? await User.findById(userId) //userIdあれば
    : await User.findOne({ username: username }); //userId存在しない場合
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザーのフォロー（情報の更新なのでput）
router.put("/:id/follow", async (req, res) => {
  if(req.body.userId !== req.params.id) { // 自分自身のIDが、フォローするするIDと等しくない場合
    try {
      const user = await User.findById(req.params.id); // 相手の情報
      const currentUser = await User.findById(req.body.userId);
      // 相手のtwitterをフォローしているか/していないかの条件分岐
      if (!user.followers.includes(req.body.userId)) { // 相手をみにいき、自分自身がフォローされていなければ
        await user.updateOne({
          $push: {
            followers: req.body.userId, //フォロワー
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          }
        });
        return res.status(200).json("フォローに成功しました！");
      } else { // フォローされていたら
        return res.status(403).json("あなたはすでにこのユーザーをフォローしています。");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォローできません");
  }
});

// ユーザーのフォローをはずす
router.put("/:id/unfollow", async (req, res) => {
  if(req.body.userId !== req.params.id) { // 自分自身のIDが、フォローするするIDと等しくない場合
    try {
      const user = await User.findById(req.params.id); // 相手の情報
      const currentUser = await User.findById(req.body.userId);
      // フォロワーに存在したらフォローをはずせる
      if (user.followers.includes(req.body.userId)) { // 相手をみにいき、自分自身がフォローされていなければ
        await user.updateOne({
          $pull: {
            followers: req.body.userId, //フォロワー
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          }
        });
        return res.status(200).json("フォローを解除しました");
      } else { // フォローされていたら
        return res.status(403).json("このユーザーはフォロー解除できません");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォロー解除できません");
  }
});

// router.get("/", (req, res) => { // ルート指定
//   res.send("user router");
// })

module.exports = router;
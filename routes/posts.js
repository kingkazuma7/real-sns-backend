const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 投稿を作成する
router.post("/", async (req, res) => {
  const newPost = new Post(req.body); //req.bodyに打ち込んだ内容がPostへ
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// 投稿を更新する
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // post更新後の情報が入る
    if (post.userId === req.body.userId) { // req.body...今から編集するユーザーのuserIdが必要
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿編集に成功しました!")
    } else { // 編集するのが自分以外の場合
      return res.status(403).json("あなたは他人の投稿を編集できません!")
    }
  } catch (error) {
    return res.status(403).json(error);
  }
});

// 投稿を削除する
router.delete("/:id", async(req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿が削除されました");
    } else {
      return res.status(403).json("あなたは他人の投稿を削除できません") 
    }
  } catch (error) {
    return res.status(403).json(error);
  }
});

// 特定の投稿を取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(403).json(error);
  }
});

// 特定の投稿にいいねを押す
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // req.params.idは、:id/のこと、投稿A,B,C、各投稿のこと
    // 投稿にいいねが押されていなかったら
    if (!post.likes.includes(req.body.userId)) { // 投稿のいいねに対して、userIdがなければ
      await post.updateOne({
        $push: {
          likes: req.body.userId, //いいね付与
        },
      });
      return res.status(200).json("投稿にいいねしました！");
    // すでに投稿にいいねが押されてたら
    } else {
      await post.updateOne({ // いいねしているuserIdを取り除く
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json("投稿のいいねを外しました！");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// プロフィール専用のタイムラインの取得
router.get("/profile/:username", async(req, res) => {
  try {
    // 自分の投稿内容の取得
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts); //mapで一つ一つ取り出しているので...が必要
  } catch (error) {
    // console.log(error);
    return res.status(500).json(error);
  }
});

// タイムラインの投稿を取得
router.get("/timeline/:userId", async(req, res) => { // :idと差別化
  try {
    // 自分の投稿内容の取得
    const currentUser = await User.findById(req.params.userId); // User... どの人が投稿したか？
    const userPosts = await Post.find({ userId: currentUser._id }); // 投稿内容すべて
    // 自分がフォローしているユーザーの投稿内容の取得
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
        // console.log(currentUser.followings);
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts)); //mapで一つ一つ取り出しているので...が必要
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

module.exports = router;
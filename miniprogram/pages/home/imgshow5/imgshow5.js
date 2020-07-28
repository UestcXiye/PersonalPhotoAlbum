// pages/home/imgshow5/imgshow5.js
var app = getApp()  
Page({
  async checkUser() {
    //获取clouddisk是否有当前用户的数据，注意这里默认带了一个where({_openid:"当前用户的openid"})的条件
    const userData = await db.collection('image1').get()
    console.log("当前用户的数据对象",userData)

    //如果当前用户的数据data数组的长度为0，说明数据库里没有当前用户的数据
    if(userData.data.length === 0){
      //没有当前用户的数据，那就新建一个数据框架，其中_id和_openid会自动生成
      return await db.collection('image1').add({
        data:{
          //nickName和avatarUrl可以通过getUserInfo来获取，这里不多介绍
          "nickName": "",
          "avatarUrl": "",
          "albums": [ ],
          "folders": [ ]
        }
      })
    }else{
      this.setData({
        userData
      })
      console.log('用户数据',userData)
    }
  },
/*返回到上一页*/
  navigateBack() {
    wx.navigateBack({
        delta: 1
    })
},
/*返回到页面顶部*/
scrollToTop() {
  wx.pageScrollTo({
    scrollTop: 0,
    duration: 300
  })
},
CUImage5() {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: res=> {
      const filePath = res.tempFilePaths[0]
      const cloudPath = `image5/${Date.now()}-${Math.floor(Math.random(0,1)*1000)}`+filePath.match(/\.[^.]+?$/)[0]
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => {
          console.log("云存储上传成功", res)
          const db = wx.cloud.database()
          const name = `image5-${Date.now()}-${Math.floor(Math.random(0,1)*1000)}`+filePath.match(/\.[^.]+?$/)[0]
          const fileID = res.fileID
          this.setData({
            fileID:fileID
          })
          db.collection('image5').add({
            data: {
              name: name,
              fileID: fileID,
            }
          })
          .then(result => {
            console.log("数据库写入成功", result)
          })
          .catch(err => {
            console.error("数据库写入失败", err)
          })
        },
      })
    },
  })
},
getFiles() {
  const db = wx.cloud.database()  //获取数据库的引用
  db.collection("image5")
  .get()
  .then(res => {
    console.log('用户数据',res.data)
  })
  .catch(err => {
    console.error(err)
  })
},
  /**
   * 页面的初始数据
   */
  data: {
    image:[
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image5-1.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image5-2.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image5-3.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image5-4.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image4-5.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image4-6.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image4-7.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image4-8.jpg"},
      {imgurl:"https://image-1302635214.cos.ap-chengdu.myqcloud.com/image4-9.jpg"},
    ],
    fileID:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkUser()
    this.getFiles()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
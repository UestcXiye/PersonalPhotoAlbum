// pages/programlab/testupload/testupload.js
Page({
  CUImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res=> {
        const filePath = res.tempFilePaths[0]
        const cloudPath = `testupload/${Date.now()}-${Math.floor(Math.random(0,1)*1000)}`+filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log("云存储上传成功", res)
            const db = wx.cloud.database()
            const name = `testupload-${Date.now()}-${Math.floor(Math.random(0,1)*1000)}`+filePath.match(/\.[^.]+?$/)[0]
            const fileID = res.fileID
            this.setData({
              fileID:fileID
            })
            db.collection('testupload').add({
              data: {
                name: name,
                fileID: fileID,
              }
            })
            .then(res => {
              console.log("数据库写入成功", res)
              wx.navigateBack()
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
    const db = wx.cloud.database()
    db.collection('testupload')
    .field({
      _id:false,
      _openid:false,
      name:false
    })
    .get()
    .then(res => {
      console.log("数据库中所有图片的 fileID: ", res.data)
      const length = res.data.length
      for(let i=0;i<length;i++) {
        // this.data.fileID = [{imgurl: res.data[i]}].concat(this.data.fileID)
        this.data.fileID = [res.data[i]].concat(this.data.fileID)
      }
      this.setData({
        fileID: this.data.fileID
      })
    })
    .catch(err => {
      console.error(err)
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    fileID:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
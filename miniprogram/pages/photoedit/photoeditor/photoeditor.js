var app = getApp();
//全局配置
var cfg ={
  //记录贴图的信息
  template:{
    x:0,
    y:0,
    originalHeight:100,
    originalWidth: 100,
    height:100,
    width:100
  },
  scale:1
};
var SCALE = {
  MIN: 0.1,
  MAX: 2,
};

Page({
  data: {
    swiperList: [
      {image:'../../../image/bear.png'},
      {image:'../../../image/bear-front.png'},
      {image:'../../../image/penguin-student.png'},
      {image:'../../../image/penguin-teacher.png'},
      {image:'../../../image/seal.png'},
    ],
    //贴图位置索引
    currentNewScene:0,
    canvasWidth:0,
    canvasHeight:0
  },
  onLoad: function(options) {
    this.setCanvasSize()
  },
  //设置画布大小
  setCanvasSize: function() {
    var uploadData = app.globalData.uploadData;
    let that = this
    //选择一张画布，获取画布信息
    wx.createSelectorQuery().select('#scene-editor').boundingClientRect(function (canvasWrapper) {
      wx.getImageInfo({
        src: uploadData.tempFilePaths[0],
        success(res) {
          var imageWidth = res.width;
          var imageHeight = res.height;
          //如果画布高宽比小于图像高宽比，固定画布高度，调整画布宽度
          if (imageHeight / imageWidth > canvasWrapper.height / canvasWrapper.width) {
            cfg.canvasHeight = canvasWrapper.height
            cfg.canvasWidth = imageWidth * cfg.canvasHeight / imageHeight
          }
          //如果画布高宽比小于图像高宽比，固定画布高=宽度，调整画布高度
          else{
            cfg.canvasWidth = canvasWrapper.width
            cfg.canvasHeight = imageHeight * cfg.canvasWidth / imageWidth
          }
          //重新设置画布大小
          that.setData({
            canvasWidth : cfg.canvasWidth,
            canvasHeight : cfg.canvasHeight
          })
          that.drawNewScene()
        }
      })
    }).exec();
  },
  //画出图像
  drawNewScene: function () {
    //上传图片信息
    var uploadData = app.globalData.uploadData;
    var that = this;
    wx.getImageInfo({
      src: this.data.swiperList[this.data.currentNewScene].image,
      success(res) {
        //获取插图信息，调整高宽比
        var scale = res.width/res.height;
        var ctx = wx.createCanvasContext('scene');
        ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
        ctx.drawImage(that.data.swiperList[that.data.currentNewScene].image, cfg.template.x, cfg.template.y, cfg.template.height * scale, cfg.template.width)
        ctx.draw();
      }
    })
  },
  onTapScene: function(event) {
    let index = event.currentTarget.dataset.index
    //调整插图索引
    this.setData({
      currentNewScene:index
    })
    //初始化插图位置
    cfg.template.x = 0
    cfg.template.y = 0
    //初始化插图高度
    cfg.template.height = cfg.template.originalHeight
    cfg.template.width = cfg.template.originalWidth
    this.drawNewScene()
  },
  onSave: function() {
    wx.canvasToTempFilePath({
      width: cfg.canvasWidth,
      height: cfg.canvasHeight,
      destWidth: cfg.canvasWidth*2,
      destHeight: cfg.canvasHeight*2,
      canvasId: 'scene',
      success(res) {
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })
  },
  //图片触摸开始事件
  touchStart:function(event) {
    if (event.touches.length > 1) {
      this.startZoom(event)
    }else{
      this.startMove(event)
    }
  },
  startMove: function (event) {
    var touchPoint = event.touches[0];
    //计算出触摸点与图片起始位置的偏移量
    cfg.offsetX = touchPoint.clientX - cfg.template.x
    cfg.offsetY = touchPoint.clientY - cfg.template.y
  },
  startZoom: function (event) {
    //用勾股定理算出两指间的初始距离
    var distanceX = event.touches[0].clientX - event.touches[1].clientX
    var distanceY = event.touches[0].clientY - event.touches[1].clientY
   cfg.initDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
  },
  touchMove: function (event) {
    if (event.touches.length > 1) {
      this.zoom(event)
    } else {
      //缩放时，手指离开后会触发移动事件，要阻止
      if (new Date().getTime() - cfg.endTime>600){
        this.move(event)
      }
    };
  },
  move:function(event) {
    var touchPoint = event.touches[0];
    //根据实际落点与偏移量的相对值算出当前图片位置
    cfg.template.x = touchPoint.clientX - cfg.offsetX
    cfg.template.y = touchPoint.clientY - cfg.offsetY
    this.drawNewScene();
  },
  zoom:function(event) {
    var distanceX = event.touches[0].clientX - event.touches[1].clientX
    var distanceY = event.touches[0].clientY - event.touches[1].clientY
    var currentDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    //以当前手指距离与初始手指距离的比例算出当前缩放比
    cfg.scale = Math.max(Math.min(cfg.scale + 0.001 * (currentDistance - cfg.initDistance), SCALE.MAX), SCALE.MIN); 
    cfg.template.height = cfg.template.originalHeight * cfg.scale;
    cfg.template.width = cfg.template.originalWidth * cfg.scale;
    this.drawNewScene();
  },
  touchEnd: function () {
    const date = new Date();
    cfg.endTime = date.getTime();
  },
})
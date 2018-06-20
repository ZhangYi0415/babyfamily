//index.js
//获取应用实例
const app = getApp();

Page({
  data : {
      windowHeight : 0
  },
  onLoad : function () {
      var systemInfo = wx.getSystemInfoSync();
      var windowHeight = systemInfo.windowHeight;
      this.setData({
          windowHeight : windowHeight
      })
  }
});

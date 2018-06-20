//index.js
//获取应用实例
const app = getApp();

Page({
    data : {
        windowHeight : 0,
        windowHalfHeight : 0,
        version : app.globalData.version,
        nickName : '',
        pic : ''
    },
    onLoad : function () {
        var systemInfo = wx.getSystemInfoSync();
        var windowHeight = systemInfo.windowHeight;
        this.setData({
            windowHeight : windowHeight,
            windowHalfHeight : windowHeight / 2.5,
        });
        this.userInfo();
    },
    userInfo: function () {
        app.showLoading();
        var that = this;
        var options = {
            url : app.globalData.serverURL + 'userinfo',
            data : {
                token : wx.getStorageSync('userInfo').token
            },
            success: function (res) {
                if (res.data.status === 0){
                    var data = res.data.data;
                    that.setData({
                        nickName : data.nickName,
                        pic : data.pic
                    });
                }
                else {
                    app.showToast(res.data.content);
                }
            },
            complete : function (res) {
                app.hideLoading();
            }
        };
        wx.request(options);
    },
    toBabyList : function () {
        wx.setStorageSync('babyPageReload', true);
        wx.switchTab({
            url : '/pages/baby/baby'
        });
    }
});

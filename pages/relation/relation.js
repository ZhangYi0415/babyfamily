//获取应用实例
const app = getApp();
Page({
    data : {
        babyUid : 0,
        relationList : [],
        relationCanAddList : []
    },
    onLoad : function (res) {
        this.setData({
           babyUid : res.babyUid
        });
        app.setBeforePageData(1, {
            hiddenFun : true
        });
        this.relationList();
    },
    relationList: function () {
        var that = this;
        var options = {
            url: app.globalData.serverURL + 'babyRelationList',
            data: {
                token : wx.getStorageSync('userInfo').token,
                babyUid: this.data.babyUid
            },
            success: function (res) {
                if (res.data.status === 0){
                    that.setData({
                        relationList : res.data.data
                    });
                }
                else {
                    app.showToast(res.data.content);
                }
            }
        };
        wx.request(options);
    },
    relationCanAddList: function () {
        wx.navigateTo({
          url: '/pages/relationAdd/relationAdd?babyUid=' + this.data.babyUid
        });
    }
});

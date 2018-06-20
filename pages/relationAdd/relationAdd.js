//获取应用实例
const app = getApp();
Page({
    data : {
        babyUid : 0,
        relationCanAddList : []
    },
    onLoad : function (res) {
        this.setData({
            babyUid : res.babyUid
        });
        this.relationCanAddList();
    },
    relationCanAddList: function () {
        var that = this;
        var options = {
            url : app.globalData.serverURL + 'babyRelationCanAddList',
            data: {
                token : wx.getStorageSync('userInfo').token,
                babyUid: this.data.babyUid
            },
            success: function (res) {
                if (res.data.status === 0){
                    var relationCanAddList = [];
                    var arrayData = res.data.data;
                    for (var i in arrayData){
                        var obj = new Object();
                        obj.name = arrayData[i].name;
                        obj.id = arrayData[i].id;
                        obj.canAdd = arrayData[i].canAdd;
                        relationCanAddList.push(obj);
                    }
                    that.setData({
                        relationCanAddList : relationCanAddList
                    });
                }
                else {
                    app.showToast(res.data.content);
                }
            }
        };
        wx.request(options);
    },
    relationAdd: function (e) {
        var id = e.currentTarget.dataset.id;
        console.log(id);
    },
    /**
     * 页面分享注册
     */
    onShareAppMessage: function (res) {
        console.log(res);
        return {
            title: '快来加入我的宝贝家园吧',
            path : '/pages/index/index?addRelationBabyUid=' + this.data.babyUid + '&relationId=' + res.target.dataset.relationid,
            imageUrl : app.globalData.shareImg,
            success: function(res) {
                // 转发成功
            },
            fail: function(res) {
                // 转发失败
            }
        }
    },
});

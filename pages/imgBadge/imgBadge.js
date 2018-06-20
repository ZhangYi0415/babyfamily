//index.js
//获取应用实例
const app = getApp();
var type = '';
var title = '';
var api = '';
var page = 1;
var pageTotal = 1;
const bgAudio = wx.getBackgroundAudioManager();
var bgAudioData = new Object();
Page({
    data : {
        listData : [],
        noMoreData : true
    },
    onLoad : function (res) {
        type = res.type;
        switch (type){
            case 'childStory':
                api = 'childstorylist';
                title = '儿童故事（音频）';
                break;
        }
        wx.setNavigationBarTitle({
            title : title
        });
        this.getList();
    },
    getList: function () {
        app.showLoading();
        var that = this;
        var options = {
            url : app.globalData.serverURL + api,
            data : {
                page : page,
                token : wx.getStorageSync('userInfo').token
            },
            success : function (res) {
                if (res.data.status == 0){
                    var dataReturn = res.data.data;
                    page = dataReturn.page;
                    pageTotal = dataReturn.pageTotal;
                    var noMoreData = that.data.noMoreData;
                    if (page === pageTotal){
                        noMoreData = false;
                    }
                    var oldData = that.data.listData;
                    for (var i = 0; i < dataReturn.detail.length; i ++){
                        oldData.push(dataReturn.detail[i]);
                    }
                    that.setData({
                        listData : oldData,
                        noMoreData : noMoreData
                    })
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
    onPullDownRefresh: function (e) {
        page = 1;
        this.setData({
            listData : [],
            noMoreData : true
        });
        this.getList();
        wx.stopPullDownRefresh(); //停止下拉刷新
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function (e) {
        if (page < pageTotal) {
            page = page + 1;
            if (page > pageTotal) {
                page = pageTotal;
            }
            this.getList();
        }
    },
    /**
     *  播放媒体文件
     */
    playMedia : function (e) {
        var data = e.currentTarget.dataset;
        switch (type){
            case 'childStory'://播放音频
                bgAudio.src = encodeURI(data.url);
                bgAudio.title = data.title;
                bgAudio.coverImgUrl = data.img;
                bgAudioData = data;
                bgAudio.onTimeUpdate(()=> {
                    console.log(bgAudio.currentTime + ' ' + bgAudio.duration);
                    var timeDiff = bgAudio.duration - bgAudio.currentTime;
                    if (timeDiff <= 1) {
                        if (wx.getSystemInfoSync().system[0] === 'A') {
                            bgAudio.seek(0.1);
                        }
                        else {
                            bgAudio.src = bgAudioData.url;
                            bgAudio.title = bgAudioData.title;
                            bgAudio.coverImgUrl = bgAudioData.img;
                        }
                    }
                });
                break;
        }
    }
});

//index.js
//获取应用实例
const app = getApp();

Page({
    data : {
        windowHeight : 0,
        squareWidth : 0,
        squareHeight : 0,
        squareViewHeight : 0,
        squareViewWidth : 0,
        squareViewTitleHeight : 0,
        rightChannelWidth : 0,
        detailWidth : 0,
        imgLittle1x1 : 0,
        imgLittle2x1 : 0,
        imgLittle3x1 : 0,
        hiddenList : false,
        hiddenList1 : true,
        hiddenAdd : true,
        hiddenFun : true,
        listData : {
            page : 1,
            pageTotal : 1,
            noMoreData : true,
            data : []
        },
        unReadNum : 0,
        detailListData : {
            page : 1,
            pageTotal : 1,
            noMoreData : true,
            data : []
        },
        reload : false,
        babyUid : 0,
        babyInfo : {
            headPic : '',
            name : '',
            birthday : '',
            isCreater : false,
            sex : 0
        },
        relationList : []
    },
    onShow : function(){
        console.log(wx.getStorageSync('babyPageReload'));
        if (this.data.reload === true || wx.getStorageSync('babyPageReload') === true){
            this.setData({
                reload : false
            });
            wx.setStorageSync('babyPageReload', false);
            this.onPullDownRefresh();
        }
        this.cancelAdd();
    },
    onLoad : function (res) {
        app.showLoading();
        var systemInfo = wx.getSystemInfoSync();
        var windowHeight = systemInfo.windowHeight;
        var wihdowWidth = systemInfo.windowWidth;
        var standard = wihdowWidth / 3;//一行最多3个
        var standard1 = standard / 2;//圆形背景view的宽高
        var rightChannelWidth = wihdowWidth - 30;
        var rmChannelWidth = rightChannelWidth - 40 -120 - 8;
        var detailWidth = wihdowWidth - 15;
        var detailWidthInner = detailWidth - 30;
        this.setData({
            windowHeight : windowHeight,
            squareWidth : standard,
            squareHeight : standard,
            squareViewHeight : standard1,
            squareViewWidth : standard1,
            squareViewTitleHeight : standard - standard1,
            rightChannelWidth : rightChannelWidth,
            rmChannelWidth : rmChannelWidth,
            detailWidth : detailWidth,
            detailWidthInner : detailWidthInner,
            imgLittle1x1 : detailWidthInner - 10,
            imgLittle2x1 : (detailWidthInner - 10 * 2) / 2,
            imgLittle3x1 : (detailWidthInner - 10 * 3) / 3

        });
        var that = this;
        this.addRelation();
    },
    babyList : function () {
        var that = this;
        var options = {
            url : app.globalData.serverURL + 'babyList',
            data : {
                token : wx.getStorageSync('userInfo').token,
                page : this.data.listData.page
            },
            success : function (res) {
                if (res.data.status === 0){
                    var receiveData = res.data.data;
                    var oldData = that.data.listData.data;
                    var page = receiveData.page;
                    var pageTotal = receiveData.pageTotal;
                    var noMoreData = true;
                    if (page === pageTotal){
                        noMoreData = !noMoreData;
                    }
                    oldData.push(receiveData.detail);
                    that.setData({
                        listData : {
                            page : receiveData.page,
                            pageTotal : receiveData.pageTotal,
                            noMoreData : noMoreData,
                            data : receiveData.detail
                        }
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
    onPullDownRefresh: function (e) {
        if (this.data.hiddenList === false) {//详情页
            this.setData({
                listData: {
                    page: 1,
                    pageTotal: 1,
                    noMoreData: true,
                    data: []
                }
            });
            this.babyList();
        }
        else {
            this.setData({
                detailListData: {
                    page: 1,
                    pageTotal: 1,
                    noMoreData: true,
                    data: []
                }
            });
            this.babyDetail(true);
        }
        wx.stopPullDownRefresh(); //停止下拉刷新
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function (e) {
        var page = 1;
        var pageTotal = 1;
        if (this.data.hiddenList === false) {//列表页
            page = this.data.listData.page;
            pageTotal = this.data.listData.pageTotal;
            if (page < pageTotal) {
                page = page + 1;
                if (page > pageTotal) {
                    page = pageTotal;
                }
                this.setData({
                    'listData.page' : page,
                    'listData.pageTotal' : pageTotal
                });
                this.getList();
            }
        }
        else {
            page = this.data.detailListData.page;
            pageTotal = this.data.detailListData.pageTotal;
            if (page < pageTotal) {
                page = page + 1;
                if (page > pageTotal) {
                    page = pageTotal;
                }
                this.setData({
                    'detailListData.page' : page,
                    'detailListData.pageTotal' : pageTotal
                });
                this.babyDetail(true);
            }
        }
    },
    babyDetail : function (e) {
        app.showLoading();
        var babyUid = this.data.babyUid;
        var unReadNum = this.data.unReadNum;
        if (this.data.hiddenList === false) {
            var data = e.currentTarget.dataset;
            babyUid = data.uid;
            unReadNum = data.unreadnum;
            this.setData({
                detailListData : {
                    page : 1,
                    pageTotal : 1,
                    noMoreData : true,
                    data : []
                },
                hiddenList: true,
                hiddenList1: false,
                babyUid: babyUid,
                unReadNum: unReadNum
            });

        }
        var that = this;
        this.babyInfo(babyUid, function (res) {
            unReadNum = unReadNum > 0 ? 0 : 1;
            var that1 = that;
            var options = {
                url : app.globalData.serverURL + 'babyDetailList',
                data : {
                    token : wx.getStorageSync('userInfo').token,
                    page : that1.data.detailListData.page,
                    babyUid : that1.data.babyUid,
                    type : unReadNum
                },
                success : function (res) {
                    if (res.data.status === 0) {
                        var dataJson = res.data.data;
                        var relationList = app.globalData.relationList;
                        var oldData = that1.data.detailListData;
                        oldData.page = dataJson.page;
                        oldData.pageTotal = dataJson.pageTotal;
                        if (oldData.page === oldData.pageTotal){
                            oldData.noMoreData = false;
                        }
                        else {
                            oldData.noMoreData = true;
                        }
                        var heightAndWidth = 0;
                        for (var i in dataJson.detail){
                            var picLength = dataJson.detail[i].pic.length;
                            if (picLength === 1) {
                                heightAndWidth = that1.data.imgLittle1x1;
                            }
                            else if (picLength === 2) {
                                heightAndWidth = that1.data.imgLittle2x1;
                            }
                            else {
                                heightAndWidth = that1.data.imgLittle3x1;
                            }
                            for (var iPic in dataJson.detail[i].pic){
                                dataJson.detail[i].pic[iPic].heightAndWidth = heightAndWidth;
                            }
                            for (var ii = 0; ii < relationList.length; ii ++){
                                if (parseInt(relationList[ii].value) === parseInt(dataJson.detail[i].relation)){
                                    dataJson.detail[i].relation = relationList[ii].name;
                                    break;
                                }
                            }
                            oldData.data.push(dataJson.detail[i]);
                        }
                        console.log(oldData.data);
                        that1.setData({
                            detailListData : oldData
                        });
                        app.hideLoading();
                    }
                    else {
                        app.showToast(res.data.content);
                    }
                }
            };
            wx.request(options);
        });
    },
    babyInfo : function(babyUid, callback){
        var that = this;
        var options = {
            url : app.globalData.serverURL + 'babyInfo',
            data : {
                token : wx.getStorageSync('userInfo').token,
                babyUid : babyUid
            },
            success : function (res) {
                callback();
                if (res.data.status === 0){
                    var data = res.data.data;
                    that.setData({
                        babyInfo : data
                    });
                }
                else {
                    app.showToast(res.data.content);
                }
            }
        };
        wx.request(options);
    },
    backToList : function () {
        this.setData({
            hiddenList : false,
            hiddenList1 : true,
            babyInfo : {
                headPic : '',
                name : '',
                birthday : '',
                isCreater : false,
                sex : 0
            }
        });
    },
    /**
     *  阻止遮罩层穿透
     */
    cathMove: function (e) {
    },
    /**
     *  阻止遮罩层点击穿透
     */
    tapCatch: function (e) {
        console.log(e)
    },
    add : function () {
        wx.hideTabBar();
        this.setData({
            hiddenAdd : false
        });
    },
    cancelAdd : function () {
        this.setData({
            hiddenAdd : true
        });
        wx.showTabBar();
    },
    moreFun : function () {
        wx.hideTabBar();
        this.setData({
            hiddenFun : false
        });
    },
    cancelFun : function () {
        this.setData({
            hiddenFun : true
        });
        wx.showTabBar();
    },
    publicPicture : function () {
        wx.navigateTo({
            url: '/pages/public/picture/picture?babyUid=' + this.data.babyUid
        });
    },
    familyGroup : function () {
        wx.navigateTo({
            url: '/pages/relation/relation?babyUid=' + this.data.babyUid
        });
    },
    /**
     *      图片预览
     */
    previewImG: function (e) {
        var current = e.currentTarget.dataset.currentpic;
        var oldData = this.data.detailListData;
        var urls = [];
        for (var i in oldData.data){
            for (var ii in oldData.data[i].pic){
                if (oldData.data[i].pic[ii].picOrigin === current){
                    current = oldData.data[i].pic[ii].picHigh;
                }
                urls.push(oldData.data[i].pic[ii].picHigh);
            }
        }
        wx.previewImage({
            urls : urls,
            current : current
        });
    },
    /**
     *     修改宝宝信息
     */
    editBaby : function () {
        var babyUid = this.data.babyUid;
        wx.navigateTo({
            url: '/pages/addBaby/addBaby?babyUid=' + babyUid
        });
    },
    /**
     *      是否新增亲属关系
     */
    addRelation : function () {
        var that = this;
        var relationId = app.globalData.relationId;
        var addRelationBabyUid = app.globalData.addRelationBabyUid;
        console.log('adfasdfsd', addRelationBabyUid);
        if (relationId >= 0 && addRelationBabyUid >= 0){
            var options = {
                url : app.globalData.serverURL + 'babyAddRelation',
                method : 'POST',
                data : {
                    token : wx.getStorageSync('userInfo').token,
                    babyUid : addRelationBabyUid,
                    relationId : relationId
                },
                success : function (res) {
                    console.log(res);
                    if (res.data.status === 0){
                        app.showModal(res.data.content, false, false);
                    }
                    else {
                        app.showToast(res.data.content);
                    }
                    that.babyList();
                }
            };
            wx.request(options);
        }
        else {
            this.babyList();
        }
    }
});

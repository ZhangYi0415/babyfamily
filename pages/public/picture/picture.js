//获取应用实例
const app = getApp();
Page({
    data : {
        imgHeight : 0,
        endDate : '',
        showType : '',
        inputData : {
            token : '',
            babyUid : 0,
            recordTime : '',
            content : '',
            showType : 0,
            uidArray : [],
            picArray : []
        },
        canSeePageData : {
            canSeeStatus : true,
            canSeeStatus1 : true,
            radioItems: [
                {name: '全部可见', value: '0', color: 'green', checked: true},
                {name: '仅自己可见', value: '1', color: 'green'},
                {name: '部分可见', value: '2', color: 'green'},
                {name: '不给谁看', value: '3', color: 'red'}
            ],
            checkboxItems: [],
            checkboxItems1: [],
            inputData: {
                selectType : 0,
                uidArray : [],
                itemsUidArray : [],
                items1UidArray : [],
            }
        },
        picData : {
            picMaxnum : 9,
            picNowNum : 0,
            picAddBtnHidden : 'flex',
            picArray : [],
        }
    },
    onShow: function(){
        var showType = '';
        var showTypeNum = this.data.canSeePageData.inputData.selectType;
        switch (showTypeNum){
            case 0:
                showType = '全部可见';
                break;
            case 1:
                showType = '仅自己可见';
                break;
            case 2:
                showType = '部分可见';
                break;
            case 3:
                showType = '不给谁看';
                break;
        }
        this.setData({
            showType : showType,
            'inputData.showType' : showTypeNum,
            'inputData.uidArray' : this.data.canSeePageData.inputData.uidArray
        })
    },
    onLoad : function (options) {
        var babyUid = options.babyUid;
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        const windowWidth = systemInfo.windowWidth;
        this.setData({
            windowHeight : windowHeight,
            imgHeight : windowWidth * 0.9 * 0.333333,
            endDate : app.globalData.endDate,
            'inputData.babyUid' : babyUid
        });
    },
    bindDateChange: function (e) {
        this.setData({
            'inputData.recordTime' : e.detail.value
        })
    },
    bindChange: function(e) {
        console.log('picker country 发生选择改变，携带值为', e.detail.value);

        this.setData({
            countryIndex: e.detail.value
        })
    },
    canSee:function () {
        wx.setStorageSync('canSeePageData', this.data.canSeePageData);
        wx.navigateTo({
            url: '/pages/public/canSee/canSee?babyUid=' + this.data.inputData.babyUid
        });
    },
    contentChange :function (e) {
        var data = e.detail.value;
        this.setData({
            "inputData.content" : data
        });
    },
    addPic : function () {
        var that = this;
        var data = this.data.picData;
        var nowPicNum = data.picNowNum;
        var maxPicCount = data.picMaxnum;
        var leftPicNum = maxPicCount - nowPicNum;
            wx.chooseImage({
                count: leftPicNum,
                sizeType: ['original'],//, 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    var thisPicNum = res.tempFilePaths.length;
                    nowPicNum = nowPicNum + thisPicNum;
                    data.picNowNum = nowPicNum;
                    if (maxPicCount - nowPicNum === 0) {
                        data.picAddBtnHidden = 'none';
                    }
                    else {
                        data.picAddBtnHidden = 'flex';
                    }
                    for (var i = 0; i < res.tempFilePaths.length; i++) {
                        var obj = new Object();
                        obj.src = res.tempFilePaths[i];
                        obj.num = (Math.random() + Math.random())* 10;
                        data.picArray.push(obj);
                    }
                    that.setData({
                        picData: data,
                        'inputData.picArray' : data.picArray
                    });
                }
            });
    },
    delPic : function (e) {
        var data = e.currentTarget.dataset;
        var picArray = this.data.picData.picArray;
        for (var i = 0; i < picArray.length; i ++){
            if (picArray[i].num == data.uid){
                picArray.splice(i, 1);
                break;
            }
        }
        this.setData({
            'picData.picArray' : picArray,
            'inputData.picArray' : picArray,
            'picData.picNowNum' : this.data.picData.picNowNum - 1
        })
    },
    submit : function (e) {
        var dataInput = this.data.inputData;
        var tips = '';
        var canSubmit = true;
        if (dataInput.babyUid === 0){
            tips = '宝宝ID不合法';
            canSubmit = false;
        }
        if (dataInput.recordTime === ''){
            tips = '请选择事件时间';
            canSubmit = false;
        }
        if (dataInput.showType >= 2 && dataInput.uidArray.length == 0){
            tips = '请选择要限制的对象';
            canSubmit = false;
        }
        if (dataInput.picArray.length === 0){
            tips = '至少上传一张图片';
            canSubmit = false;
        }
        if (canSubmit === true){
            var qiniuArray = [];
            for (var i = 0; i < dataInput.picArray.length; i ++){
                qiniuArray.push(dataInput.picArray[i].src);
            }
            app.showLoading('数据提交中,图片过大,请勿关闭页面');
            app.uploadToQiNiu(qiniuArray, function (res) {
                console.log(res);
                if (res.status === true) {
                    dataInput.token = wx.getStorageSync('userInfo').token;
                    dataInput.pictureArray = res.data;
                    var options = {
                        url: app.globalData.serverURL + 'publicPicture',
                        data: dataInput,
                        method : 'POST',
                        success: function (res) {
                            app.hideLoading();
                            if (res.data.status === 0) {
                                app.setBeforePageData(1, {
                                    reload : true
                                });
                                app.showModal(res.data.content);
                            }
                            else {
                                app.showToast(res.data.content);
                            }
                        }
                    };
                    wx.request(options);
                }
            });
        }
        else {
            app.showToast(tips);
        }
    }
});
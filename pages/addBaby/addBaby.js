//获取应用实例
const app = getApp();

Page({
    data : {
        windowHeight : 0,
        headPic : {
            pic : '',
            picR : '/assets/img/camera.png'
        },
        radioItems: [
            {name: '男', value: '0', checked: true},
            {name: '女', value: '1'}
        ],
        radioRelation: [],
        endDate : '',
        inputData : {
            cym : '',
            xm : '',
            sex : 0,
            relation : 19,
            date : '',
            babyUid : ''
        }
    },
    onLoad : function (options) {
        /**
         *    设置窗口操作区高度
         */
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        this.setData({
            windowHeight : windowHeight,
            endDate : app.globalData.endDate,
            radioRelation : app.globalData.relationList
        });
        /**
         *      判断是否是编辑宝宝状态
         */
        var babyUid = options.babyUid;
        if (babyUid !== ''){
            this.getBabyInfo(babyUid);
        }
    },
    getBabyInfo : function (babyUid){
        app.showLoading();
        var that = this;
        var options = {
            url : app.globalData.serverURL + 'babyInfo',
            data : {
                babyUid : babyUid,
                token : wx.getStorageSync('userInfo').token
            },
            success : function (res) {
                if (res.data.status === 0) {
                    var data = res.data.data;
                    var radioItems = that.data.radioItems;
                    for (var i in radioItems){
                        if (parseInt(radioItems[i].value) === parseInt(data.sex)){
                            radioItems[i].checked = true;
                        }
                        else {
                            radioItems[i].checked = false;
                        }
                    }
                    var radioRelation = that.data.radioRelation;
                    for (var i in radioRelation){
                        if (parseInt(radioRelation[i].value) === parseInt(data.relation)){
                            radioRelation[i].checked = true;
                        }
                        else {
                            radioRelation[i].checked = false;
                        }
                    }
                    that.setData({
                        headPic: {
                            pic: data.headPicOrigin,
                            picR: data.headPic
                        },
                        inputData : {
                            cym : data.nameEdit,
                            xm : data.secondNameEdit,
                            sex : data.sex,
                            relation : data.relation,
                            date : data.birthdayTimestamp,
                            babyUid : babyUid
                        },
                        radioItems : radioItems,
                        radioRelation : radioRelation
                    });
                    app.hideLoading();
                }
                else {
                    app.showToast(res.data.content);
                }
            }
        };
        wx.request(options);
    },
    radioChange: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);

        var radioItems = this.data.radioItems;
        for (var i = 0, len = radioItems.length; i < len; ++i) {
            radioItems[i].checked = radioItems[i].value == e.detail.value;
        }

        this.setData({
            radioItems: radioItems,
            'inputData.sex' : e.detail.value
        });
    },
    radioRelationChange: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);

        var radioItems = this.data.radioRelation;
        for (var i = 0, len = radioItems.length; i < len; ++i) {
            radioItems[i].checked = radioItems[i].value == e.detail.value;
        }

        this.setData({
            radioRelation: radioItems,
            'inputData.relation' : e.detail.value
        });
    },
    bindDateChange: function (e) {
        this.setData({
            'inputData.date' : e.detail.value
        })
    },
    chooseImg : function () {
        wx.chooseImage({
            count: 1,
            sizeType: ['original'],//, 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var src = res.tempFilePaths[0];
                wx.navigateTo({
                    url: '/pages/imgUploader/imgUploader?src=' + src
                })
            }
        });
    },
    cymInput : function (res) {
        this.setData({
            'inputData.cym' : res.detail.value
        })
    },
    xmInput : function (res) {
        this.setData({
            'inputData.xm' : res.detail.value
        })
    },
    submit : function () {
        var dataPage = this.data;
        var inputData = dataPage.inputData;
        var canSubmit = true;
        var alertContent = '';
        if (inputData.xm === ''){
            canSubmit = false;
            alertContent = '请输入小名';
        }
        if (inputData.date === ''){
            canSubmit = false;
            alertContent = '请选择出生日期';
        }
        if (canSubmit === true) {
            app.showLoading('创建中');
            var options = {
                url: app.globalData.serverURL + 'createBaby',
                method: 'POST',
                data: {
                    token: wx.getStorageSync('userInfo').token,
                    headpic: dataPage.headPic.pic,
                    name: inputData.cym,
                    littlename: inputData.xm,
                    birthday: inputData.date,
                    sex: inputData.sex,
                    relation: inputData.relation,
                    babyUid : inputData.babyUid
                },
                success: function (res) {
                    if (res.data.status === 0) {
                        app.setBeforePageData(1, {
                            reload : true
                        });
                        app.showModal(res.data.content);
                    }
                    else {
                        app.showModal(res.data.content, false);
                    }
                },
                complete: function (res) {
                    app.hideLoading();
                }
            };
            wx.request(options);
        }
        else {
            app.showToast(alertContent);
        }
    }
});

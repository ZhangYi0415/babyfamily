//app.js
const qiniu = require("/utils/qiniuUploader");

App({
    globalData: {
        version: '1.0.3',
        userInfo: {
            unionId : ''
        },
        serverURL: 'https://weapp.hxzhang.top/',//业务服务器
        picUrlQiNiu: 'https://res.hxzhang.top/',//七牛资源服务器地址,
        seceretPicURL : 'https://res.hxzhang.top/',//七牛加密资源服务器地址,
        shareImg : '/assets/img/icon.png',
        addRelationBabyUid : 0,
        relationId : 0,
        endDate : '',
        relationList : [],
        //上传图片全局配置
        picCount : 0,
        imgArray : [],
        addEnabled : true
    },
    onLaunch: function () {
        this.qiNiuSetting();
        this.getNowDate();
    },
    qiNiuSetting : function (token) {
        //七牛初始化
        const uptokenURL = this.globalData.serverURL + 'qiniu/uptoken?token=' + token;
        const optionsPic = {
            region: 'SCN', // 是你注册bucket的时候选择的区域的代码
            // ECN, SCN, NCN, NA, ASG，分别对应七牛的：华东，华南，华北，北美，新加坡 5 个区域
            // 详情可以参见「说明」部分的第一条

            domain: this.globalData.picUrlQiNiu, // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接

            // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
            uptokenURL: uptokenURL, // 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "0MLvWPnyy..."}
            shouldUseQiniuFileName: true // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
        };
        const optionsPicSeceret = {
            region: 'SCN', // 是你注册bucket的时候选择的区域的代码
            // ECN, SCN, NCN, NA, ASG，分别对应七牛的：华东，华南，华北，北美，新加坡 5 个区域
            // 详情可以参见「说明」部分的第一条

            domain: this.globalData.seceretPicURL, // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接

            // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
            uptokenURL: uptokenURL + '&bucket=1', // 从指定 url 通过 HTTP GET 获取 uptoken，返回的格式必须是 json 且包含 uptoken 字段，例如： {"uptoken": "0MLvWPnyy..."}
            shouldUseQiniuFileName: true // 如果是 true，则文件 key 由 qiniu 服务器分配 (全局去重)。默认是 false: 即使用微信产生的 filename
        };
        var obj = new Object;
        obj.qiniuPicConfig = optionsPic;
        obj.qiniuSecretConfig = optionsPicSeceret;
        return obj;
    },
    showToast : function (content) {
        this.hideLoading();
        if (content === '尚未登录'){
            this.showModal(content);
        }
        else {
            wx.showToast({
                title: content,
                icon: 'none',
                duration: 800
            });
        }
    },
    showModal : function (content, closeNowPage=true, cancelBtn=false) {
        this.hideLoading();
        wx.showModal({
            title: '提示',
            content: content,
            showCancel : cancelBtn,
            success : function () {
                if (content === '尚未登录'){
                    wx.redirectTo({
                        url : '/pages/index/index'
                    });
                }
                else {
                    if (closeNowPage === true){
                        wx.navigateBack({
                            delta : 1
                        });
                    }
                }
            }
        });
    },
    showLoading : function (content=null, mask=null){
        this.hideLoading();
        if (content === null){
            content = '数据读取中';
        }
        if (mask === null){
            mask = true;
        }
        wx.showLoading({
            title : content,
            mask : mask
        });
    },
    hideLoading : function(){
        wx.hideLoading();
    },
    getNowDate: function () {
        var that = this;
        var options = {
            url : that.globalData.serverURL + 'nowdate',
            data : {
                type : 'ymd'
            },
            success : function (res) {
                if (res.data.status === 0){
                    that.globalData.endDate = res.data.data;
                }
            }
        };
        wx.request(options);
    },
    /**
     *  上传图片
     */
    chooseImage: function (maxPicNum, callback) {
        var that = this;
        wx.chooseImage({
            count : maxPicNum - that.globalData.picCount,
            sizeType: ['original'],//, 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                qiniu.init(that.qiNiuSetting(wx.getStorageSync('userInfo').token).qiniuPicConfig);
                for (var i = 0; i < res.tempFilePaths.length; i ++){
                    qiniu.upload(res.tempFilePaths[i], function (result) {
                        var dataReturn = new Object();
                        if (result.success === true){
                            dataReturn = result;
                        }
                        else {
                            dataReturn = JSON.parse(result.error);
                        }
                        if (dataReturn.success === true || dataReturn.error === 'file exists'){
                            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                            var oldData = that.globalData.imgArray;
                            var object = new Object();
                            if (dataReturn.success === true) {
                                object.pic = dataReturn.hash;
                            }
                            else {
                                var hash = dataReturn.callback_body.split('&');
                                for (var i = 0; i < hash.length; i ++){
                                    if (hash[i].indexOf('hash=') >= 0){
                                        object.pic = hash[i].substr(5, hash[i].length);
                                        break;
                                    }
                                }
                            }
                            oldData.push(object);
                            var length = oldData.length;
                            var addEnabled = true;
                            if (length === maxPicNum){
                                addEnabled = false;
                            }
                            that.globalData.imgArray = oldData;
                            that.globalData.addEnabled = addEnabled;
                            that.globalData.picCount = oldData.length;
                        }
                        else {
                            that.showToast('上传失败，请重新进入当前页面');
                        }
                        var obj = new Object();
                        obj.imgArray = that.globalData.imgArray;
                        obj.addEnabled = that.globalData.addEnabled;
                        callback(obj);
                    });
                }
            }
        });
    },
    checkLoginStatus : function (callback) {
        var options = {
            url : this.globalData.serverURL + 'loginStatus',
            data : {
                token : wx.getStorageSync('userInfo').token
            },
            success : function (res) {
                callback(res);
            }
        };
        wx.request(options);
    },
    setBeforePageData : function (pageNum=1, objData) {
        pageNum = pageNum + 1;
        var pages=getCurrentPages();
        var prevPage=pages[pages.length-pageNum];
        prevPage.setData(objData);
    },
    uploadToQiNiu : function (res, callback) {
        var that = this;
        qiniu.init(this.qiNiuSetting(wx.getStorageSync('userInfo').token).qiniuPicConfig);
        var returnArray = new Object();
        returnArray.status = true;
        returnArray.data = [];
        for (var i = 0; i < res.length; i ++){
            returnArray.data[i] = '';
        }
        for (var i = 0; i < res.length; i ++){
            (function(i){
                var that1 = that;
                qiniu.upload(res[i], function (result) {
                    var that2 = that1;
                    var dataReturn = new Object();
                    if (result.success === true){
                        dataReturn = result;
                    }
                    else {
                        dataReturn = JSON.parse(result.error);
                    }
                    var object = '';
                    var canCallBack = true;
                    if (dataReturn.success === true || dataReturn.error === 'file exists') {
                        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                        if (dataReturn.success === true) {
                            object = dataReturn.hash;
                        }
                        else {
                            var hash = dataReturn.callback_body.split('&');
                            for (var ii = 0; ii < hash.length; ii++) {
                                if (hash[ii].indexOf('hash=') >= 0) {
                                    object = hash[ii].substr(5, hash[ii].length);
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        that2.showToast('第' + i + '张图片上传失败');
                        object = 'none';
                        canCallBack = false;
                    }
                    returnArray.data[i] = object;
                    for (var ii = 0; ii < returnArray.data.length; ii++) {
                        if (returnArray.data[ii] === '') {
                            canCallBack = false;
                            break;
                        }
                    }
                    returnArray.status = canCallBack;
                    callback(returnArray);
                });
            })(i);
        }
    }
});





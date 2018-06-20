//index.js
//获取应用实例
const app = getApp();

Page({
    data : {
        windowHeight : 0,
        content : '加载中',
        hidden : false,
        addRelationBabyUid: 0,
        relationId : 0
    },
    onLoad : function (res) {
        /**
         *    设置窗口操作区高度
         */
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;

        this.setData({
            windowHeight : windowHeight
        });
        app.globalData.addRelationBabyUid = res.addRelationBabyUid;
        app.globalData.relationId = res.relationId;
        /**
         *    判断用户登录状态
         */
        this.getUserInfo();
    },
    getUserInfo : function (e) {
        this.setData({
            hidden : false,
            content : '加载中'
        });
        var that = this;
        wx.login({
            success : function (res) {
                var that1 = that;
                if (res.code) {
                    //发起网络请求
                    wx.request({
                        url: app.globalData.serverURL + 'weapplogin',
                        data: {
                            code: res.code
                        },
                        success: function (res1) {
                            var that2 = that1;
                            var unionID = '';
                            if (res1.unionid){
                                unionID = res1.data.unionid;
                            }
                            else {
                                unionID = res1.data.openid;
                            }
                            const sessionKey = res1.data.session_key;
                            wx.getUserInfo({
                                success :res=>{
                                    var that3 = that2;
                                    var options = {
                                        url: app.globalData.serverURL + 'decodeweapp',
                                        data: {
                                            ecryptdata: res.encryptedData,
                                            iv: res.iv,
                                            session: sessionKey
                                        },
                                        success: function () {
                                            that3.setData({
                                                content : '登录中'
                                            });
                                            var options = {
                                                url: app.globalData.serverURL + 'login',
                                                data: {
                                                    unionid : unionID,
                                                    userInfo : JSON.stringify(res.userInfo)
                                                },
                                                method : 'POST',
                                                success: function (res) {
                                                    var that4 = that3;
                                                    const data = res.data;
                                                    const token = data.data.token;//服务端返回的token
                                                    try {
                                                        const userObject = new Object();
                                                        userObject.token = token;
                                                        wx.setStorageSync('userInfo', userObject);//将token设置到本地缓存中
                                                        that4.relationList();
                                                        switch (data.status) {
                                                            case 0://登录成功
                                                                that4.setData({
                                                                    content : '登录成功',
                                                                    hidden: true
                                                                });
                                                                userObject.headPic = data.data.pic;
                                                                wx.setStorageSync('userInfo', userObject);

                                                                var options = {
                                                                    url : "/pages/baby/baby"
                                                                };
                                                                wx.switchTab(options);
                                                                break;
                                                            case 101://禁止登录
                                                                wx.showModal({
                                                                    title: '提示',
                                                                    content: data.content,
                                                                    confirmText: '确定',
                                                                    showCancel: false,
                                                                    success: function (res) {
                                                                    }
                                                                });
                                                                break;
                                                            case 401://没有绑定手机
                                                                wx.navigateTo({
                                                                    url: "/pages/mine/bindmobile/bindmobile"
                                                                });
                                                                break;
                                                        }
                                                    }
                                                    catch (e) {
                                                        console.error(e, 'login');
                                                    }
                                                },
                                            };
                                            wx.request(options);
                                        }
                                    };
                                    wx.request(options);
                                },
                                fail : res=>{
                                    that2.setData({
                                        content : '使用微信账户登录',
                                        hidden : true
                                    });
                                    console.log('errorGetUserInfo', res);
                                }
                            });
                        }
                    });
                }
                else {
                    console.info('登录失败！' + res.errMsg, 'onLaunch');
                }
            }
        });
    },
    relationList: function () {
        var options = {
            url : app.globalData.serverURL + 'relationlist',
            data : {
                token : wx.getStorageSync('userInfo').token
            },
            success: function (res) {
                if (res.data.status === 0){
                    app.globalData.relationList = res.data.data;
                }
            }
        };
        wx.request(options);
    },
});

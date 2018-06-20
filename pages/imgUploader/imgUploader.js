//获取应用实例
import WeCropper from '../../utils/we-cropper/we-cropper.js';
const app = getApp();
const qiniu = require("../../utils/qiniuUploader");
const device = wx.getSystemInfoSync(); // 获取设备信息
const width = device.windowWidth;
const height = device.windowHeight - 40;
const imgCutWidth = width;
const imgCutHeight = width;
Page ({
    data : {
        cropperOpt: {
            id: 'cropper',
            width,  // 画布宽度
            height, // 画布高度
            scale: 2.5, // 最大缩放倍数
            zoom: 8, // 缩放系数
            cut: {
                x: (width - imgCutWidth) / 2, // 裁剪框x轴起点
                y: (height - imgCutHeight) / 3, // 裁剪框y轴期起点
                width: imgCutWidth, // 裁剪框宽度
                height: imgCutHeight // 裁剪框高度
            }
        }
    },
    onLoad : function (options) {
        var that = this;
        app.checkLoginStatus(function (res) {//避免未登录状态获取uptoken，生成失败无法继续上传
            if (res.data.status === 0) {
                /**
                 *     实例化wecopper
                 */
                const {cropperOpt} = that.data;

                new WeCropper(cropperOpt)
                    .on('ready', (ctx) => {
                        console.log(`wecropper is ready for work!`)
                    })
                    .on('beforeImageLoad', (ctx) => {
                        console.log(`before picture loaded, i can do something`);
                        console.log(`current canvas context: ${ctx}`);
                        wx.showToast({
                            title: '上传中',
                            icon: 'loading',
                            duration: 20000
                        })
                    })
                    .on('imageLoad', (ctx) => {
                        console.log(`picture loaded`);
                        console.log(`current canvas context: ${ctx}`);
                        wx.hideToast()
                    });

                that.wecropper.pushOrign(options.src);
            }
            else {
                app.showToast(res.data.content);
            }
        });
    },
    touchStart (e) {
        this.wecropper.touchStart(e)
    },
    touchMove (e) {
        this.wecropper.touchMove(e)
    },
    touchEnd (e) {
        this.wecropper.touchEnd(e)
    },
    getCropperImage () {
        app.showLoading('正在上传', true);
        this.wecropper.getCropperImage((src) => {
            qiniu.init(app.qiNiuSetting(wx.getStorageSync('userInfo').token).qiniuPicConfig);
                qiniu.upload(src, function (result) {
                    var dataReturn = new Object();
                    if (result.success === true){
                        dataReturn = result;
                    }
                    else {
                        dataReturn = JSON.parse(result.error);
                    }
                    if (dataReturn.success === true || dataReturn.error === 'file exists'){
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
                        object.picR = src;
                        app.setBeforePageData(1, {
                            headPic:  object
                        });
                    }
                    else {
                        that.showToast('上传失败，请重新进入当前页面');
                    }
                    app.hideLoading();
                    wx.navigateBack({
                            delta: 1
                        }
                    );
                });
        });
    }
});
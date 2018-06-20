const app = getApp();

Page({
    data : {
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
    onLoad : function (res) {
        var babyUid = res.babyUid;
        this.setData(wx.getStorageSync('canSeePageData'));
        this.relationMemberList(babyUid);
    },
    radioChange: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);

        var radioItems = this.data.radioItems;
        var canSeeStatus = true;
        var canSeeStatus1 = true;
        var selectType = this.data.inputData.selectType;
        for (var i = 0, len = radioItems.length; i < len; ++i) {
            var status = radioItems[i].value == e.detail.value;
            radioItems[i].checked = status;
            if (status){
                selectType = i;
                switch (i){
                    case 0:
                        canSeeStatus = true;
                        canSeeStatus1 = true;
                        break;
                    case 1:
                        canSeeStatus = true;
                        canSeeStatus1 = true;
                        break;
                    case 2:
                        canSeeStatus = false;
                        canSeeStatus1 = true;
                        this.setData({
                            'inputData.uidArray' : this.data.inputData.itemsUidArray
                        });
                        break;
                    case 3:
                        canSeeStatus = true;
                        canSeeStatus1 = false;
                        this.setData({
                            'inputData.uidArray' : this.data.inputData.items1UidArray
                        });
                        break;
                }
            }
        }
        this.setData({
            radioItems: radioItems,
            canSeeStatus : canSeeStatus,
            canSeeStatus1 : canSeeStatus1,
            'inputData.selectType' : selectType
        });
    },
    checkboxChange: function (e) {
        console.log('checkbox发生change事件，携带value值为：', e.detail.value);

        var checkboxItems = this.data.checkboxItems, values = e.detail.value;
        for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
            checkboxItems[i].checked = false;

            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if(checkboxItems[i].uid == values[j]){
                    checkboxItems[i].checked = true;
                    break;
                }
            }
        }

        this.setData({
            checkboxItems: checkboxItems,
            'inputData.uidArray' : e.detail.value,
            'inputData.itemsUidArray' : e.detail.value
        });
    },
    checkboxChange1: function (e) {
        console.log('checkbox1发生change事件，携带value值为：', e.detail.value);

        var checkboxItems = this.data.checkboxItems1, values = e.detail.value;
        for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
            checkboxItems[i].checked = false;

            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if(checkboxItems[i].uid == values[j]){
                    checkboxItems[i].checked = true;
                    break;
                }
            }
        }

        this.setData({
            checkboxItems1: checkboxItems,
            'inputData.uidArray' : e.detail.value,
            'inputData.items1UidArray' : e.detail.value
        });
    },
    relationMemberList : function (babyUid) {
        var that = this;
        var options = {
            url : app.globalData.serverURL + 'babyRelationList',
            data : {
                token : wx.getStorageSync('userInfo').token,
                babyUid : babyUid
            },
            success : function (res) {
                if (res.data.status === 0){
                    var data = res.data.data;
                    var relationList = app.globalData.relationList;
                    var dataToData = [];
                    for (var i = 0; i < data.length; i ++){
                        var obj = new Object();
                        for (var ii = 0; ii < relationList.length; ii ++){
                            if (data[i].relation === relationList[ii].value){
                                data[i].relationId = relationList[ii].value;
                                data[i].relation = relationList[ii].name;
                                break;
                            }
                        }
                        obj.name = data[i].nickName;
                        obj.value = '' + i;
                        obj.relation = data[i].relation;
                        obj.headPic = data[i].headPic;
                        obj.uid = data[i].uid;
                        obj.checked = false;
                        dataToData.push(obj);
                    }
                    that.setData({
                        checkboxItems : dataToData,
                        checkboxItems1 : dataToData
                    });
                    var checkBoxItems = that.data.checkboxItems;
                    var itemsUidArray = that.data.inputData.itemsUidArray;
                    for (var i = 0; i < itemsUidArray.length; i ++){
                        for (var ii = 0; ii < checkBoxItems.length; ii ++){
                            console.log(itemsUidArray[i] + '====' + checkBoxItems[ii].uid);
                            if (itemsUidArray[i] == checkBoxItems[ii].uid){
                                checkBoxItems[ii].checked = true;
                                break;
                            }
                        }
                    }
                    var checkBoxItems1 = that.data.checkboxItems1;
                    var items1UidArray = that.data.inputData.items1UidArray;
                    for (var i = 0; i < items1UidArray.length; i ++){
                        for (var ii = 0; ii < checkBoxItems1.length; ii ++){
                            console.log(items1UidArray[i] + '====' + checkBoxItems1[ii].uid);
                            if (items1UidArray[i] == checkBoxItems1[ii].uid){
                                checkBoxItems1[ii].checked = true;
                                break;
                            }
                        }
                    }
                    that.setData({
                        checkboxItems: checkBoxItems,
                        checkboxItems1: checkBoxItems1
                    });
                }
                else {
                    app.showToast(res.data.content);
                }
            }
        };
        wx.request(options);
    },
    submit : function () {
        var selectType = this.data.inputData.selectType;
        if (this.data.inputData.uidArray.length > 0 ||  selectType == 0 || selectType == 1 ) {
            app.setBeforePageData(1, {
                canSeePageData: this.data
            });
            wx.navigateBack({
                delta: 1
            });
        }
        else {
            app.showToast('至少选择一个限制目标');
        }
    }
});
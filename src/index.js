var CryptoJS = require('crypto-js');

let Vcc = {
    /*php加密js解密，code为密钥*/
    encrypt:function(string, code)
    {
        code = code||'a66208';
        code = CryptoJS.MD5(code).toString();
        let iv = CryptoJS.enc.Utf8.parse(code.substring(0,16));
        let key = CryptoJS.enc.Utf8.parse(code.substring(16));
        return CryptoJS.AES.encrypt(string.toString(), key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString();
    },
    decrypt:function(string, code)
    {
        code = code||'a66208';
        code = CryptoJS.MD5(code).toString();
        let iv = CryptoJS.enc.Utf8.parse(code.substring(0,16));
        let key = CryptoJS.enc.Utf8.parse(code.substring(16));
        return CryptoJS.AES.decrypt(string,key,{iv:iv,padding:CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
    },
    /*字符转Unicode*/
    enUnicode:function(str)
    {
        let str_ = str.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g,function(newStr){
            return "\\u" + newStr.charCodeAt(0).toString(16);
        });
        return this.evil("'"+str_+"'");
    },
    enZh64:function(str)
    {
        return window.btoa(encodeURIComponent(str));
    },
    deZh64:function(str)
    {
        return decodeURIComponent(window.atob(str));
    },
    /*生成随机整数*/
    ranInt:function(min,max)
    {
        if(!max){
            max = min;
            min = 0;
        }
        return Math.floor(Math.random()*(max-min+1)+min);
    },
    /*生成随机字符串*/
    ranStr:function(len)
    {
        len = len || 1;
        let $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++){
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd.toLowerCase();
    },
    /*把数组顺序打乱,或返回0-n的随机不重复的数组*/
    ranArr:function(arr){
        if (typeof(arr)=="number"){
            let max = arr;
            arr = [];//创建一个空数组用来保存随机数组
            for(let i=0; i<max; i++){//按照正常排序填充数组
                arr[i] = i+1;
            }
        }
        arr.sort(function(){
            return 0.5-Math.random();//返回随机正负值
        });
        return arr;//返回数组
    },
    /*跳转到*/
    toUrl:function(link)
    {
        if(link.indexOf('://') < 0){
            if(window.location.port){
                location = '//'+window.location.hostname+':'+window.location.port+link;
            }else{
                location = '//'+window.location.hostname+link;
            }
        }else{
            location = link;
        }
    },
    //以分为单位
    moneyInt:function(money)
    {
        if(!money){
            return 0;
        }
        //money = money * 100;
        money = parseInt(Math.round(money*100*100)/100);
        if(money && money>0){
            return money;
        }else{
            return 0;
        }
    },
    //还原为元为单位
    moneyFloat:function(money)
    {
        if(!money){
            return 0;
        }
        //money = (Math.floor(money)/100).toFixed(2);
        //money = Math.floor(money * 100) / 100;
        money = money / 100;
        if(money && money>0){
            return money;
        }else{
            return 0;
        }
    },
    /*四舍五入*/
    money_45:function(money)
    {
        return Math.round(money*100)/100;
    },
    /*五舍*/
    money_40:function(money)
    {
        //乘1000除1000就是保留3位小数
        return Math.floor(money * 100) / 100;
    },
    // 通过时间戳获取正常的时间显示
    date:function(data,type){
        let _data = data;
        //如果是13位正常，如果是10位则需要转化为毫秒
        if (String(data).length == 13) {
            _data = data
        } else {
            _data = data*1000
        }
        let time = new Date(_data);
        let Y = time.getFullYear();
        let Mon = time.getMonth() + 1;
        let Day = time.getDate();
        let H = time.getHours();
        let Min = time.getMinutes();
        let S = time.getSeconds();
        //自定义选择想要返回的类型
        if(type=="Y"){
            return `${Y}年${Mon}月${Day}日`
        }else if(type=="H"){
            return `${H}:${Min}:${S}`
        }else{
            return `${Y}年${Mon}月${Day}日  ${H}:${Min}:${S}`
        }
    },
    /*创建缓存*/
    createCode:function(name,data)
    {
        switch(Object.prototype.toString.call(data)){
            case '[object Object]':data = JSON.stringify(data);//对象
                break;
            case '[object Array]':data = JSON.stringify(data);//数组
                break;
        }
        return localStorage.setItem('vccJS'+name,data);
    },
    addCode:function(name,data)
    {
        switch(Object.prototype.toString.call(data)){
            case '[object Object]':
                data = JSON.stringify(data);
                break;
            case '[object Array]':
                data = JSON.stringify(data);
                break;
        }
        let data2 = localStorage.getItem('vccJS'+name);
        if(data2){
            return localStorage.setItem('vccJS'+name,data2+'_;_'+data);
        }else{
            return localStorage.setItem('vccJS'+name,data);
        }
    },
    getCode:function(name,id)
    {
        let data = localStorage.getItem('vccJS'+name);
        if(data) {
            if (data.indexOf('_;_') != -1) {
                data = data.split('_;_');
                for (let i = 0; i < data.length; i++) {
                    if (data[i].indexOf('{') != -1) {
                        data[i] = JSON.parse(data[i]);
                        if (id) {
                            if (data[i]['id'] == id) {
                                return data[i];
                            }
                        }
                    }
                }
            } else if (data.indexOf('{') != -1) {
                data = JSON.parse(data);
            }
        }
        return data;
    },
    deleteCode:function(name)
    {
        return localStorage.removeItem('vccJS'+name);
    },
    /*设置link拼接*/
    setGet(data)
    {
        let get = decodeURIComponent(window.location.search).replace(/\?\?/i,'?');
        if(get.indexOf('is=1') != -1){
            return 0;
        }
        let str  = '';
        if(Object.prototype.toString.call(data) == '[object Object]'){
            for(let k in data){
                str += '&'+k+'='+data[k];
            }
        }else{
            if(data.indexOf('&') != 0){
                str = '&'+data;
            }else{
                str = data;
            }
        }
        if(str){
            str = str+'&is=1';//避免重复请求
            if(!get){
                str = str.replace(/\&/i,'?');
            }
        }else{
            str = '?is=1';
        }
        window.location.search = get+str;
    },
    /*获取link拼接*/
    getGet(key)
    {
        let get = decodeURIComponent(window.location.search).replace(/\?\?/i,'?');
        let data = [];
        let data1 = {};
        if(get){
            get = get.replace(/\?/i,'');
            get = get.split('&');
            for(let i = 0; i < get.length; i++) {
                data = get[i].split('=');
                if(data[0]) {
                    data1[data[0]] = data[1];
                }
            }
        }
        if(key){
            return data1[key];
        }else{
            return data1;
        }
    }
};

export default Vcc;
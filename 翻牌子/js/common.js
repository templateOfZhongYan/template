(function () {
    var _ = {
        ajax: function (options) {
            if (!options || typeof options !== "object") {
                return;
            }
            var type = options.type === "post" ? "post" : "get";
            var url = options.url;
            if (!url) {
                return;
            }
            // 抽奖点击事件开关
            btn_flag = false;
            var data = options.data;
            // 将对象形式的参数转为连接符形式
            var params = _.parseParams(data);
            var dataType = options.dataType;
            var xhr = new XMLHttpRequest();
            if (type === "get") {
                url += "?" + params;
                params = null;
            }
            xhr.open(type, url);
            if (type === "post") {
                xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            }
            xhr.send(params);
            if (options.async === false) {
                return xhr.responseText;
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) {
                    options.error && options.error(xhr.responseText);
                    return;
                }
                console.log(JSON.parse(xhr.responseText),options.success)
                try {
                    var result = JSON.parse(xhr.responseText);
                    options.success && options.success(result);
                } catch (e) {
                    options.error && options.error(xhr.responseText);
                }
            }
        },
        // 转换参数形式
        parseParams: function (obj) {
            if (!obj || typeof obj !== "object") {
                return '';
            }
            var arr = [];
            for (var k in obj) {
                if (obj[k] instanceof Object) {
                    for (var key in obj[k]) {
                        arr.push(k + "[" + key + "]" + "=" + obj[k][key]);
                    }
                } else {
                    arr.push(k + "=" + obj[k]);
                }
            }
            return arr.join("&");
        },
        animate: function (obj, json, fn) {
            //所有运动是否到达目标值
            var flag = true;
            clearInterval(obj.timer);
            obj.timer = setInterval(function () {
                for (var attr in json) {
                    var curr = 0;
                    //判断是否为透明度
                    if (attr == 'opacity') {
                        curr = Math.round(parseFloat(_.getStyle(obj, attr)) * 100);
                    } else {
                        curr = parseInt(_.getStyle(obj, attr));
                    } //移动速度处理

                    var speed = 0;
                    speed = (json[attr] - curr) / 10;
                    speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                    if (curr != json[attr]) {
                        flag = false;
                    }
                    if (attr == 'opacity') {
                        obj.style.filter = 'alpha(opacity:' + (curr + speed) + ')';
                        obj.style.opacity = (curr + speed) / 100;
                    } else {
                        obj.style[attr] = curr + speed + 'px';
                    }
                }
                if (flag) {
                    clearInterval(obj.timer);
                    fn && fn();
                }
            }, 20);
        },

        //获取样式
        getStyle: function (obj, attr) {
            if (obj.currentStyle) {
                return obj.currentStyle[attr];
            } else {
                return getComputedStyle(obj, false)[attr];
            }
        },

        setCookie: function (name, value, expire) {
            var exp = new Date();
            if (expire) {
                exp.setTime(exp.getTime() + expire);
            } else {
                var Days = 1;
                exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            }
            document.cookie = name + "=" + escape(value) + ";expires=" +
                exp.toGMTString();
        },

        getCookie: function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return '';
        },

        delCookie: function (name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = getCookie(name);
            if (cval != null)
                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
        }
    }
    window._ = _;
}())
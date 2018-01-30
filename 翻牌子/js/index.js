(function () {
    var award_ul = document.getElementById('award_ul');
    var scroller = document.getElementById('scroller');
    var fpz_cards = document.querySelectorAll('.fpz_cards');
    var fpz_container = document.getElementById('fpz_container');
    var fpz_main = document.getElementById('fpz_main');
    var fpz_modal = document.getElementById('fpz_modal');
    var modal_card = fpz_modal.querySelector('.modal_card');
    var html_fontsize = parseInt(window.getComputedStyle(document.documentElement, null)['font-size']);
    var lottery_times = fpz_container.querySelector('.fpz_header p span');
    var btn_flag = true; // 抽奖开关
    config.params.user_info = {};
    config.params.user_info_remote = {};
    var firstGetIn = true;
    //  接收奖品种类数据
    var renderData = {};

    // 中奖弹窗各元素
    var lottery_contain = document.getElementById('_W-l-r');
    var lottery_contain_close = lottery_contain.querySelector('.close');
    var lotteryResult = lottery_contain.querySelector(
        '.ct');
    var lotteryResult_h3 = lotteryResult.querySelector(
        'h3');
    var lotteryResult_h4 = lotteryResult.querySelector(
        'h4');
    var lotteryResult_a = lotteryResult.querySelector(
        'a');

    var count = 0;
    // 在cookie中存储剩余抽奖数
    if (_.getCookie('count') > 0) {
        count = _.getCookie('count') - 0;
    } else {
        count = config.times;
    }

    lottery_times.innerHTML = count;

    /*奖品横向滑动代码开始*/
    var myScroll;

    function loaded() {
        myScroll = new IScroll('#wrapper', {
            scrollX: true,
            scrollY: false,
            mouseWheel: true
        });
    }

    window.onload = function () {
        // 计算ul宽度
        var scroller_width = 0;
        var award_lis = document.querySelectorAll('#award_ul li');
        award_lis.forEach(function (ele) {
            scroller_width += ele.offsetWidth;
        })
        scroller.style.width = scroller_width + 0.406 * html_fontsize + 'px';
        loaded();

    }
    /*奖品横向滑动代码结束*/

    // 渲染奖品展示
    function award_render(result) {
        // 控制渲染位置
        var times = 0;
        var awardArr = [];
        renderData = result;
        console.log(renderData);
        var banner_name_map = result.banner_name_map;
        for (var k in banner_name_map) {
            if (!banner_name_map[k].subtitle) {
                awardArr.push(banner_name_map[k]);
            }
        }
        awardArr.forEach(function (ele) {
            var li = document.createElement('li');
            var div = document.createElement('div');
            var p_award_value = document.createElement('p');
            p_award_value.classList.add('award_value');
            var span_value = document.createElement('span');
            var span_unit = document.createElement('span');
            span_value.innerHTML = ele.value;
            span_value.classList.add('value');
            span_unit.innerHTML = ele.unit;
            span_unit.classList.add('unit');
            p_award_value.appendChild(span_value);
            p_award_value.appendChild(span_unit);
            div.appendChild(p_award_value);
            var p_award_name = document.createElement('p');
            p_award_name.classList.add('award_name');
            p_award_name.innerHTML = ele.name;
            div.appendChild(p_award_name);
            li.appendChild(div);
            award_ul.appendChild(li);
            times++;
        })
    }

    window.award_render = award_render;
    var jsonp = document.createElement('script');
    // lp 为渲染的九宫格回掉函数的名称
    jsonp.src = config.render_url;
    document.getElementsByTagName("head")[0].appendChild(jsonp);

    var methods = {
        showCards: function () {
            fpz_cards.forEach(function (ele, index) {
                ele.classList.remove('light');
                switch (index < 3) {
                    case true:
                        var left = parseInt(0.1 * html_fontsize * (index + 1) + 2.859 * html_fontsize * index);
                        var top = parseInt(0.1 * html_fontsize);
                        break;
                    case false:
                        var left = parseInt(0.1 * html_fontsize * (index - 2) + 2.859 * html_fontsize * (index - 3));
                        var top = parseInt(0.1 * html_fontsize * 2 + 3.719 * html_fontsize);
                }
                clearTimeout(ele.timer);
                ele.timer = setTimeout(function () {
                    _.animate(fpz_cards[index], {
                        left: left,
                        top: top
                    });
                    methods.flag = index;
                }, 200 * (index * 2 + 1))
            })
            var i = 0;
            clearInterval(methods.light);
            setTimeout(function () {
                if (methods.flag == 5 ? true : false) {
                    methods.light = setInterval(function () {
                        fpz_cards.forEach(function (ele, index) {
                            ele.classList.remove('light')
                        })

                        fpz_cards[i].classList.add('light');
                        i = i < 5 ? i + 1 : 0;
                    }, 500)
                }
            }, 2400)
        },
        hideCards: function () {
            clearInterval(methods.light);
            var left = parseInt(6 * html_fontsize);
            var top = parseInt(3.9 * html_fontsize);
            fpz_cards.forEach(function (ele, index) {
                _.animate(ele, {
                    left: left,
                    top: top
                });
            })
        },
        lottery: function () {
            fpz_modal.classList.add('hide');
            modal_card.classList.remove('swing');
            if (firstGetIn) {
                methods.lottery_norequest();
            } else {
                methods.lottery_request();
            }
        },

        lottery_norequest: function () {
            firstGetIn = false;
            document.getElementById('_W-l-r').style.display = 'block';
            document.getElementById('_W-l-r-bg').style.display = 'block';
        },

        lottery_request: function () {
            _.ajax({
                type: 'post',
                url: config.lottery_url,
                data: config.params,
                success: function (result) {
                    console.log(1);
                    var data = result.data;
                    // 数据处理
                    console.log(data);
                    var banner = data ? data.banner : false;
                    if (banner != false) {
                        if (data.user_info) {
                            var uid = data ? data.user_info.uid : false;
                            var expire = data ? data.user_info.expire : false;
                            _.setCookie('transfer_prize_uid', uid, expire);
                        }
                        var banner_id = banner.banner_id;
                        // 判断返回的是否为banner
                        var bannerInfo = renderData.banner_name_map[banner_id];
                        var hasSubtitle = bannerInfo.subtitle;
                        var isBanner = hasSubtitle ? true : false;
                        console.log(isBanner);
                        if (isBanner) {
                            lotteryResult_h3.innerHTML = bannerInfo.text;
                            lotteryResult_h4.style.display = 'block';
                            lotteryResult_h4.innerHTML = bannerInfo.subtitle;
                        } else {
                            lotteryResult_h3.innerHTML =
                                '恭喜您获得' + bannerInfo.text;
                            lotteryResult_h4.style.display = 'none';
                        }
                    }

                    var url_whole = banner ? banner.url_whole : '[URL]';
                    //url_whole中出现transfer_prize字段说明是奖品
                    if (url_whole.indexOf('transfer_prize') !== -1) {
                        url_whole = url_whole.replace('http://', 'https://');
                        if (_.getCookie('transfer_prize_uid')) {
                            config.params.user_info.uid = _.getCookie('transfer_prize_uid');
                        }
                        config.params.user_info_remote.cookie_string = document.cookie;
                        _.ajax({
                            url: url_whole,
                            type: 'post',
                            data: config.params,
                            success: function (result) {
                                var data = result.data;
                                lotteryResult_a.href = data.prize.detail.url;
                            }
                        })
                    } else {
                        lotteryResult_a.href = url_whole;
                    }

                    document.getElementById('_W-l-r').style.display = 'block';
                    document.getElementById('_W-l-r-bg').style.display = 'block';
                }
            })
        }
    }

    fpz_modal.addEventListener('touchmove', function (e) {
        e.preventDefault();
    })

    lotteryResult.addEventListener('touchmove', function (e) {
        e.preventDefault();
    })

    lottery_contain.addEventListener('touchmove', function (e) {
        e.preventDefault();
    })

    lottery_contain_close.addEventListener('click', function (e) {
        document.getElementById('_W-l-r').style.display = 'none';
        document.getElementById('_W-l-r-bg').style.display = 'none';
        btn_flag = true;
        // 关闭奖品展示窗，重新开始抽奖
        methods.showCards();
    })

    methods.showCards();
    fpz_main.addEventListener('click', function (e) {
        if (e.target.classList.contains('fpz_cards') && count > 0) {
            btn_flag = false;
            count--;
            lottery_times.innerHTML = count;
            _.setCookie('count', count);
            methods.hideCards();
            fpz_modal.classList.remove('hide');
            modal_card.classList.add('swing');
            setTimeout(methods.lottery, 3000);
        }
    })
}())
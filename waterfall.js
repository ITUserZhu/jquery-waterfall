;(function(win,$,doc){
    // 声明插件名
    const PLUGINNAME = 'toWaterfall';

    // 默认参数
    let defaultOpts = {
        item: '.item',
        spaceBetween: 10,
        resize: true,
        checkNav: '',
        ajaxData: null,
        tipObj: {
            tipDom: '#no-data',
            text0: '已经到底啦~',
            text1: '↓ 下拉加载更多',
        },
    }; 

    class Plugin {
        constructor(wrap, opts) {
            this.wrap = $(wrap);
            this.opts = $.extend(true, {}, defaultOpts, opts);
            this.init();
        }

        init() {
            this.initDom();
            this.initEvent();
            this.winResizePosition();
        }

        initDom() {
            let _this = this;
            this.isLoading = false; 
            this.leftSet = 0;
            this.isEnd = true; 
            this.timer = null;
            this.isInit = false; 
            // 判断底部加载状态是否存在
            if($(this.opts.tipObj.tipDom).length == 0 && this.opts.ajaxData) {
                // 在不瀑布流容器后面添加
                this.wrap.after($(`<div id="${ this.opts.tipObj.tipDom.replace('#', '') }">${ this.opts.tipObj.text1 }</div>`));
                // 设置样式
                $(this.opts.tipObj.tipDom).css({
                    marginTop: '30px',
                    textAlign: 'center',
                    color: '#999'
                });
            };
            this.noDataDom = $(this.opts.tipObj.tipDom);
        }     

        initPosition(items = this.items, isNew = 0) {
            if(this.isInit) return;
            this.isInit = true;
            let _this = this;

            this.itemWidth = this.items.eq(0).outerWidth(); // 获取元素宽度
            this.wrapWidth = this.wrap.width(); // 获取容器宽度
            this.num = Math.floor(this.wrapWidth / (this.itemWidth + this.opts.spaceBetween * 2)); // 获取元素可容纳的列数
            this.leftSet = Math.floor((this.wrapWidth - (this.itemWidth + this.opts.spaceBetween * 2) * this.num) / 2); // 最左边定位位置

            let promiseArr = [], flagIndex = -1; 
            items.each(function(index, el) {
                promiseArr.push(_this.loadImg($(el).find('img'))); // 添加promise对象到数组中
                // 等待图片加载完成获取高度
                _this.loadImg($(el).find('img')).then(function() { 
                    let h = $(el).outerHeight(),
                        minH, minIndex;
                    flagIndex++;
                    // 第一排元素高度存入 数组 并定位
                    if (flagIndex < _this.num && !isNew) {
                        _this.heightArr.push(h);
                        $(el).css({
                            position: 'absolute',
                            left: flagIndex * (_this.itemWidth + 
                                _this.opts.spaceBetween * 2) + _this.opts.spaceBetween + _this.leftSet + 'px',
                            top: '0px',
                            opacity: 1
                        });
                    } else { // 第一排以后的 按照数组中高度最低的去定位
                        minH = Math.min.apply( null, _this.heightArr);
                        minIndex = $.inArray(minH, _this.heightArr);

                        if(isNew) {
                            _this.wrap.append($(el));
                        };

                        $(el).css({
                            position: 'absolute',
                            left: minIndex * (_this.itemWidth + 
                                _this.opts.spaceBetween * 2) + _this.opts.spaceBetween + _this.leftSet + 'px',
                            top: minH + _this.opts.spaceBetween * 2 + 'px',
                            opacity: 1
                        });
                        // 更新数组数据
                        _this.heightArr[minIndex] += $(el).outerHeight() + _this.opts.spaceBetween * 2;
                    }
                })
                // 所有promise对象状态成功后设置容器高度，初始状态
                Promise.all(promiseArr).then(function() {
                    _this.wrap.height(Math.max.apply( null, _this.heightArr));
                    _this.isLoading = false;
                    _this.isInit = false;
                })

            }); 

        }
        // 返回图片加载完成promise对象
        loadImg(img) {
            return new Promise(function(resolve, reject) {
                if(img[0].complete) {
                    resolve()
                }else {
                    img.on('load', function() {
                        resolve()
                    })
                }
            })
        }
        // 初始事件
        initEvent() {
            //监测滚动
            $(win).on('scroll', this.scrollEvent.bind(this));
            // 监测屏幕resize
            if(this.opts.resize) {
                $(win).on('resize', this.winResizePosition.bind(this))
            };

            // 监测tab切换点击事件
            if(this.opts.checkNav !== '') {
                $(this.opts.checkNav).on('click', this.winResizePosition.bind(this));
            };
        }   

        winResizePosition() {
            // 初始定位，如果元素隐藏则不管
            if(this.wrap.is(':hidden')) return;
            this.items = this.wrap.children(this.opts.item);
            this.heightArr = [];
            this.initPosition();
        }

        scrollEvent(e) {
            if (this.wrap.is(':hidden')) return;

            let scrollH = $(e.target).scrollTop(),
                docH = $(doc).height(),
                winH = $(win).height(),
                maxH = Math.max.apply(null, this.heightArr),
                _this = this;
            // 判断滚动高度与是否需要滚动加载与是否正在加载中
            if((scrollH + winH) >= (docH - 800) && maxH > 1500 && !!this.opts.ajaxData && !this.isLoading) {
                // 如果没有数据底部提示到底，否则提示加载更多
                if(_this.isEnd) {
                    $(_this.noDataDom).text(_this.opts.tipObj.text1);
                } else {
                    $(_this.noDataDom).text(_this.opts.tipObj.text0);
                    return;
                };
                this.isLoading = true;
                clearTimeout(this.timer);
                this.timer = setTimeout(()=>{
                    this.opts.ajaxData(function(res, end) {

                        _this.isEnd = end == 1? true: false;

                        if(end == 500) {
                            $(_this.noDataDom).text(_this.opts.tipObj.text0);
                            return;
                        }

                        let newItem = $(res).filter(function(index, el) {
                            return el.className == _this.opts.item.replace('.', '');
                        });
                        // 添加新添加的数据并定位
                        _this.initPosition($(newItem), 1);
                    })
                }, 500);
            } 
        }
    }

    $.fn[PLUGINNAME] = function(options) {
        this.each(function() {
            if (!$.data(this, "plugin_" + PLUGINNAME)) {
                $.data(this, "plugin_" + PLUGINNAME, new Plugin(this, options));
            }
        });
        return this;
    };

})(window, jQuery, document);
# jquery-waterfall

waterfall with jquery, es6

# 一款简单jq插件，配载**es6**语法的竖向瀑布流 [demo](https://ituserzhu.github.io/jquery-waterfall/demo/)

## 插件特点：

* 数据灵活，可以后台请求数据载入页面也可以直接在html中加入元素，一般放第一页
* 同个页面可以放置多个，使用tab切换无刷新
* 页面滚动至底部前自动请求加载数据
* 数据底部动态生成加载提示或已加载结束
* 可配置是否适应resize，通用pc到手机响应式
* 自定义瀑布流元素之间间距，内容根据样式宽度自适应放入数量
* es6语法promise函数，保证图片加载后布局

---

## 插件依赖

* jQuery 2.1.4
* 插件环境es6语法，浏览器中需要babel转义

## 使用方法

1. 在jquery.js后引入
2. 自定义瀑布流容器,设置初始高度，需要相对定位
2. 自定义瀑布流元素,定义宽度与默认样式，高度根据图片自适应（默认class="item"）图片宽度固定
3. 容器调用插件方法
4. waterfall.min.js 已经转义为es5并引入babel-polyfill

```

// 接受参数
/*
    ** item: '.item',  瀑布流元素类名
    ** spaceBetween: 10, 元素间距
    ** resize: true, 是否根据窗口自适应
    ** checkNav: '', 这边是当有tab切换，tab元素父容器
    ** ajaxData: null, 滚动加载数据自定义函数，处理数据方法等，自定义方便使用
    ** tipObj: { 动态加载数据底部提示框
        tipDom: '#no-data',
        text0: '已经到底啦~',
        text1: '↓ 下拉加载更多',
    }, 

*/

// ajaxData： fn(success) ,这里回调函数接受一个函数参数，数据获取成功需要主动调用一下
// 如果有数据 success(str, 1), 没有数据success('', 0)
// str 是你这里处理过返回瀑布流元素字符串


// 举例

// 瀑布流元素
let template = `
    <li class="item" data-id="{ id }">
	<a href="{ url }" title="{ title }">
  	    <img src="{ thumb }" title="{ title }">
	    <div class="mask">
		<div class="img-operate">
		    <span class="collect"><i class="icon-collect"></i></span>
		    <span class="download-other fr">源文件</span>
		    <span class="download-jpg fr">原图</span>
		</div>
		<div class="img-title common_ovh">{ title }</div>
	    </div>
	</a>
    </li>`;
let curPage = 2, filterData = { 一些数据 };

// 后台获取数据接口方法
function getListAjax(callback) {
    let data = filterData;
    data.page = curPage;

     $.ajax({
        url: '/api/get_photo_list',
        type: 'POST',
        data: data,
     })
     .done(function(res) {
          let str = "";
          if(res.code == 200) {
	      $.each(res.data, function(index, el) {
		  str += template
		       .replace("{ thumb }", el.thumb)
		        .replace("{ id }", el.id)
		        .replace("{ url }", el.url)
		        .replace(/{ title }/g, el.title)
		  });

		  curPage++;
             }
             callback(res, str)
        })
        .fail(function(error) {
            console.log(error);
        })
};

容器.toWaterfall({
    ajaxData: function(success) {
	getListAjax(function(res, str) {
	    if(res.code == 200) {
		$bigSmall.append($(str));
		success(str, res.next);
	    }else {
	        success('', 0);
	    }
	})
	}
    })


```

--- 

## 效果图

![效果图1](/imgs/1.png)

![效果图1](/imgs/2.png)

## 提交日志

* 1.0.0 2019-03-05 —— 首次提交
 
* 1.0.1 2019-03-06 —— 添加注释

* 1.0.2 2019-03-06 —— 修改动态加载判断条件

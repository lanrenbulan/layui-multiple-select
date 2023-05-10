## 介绍

layui2.8，select多选，支持搜索

## 使用示例
```
<div class="layui-container">
  <form class="layui-form">
    <div class="layui-form-item">
      <label class="layui-form-label">城市</label>
      <div class="layui-input-block">
      <div id="select"></div>
    </div>
    </div>
    <button class="layui-btn" lay-submit lay-filter="demo-verify">提交</button>
    <button class="layui-btn" type="button" id="reload">重载</button>
  </form>
</div>
```
```
layui.config({
  // 模块地址
  base: '/test/layui/'
}).extend({
  // 定义模块路径
  select: 'select'
});
  
layui.use(['select', 'form'], function(){
  const select = layui.select;
  const form = layui.form;
  const $ = layui.$;

  const citySelect = select.render({
    elem: '#select',
    // 表单名称
    name: 'city',
    options: [{id: 1,title: '北京'}, {id: 2,title: '上海'}, {id: 3,title: '湖北'}],
    // 验证规则
    verify: 'required',
    // 初始值
    value: [{id: 1,title: '北京'}, {id: 2,title: '上海'}]
  });


  $('#reload').click(function() {
    // 重载
    citySelect.reload({
      options: [{id: 1,title: '北京'}, {id: 2,title: '上海'}, {id: 3,title: '湖北'}, {id: 4,title: '湖南'}],
    });
    // 传参：设置值
    citySelect.val('1,4');
    // 不传参，获取值
    citySelect.val();
    // 清除值
    citySelect.reset();
  });

   // 提交事件
  form.on('submit(demo-verify)', function(data){
    var field = data.field; // 获取表单字段值
    // 显示填写结果，仅作演示用
    layer.alert(JSON.stringify(field), {
      title: '当前填写的字段值'
    });
    // 此处可执行 Ajax 等操作
    // …
    return false; // 阻止默认 form 跳转
  });
});
```

## 示例图
![image](https://github.com/lanrenbulan/layui-select-multiple/assets/9604624/a40a1233-19a1-45b2-8908-db119b139bdf)


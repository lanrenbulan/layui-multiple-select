layui.define(['jquery', 'dropdown'],function(exports){
  "use strict";

  var $ = layui.jquery;
  var laytpl = layui.laytpl;
  var dropdown = layui.dropdown;

  var MOD_NAME = 'select';

  var select = {
    onfig: {
      keywordPlaceholder: '关键词'
    }
  };

  var thisSelect = function(){
    var that = this
    ,options = that.config;
    
    
    return {
      config: options
      ,reload: function(options){
        that.reload.call(that, options);
      },
      val: function(value) {
        if (!value) {
          return that.selectedIds.join(',');
        }

        that.clear.call(that);

        var ids = $.isArray(value) ? value : value.split(',');

        for (var i = 0; i < ids.length; i++) {
          var option = that.getDropdownData().filter(option => option.id == ids[i])[0];
          if (!option) {
            continue;
          }

          that.select(option)
        }
      },
      clear: function() {
        that.clear.call(that);
      }
    }
  }

  var Class = function(options) {
    var that = this;
    that.config = $.extend({}, that.config, select.config, options);
    that.selectedIds = (options.value || []).map(function(option) {
      return option.id;
    });
    that.dropdownOpened = false;

    that.render();
  }

  Class.prototype.render = function() {
    var that = this;
    var options = that.config;

    options.elem = $(options.elem);


    var temp  = '<div class="layui-form-select layui-form-select-multiple">';
    temp += '<div class="layui-form-select-input">';
    temp += `<input class="layui-input" lay-verify="${options.verify}" value="${that.selectedIds.join(',')}" name="${options.name}"><i class="layui-edge"></i>`;
    temp += '</div>',
    temp += '<div class="layui-form-select-options"></div>';
    temp += '<div class="layui-form-select-placehoder">请选择</div>',
    temp += '</div>'

    options.elem.html(temp);

    that.renderSelection();
    that.renderDropdown();

    // 移除选择
    options.elem.find('.layui-form-select-options').on('click', '.layui-form-select-item-remove', function(e) {
      e.stopPropagation();

      var id = that.selectedIds[$(this).parent().index()],
          option = that.getDropdownData().filter(option => option.id == id)[0];

      that.remove(option);
    })
  };


  Class.prototype.clear = function() {
    this.selectedIds = [];
    this.reload();
  };


  // 移除选择
  Class.prototype.remove = function(option) {
    this.selectedIds = this.selectedIds.filter(id => id != option.id);
    this.reload();
  };


  // 选择
  Class.prototype.select = function(option) {
    this.selectedIds.push(option.id);
    this.reload();
  };

  // 重载
  Class.prototype.reload = function(options) {
    if (options) {
      this.config = $.extend({}, this.config, options);
    }
    
    this.renderSelection();
    this.dropdown.reload({content: this.getDropdownContent(), show: this.dropdownOpened});
    var height = this.config.elem.find('.layui-form-select-options').height();
    height = height > 35 ? height + 4 : height;
    height = Math.max(height, 38);
    this.config.elem.find('.layui-form-select-input > input').val(this.selectedIds.join(',')).css('height', height + 'px');

  };

  Class.prototype.getDropdownData = function() {
    var that = this;
    return this.config.options.map(function(item) {
      return {
        id: item.id,
        title: item.title,
        checked: that.selectedIds.indexOf(item.id) !== -1
      }
    });
  };

  Class.prototype.getDropdownContent = function() {
    return [
        '<div class="layui-form-select-search"><input class="layui-input" autofocus placeholder="关键词"/></div>',
        '<ul class="layui-menu layui-dropdown-menu">',
        this.getDropdownData().map(function(option) {
          return `<li><div class="layui-menu-body-title"><div class="layui-form-select-dropdown-item ${option.checked ? 'layui-form-select-dropdown-selected' : ''}"><i class="layui-icon layui-icon-ok"></i>${option.title}</div></div></li>`;
        }).join(''),
        '</ul>',
      ].join('');
  };

  Class.prototype.renderDropdown = function() {
    var that = this;

    that.dropdownOpened = false;

    var panel = dropdown.render({
      elem: that.config.elem,
      style: 'width:' + that.config.elem.width() + 'px',
      content: that.getDropdownContent(),
      templet: function(d) {
        return `<div class="layui-form-select-dropdown-item ${d.checked ? 'layui-form-select-dropdown-selected' : ''}"><i class="layui-icon layui-icon-ok"></i>${d.title}</div>`
      },
      ready: function(panel, elem) {
        that.dropdownOpened = true;
        // select箭头
        that.config.elem.find('.layui-form-select').addClass('layui-form-select-panel-opened');

        // 搜索框事件
        panel.find('div.layui-form-select-search > input').on('input', function() {
          var keyword = $(this).val().toLowerCase();
          panel.find('ul.layui-dropdown-menu li').each(function() {
            // 不匹配则隐藏
            if ($(this).text().toLowerCase().indexOf(keyword) === -1) {
              $(this).hide();
            } else {
              $(this).show();
            }
          })
        });

        var i = setInterval(function() {
          // 是否已展开
          if (!elem.data('layui_dropdown_index_opened')) {
            that.dropdownOpened = false;

            that.config.elem.find('.layui-form-select').removeClass('layui-form-select-panel-opened');
            clearInterval(i);
          }
        }, 100);
      },

      click: function(data, elem) {
        // 获取点击项的索引
        var index = elem.index(),
            selectedOption = that.getDropdownData()[index]; 
        
        // 如果值不存在
        if (that.selectedIds.indexOf(selectedOption.id) === -1) {
          that.select(selectedOption);
        } else {
          that.remove(selectedOption);
        }

        // false不关闭面板
        return false;
      }
    });

    that.dropdown = panel;
  };


  Class.prototype.renderSelection = function() {
    var tpl = [
        '{{#  layui.each(d, function(index, option) { }}',
        '<div class="layui-inline layui-form-select-selection-item" data-id="{{= option.id }}">',
        '<span class="layui-form-select-selection-item-content">{{= option.title}}</span>',
        '<i class="layui-icon layui-icon-close layui-form-select-item-remove"></i></div>',
        '{{# }) }}',
      ].join('')
      ,selectPlacehodlerElem = this.config.elem.find('div.layui-form-select-placehoder')
      ,h = laytpl(tpl).render(this.getSelectedOptions());

    this.config.elem.find('div.layui-form-select-options').html(h);

    if (this.selectedIds.length === 0) {
      selectPlacehodlerElem.show();
    } else {
      selectPlacehodlerElem.hide();
    }
  };

  Class.prototype.getSelectedOptions = function() {
    var that = this;
    return that.config.options.filter(function(item) {
      return that.selectedIds.indexOf(item.id) !== -1
    });
  };



  //核心入口
  select.render = function(options){
    var inst = new Class(options);
    return thisSelect.call(inst);
  };

  exports('select', select);
});

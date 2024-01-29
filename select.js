layui.define(['jquery', 'dropdown'],function(exports){
  "use strict";

  var $ = layui.jquery;
  var laytpl = layui.laytpl;
  var dropdown = layui.dropdown;

  var MOD_NAME = 'select';

  var select = {
    // 默认配置
    config: {
      valueSeparator: ',',
      keywordPlaceholder: '请输入关键词',
      unfilteredText: '没有匹配的选项',
      customName: {
        id: 'id',
        title: 'title',
        selected: 'selected',
      },
      options: [],
      allowCreate: true,
      collapseSelected: false,
    }
  };

  var thisSelect = function(){
    var that = this
    ,config = that.config;
    
    return {
      config: config
      ,reload: function(config){
        that.reload.call(that, config);
      },

      // 获取值或设置值
      val: function(value) {
        if (!value) {
          return that.context.selectedIds.join(config.valueSeparator);
        }

        that.clear.call(that);

        var ids = $.isArray(value) ? value : value.split(config.valueSeparator);

        for (var i = 0; i < ids.length; i++) {
          var option = that.getOptionById(ids[i]);
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

  var Class = function(config) {
    var that = this;

    that.config = $.extend({}, that.config, select.config, config);

    that.config.elem = $(config.elem);

    that.config.elem.css({
      position: 'absolute',
      color: '#FFF',
      userSelect: 'none',
      top: 0,
      height: '100%'
    });

    var width = that.config.elem.parent().outerWidth();

    var layuiInputBlock = that.config.elem.parents('.layui-input-block');
    if (layuiInputBlock.length > 0) {
      width = layuiInputBlock.width();
    }

    var layuiInputGroup = that.config.elem.parents('.layui-input-group');
    if (layuiInputGroup.length > 0) {
      width -= layuiInputGroup.width();
    }

    // 将input包裹起来
    that.config.elem.wrap(`<div class="layui-form-select multiple-select" style="width:${width}px"></div>`)
    // 向下箭头
    that.config.elem.after('<div class="layui-input-suffix"><i class="layui-edge"></i></div>');

    that.render();
  }

  Class.prototype.render = function() {
    var that = this;
    var config = that.config;

    // 根据`config.customName`标准化
    config.options = config.options.map(function(option) {
      return {
        id: option[that.config.customName.id],
        title: option[that.config.customName.title],
        selected: option[that.config.customName.selected],
      };
    });

    // 上下文
    this.context = {
      // 搜索关键词
      keyword: '',
      // 满足搜索关键词的选项
      filteredOptions: null,
      // 已选择的ID
      selectedIds: that.config.options.filter(function(option) {
        return option.selected;
      }).map(function(option) {
        return option.id
      }),
      options: JSON.parse(JSON.stringify(config.options)),
      // dropdown滚动条的位置
      dropdownMenuScrollTop: 0,
    };

    // 赋值
    config.elem.val(this.context.selectedIds.join(config.valueSeparator));

    // 因为样式层级问题，这里click相当于
    config.elem.parent().on('click', '.multiple-select-selection', function() {
      that.config.elem.click();
    });

    // 移除选项
    config.elem.parent().on('click', '.multiple-select-selection-item-remove', function(e) {
      e.stopPropagation();

      var id = $(this).parent().data('id'),
          option = that.getOptionById(id);

      that.remove(option);
    });

    that.renderDropdown();
    that.renderSelection();
  };

  // 清空所有值
  Class.prototype.clear = function() {
    this.context.selectedIds = [];
    this.reloadDropdownData(this.buildRenderOptions());
  };

  // 移除选项
  Class.prototype.remove = function(option) {
    this.context.selectedIds = this.context.selectedIds.filter(function(id) { return id != option.id; });
    this.reloadDropdownData(this.buildRenderOptions());
  };


  // 选择选项
  Class.prototype.select = function(option) {
    this.context.selectedIds.push(option.id);
    this.reloadDropdownData(this.buildRenderOptions());
  };


  // 重置搜索
  Class.prototype.resetSearch = function() {
    this.context.filteredOptions = null;
    this.context.keyword = '';

    var input = this.getSearchInput();
    
    input && input.val('');
  };

  // 重载
  Class.prototype.reload = function(config) {
    if (config) {
      this.config = $.extend({}, this.config, config || {});
    }

    this.render();
  };

  Class.prototype.buildRenderOptions = function(options) {
    var that = this,
        renderOptions = options || [];

    if (renderOptions.length === 0) {
      if (that.context.filteredOptions !== null) {
        renderOptions = that.context.filteredOptions;
      } else {
        renderOptions = this.getAllOptions();
      }
    }

    return renderOptions.map(function(option) {
      option.selected = that.context.selectedIds.indexOf(option.id) !== -1;

      return option;
    });
  };

  // 过滤选项
  Class.prototype.filterOptions = function(keyword) {
    var that = this,
        keyword = keyword.toLowerCase()
      ;

    return this.getAllOptions().filter(function(item) {
      return -1 !== item.title.toLowerCase().indexOf(keyword);
    });
  };


  // 获取所有选项
  Class.prototype.getAllOptions = function() {
    var that = this;

    return that.context.options.map(function(item) {
      return {
        id: item.id,
        title: item.title,
        selected: that.context.selectedIds.indexOf(item.id) !== -1
      }
    });
  };


  Class.prototype.buildDropdownContent = function(options) {
    return [
        `<div class="multiple-select-search"><input class="layui-input" placeholder="${this.config.keywordPlaceholder}"/></div>`,
        '<ul class="layui-menu layui-dropdown-menu" style="max-height: 300px;overflow-y: auto;">',
        options.length > 0 ? options.map(function(option) {
          return `<li data-value="${option.id}" class="multiple-select-option ${option.selected ? 'multiple-select-option-selected' : ''}">${option.title}</li>`;
        }).join('') : `<div style="padding: 5px;font-size:12px;">${this.config.unfilteredText}</div>`,
        '</ul>',
      ].join('');
  };


  Class.prototype.reloadDropdownData = function(options) {
    if (options && options.length === this.getAllOptions().length) {
      this.resetSearch();
    }

    var renderOptions = this.buildRenderOptions(options);

    this.dropdown.reloadData({
      content: this.buildDropdownContent(renderOptions)
    });

    this.renderSelection();
  };

  Class.prototype.getSearchInput = function() {
    if (!this.panel) {
      return ;
    }

    return this.panel.find('div.multiple-select-search > input');
  };


  Class.prototype.renderDropdown = function() {
    var that = this;

    that.dropdown = dropdown.render({
      elem: that.config.elem,
      style: 'width:' + that.config.elem.outerWidth() + 'px',
      content: that.buildDropdownContent(that.getAllOptions()),
      ready: function(panel, elem) {
        that.panel = panel;

        elem.parent().addClass('multiple-select-panel-opended')

        // 保持滚动条位置
        if (that.context.dropdownMenuScrollTop > 0) {
          panel.find('.layui-dropdown-menu').scrollTop(that.context.dropdownMenuScrollTop);
        }

        var inputCompositionStart = false,
            searchInput = that.getSearchInput();

        function reloadDropdown(keyword) {
          var filterOptions = that.filterOptions(keyword);

          // 当没有符合条件的项且允许创建时
          if (filterOptions.length === 0 && that.config.allowCreate) {
            filterOptions.push({
              [that.config.customName.id]: keyword,
              [that.config.customName.title]: keyword,
            });
          }

          that.context.keyword = keyword;
          that.context.filteredOptions = filterOptions;
          that.reloadDropdownData(that.context.filteredOptions);
        }

        // 搜索框事件
        searchInput.on('input', function() {
          if (inputCompositionStart) {
            return ;
          }

          reloadDropdown($(this).val());
        }).on('compositionstart', function() {
          // compositionstart compositionend是为了支持中文类字母
          inputCompositionStart = true;
        }).on('compositionend', function() {
          inputCompositionStart = false;
          reloadDropdown($(this).val());
        });

        // 每次输入都会重新渲染一次dropdown，所以要记已上次输入
        if (that.context.keyword !== '') {
          searchInput.val(that.context.keyword).focus();
        }

        // 检测dropdown的面版是否已关闭
        var i = setInterval(function() {
          // 是否已展开
          if (!elem.data('layui_dropdown_index_opened')) {
            clearInterval(i);

            that.context.keyword = '';
            that.context.filteredOptions = null;
            that.reloadDropdownData();

            elem.parent().removeClass('multiple-select-panel-opended')
          }
        }, 100);
      },

      click: function(data, elem) {
        // 获取点击项的索引
        var value = elem.data('value'),
            option = that.getOptionById(value)
            ;

        if (!option) {
          if (!that.config.allowCreate) {
            return ;
          }

          option = {
            [that.config.customName.id]: value,
            [that.config.customName.title]: value,
            [that.config.customName.selected]: true,
          }

          that.context.options.push(option);
        }

        // 记录选择面板滚动的位置
        that.context.dropdownMenuScrollTop = elem.parent().scrollTop();

        if (that.context.selectedIds.indexOf(option.id) === -1) {
          that.select(option);
        } else {
          that.remove(option);
        }

        // false不关闭面板
        return false;
      }
    });
  };

  // 根据ID获取选项
  Class.prototype.getOptionById = function(id) {
    return this.getAllOptions().filter(function(option) {
      return option.id == id;
    })[0];
  };


  // 渲染选择
  Class.prototype.renderSelection = function() {
    var that = this,
        inputWrap = that.config.elem.parent(),
        selectedOptions = that.getSelectedOptions(),
        options = selectedOptions.length > 1 && that.config.collapseSelected ? [selectedOptions[0]] : selectedOptions,
        selectionHtml = '',
        selectionTpl = `
          <div class="multiple-select-selection">
            <div class="multiple-select-selection-overflow">
              {{# layui.each(d.options, function(index, option) { }}
                <div class="multiple-select-selection-overflow-item">
                  <span class="multiple-select-selection-item" data-id="{{= option.id }}">
                    <span class="multiple-select-selection-item-content">{{= option.title}}</span>
                    <i class="layui-icon layui-icon-close multiple-select-selection-item-remove"></i>
                  </span>
                </div>
              {{# }) }}
              {{# if (d.collapseSelected && d.total > 1) { }}
                <div class="multiple-select-selection-overflow-item">
                  <span class="multiple-select-selection-item">
                    <span class="multiple-select-selection-item-content">+ {{ d.total }}</span>
                  </span>
                </div>
              {{# } }}
            </div>
          </div>
        `
        ;

    if (selectedOptions.length > 0) {
      selectionHtml = laytpl(selectionTpl).render({
        total: selectedOptions.length,
        options: options,
        collapseSelected: that.config.collapseSelected
      });
    }

    inputWrap.find('.multiple-select-selection').remove();
    selectionHtml !== '' && inputWrap.append(selectionHtml);

    this.config.elem.val(this.context.selectedIds.join(this.context.valueSeparator));
  };

  Class.prototype.getSelectedOptions = function() {
    return this.getAllOptions().filter(function(option) {
      return option.selected;
    });
  };

  //核心入口
  select.render = function(options){
    var inst = new Class(options);
    return thisSelect.call(inst);
  };

  exports('select', select);
});

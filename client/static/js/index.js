$(function(){
  const page = {
    data:{
      type: 'login',
      timer: null,
      baseUrl: 'http://39.107.71.98:9999',
      loginCode: {
        '-1' : '用户不存在！',
        '0' : '用户已经登录！',
        '2' : '密码输入错误！'
      },
      rules: {
        name: [
          {
            ruleExp: function(val){return !val},
            message: '请输入用户名'
          },
          {
            ruleExp: function(val){return val.length > 10},
            message: '请输入小于10位用户名'
          }
        ],
        pwd: [
          {
            ruleExp: function(val){return !val},
            message: '请输入密码'
          },
          {
            ruleExp: function(val){return val.length > 12},
            message: '输入密码长度不能超过12位'
          },
          {
            ruleExp: function(val){return val.length < 4},
            message: '输入密码长度不能少于4位'
          }
        ],
        cfmPwd: [
          {
            ruleExp: function(val,param){return val !== param.pwd},
            message: '两次输入密码不一样'
          }
        ]
      }
    },
    init(){
      this.bindEvent();
    },
    bindEvent(){
      var _self = this;
      // 输入框获取焦点
      $('.label-cnt').on('focus',function() {
        $(this).parent().addClass('focus-label');
      })
      // 输入框失去焦点
      $('.label-cnt').on('blur',function() {
        $(this).parent().removeClass('focus-label');
        !!$(this).val().trim() ? $(this).parent().addClass('value-label') : $(this).parent().removeClass('value-label');
      })
      // 登录、注册tab切换
      $('.todoBtn').on('click',function(){
        var todo = $(this).data('todo');
        _self.data.type = todo;
        _self.initInput();
        if (todo == 'login') {
          !$('.login-content').hasClass('login') && $('.login-content').addClass('login');
        } else {
          $('.login-content').removeClass('login');
        }
      })
      // 立即注册
      $('.registerbtn').on('click',function(){
        $('.login-content').removeClass('login');
        _self.data.type = 'register';
        _self.initInput();
      })
      // 立即登录
      $('.loginbtn').on('click', function () {
        $('.wrap').hasClass('registerSuccess') && $('.wrap').removeClass('registerSuccess')
        $('.login-content').addClass('login');
        _self.data.type = 'login';
        _self.initInput();
      })
      $('#submitBtn').on('click',function(){
        var type = _self.data.type;
        if(type == 'login') {
          _self.loginFn();
          return
        }
        if(type == 'register') {
          _self.registerFn();
          return
        }
      })
    },
    initInput() {
      $('#name').val('');
      $('#pwd').val('');
      $('#cfmPwd').val('');
      $('.wrap label').removeClass('value-label');
    },
    loginFn() {
      var _self = this;
      var _data = this.data.loginCode;
      var rules = this.data.rules;

      var param = {
        name: $('#name').val().trim(),
        pwd: $('#pwd').val().trim()
      }
      // 规则判断
      for(k in param) {
        var rule = rules[k];
        for(var i=0,len=rule.length;i<len;i++){
          if (rule[i].ruleExp(param[k])) {
            _self.errorFn(rule[i].message);
            return
          }
        }
      }

      _self.ajaxFn({
        url: _self.data.baseUrl + '/login',
        type: 'post',
        data: param,
        successFn: function (res) {
          console.log(res);
          res.code == 1 ? _self.doLogin(res.data.name) : _self.errorFn(_data[res.code]);
        }
      })
    },
    doLogin(name){
      $$.setCookie('name',name);
      window.location.href = '/views/chat.html';
    },
    registerFn() {
      var _self = this;
      var rules = this.data.rules;
      var param = {
        name: $('#name').val().trim(),
        pwd: $('#pwd').val().trim(),
        cfmPwd: $('#cfmPwd').val().trim()
      }
      // 规则判断
      for(k in param) {
        var rule = rules[k];
        for(var i=0,len=rule.length;i<len;i++){
          console.log(rule[i].message,rule[i].ruleExp(param[k],param))
          if (rule[i].ruleExp(param[k],param)) {
            _self.errorFn(rule[i].message);
            return
          }
        }
      }
      _self.ajaxFn({
        url: _self.data.baseUrl + '/register',
        type: 'post',
        data: param,
        successFn: function (res) {
          console.log(res);
          /*
            code: 
              1 注册成功
              2 用户名已存在
          */
          if(res.code == 2){
            _self.errorFn('用户名已经存在')
          } else if(res.code == 1){
            $('.wrap').addClass('registerSuccess');
          }
        } 
      })
    },
    errorFn(msg) {
      this.data.timer && clearTimeout(this.data.timer);
      $('.tips').removeClass('hideText').text(msg);
      this.data.timer = setTimeout(() => {
        $('.tips').addClass('hideText');
      }, 2000);
    },
    ajaxFn(obj) {
      $.ajax({
        url: obj.url,
        type: obj.type,
        data: obj.data,
        dataType: "json",
        success: obj.successFn,
        error: function(err){
          console.log(err);
        }
      })
    }
  }
  page.init();
})
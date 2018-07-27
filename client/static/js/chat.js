$(function() {
  var page = {
    data:{
      socketAddress: 'ws://39.107.71.98:3000/',
      baseUrl: 'http://39.107.71.98:9999',
      websocket: null,
      name: '',
      chatWrap: $('.chat-wrap')
    },
    init(){
      this.bindEvent();
      this.getUserName()
    },
    bindEvent(){
      var _self = this;
      $('.userName').on('click', function () {
        $('.user-compute').hasClass('hide') ? $('.user-compute').removeClass('hide') : $('.user-compute').addClass('hide');
      })
      $('.logout').on('click',function(){
        _self.logOut(_self.data.name);
      })
    },
    getUserName(){
      var name = $$.getCookie('name');
      var _self = this;
      if(name){
        _self.data.name = name;
        $('.adminName').text(name);
        _self.initSocket();
      }else{
         window.location.href = '/index.html'
      }
    },
    initArea(){
      var _data = this.data;
      var area = $('#area');
      var websocket = _data.websocket;
      var _self = this;
      area.on('keydown',function(e){
        var ev = e || window.event;
        var cnt = area.val().trim();
        if (ev.keyCode !== 13){return}
        if(!cnt){return}
        var msg = {
          type: 'text',
          content: cnt,
          from: _data.name
        }
        websocket.send(JSON.stringify(msg));
        _self.scrollToBottom();
        area.val(null)
      })
    },
    initSocket(){
      var _self = this;
      var _data = this.data;
      var websocket = new WebSocket(_data.socketAddress);
      _data.websocket = websocket;
      websocket.onopen = function () {
        var join = {
          type: 'join',
          content: _data.name,
          from: _data.name
        }
        websocket.send(JSON.stringify(join));
        _self.initArea();
      }
      websocket.onclose = function () {
        console.log('websocket close');
      }
      websocket.error = function () {
        console.log('websocket error')
      }
      websocket.onmessage = function (e) {
        console.log(e.data);
        var msg = JSON.parse(e.data);
        _self.renderMsg(msg);
      }
    },
    renderMsg(obj){
      var name = this.data.name;
      var _self = this;
      switch (obj.type) {
        case 'text':
          if(obj.from == name){
            _self.renderMine(obj)
          }else{
            _self.renderUser(obj)
          }
          break;
        case 'sys':
        case 'join':
        case 'leave':
          _self.renderSys(obj)
          break;
        case 'time':
          _self.renderTime(obj)
          break;
        case 'count':
          _self.renderCount(obj)
          break;
        default :
          _self.renderSys({
            type: '',
            content: '网络错误',
            from: 'sys'
          })
          break;
      }
    },
    renderMine(obj){
      var chatWrap = this.data.chatWrap;
      chatWrap.append(
        `
        <li class="self-content">
            <p class="name">${obj.from}</p>
            <div class="content-wrap clearFixed">
              <p class="content">
                ${obj.content}
              </p>
            </div>
        </li>
        `
      );
      this.scrollToBottom();
    },
    renderUser(obj){
      var chatWrap = this.data.chatWrap;
      chatWrap.append(
        `
        <li class="user-content">
            <p class="name">${obj.from}</p>
            <div class="content-wrap clearFixed">
              <p class="content">
                ${obj.content}
              </p>
            </div>
        </li>
        `
      )
      this.scrollToBottom();

    },
    renderSys(obj){
      var chatWrap = this.data.chatWrap;
      // obj.type == 'join' && $('.num').text($('.num').text()-0+1);
      // obj.type == 'leave' && $('.num').text($('.num').text()-0-1);
      chatWrap.append(
        `
         <li class="sys-content">${obj.content}</li>
        `
      )
      this.scrollToBottom();

    },
    renderTime(obj){
      var chatWrap = this.data.chatWrap;
      chatWrap.append(
        `
        <li class="time-content">
          <span class="time">
            ${obj.content}
          </span>  
        </li>
        `
      )
      this.scrollToBottom();

    },
    renderCount(obj){
      $('.num').text(obj.content)
    },
    scrollToBottom(){
      // this.data.chatWrap[0].scrollIntoView()
      var h = this.data.chatWrap.height() - $('.chat-main').height() + 32;
      $('.chat-main').scrollTop(h);
    },
    logOut(name){
      var _self = this;
      $.ajax({
        type: 'post',
        url: _self.data.baseUrl + '/logout',
        data: {name},
        dataType: "json",
        success: function(res){
          $$.deletCookie('name');
          // $$.setCookie('name','');
          console.log($$.getCookie('name'));
          window.location.href = '/index.html'
        }
      })
    }
  }
  page.init();
})
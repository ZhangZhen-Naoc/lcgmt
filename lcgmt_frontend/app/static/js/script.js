var flash = null;
$(function () {
    var default_error_message = 'Server error, please try again later.';

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', csrf_token);
            }
        }
    });

    $(document).ajaxError(function (event, request, settings) {
        var message = null;
        if (request.responseJSON && request.responseJSON.hasOwnProperty('message')) {
            message = request.responseJSON.message;
        } else if (request.responseText) {
            var IS_JSON = true;
            try {
                var data = JSON.parse(request.responseText);
            }
            catch (err) {
                IS_JSON = false;
            }
            if (IS_JSON && data !== undefined && data.hasOwnProperty('message')) {
                message = JSON.parse(request.responseText).message;
            } else {
                message = default_error_message;
            }
        } else {
            message = default_error_message;
        }
        toast(message, 'error');
    });

    if (is_authenticated) {
        setInterval(update_notifications_count, 30000);
    }
});

function toast(body, category) {
    clearTimeout(flash);
    var $toast = $('#toast');
    if (category === 'error') {
        $toast.css('background-color', 'red')
    } else {
        $toast.css('background-color', '#333')
    }
    $toast.text(body).fadeIn();
    flash = setTimeout(function () {
        $toast.fadeOut();
    }, 3000);
}

function update_notifications_count() {
    var $el = $('#notification-badge');
    $.ajax({
        type: 'GET',
        url: $el.data('href'),
        success: function (data) {
            if (data.count === 0) {
                $('#notification-badge').hide();
            } else {
                $el.show();
                $el.text(data.count)
            }
        }
    });
}

function visit_url_and_refresh_current_page(href){
    $.ajax({
        type: 'GET',
        url: href,
        success: function (data) {
            window.location.reload();
        }
    });
}

function is_email(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function is_cn_name(name) {
    var pattern = /^[\u4E00-\u9FA5]{2,12}$/;
    return pattern.test(name);
}

function is_eng_name(name){
    var pattern = /^[a-zA-Z\s]+$/;
    return pattern.test(name);
}

// 验证身份证
function is_card_No(card) {
    var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return pattern.test(card);
}

// 验证手机号
function is_phone_No(phone) {
    var pattern = /^1[34578]\d{9}$/;
    return pattern.test(phone);
}
// 验证固话号
function is_tele_No(phone) {
    var pattern = /^((0\d{2,3})-?)(\d{7,8})(-(\d{3,}))?$/;
    return pattern.test(phone);
}
//国际电话
function is_worldtele_No(phone) {
    var pattern = /^(?:\(?[0\+]?\d{1,3}\)?)[\s-]?(?:0|\d{1,4})[\s-]?(?:(?:13\d{9})|(?:\d{7,8}))$/;
    return pattern.test(phone);
}

function check_empty(id){
    var val = $('#'+id).val();
    if(val.trim()=='') return [false, 'Cannot be empty.'];
    return [true, ''];
}

function check_phone(id){
    var val = $('#'+id).val();
    if(is_phone_No(val) || is_tele_No(val) || is_worldtele_No(val)) return [true, ''];
    return [false, 'Phone format error.'];
}

function check_name(id){
    var name=$('#'+id).val().trim();
    if(name=='') return [false, 'Cannot be empty.'];
    if(is_cn_name(name)||is_eng_name(name)){
        return [true, ''];
    }
    return [false, 'Please input chinese or english name.'];
}
function check_email_valid(id){
    var val = $('#'+id).val();
    if(!is_email(val)){
        return [false, 'Email format invalid.'];
    }
    return [true, ''];
}
function check_email(id){
    var val = $('#'+id).val();
    if(!is_email(val)){
        return [false, 'Email format invalid.'];
    }
    var res = $.ajax({
        type: "GET",
        url: '/user/email-exists',
        data:{'email':val},
        async: false,
        dataType:"json"});
    var json = $.parseJSON(res.responseText);//{'email':email, 'exists':'true'}
    if('true'==json.exists){
        return [false, 'The email is already in use.'];
    }
    return [true, ''];
}

function vals_equal(contents){
    var i = contents.length;
    i-=1;
    while(i>0){
        if(contents[i]!=contents[i-1]) return false;
        i--;
    }
    return true;
}

function check_passwords(ids){
    var pw0=$('#'+ids[0]).val();
    var pw1=$('#'+ids[1]).val();
    if(!vals_equal([pw0,pw1])){
        return [false, 'Passwords not equal!'];
    }
    return [true, ''];
}

function elem_exists(elem){
    return elem.length>0;
}

function check_pass_level(id){
    $('#'+id).keyup(function(e) {
        var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
        var enoughRegex = new RegExp("(?=.{6,}).*", "g");
        if (false == enoughRegex.test($(this).val())) {
            $('#passstrength_'+id).attr('class', 'text-warning');
            $('#passstrength_'+id).html('More Characters');
        } else if (strongRegex.test($(this).val())) {
            $('#passstrength_'+id).attr('class', 'text-success');
            $('#passstrength_'+id).html('Strong!');
        } else if (mediumRegex.test($(this).val())) {
            $('#passstrength_'+id).attr('class', 'text-warning');
            $('#passstrength_'+id).html('Medium!');
        } else {
            $('#passstrength_'+id).attr('class', 'text-danger');
            $('#passstrength_'+id).html('Weak!');
        }
        return true;
    });
}

function check_elem_on(event, objid, func, func_args){
    $('#'+objid).bind(event, function(e) {
        var obj = $(e.delegateTarget);
        var id = obj.attr('id');
        if(!elem_exists($('#'+id+'_error'))){
            obj.after($('<div id="'+id+'_error" class="invalid-feedback d-block"></div>'));
        }
        var err_elem = $('#'+id+'_error');
        var re = func(func_args);
        err_elem.html(re[1]);
        return re[0];
    });
}
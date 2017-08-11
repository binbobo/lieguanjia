/**
 * Created by William on 16/5/5.
 * 注意:要被check的元素,class必须是form-control
 */

function removeErrorTip($inputElem) {
    if ($inputElem.data('error-msg')) {
        $inputElem.tooltip('destroy');
    }
    $inputElem.removeClass('checker-tipped');
    $inputElem.data('error-msg', '');
}

function addErrorTip($inputElem, errMsg) {
    $inputElem.addClass('checker-tipped');
    $inputElem.data('error-msg', errMsg);
    $inputElem.tooltip({
            items: '*',
            position: {
                my: "center bottom-10",
                at: "center top"
            },
            tooltipClass: 'top error-hint',
            content: function () {
                if ($inputElem.hasClass("checker-activated") || $inputElem.parents(".checker-activated").length) {
                    return $inputElem.data('error-msg');
                }
                return "";
            }
        }
    ).tooltip("option", "show", {duration: 0}).tooltip("option", "hide", {duration: 0}).mouseleave(function () { // on mouse leave
        if ($inputElem.is(':focus')) { // if input is focused
            setTimeout(function () {
                $inputElem.tooltip('open');
            }, 0);
        }
    }).focusout(function () { // on focus out
        $inputElem.tooltip('close'); // close the tooltip
    });

}

function activateError(elem) {
    $(elem).removeClass("checker-touched");
    $(elem).addClass("checker-activated");
}

function getCheckers(_this) {
    var checkers = $(_this).attr('checkers');
    if (checkers) {
        return checkers.split(',');
    }
    return [];
}

function doCheck(elem) {

    var msg = "";
    var checkers = getCheckers(elem);
    var max = elem.attr('max-length');
    var val = elem.val();
    var name = elem.prop("tagName");
    var require = _.indexOf(checkers, 'require') >= 0;
    $(checkers).each(function (k, v) {
        var checker = defaultCheckers[v];
        if ($.isFunction(checker)) {
            if ((require && name == 'INPUT' || name == 'TEXTAREA') || val.length > 0) {
                msg = checker(val);
                if (msg) {
                    return false;
                }
            }
        }
    });

    if (!msg) {
        msg = elem.attr('custom-checker');
    }


    if (msg == "" && max) {
        msg = val.length > max ? "内容长度不能超过" + max : "";
    }
    var valid = (!msg || msg == "");
    if (valid) {
        removeErrorTip(elem);
    } else {
        activateError(elem);
        addErrorTip(elem, msg)
    }
    return valid;
}
var regexPattens = {
    password: /^(?=.*\d)(?=.*\D)\S{6,16}$/,
    email: /^[a-z0-9]+([._-]*[a-z0-9]+)*@([a-z0-9\-_]+([._\-][a-z0-9]+))+$/i,
    phone: /^1\d{10}$/,
    number: /^\d+$/,
    year: /^[1-9]\d{3}$/,
    float: /^[0-9]+([.]?[0-9]+)?$/,
    posAndNagfloat: /^[0-9\-]+([.]?[0-9]+)?$/,
    url: /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w:]*))?)$/,
};

var defaultCheckers = {
    require: function (val) {
        if (val)
            return val.trim() == "" ? "内容不能为空" : "";
        else
            return "内容不能为空";
    },
    password: function (val) {
        return regexPattens.password.test(val) ? "" : "密码格式有误";
    },
    email: function (val) {
        return regexPattens.email.test(val) ? "" : "不是合法的邮箱格式";
    },
    number: function (val) {
        return regexPattens.number.test(val) ? "" : "请输入整数";
    },
    phone: function (val) {
        return regexPattens.phone.test(val) ? "" : "不是合法的手机号码";
    },
    year: function (val) {
        return regexPattens.year.test(val) ? "" : "不是合法的年份";
    },
    float: function (val) {
        return regexPattens.float.test(val) ? "" : "不是合法的数字";
    },
    allFloat: function (val) {
        return regexPattens.posAndNagfloat.test(val) ? "" : "不是合法的数字";
    },
    url: function (val) {
        return regexPattens.url.test(val) ? "" : '不是合法的URL';
    }
};

$("body").on('blur', '[need-check]', function () {
    doCheck($(this));
});

var _export = {
    checkForm: function (form) {
        var $form = $(form);
        var result = true;
        $(form).find('[need-check]').each(function (k, v) {
            var r = doCheck($(v));
            result = result && r;
        });
        var $firstError = $form.find(".checker-tipped").filter(":first");
        if ($firstError.length) {
            $firstError.tooltip("open");
            if (!$(form).closest('.modal').length) {
                $('html, body').animate({
                    scrollTop: $firstError.offset().top - 100
                }, 500);
            }
            return false;
        }
        return true;
    },
    resetForm: function (form) {
        var $form = $(form);
        $form.removeClass("checker-activated");
        $form.find('.checker-activated').removeClass('checker-activated');
        $form.find(".checker-tipped").tooltip("close");
    }
};
$.formChecker = _export;
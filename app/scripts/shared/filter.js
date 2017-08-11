"use strict";
angular.module('tiger.filter', []).filter('reminderType', function () {
    return function (input) {

    }
}).filter('nl2br', function () {
    return function (input) {
        if (typeof input == "string") {
            return input.replace(/\n/g, '<br>');
        } else {
            return input;
        }
    };
}).filter('firstItem', function () {
    return function (arr) {
        if (arr && arr.length) {
            return arr[0];
        }
        return null;
    };
}).filter('inArray', function () {
    return function (input, arr) {
        return (arr.indexOf(input) != -1)
    }
}).filter('i18n', function () {
    return function (input) {
        if (!input) {
            return null;
        }

        if (typeof input == 'string') {
            return input;
        }

        if (input.i18n && input.i18n.zh) {
            return input.i18n.zh;
        }

        if (input.title) {
            return input.title;
        }

        if (input.length) {
            return ($.map(input, function (item) {
                if (item.i18n && item.i18n.zh) {
                    return item.i18n.zh;
                }
                return item.title;
            })).join(', ');
        }

        return null;
    };
}).filter('tigerDate', function ($filter) {
    return function (data) {
        var dateFilterFunc = $filter('date');

        if (!data) return null;
        return dateFilterFunc(data * 1000, 'yyyy-MM-dd');
    };
}).filter('tigerDatetime', function ($filter) {
    var dateFilterFunc = $filter('date');

    return function (data, noSecond) {
        if (!data) return null;

        if (noSecond) {
            return dateFilterFunc(data * 1000, 'yyyy-MM-dd HH:mm');
        }
        return dateFilterFunc(data * 1000, 'yyyy-MM-dd HH:mm:ss');
    };
}).filter('tigerDateRecent', function ($filter) {
    var dateFilterFunc = $filter('date');

    return function (timeStamp) {
        var timeNow = Math.floor(new Date().getTime() / 1000);
        var timeDiff = timeNow - timeStamp;

        if (timeDiff < 10) {
            return '几秒前'
        }
        if (timeDiff < 60) {
            return timeDiff + '秒前';
        }
        if (timeDiff < 3600) {
            return Math.floor(timeDiff / 60) + '分钟前';
        }
        if (timeDiff < 86400) {
            return Math.floor(timeDiff / 3600) + '小时前';
        }
        if (timeDiff < 86400 * 7) {
            return Math.floor(timeDiff / 86400) + '天前';
        }

        return dateFilterFunc(timeStamp * 1000, 'yyyy-MM-dd');
    }
}).filter('tigerDays', function () {
    return function (timeStamp) {
        if (!timeStamp) {
            return null;
        }

        var startTime = new Date(timeStamp * 1000);
        startTime.setHours(0, 0, 0, 0);
        var nowTime = new Date();
        nowTime.setHours(0, 0, 0, 0);

        var days = (nowTime - startTime) / 86400000;

        if (days < 0) {
            return null;
        }

        return days + '天';
    };
}).filter('tigerMoney', function ($filter, customFormHelper) {
    var map = {
        1: '',
        1000: '千',
        10000: '万'
    };

    return function (value, notEmpty) {
        if (!value) {
            return notEmpty ? '0元' : null;
        }
        var unit = customFormHelper.moneyValue2Unit(value);
        var newValue = value / unit;
        return '' + $filter('number')(newValue, 2) + map[unit] + '元';
    };

// }).filter('tigerMoneyNotEmpty', function ($filter) {
//     var tigerMoney = $filter('tigerMoney');
//     return function (value) {
//         var result = tigerMoney(value);
//         if (!result) {
//             result = '0元';
//         }
//         return result;
//     };
}).filter('fileSize', function () {
    return function (size) {
        if (isNaN(size))
            size = 0;

        if (size < 1024) {
            return size + ' Bytes';
        }

        size /= 1024;
        if (size < 1024) {
            return size.toFixed(2) + ' KB';
        }

        size /= 1024;
        if (size < 1024) {
            return size.toFixed(2) + ' MB';
        }

        size /= 1024;
        if (size < 1024) {
            return size.toFixed(2) + ' GB';
        }

        size /= 1024;
        return size.toFixed(2) + ' TB';
    }
}).filter('age', function () {
    return function (timeStamp) {
        if (isNaN(timeStamp))
            timeStamp = 0;

        return Math.floor((new Date().getTime() / 1000 - timeStamp) / 365 / 86400);
    }
}).filter('trustAsHtml', function ($sce) {
    return function (value) {
        return $sce.trustAsHtml(value);
    };
}).filter('countFormError', function () {
    return function (errObj) {
        if (errObj.$error) {
            errObj = errObj.$error;
        }

        var count = 0;
        angular.forEach(errObj, function (item) {
            if (item && item.length) {
                count += item.length;
            }
        });
        return count;
    };
}).filter('arrayToStr', function () {
    return function (items) {
        if (!items) {
            return "";
        }
        return items.join(",");
    }
}).filter('fieldNull', function () {
    return function (items) {
        if (!items) {
            return "<未填写>";
        }
        return items;
    }
});

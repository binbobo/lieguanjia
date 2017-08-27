window.nb = {};
/**
 * @param validGap 两次事件被累积的最大间隔秒
 * @param reportGap  上报累积结果的间隔
 * @param reporter 上报函数
 * @param pathProvider
 * @param unloadSaver 关闭窗口时的保存器
 * 上报结果: { location.href : seconds }
 */
window.nb = {
    config: {
        validGap: 5000,
        reportGap: 15000,
        pathProvider: function () {
            return location.href;
        }
    },
    store: {},
    recordTime: function (ts) {
        var key = this.config.pathProvider();
        if (key === null) {
            return;
        }
        if (!(key in this.store)) {
            this.store[key] = {
                p: ts,
                t: 0
            };
            return;
        }
        var record = this.store[key];
        var gap = ts - record.p;
        record.p = ts;
        if (gap < this.config.validGap) {
            record.t += gap;
        }
    },
    startTimeIt: function (validGap, reportGap, reporter, pathProvider, unloadSaver) {
        var that = this;

        this.config.validGap = validGap * 1000;
        this.config.reportGap = reportGap * 1000;
        this.config.pathProvider = pathProvider;

        if (unloadSaver === undefined) {
            unloadSaver = {
                pop: function () {
                    /**
                     * 返回并清空之前未发送的内容
                     */
                },
                push: function (r) {
                    /**
                     * 记录未发出的内容
                     */
                }
            };
        }
        // reporter(unloadSaver.pop());

        $(window).on('click.nb keydown.nb scroll.nb resize.nb mousemove.nb', function (event) {
            that.recordTime(new Date().getTime());
        });

        setInterval(function () {
            var report = {};
            var needClear = [];

            $.map(that.store, function (timeRecord, path) {
                if (timeRecord.t > 500) {
                    report[path] = Math.round(timeRecord.t / 1000);
                }
                if (timeRecord.p < new Date().getTime() - that.config.validGap * 2) {
                    needClear.push(path);
                }
                timeRecord.t = 0;
            });

            if (Object.keys(report).length > 0) {
                reporter(report);
            }

            $.map(needClear, function (key) {
                delete that.store[key];
            });

        }, this.config.reportGap);
    }
};

angular.module('tiger.api.attachment', []).service('attachmentService', function (apiService) {
    this.getAttachmentList = function (type, rid) {
        return apiService.get('/api/attachment/list', {
            type: type,
            rid: rid
        })
    };

    this.getAttachmentListWithSubtype = function (type, rid) {
        return this.getAttachmentList(type, rid).then(function (data) {
            var result = null;
            var noSubtype = null;
            angular.forEach(data, function (item) {
                if (!item.subTypeItem) {
                    if (!noSubtype) {
                        noSubtype = [];
                    }
                    noSubtype.push(item);
                    return;
                }

                if (!result) {
                    result = {};
                }

                if (!result[item.subTypeItem.value]) {
                    result[item.subTypeItem.value] = {
                        info: item.subTypeItem,
                        list: []
                    };
                }

                result[item.subTypeItem.value].list.push(item);
            });

            if (!result && !noSubtype) {
                return [];
            }
            if (!result) {
                return [{
                    list: noSubtype
                }];
            }

            if (noSubtype) {
                result[-1] = {
                    info: {
                        value: -1,
                        title: '其他',
                        i18n: {
                            en: 'Other',
                            zh: '其他'
                        }
                    },
                    list: noSubtype
                };
            }

            return result;
        });
    };

    this.updateAttachmentList = function (type, rid, fileList) {
        return apiService.post('/api/attachment/relation', {
            type: type,
            rid: rid,
            fileList: fileList
        })
    };
});

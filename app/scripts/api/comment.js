"use strict";
angular.module('tiger.api.comment', ['tiger.api.base']).service('commentService', function (apiService) {

    this.get = function (id) {
        return apiService.get('/api/comment', {id: id});
    };

    this.list = function (relationId, moduleId) {
        var param = {
            relationId: relationId,
            moduleId: moduleId
        };
        return apiService.get('/api/comment/list', param);
    };

    this.update = function (comment, feedback) {

        comment.type = comment.typeItem.id;

        if (comment.subtypeItem) {
            comment.subtype = comment.subtypeItem.id;
        }
        return apiService.post('/api/comment/update', comment, feedback == undefined ? true : feedback);
    };

    this.delete = function (id, feedback) {
        return apiService.post('/api/comment/delete', {id: id}, feedback == undefined ? true : feedback);
    };

});

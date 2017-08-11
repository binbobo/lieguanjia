"use strict";
angular.module('tiger.api.search', ['tiger.api.base']).service('searchService', function (apiService) {
    this.search = function (index, query, source) {
        return this.searchWithIndex(index, query, source).then(function (data) {
            return data[index];
        });

    };

    this.searchWithIndex = function (index, query, source) {
        return apiService.post('/api/search', {
            index: index,
            search: query,
            source: source
        });
    };

    this.count = function (index, query, source) {
        return apiService.post('/api/search/count', {
            index: index,
            search: query,
            source: source
        });
    };

    this.updateSearchParam = function (moduleId, id, title, json) {
        return apiService.post('/api/search/param/update', {
            module: moduleId,
            id: id,
            title: title,
            json: JSON.stringify(json),
        });
    };

    this.deleteSearchParam = function (id) {
        return apiService.post('/api/search/param/delete', {
            id: id
        })
    };

    var searchParamCache = {};

    this.listSearchParam = function (moduleId) {
        searchParamCache[moduleId] = apiService.get('/api/search/param/list', {
            module: moduleId
        });
        return searchParamCache[moduleId];
    };

    this.listSearchParamByCache = function (moduleId) {
        if (searchParamCache[moduleId]) {
            return searchParamCache[moduleId];
        }

        return this.listSearchParam(moduleId);
    };

    this.quickSearch = function (query) {
        return apiService.get('/api/search/quick', {query: query});
    };

});

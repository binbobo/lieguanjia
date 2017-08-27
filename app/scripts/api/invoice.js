/**
 * Created by liudi on 16/5/5.
 */
'use strict';
angular.module('tiger.api.invoice', ['tiger.api.base']).service('invoiceService', function (apiService) {

    this.updateInvoice = function (invoice, id, feedback) {
        return apiService.post('/api/project/invoice/update', {invoice: invoice, id: id},
            feedback == undefined ? true : feedback);
    };

    this.getInvoice = function (invoiceId) {
        return apiService.get('/api/project/invoice/detail', {id: invoiceId});
    };

    this.deleteInvoice = function (invoiceId, feedback) {
        return apiService.post('/api/project/invoice/delete', {id: invoiceId}, feedback == undefined ? true : feedback);
    };

    this.batchDelete = function (batchParam, feedback) {
        return apiService.post('/api/project/invoice/batchDelete', batchParam, feedback == undefined ? true : feedback);
    };

});

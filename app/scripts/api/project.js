/**
 * Created by haozhenghua on 16/4/6.
 */
'use strict';
angular.module('tiger.api.project', ['tiger.api.base']).service('projectService', function (apiService) {
    this.updateProject = function (project, feedback) {
        return apiService.post('/api/project/update', project, feedback == undefined ? true : feedback)
    };

    this.getProject = function (projectId) {
        return apiService.get('/api/project/detail', {
            id: projectId
        })
    };

    this.changeProjectStatus = function (projectId, status) {
        return apiService.post('/api/project/changeStatus', {
            id: projectId,
            status: status,
        });
    };

    this.updateProjectMembers = function (projectId, projectMembers) {
        return apiService.post('/api/project/member/update', {
            project_id: projectId,
            list: projectMembers,
        });
    };

    this.listProjectAchievements = function (projectId, resumeId) {
        return apiService.get('/api/project/achievement/list', {
            project_id: projectId,
            resume_id: resumeId
        });
    };

    this.listProjectMembers = function (projectId) {
        return apiService.get('/api/project/member/list', {
            project_id: projectId
        });
    };

    this.getPipelineCount = function (searchParam) {
        searchParam = !!searchParam ? searchParam : {"query": {"bool": {"must": []}}};
        return apiService.post('/api/project/resume/pipelineCount', {
            searchParam: searchParam
        })
    };

    this.listProjectMemberRevenues = function (projectId) {
        return apiService.get('/api/project/achievement/member/list', {
            project_id: projectId
        });
    };

    this.getUpdateLogs = function (projectId) {
        return apiService.getFieldUpdateList(2, projectId);
    };
    this.listProjects = function (companyId) {
        return apiService.get('/api/project/list', {
            company_id: companyId
        })
    };

    this.getProjectCandidateDetail = function (projectId, candidateId) {
        return apiService.get('/api/project/resume/detail', {
            project_id: projectId,
            resume_id: candidateId
        });
    };

    this.listProjectCandidate = function (projectId, query, sort, page, length) {
        query = query || {};
        query.bool = query.bool || {};
        query.bool.must = query.bool.must || [];

        query.bool.must.push({
            term: {
                projectId: projectId
            }
        });

        return apiService.post('/api/search', {
            index: 'project_resume',
            search: {
                from: (page - 1) * length,
                size: length,
                query: query,
                sort: sort,
            },
            source: 'project'
        }).then(function (data) {
            return data.project_resume;
        });
    };

    this.operation = function (projectId, resumeId, status, data, extra, operationId, feedback) {
        return apiService.post('/api/project/resume/operate', {
            project_id: projectId,
            resume_id: resumeId,
            id: operationId,
            status: status,
            data: data,
            extra: extra,
        }, feedback == undefined ? true : feedback);
    };

    this.remove = function (projectId, resumeId) {
        return apiService.post('/api/project/resume/remove', {
            projectId: projectId,
            resumeId: resumeId
        })
    };

    this.listJoinedProject = function (resumeId) {
        return apiService.get('/api/project/resume/projectJoined', {
            resumeId: resumeId
        });
    };

    this.listJoinedProjectWithCompany = function (resumeId) {
        return apiService.get('/api/project/resume/projectWithCompanyJoined', {
            resumeId: resumeId
        });
    };


    this.listCanJoinProject = function (resumeId, key) {
        return apiService.get('/api/project/resume/projectCanJoin', {
            resumeId: resumeId,
            key: key
        });
    };

    this.updateAchievement = function (achievement, feedback) {
        return apiService.post('/api/project/achievement/update', achievement
            , feedback == undefined ? true : feedback);
    };

    this.getAchievementById = function (achievementId) {
        return apiService.get('/api/project/achievement/detail', {
            id: achievementId
        });
    };

    this.getAchievement = function (projectId, resumeId) {
        return apiService.get('/api/project/achievement', {
            project_id: projectId,
            resume_id: resumeId
        });
    };

    this.deleteProject = function (projectId, feedback) {
        return apiService.post('/api/project/delete', {id: projectId},
            feedback == undefined ? true : feedback).then(function (data) {
            if (data == 0) {
                uiModalService.alert('删除失败');
            }
        }, function (data) {
            uiModalService.alert('删除失败');
        });
    };

    this.batchDelete = function (batchParam, feedback) {
        return apiService.post('/api/project/batchDelete', batchParam, feedback == undefined ? true : feedback);
    };

    this.batchOperation = function (projectId, batchParam, status, data, extra) {
        var param = {
            projectId: projectId,
            status: status,
            data: data,
            extra: extra,
        };
        if (batchParam.ids) {
            param.resumeIds = batchParam.ids;
        } else {
            param.searchParam = batchParam.searchParam;
        }
        return apiService.post('/api/project/resume/batchOperate', param);
    };

    this.updateField = function (item, name, id, value, projectId) {
        return apiService.post('/api/project/update/item', {
            moduleItem: item,
            name: name,
            id: id,
            newValue: value,
            indexId: projectId
        });
    };

    this.updatePipelineField = function (item, name, id, value, indexId) {
        return apiService.post('/api/project/resume/update/item', {
            moduleItem: item,
            name: name,
            id: id,
            newValue: value,
            indexId: indexId
        });
    };

    this.listMatchedCandidate = function (projectId, page, length) {
        return apiService.post('/api/search/matchedCandidate', {
            projectId: projectId,
            from: (page - 1) * length,
            size: length
        }).then(function (data) {
            return data.resume;
        });
    };

    this.getCustomerInfo = function (projectId) {
        return apiService.get('/api/project/getCustomerInfo', {projectId: projectId});
    }

    this.countMatchedCandidate = function (projectId) {
        return apiService.get('/api/project/matchedCandidate/count', {
            projectId: projectId
        });
    }

});

angular.module('tiger.ui.achievement_modal', []).service('achievementModal', [
    '$uibModal',
    function ($uibModal) {

        this.openAchievement = function (projectId, resumeId, achievementId, readOnly) {
            return $uibModal.open({
                animation: true,
                templateUrl: 'views/project/modal/achievement.html',
                controller: "achievementEditCtrl",
                resolve: {
                    achievementInfo: function () {
                        if (achievementId > 0) {
                            return {projectId: projectId, resumeId: resumeId, id: achievementId, readOnly: readOnly};
                        } else {
                            return {projectId: projectId, resumeId: resumeId};
                        }
                    }
                }
            }).result;
        };
        this.openAchievementWarn = function (projectId, resumeId, achievementList) {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/project/modal/achievement_warn.html',
                controller: "achievementWarnCtrl",
                resolve: {
                    achievementInfo: function () {
                        //return {projectId: projectId, resumeId: resumeId, achievementId: achievementId};
                        return {projectId: projectId, resumeId: resumeId, list: achievementList};
                        //return {projectId: projectId, resumeId: resumeId};
                    }
                }
            });
        };
    }
]);

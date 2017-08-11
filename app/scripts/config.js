"use strict";
angular.module('tiger.config', []).constant('config', {
    localStoragePrefix: 'tigerStore',
    moduleMap: {
        candidate: 1,
        project: 2,
        company: 3,
        resume_comment: 4,
        project_comment: 5,
        company_comment: 6,
        project_resume_comment: 7,
        contract: 8,
        invoice: 9,
        project_resume: 10,
        channel_job: 11,
        document: 12,
        email: 16
    },
    fileMime2Icon: {
        'application/msword': 'word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
        'application/vnd.ms-excel': 'excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
        'application/vnd.ms-powerpoint': 'powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'powerpoint',
        'message/rfc822': 'html',
        'text/html': 'html',
        'application/pdf': 'pdf',
        'image/gif': 'image',
        'image/jpeg': 'image',
        'image/png': 'image',
        'text/plain': 'html',
        'application/rtf': 'word'
    },
    fileMime2Preview: {
        'application/msword': 'iframe',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'iframe',
        'application/vnd.ms-excel': 'iframe',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'iframe',
        'application/vnd.ms-powerpoint': 'iframe',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'iframe',
        'message/rfc822': 'iframe',
        'application/pdf': 'pdf',
        'text/html': 'iframe',
        'image/gif': 'image',
        'image/jpeg': 'image',
        'image/png': 'image',
        'text/plain': 'iframe',
        'application/rtf': 'iframe'
    },
    reminder_type: {
        0: '默认',
        1: '客户面试',
        2: '入职',
        3: '试用期结束',
        4: '预计到款'
    },
    salaryType: {
        1: "基本薪资",
        2: "奖金",
        3: "补贴"
    },
    hint: {
        formError: '内容错误，请检查后保存'
    },
    search: {
        maxLength: 50000
    },
    pipelineStatus: {
        reject: -1,
        join: 1,
        recommend: 2,
        interview: 3,
        offer: 4,
        entry: 5,
    },
    projectStatus: {
        progressing: 0,
        success: 1,
        suspended: 2,
        cancel: 3,
        failed: 4,
    },
    presetStatus: {
        notPreset: 0,
        presetting: 1,
        hasPreset: 2,
        deleted: 3,
        deleting: 4,
        none: -1
    },

    moduleAttachmentMap: {
        1: 31,
        2: 34,
        3: 35,
    },

    taskForm: [
        {
            name: 'title',
            dataType: 'text',
            title: '标题',
            required: true
        }, {
            name: "remark",
            dataType: "textarea",
            title: "备注"
        }, {
            name: 'datetimeRange',
            required: true,
            dataType: 'datetimerange',
            title: "日期"
        }, {
            name: "advanceTime",
            dataType: "number",
            required: true,
            title: "提前提醒",
            minLength: 0,
            defaultValue: 10
        }, {
            name: "advanceTimeType",
            dataType: "radio",
            title: "",
            defaultValue: {
                id: 1,
                value: 1
            },
            itemList: [
                {
                    id: 1,
                    value: 1,
                    title: "分钟"
                }, {
                    id: 2,
                    value: 2,
                    title: "小时"
                }, {
                    id: 3,
                    value: 3,
                    title: "天"
                }
            ]
        }, {
            name: 'participants',
            dataType: "multiselect",
            title: "提醒人",
            required: true,
            listType: 2001
        }
    ],
    recReportForm: [
        //{
        //    name: 'participants',
        //    required: true,
        //    dataType: "select",
        //    title: "用户",
        //    listType: 800,
        //    i18n: {
        //        zh: "用户",
        //        en: "User",
        //    },
        //}, {
        //    name: 'resumeType',
        //    dataType: 'select',
        //    title: "简历类型",
        //    itemList: [
        //        {
        //            id: 0,
        //            title: "默认",
        //        }
        //    ],
        //    i18n: {
        //        zh: "简历类型",
        //        en: "Resume Type",
        //    },
        //},
        {
            name: "project",
            dataType: "select",
            title: "项目",
            listType: 801,
            i18n: {
                zh: "项目",
                en: "Project"
            },
            attributeData: "{\"dynamicList\": 1}"
        }, {
            name: "template",
            dataType: "select",
            required: true,
            title: "模板",
            listType: 802,
            i18n: {
                zh: "模板",
                en: "Template",
            },
        },
    ],

    projectModal: {
        interviewForm: [
            {
                name: "interviewTime",
                dataType: 'datetime',
                title: '面试时间',
                required: 1
            }, {
                name: "interviewer",
                dataType: 'text',
                title: '面试官'
            }, {
                name: "place",
                dataType: 'textarea',
                title: '面试地点'
            }
        ]
    },
    settingNav: {
        form: {
            1: {
                title: 'Candidate',
                name: '1',
                i18n: {
                    zh: '简历',
                    en: 'Candidate'
                },
                subType: [
                    {
                        title: '候选人',
                        name: 11
                    },
                    {
                        title: '联系人',
                        name: 12
                    },
                    {
                        title: 'Cold Call',
                        name: 13
                    }
                ],
                subForm: [
                    {
                        title: 'Basic Info',
                        name: 'basicInfo',
                        i18n: {
                            zh: '基本信息',
                            en: 'BaiscInfo'
                        }
                    }, {
                        title: 'Occupation',
                        name: 'occupationList',
                        i18n: {
                            zh: '工作经历',
                            en: 'Occupation'
                        }
                    }, {
                        title: 'Education',
                        name: 'educationList',
                        i18n: {
                            zh: '教育经历',
                            en: 'Education'
                        }
                    }, {
                        title: 'Project',
                        name: 'projectList',
                        i18n: {
                            zh: '项目经历',
                            en: 'Project'
                        }
                    },
                ],
            },
            2: {
                title: 'Project',
                name: 2,
                i18n: {
                    zh: '项目',
                    en: 'Project',
                },
                type: null,
                subType: [
                    {
                        title: 'default',
                        i18n: {
                            zh: '默认',
                            en: 'default',
                        },
                        name: 21,
                    }
                ],
                subForm: [
                    {
                        title: 'Basic Info',
                        i18n: {
                            zh: '基本信息'
                        },
                        name: 'basicInfo',
                    }
                ],
            },
            3: {
                title: 'Company',
                name: 3,
                i18n: {
                    zh: '公司',
                    en: 'Company',
                },
                type: 31,
                subType: [
                    {
                        title: 'default',
                        i18n: {
                            zh: '默认',
                            en: 'default',
                        },
                        name: 31,
                    }
                ],
                subForm: [
                    {
                        title: 'Basic Info',
                        i18n: {
                            zh: '基本信息'
                        },
                        name: 'basicInfo',
                    }
                ],
            },
            9: {
                title: 'Invoice',
                name: 9,
                i18n: {
                    zh: '发票',
                    en: 'Company',
                },
                // type: 31,
                subType: [
                    {
                        title: '客户信息',
                        fieldGroup: "customerInfo",
                        name: 90
                    },
                    {
                        title: '内部信息',
                        fieldGroup: "internalInfo",
                        name: 90
                    },
                    {
                        title: '发票寄出',
                        fieldGroup: "sendInfo",
                        name: 90
                    },
                    {
                        title: '发票到款',
                        fieldGroup: "paymentInfo",
                        name: 90
                    },
                    {
                        title: '作废',
                        fieldGroup: "cancelInfo",
                        name: 90
                    }
                ],
                subForm: [
                    {
                        title: 'Invoice',
                        i18n: {
                            zh: '发票'
                        },
                        name: 'invoice',
                    }
                ],
            }
        },
        generalItem: {
            1: {
                title: 'Candidate',
                name: '1',
                i18n: {
                    zh: '简历',
                    en: 'Candidate'
                },
                subItem: [
                    {
                        title: 'Candidate Status',
                        name: 'candidateStatus',
                        i18n: {
                            zh: '人选状态',
                            en: 'Candidate Status'
                        },
                        listType: 301,
                        fieldItem: 0,
                    },
                    {
                        title: 'Language Level',
                        name: 'languageLevel',
                        i18n: {
                            zh: '外语等级',
                            en: 'Language Level'
                        },
                        listType: 0,
                        fieldItem: 13,
                    },
                    {
                        title: 'Degree',
                        name: 'degree',
                        i18n: {
                            zh: '学历',
                            en: 'Degree'
                        },
                        listType: 0,
                        fieldItem: 35,
                    },
                    {
                        title: 'Attachment Type',
                        name: 'attachmentType',
                        i18n: {
                            zh: '附件类型',
                            en: 'Degree'
                        },
                        listType: 600,
                        fieldItem: 0,
                    },
                ],
            },
            2: {
                title: 'Project',
                name: '2',
                i18n: {
                    zh: '项目',
                    en: 'Project'
                },
                subItem: [
                    {
                        title: 'Member Type',
                        name: 'memberType',
                        i18n: {
                            zh: '项目成员类型',
                            en: 'Member Type'
                        },
                        listType: 401,
                        fieldItem: 0,
                    },
                    {
                        title: 'Payment Type',
                        name: 'paymentType',
                        i18n: {
                            zh: '收费类型',
                            en: 'Payment Type'
                        },
                        listType: 408,
                        fieldItem: 0,
                    },
                ],
            },
            9: {
                title: 'Invoice',
                name: '9',
                i18n: {
                    zh: '发票',
                    en: 'Invoice'
                },
                subItem: [
                    {
                        title: 'Invalid Type',
                        name: 'invalidType',
                        i18n: {
                            zh: '作废原因',
                            en: 'Invalid Type'
                        },
                        listType: 0,
                        fieldItem: 291,
                    },
                ],
            },
        }
    },
    commentFields: {
        typeFieldInfo: {
            name: "typeItem",
            dataType: "select",
            number: 1,
            required: 1,
            display: 1
        },
        subtypeFieldInfo: {
            name: "subtypeItem",
            dataType: "select",
            number: 1,
            required: 0,
            display: 1
        },
        creatorFieldInfo: {
            name: "creatorItem",
            i18n: {
                zh: '创建者',
                en: 'creator'
            },
            dataType: "select",
            required: 0,
            listType: 800
        },
    },

    commentModuleList: [
        {
            moduleId: 4,
            i18n: {
                zh: "简历备注",
                en: "Resume comment"
            }
        }, {
            moduleId: 5,
            i18n: {
                zh: "项目备注",
                en: "Project comment"
            }
        }, {
            moduleId: 6,
            i18n: {
                zh: "公司备注",
                en: "Company comment"
            }
        }, {
            moduleId: 13,
            i18n: {
                zh: "文档备注",
                en: "Document comment"
            }
        },
    ],
    invoiceOperationInfos: {
        2: {
            title: "发票已寄出",
            group: "sendInfo"
        },
        3: {
            title: "发票已到款",
            group: "paymentInfo"
        },
        4: {
            title: "作废",
            group: "cancelInfo"
        }
    },

    achievementField: {
        type: {
            name: "type",
            dataType: "select",
            number: 1,
            required: 1,
            display: 1,
            listType: 408
        },
        fee: {
            name: "fee",
            dataType: "money",
            number: 1,
            required: 1,
            display: 1
        },
    },

    mailAttachmentSelectFields: {
        resume: {
            dataType: 'select',
            title: "简历",
            listType: 804,
            name: "info",
            attributeData: "{\"dynamicList\": 1}"
        },
        project: {
            dataType: 'select',
            title: "项目",
            listType: 801,
            name: "info",
            attributeData: "{\"dynamicList\": 1}"
        },
        company: {
            dataType: 'select',
            title: "公司",
            listType: 803,
            name: "info",
            attributeData: "{\"dynamicList\": 1}"
        },
        contract: {
            dataType: 'select',
            title: "合同",
            listType: 1001,
            name: "info",
            attributeData: "{\"dynamicList\": 1}"
        }
    },

    candidateEmailTableFields: [
        {
            "name": "sender",
            "i18n": {
                "zh": "发件人",
                "en": "sender"
            },
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "receiver",
            "i18n": {
                "zh": "收件人",
                "en": "receiver"
            },
            "dataType": "multiemail",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "subject",
            "i18n": {
                "zh": "主题",
                "en": "subject"
            },
            "dataType": "text",
            "canTable": 1,
            "tableDataType": "email",
            "moduleItem": ""
        },
        {
            "name": "receiveTime",
            "i18n": {
                "zh": "发送时间",
                "en": "send_time"
            },
            "dataType": "datetime",
            "canTable": 1,
            "moduleItem": ""
        },
    ],
    emailConfig: {
        "163": {
            "protrol": "pop3",
            "receHost": "pop.163.com",
            "recePort": 110,
            "smtpHost": "smtp.163.com",
            "smtpPort": 25,
            "ssl": 0,
            "emailType": "163",
            "prevProtrol": "pop3",
            "hint": "请在【邮箱官网】→【设置】 中开启POP服务，并设置授权码。密码框请输入授权码。"
        },
        "126": {
            "protrol": "pop3",
            "receHost": "pop.126.com",
            "recePort": 110,
            "smtpHost": "smtp.126.com",
            "smtpPort": 25,
            "ssl": 0,
            "emailType": "126",
            "prevProtrol": "pop3",
            "hint": "请在【邮箱官网】→【设置】 中开启POP服务，并设置授权码。密码框请输入授权码。"
        },
        "sina": {
            "protrol": "pop3",
            "receHost": "pop.sina.com",
            "recePort": 110,
            "smtpHost": "smtp.sina.com",
            "smtpPort": 587,
            "ssl": 0,
            "emailType": "sina",
            "prevProtrol": "pop3",
            "hint": "请在【邮箱官网】→【设置】 中开启POP服务，并设置授权码。密码框请输入授权码。"
        },
        "sohu": {
            "protrol": "pop3",
            "receHost": "pop.sohu.com",
            "recePort": 110,
            "smtpHost": "smtp.sohu.com",
            "smtpPort": 25,
            "ssl": 0,
            "emailType": "sohu",
            "prevProtrol": "pop3",
            "hint": "请在【邮箱官网】→【设置】 中开启POP服务，并设置授权码。密码框请输入授权码。"
        },
        "qq": {
            "protrol": "pop3",
            "receHost": "pop.qq.com",
            "recePort": 995,
            "smtpHost": "smtp.qq.com",
            "smtpPort": 465,
            "ssl": 1,
            "emailType": "qq",
            "prevProtrol": "pop3",
            "hint": "请在【邮箱官网】→【设置】 中开启POP服务，并设置授权码。密码框请输入授权码。"
        },
        "其它": {}
    },
    emailConfigFields: [
        {
            "title": "协议",
            "name": "protrol",
            "dataType": "select",
            "display": 1,
            "required": 1,
            "itemList": [
                {id: 1, value: 1, title: "pop3"}
            ]
        },
        {
            "title": "邮箱地址",
            "name": "username",
            "dataType": "email",
            "maxLength": 100,
            "display": 1,
            "required": 1
        },
        {
            "title": "密码",
            "name": "password",
            "dataType": "password",
            "maxLength": 100,
            "display": 1,
            "required": 1
        },
        {
            "title": "昵称",
            "name": "nickname",
            "dataType": "text",
            "maxLength": 100,
            "display": 1,
            "required": 1
        },
        {
            "title": "pop3服务器",
            "name": "receHost",
            "dataType": "text",
            "maxLength": 100,
            "display": 1,
            "required": 1
        },
        {
            "title": "pop3端口号",
            "name": "recePort",
            "dataType": "number",
            "maxLength": 99999,
            "display": 1,
            "required": 1
        },
        {
            "title": "smtp服务器",
            "name": "smtpHost",
            "dataType": "text",
            "maxLength": 100,
            "display": 1,
            "required": 1
        },
        {
            "title": "smtp端口号",
            "name": "smtpPort",
            "dataType": "text",
            "maxLength": 99999,
            "display": 1,
            "required": 1
        },
        {
            "title": "SSL",
            "name": "ssl",
            "dataType": "checkbox",
            "maxLength": 100,
            "display": 1,
            "isArray": 0,
            "required": 0
        }
    ],

    folderFields: {
        teamFieldInfo: {
            name: "teamItems",
            dataType: "treeselect",
            number: 1,
            required: 1,
            listType: 700,
            display: 1
        },
        colleagueFieldInfo: {
            name: "colleagueItem",
            dataType: "select",
            number: 1,
            required: 0,
            listType: 2001,
            display: 1
        }
    },

    channelFields: {
        typeFieldInfo: {
            name: "type",
            i18n: {
                zh: '渠道',
                en: 'channel'
            },
            dataType: "radio",
            number: 1,
            required: 1,
            display: 1,
            listType: 1101
        },
        accountFieldInfo: {
            name: "account",
            i18n: {
                zh: '猎头端账号',
                en: 'account'
            },
            dataType: "text",
            required: 1,
            display: 1
        },
        passwordFieldInfo: {
            name: "password",
            i18n: {
                zh: '密码',
                en: 'password'
            },
            dataType: "password",
            required: 1
        }
    },

    kpiCycle: {
        name: "cycle",
        dataType: "radio",
        required: 1,
        number: 1,
        display: 1,
        itemList: [
            {id: 1, value: 1, title: "周"},
            {id: 2, value: 2, title: "月"}
        ]
    },


    channelJobFields: {
        basic: {
            predictMinSalary: {
                name: "predictSalary",
                title: "预计年薪",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            predictPayment: {
                name: "predictPayment",
                title: "预付款",
                dataType: "money",
                hideNode: 1,
                display: 1
            },
            paymentMethod: {
                name: "paymentMethod",
                title: "付款方式",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            expectEntryTime: {
                name: "expectEntryTime",
                title: "期望入职时间",
                dataType: "date",
                hideNode: 1,
                display: 1
            },
            recruitNum: {
                name: "recruitNum",
                title: "招聘人数",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            department: {
                name: "department",
                title: "所属部门",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            report: {
                name: "report",
                title: "汇报对象",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            subordinateNum: {
                name: "subordinateNum",
                title: "下属人数",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            refreshTime: {
                name: "refreshTime",
                title: "更新时间",
                dataType: "date",
                hideNode: 1,
                display: 1
            },
            publishTime: {
                name: "publishTime",
                title: "发布时间",
                dataType: "date",
                hideNode: 1,
                display: 1
            },
            recruitReason: {
                name: "recruitReason",
                title: "招聘原因",
                dataType: "text",
                hideNode: 1,
                display: 1
            }
        },
        requires: {
            degree: {
                name: "degree",
                title: "学历要求",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            major: {
                name: "major",
                title: "专业要求",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            workExp: {
                name: "workExp",
                title: "工作年限",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            age: {
                name: "age",
                title: "年龄要求",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            language: {
                name: "language",
                title: "语言要求",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            gender: {
                name: "gender",
                title: "性别要求",
                dataType: "text",
                hideNode: 1,
                display: 1
            }
        },
        lights: {
            tags: {
                name: "tags",
                title: "学历要求",
                dataType: "text",
                hideNode: 1,
                display: 1
            },
            jobLights: {
                name: "jobLights",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            }
        },
        desc: {
            jobDesc: {
                name: "jobDesc",
                title: "xx",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            }
        },
        others: {
            jobRequirements: {
                name: "jobRequirements",
                title: "任职要求",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            targetEnterprise: {
                name: "targetEnterprise",
                title: "目标企业",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            interview: {
                name: "interview",
                title: "面试流程",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            others: {
                name: "others",
                title: "其他说明",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            }
        },
        company: {
            companyName: {
                name: "companyName",
                title: "名称",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            industry: {
                name: "industry",
                title: "行业",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            scale: {
                name: "scale",
                title: "规模",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            stage: {
                name: "stage",
                title: "阶段",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            nature: {
                name: "nature",
                title: "性质",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            },
            website: {
                name: "website",
                title: "主页",
                dataType: "url",
                hideNode: 1,
                display: 1
            },
            address: {
                name: "address",
                title: "地址",
                dataType: "textarea",
                hideNode: 1,
                display: 1
            }
        }
    },

    batchImportCandidateFields: {
        type: {
            name: "type",
            title: "类型",
            dataType: "radio",
            listType: 303,
            required: true,
            display: 1
        },
        duplicateOperation: {
            name: "duplicateOperation",
            title: "重复简历",
            dataType: "radio",
            required: true,
            display: 1,
            itemList: [
                {
                    id: 0,
                    value: 0,
                    title: "不上传"
                }, {
                    id: 1,
                    value: 1,
                    title: "上传并新增简历"
                }, {
                    id: 2,
                    value: 2,
                    title: "将重复简历存为人才附件"
                }
            ]
        },
        industry: {
            name: "industry",
            title: "行业",
            dataType: "treeselect",
            listType: 101,
            display: 1
        },
        titleFunction: {
            name: "titleFunction",
            title: "最近职能",
            dataType: "treeselect",
            listType: 102,
            display: 1
        },
        city: {
            name: "city",
            title: "所在城市",
            dataType: "treeselect",
            listType: 100,
            isArray: 1,
            display: 1
        },
        project: {
            name: "project",
            title: "加入项目",
            dataType: "select",
            listType: 801,
            attributeData: "{\"dynamicList\": 1}",
            display: 1
        },
        folder: {
            name: "folder",
            title: "分组",
            dataType: "treeselect",
            listType: 901,
            display: 1
        },
        tags: {
            name: "tags",
            title: "标签",
            dataType: "tag",
            display: 1
        },
    },
    documentFields: {
        folder: {
            name: "folder",
            title: "分组",
            dataType: "treeselect",
            listType: 912,
            display: 1,
            required: 0
        },
    },
    recReportFields: {
        language: {
            name: "language",
            title: "语言",
            dataType: "radio",
            required: true,
            display: 1,
            itemList: [
                {
                    id: 0,
                    value: 0,
                    title: "中文"
                }, {
                    id: 1,
                    value: 1,
                    title: "英文"
                }
            ]
        }
    },
//     function moduleId2CommentModuleId(moduleId) {
//     switch (parseInt(moduleId)) {
//         case 1:
//         case 10:
//             return 4;
//         case 2:
//             return 5;
//         case 3:
//             return 6;
//         case 12:
//             return 13;
//         default:
//             return null;
//     }
// }
    moduleIdConfig: {
        1: {
            name: 'resume',
            hideFolder: false,
            commentModuleId: 4,
            attachmentType: 31,
            attachmentSubType: {
                name: 'subType',
                dataType: 'select',
                listType: 600,
                defaultValue: 134040112,
            },
            tableDefaultFieldList: [
                "basicInfo.Fname",
                "stats.commentCount",
                "stats.attachmentCount",
                "basicInfo.Fwork_year",
                "basicInfo.Fcity",
                "basicInfo.Fphone",
                "occupationList.Ftitle",
                "occupationList.Fcompany_id",
                ".operation"
            ]
        },
        2: {
            name: 'project',
            hideFolder: false,
            commentModuleId: 5,
            attachmentType: 34,
            attachmentSubType: null,
            tableDefaultFieldList: [
                "basicInfo.Fproject_name",
                "basicInfo.Fcompany_id",
                "stats.commentCount",
                "basicInfo.Fcustomer_id",
                "basicInfo.Fannual_salary",
                "basicInfo.Fstatus",
                "stats.interviewCount",
                "stats.offerCount",
                ".operation"
            ]
        },
        3: {
            name: 'company',
            hideFolder: false,
            commentModuleId: 6,
            attachmentType: 35,
            attachmentSubType: null,
            tableDefaultFieldList: [
                "basicInfo.Fcompany_name",
                "stats.commentCount",
                "stats.attachmentCount",
                "basicInfo.Fcity_ids",
                "basicInfo.Findustry_ids",
                "basicInfo.Ftype",
                "basicInfo.Fbd_id",
                "stats.inProcessProjectCount",
                ".operation"
            ]
        },
        8: {
            name: 'contract',
            hideFolder: false,
            commentModuleId: -1,
            attachmentType: 36,
            attachmentSubType: null,
            tableDefaultFieldList: [
                "stats.attachmentCount",
                "contract.Fcontract_name",
                "company.basicInfo.Fcompany_name",
                "contract.Finvoice_title",
                "contract.Fguarantee_period",
                "company.basicInfo.Fbd_id",
                "contract.Fstart_time",
                "contract.Fend_time",
                ".operation"
            ]
        },
        9: {
            name: 'invoice',
            hideFolder: false,
            commentModuleId: -1,
            attachmentType: -1,
            attachmentSubType: null,
            tableDefaultFieldList: [
                "invoice.Fresume_id",
                ".typeList",
                "invoice.Finvoice_amount",
                "invoice.Fproject_id",
                "company.title",
                ".memberList",
                ".lastProjectResumeOperation",
                ".status",
                ".operation"
            ]
        },
        10: {
            name: 'project_resume',
            hideFolder: true,
            commentModuleId: -1,
            attachmentType: 31,
            attachmentSubType: {
                name: 'subType',
                dataType: 'select',
                listType: 600,
                defaultValue: 134040112,
            },
            tableDefaultFieldList: [
                "resume.basicInfo.Fname",
                "resume.stats.commentCount",
                "resume.stats.attachmentCount",
                "project.basicInfo.Fproject_name",
                ".lastStatus",
                "resume.occupationList.Ftitle",
                "resume.occupationList.Fcompany_id",
                "resume.basicInfo.Fstatus",
                ".operation"
            ]
        },
        11: {
            name: 'channel_job',
            hideFolder: true,
            commentModuleId: -1,
            attachmentType: -1,
            attachmentSubType: null,
        },
        12: {
            name: 'document',
            hideFolder: false,
            commentModuleId: 13,
            attachmentType: 41,
            attachmentSubType: null,
            tableDefaultFieldList: [
                ".documentName",
                "file.fileSize",
                ".time",
                ".owner",
                ".operation"
            ]
        }
    },
    permissionSettingConfig: {
        resume: {
            title: "人才访问权限",
            data: [
                {
                    name: "resume_candidate_share",
                    title: "候选人共享",
                    options: [
                        {
                            title: "不共享给任何人",
                            value: "0"
                        },
                        {
                            title: "共享给自己团队",
                            value: "1"
                        },
                        {
                            title: "共享给所有人",
                            value: "2"
                        }
                    ],
                },
                {
                    name: "resume_contacts_share",
                    title: "客户联系人共享",
                    options: [
                        {
                            title: "不共享给任何人",
                            value: "0"
                        },
                        {
                            title: "共享给自己团队",
                            value: "1"
                        },
                        {
                            title: "共享给所有人",
                            value: "2"
                        }
                    ],
                },
                {
                    name: "resume_cold_share",
                    title: "Cold Call共享",
                    options: [
                        {
                            title: "不共享给任何人",
                            value: "0"
                        },
                        {
                            title: "共享给自己团队",
                            value: "1"
                        },
                        {
                            title: "共享给所有人",
                            value: "2"
                        }
                    ],
                }
            ],
        },
        company: {
            title: "公司访问权限",
            data: [
                {
                    name: "company_share",
                    options: [
                        {
                            title: "不共享给任何人",
                            value: "0"
                        },
                        {
                            title: "共享给自己团队",
                            value: "1"
                        },
                        {
                            title: "共享给所有人",
                            value: "2"
                        }
                    ],
                }
            ]
        },

        project: {
            title: "项目访问权限",
            data: [
                {
                    name: "project_visit",
                    options: [
                        {
                            title: "用户可以访问所有的项目",
                            value: "1"
                        },
                        {
                            title: "用户可以访问自己参与的项目",
                            value: "0"
                        }
                    ]
                }
            ]
        },
        document: {
            title: "文档访问权限",
            data: [
                {
                    name: "document_share",
                    options: [
                        {
                            title: "不共享给任何人",
                            value: "0"
                        },
                        {
                            title: "共享给自己团队",
                            value: "1"
                        },
                        {
                            title: "共享给所有人",
                            value: "2"
                        }
                    ]
                }
            ]
        }
    }

});

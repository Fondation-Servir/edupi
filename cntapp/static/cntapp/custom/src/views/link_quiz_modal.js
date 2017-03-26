define([
    'underscore', 'backbone',
    'models/quiz',
    'text!templates/link_quiz_modal.html',
    'bootstrap_table'
], function (_, Backbone,
             Quiz,
             linkQuizModal) {
    var QuizTableView, LinkQuizModalView, TEMPLATE, SIGNS_ENUM;

    TEMPLATE = _.template(linkQuizModal);
    SIGNS_ENUM = {
        unlink: [
            '<a class="unlink toggle-link" href="javascript:void(0)" title="Unlink">',
            '<i class="glyphicon glyphicon-ok"></i>',
            '</a>'
        ].join(''),

        link: [
            '<a class="link toggle-link" href="javascript:void(0)" title="Link">',
            '<i class="glyphicon glyphicon-link"></i>',
            '</a>'
        ].join('')
    };

    QuizTableView = Backbone.View.extend({
        initialize: function (options) {
            if (typeof options.currentQuiz === 'undefined') {
                throw Error('LinkQuizModal not inited correctly.');
            }
            this.currentQuiz = options.currentQuiz;
            this.parentId = options.parentId;
        },

        render: function () {
            this.$el.html([
                    "<table id='table'></table>",
                ].join('')
            );

            var that = this;

            this.$('#table').bootstrapTable({
                url: '/api/quiz/',
                showRefresh: 'true',
                showColumns: 'true',
                showToggle: 'true',
                search: 'true',
                pagination: 'true',
                sidePagination: 'server',

                columns: [{
                    field: 'id',
                    title: 'ID',
                    sortable: true
                }, {
                    field: 'name',
                    title: 'Name',
                    sortable: true
                }, {
                    field: 'description',
                    title: 'Description',
                    sortable: true
                }, {
                    field: 'directory_set',
                    title: 'refs',
                    formatter: function (value, row, index) {
                        return value.length;
                    }
                }, {
                    field: 'action',
                    title: 'Action',
                    formatter: function (value, row, index) {
                        if (value) {
                            return value;
                        }
                        var length = that.currentQuiz.length;
                        // Search if the document is in the current directory
                        for (var i = 0; i < length; i++) {
                            if (row.id == that.currentQuiz.at(i).get('id')) {
                                return SIGNS_ENUM.unlink;
                            }
                        }
                        return SIGNS_ENUM.link;
                    },
                    events: {
                        'click .toggle-link': function (e, value, row, index) {
                            var type, newSign, url, data, sign;
                            sign = e.currentTarget.outerHTML;

                            switch (sign) {
                                case SIGNS_ENUM.link:
                                    type = 'POST';
                                    newSign = SIGNS_ENUM.unlink;
                                    break;
                                case SIGNS_ENUM.unlink:
                                    type = 'DELETE';
                                    newSign = SIGNS_ENUM.link;
                                    break;
                                default :
                                    console.error('unexpected action sign:' + sign);
                                    return;
                            }

                            url = cntapp.apiRoots.directories + that.parentId + '/quiz/';
                            data = {"quiz": row.id};
                            $.ajax({
                                type: type, traditional: true, url: url, data: data,
                                success: function () {
                                    that.$('#table').bootstrapTable('updateCell', {
                                        rowIndex: index,
                                        fieldName: 'action',
                                        fieldValue: newSign
                                    });
                                    that.currentQuiz.trigger('render');
                                },
                                error: function (request, status, error) {
                                    alert(error);
                                }
                            });

                        }
                    }
                }]
            });
            // adjust the header
            this.$('#table').bootstrapTable('resetView');
            return this;
        }
    });

    LinkQuizModalView = Backbone.View.extend({
        initialize: function (options) {
            options = options || {};
            this.parentId = options.parentId;
            this.currentQuiz = options.currentQuiz;
            this.quizTableView = new QuizTableView({
                currentQuiz: this.currentQuiz,
                parentId: this.parentId
            });
        },
        render: function () {
            this.$el.html(TEMPLATE());
            this.$el.i18n();
            this.$('.modal-body').html(this.quizTableView.render().el);
            return this;
        },
        toggle: function () {
            this.$('#link-quiz-modal').modal('toggle');
        }
    });

    return LinkQuizModalView
});
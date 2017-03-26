define([
    'underscore', 'backbone',
    'models/link',
    'text!templates/link_links_modal.html',
    'bootstrap_table'
], function (_, Backbone,
             Link,
             linkLinksModal) {
    var LinksTableView, LinkLinksModalView, TEMPLATE, SIGNS_ENUM;

    TEMPLATE = _.template(linkLinksModal);
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

    LinksTableView = Backbone.View.extend({
        initialize: function (options) {
            if (typeof options.currentLinks === 'undefined') {
                throw Error('LinkLinksModal not inited correctly.');
            }
            this.currentLinks = options.currentLinks;
            this.parentId = options.parentId;
        },

        render: function () {
            this.$el.html([
                    "<table id='table'></table>",
                ].join('')
            );

            var that = this;

            this.$('#table').bootstrapTable({
                url: '/api/links/',
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
                    field: 'url',
                    title: 'URL',
                    sortable: true,
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
                        var length = that.currentLinks.length;
                        // Search if the document is in the current directory
                        for (var i = 0; i < length; i++) {
                            if (row.id == that.currentLinks.at(i).get('id')) {
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

                            url = cntapp.apiRoots.directories + that.parentId + '/links/';
                            data = {"links": row.id};
                            $.ajax({
                                type: type, traditional: true, url: url, data: data,
                                success: function () {
                                    that.$('#table').bootstrapTable('updateCell', {
                                        rowIndex: index,
                                        fieldName: 'action',
                                        fieldValue: newSign
                                    });
                                    that.currentLinks.trigger('render');
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

    LinkLinksModalView = Backbone.View.extend({
        initialize: function (options) {
            options = options || {};
            this.parentId = options.parentId;
            this.currentLinks = options.currentLinks;
            this.linksTableView = new LinksTableView({
                currentLinks: this.currentLinks,
                parentId: this.parentId
            });
        },
        render: function () {
            this.$el.html(TEMPLATE());
            this.$el.i18n();
            this.$('.modal-body').html(this.linksTableView.render().el);
            return this;
        },
        toggle: function () {
            this.$('#link-links-modal').modal('toggle');
        }
    });

    return LinkLinksModalView
});
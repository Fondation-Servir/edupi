define([
    'underscore',
    'backbone',
    'models/link',
    'views/link',
    'text!templates/link_list.html'
], function (_, Backbone,
             Link,
             LinkView,
             linkListTemplate) {

    var LinkListView = Backbone.View.extend({
        tagName: "ul",
        className: "list-group",
        id: "link-list",

        initialize: function (options) {
            if (!options.parentId) {
                console.error("no directory id specified");
                return;
            }

            this.parentId = options.parentId;
            this.template = _.template(linkListTemplate);
            this.collection = options.currentLinks;
            this.collection.on('render', this.render, this);
            this.collection.on('unlink', this.unlink, this);
            _.bind(this.unlink, this);
        },

        unlink: function (linkModel) {
            var url,
                data,
                that = this;
            url = cntapp.apiRoots.directories + this.parentId + '/links/';
            data = {"links": linkModel.get('id')};

            $.ajax({
                type: 'DELETE', url: url, data: data, traditional: true,
                success: function () {
                    that.collection.remove(linkModel);
                    linkModel.trigger('destroy'); // remove the link view
                },
                error: function (request, status, error) {
                    alert(error);
                }
            });
        },

        render: function () {
            var docs = [];
            var that = this;
            var url = '/api/directories/' + this.parentId + '/links/';
            that.$el.html('');
            $.get(url)
                .done(function (data) {
                    _(data).each(function (obj) {
                        var m = new Link(obj);
                        that.$el.append(
                            new LinkView({model: m, id: "link-" + m.id}).render().el);
                        docs.push(m);
                    });
                    // must use `reset` instead of `set`, otherwise the pre-existed models cannot fire events.
                    // it's a bug of Backbone.js?
                    that.collection.reset(docs);
                });
            return this;
        }
    });

    return LinkListView;
});
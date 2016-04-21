define([
    'underscore',
    'backbone',
    'views/document',
    'views/link',
    'models/document',
    'collections/documents',
    'text!templates/document_list.html'
], function (_, Backbone,
             DocumentView, LinkView, Document, Documents,
             documentListTemplate) {

    var DocumentList = Backbone.Collection.extend({
        model: Backbone.Model
    });

    var DocumentListView = Backbone.View.extend({
        tagName: "ul",
        className: "col-sm-offset-2 col-sm-8",
        id: "document-list",

        initialize: function (options) {
            options = options || {};

            if (!options.parentId) {
                console.error("no directory id specified");
                return;
            }

            if (typeof options.documents === 'undefined' || typeof options.links === 'undefined') {
                throw new Error("documents or links not defined!");
            }

            this.parentId = options.parentId;
            this.collection_documents = options.documents;
            this.collection_links = options.links;
        },

        render: function () {
            var that = this;
            _(that.collection_documents.models).each(function (doc) {
                that.$el.append(
                    new DocumentView({model: doc, id: "document-" + doc.get('id')}).render().el);
            });
            _(that.collection_links.models).each(function (doc) {
                that.$el.append(
                    new LinkView({model: doc, id: "link-" + doc.get('id')}).render().el);
            });
            return this;
        }
    });

    return DocumentListView;
});

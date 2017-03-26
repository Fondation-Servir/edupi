define([
    'jquery',
    'underscore',
    'backbone',
    'views/generic_list',
    'views/directories',
    'models/directory'
], function ($, _, Backbone,
             GenericListView, DirectoriesView,
             Directory) {

    var StructureContentView = Backbone.View.extend({

        initialize: function (options) {
            this.currentDirectories = options.currentDirectories;
            this.currentDocuments = options.currentDocuments;
            this.currentLinks = options.currentLinks;
            this.currentQuiz = options.currentQuiz;
            this.path = options.path || null;
            this.parentId = options.parentId || null;
        },

        render: function () {
            console.debug('show content view for directory with id="' + this.parentId + '"');
            // show directories
            this.$el.html('<div id="directories" class="col-md-12"></div>');
            this.directoriesView = new DirectoriesView({
                el: this.$("#directories"),
                collection: this.currentDirectories,
                path: this.path
            });
            this.directoriesView.fetchAndRefresh(this.parentId);

            // show documents
            if (this.parentId) {
                this.genericListView = new GenericListView({
                    parentId: this.parentId,
                    currentDocuments: this.currentDocuments,
                    currentLinks: this.currentLinks,
                    currentQuiz: this.currentQuiz
                });
                this.$el.append('<div id="documents_table" class="col-md-12"></div>');
                this.$("#documents_table").html(this.genericListView.render().el);
            }

            return this;
        }
    });

    return StructureContentView;
});



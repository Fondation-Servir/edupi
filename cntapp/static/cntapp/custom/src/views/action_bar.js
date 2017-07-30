define([
    'underscore', 'backbone',
    'views/link_documents_modal', 'views/link_directory_modal', 'views/link_links_modal', 'views/link_quiz_modal',
    'text!templates/action_bar.html',
    'text!templates/create_directory_modal.html',
    'text!templates/confirm_modal.html',
    'text!templates/create_link_modal.html',
], function (_, Backbone,
             LinkDocumentModalView, LinkDirectoryModalView, LinkLinksModalView, LinkQuizModalView,
             actionBarTemplate, createDirectoryModalTemplate, confirmModalTemplate, createLinkModalTemplate) {

    var CREATE_DIRECTORY_MODAL_TEMPLATE = _.template(createDirectoryModalTemplate),
        CREATE_LINK_MODAL_TEMPLATE = _.template(createLinkModalTemplate),
        CONFIRM_MODAL_TEMPLATE = _.template(confirmModalTemplate),
        ACTION_BAR_TEMPLATE = _.template(actionBarTemplate);

    var ActionBarView = Backbone.View.extend({
        initialize: function (options) {
            options = options || {};
            this.path = options.path;
            this.parentId = options.parentId;
            this.currentDocuments = options.currentDocuments;
            this.currentLinks = options.currentLinks;
            this.currentQuiz = options.currentQuiz;
        },

        render: function () {
            var that = this;
            this.$el.html(ACTION_BAR_TEMPLATE({path: this.path, parentId: this.parentId}));
            this.$el.i18n();
            return this;
        },

        events: {
            'click .btn-create': function () {
                var that = this;
                this.$('.modal-area').html(CREATE_DIRECTORY_MODAL_TEMPLATE());
                this.$('.modal-area').i18n();
                this.$('#modal-create').on('shown.bs.modal', function () {
                    that.$('input[name="name"]').focus();
                });
                console.debug('show create-directory-modal');
            },

            'click .btn-create-link': function () {
                var that = this;
                this.$('.modal-area').html(CREATE_LINK_MODAL_TEMPLATE());
                this.$('.modal-area').i18n();
                this.$('#modal-create').on('shown.bs.modal', function () {
                    that.$('input[name="name"]').focus();
                });
                console.debug('show create-link-modal');
            },

            'submit form#directory-create-form': 'submit_directory',

            'submit form#link-create-form': 'submit_link',

            'click .btn-link-documents': function () {
                var modal = new LinkDocumentModalView({
                    currentDocuments: this.currentDocuments,
                    parentId: this.parentId
                });
                this.$('.modal-area').html(modal.render().el);
                modal.toggle();
                console.debug('show documents...');
            },

            'click .btn-link-directory': function () {
                var modal = new LinkDirectoryModalView({
                    parentId: this.parentId,
                    path: this.path
                });
                this.$('.modal-area').html(modal.render().el);
                modal.toggle();
            },

            'click .btn-link-links': function () {
                var modal = new LinkLinksModalView({
                    currentLinks: this.currentLinks,
                    parentId: this.parentId
                });
                this.$('.modal-area').html(modal.render().el);
                modal.toggle();
                console.debug('show links...');
            },

            'click .btn-link-quiz': function () {
                var modal = new LinkQuizModalView({
                    currentQuiz: this.currentQuiz,
                    parentId: this.parentId
                });
                console.log(modal);
                this.$('.modal-area').html(modal.render().el);
                modal.toggle();
                console.debug('show quiz...');
            }
        },

        submit_directory: function (event) {
            var data, url,
                that = this;

            event.preventDefault();
            this.form = this.$(event.currentTarget);
            data = this.serializeForm(this.form);
            url = cntapp.apiRoots.directories;
            url = this.parentId ? url + this.parentId + "/create_sub_directory/" : url;

            $.post(url, data)
                .success(function () {
                    that.$('.modal').modal('hide');
                    Backbone.history.loadUrl(Backbone.history.fragment);  // reload current url for refreshing page
                })
                .fail(function (reason) {
                    console.error('fail to create directory, reason:' + reason);
                });
        },

        submit_link: function (event) {
				var data, url,
                that = this;

            event.preventDefault();
            this.form = this.$(event.currentTarget);
            data = this.serializeForm(this.form);

            $.post('/api/links/', data)
                .success(function (file, json) {
                    console.error('create link, reason:' + file);
                    console.error('create link, reason:' + json);

					url = cntapp.apiRoots.directories + that.parentId + '/links/';
					var data = {"links": file['id']};

		            $.post(url, data)
		                .success(function () {
		                    that.$('.modal').modal('hide');
		                    Backbone.history.loadUrl(Backbone.history.fragment);  // reload current url for refreshing page
		                })
		                .fail(function (reason) {
		                    console.error('fail to create link, reason:' + reason);
		             });
                })
                .fail(function (reason) {
                    console.error('fail to create link, reason:' + reason);
             });

        },

        serializeForm: function (form) {
            return _.object(_.map(form.serializeArray(), function (item) {
                return [item.name, item.value];
            }));
        }
    });

    return ActionBarView;
});
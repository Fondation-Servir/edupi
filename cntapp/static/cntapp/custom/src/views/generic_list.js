define([
    'underscore',
    'backbone',
    'models/document',
    'views/document',
    'models/link',
    'views/link',
    'models/quiz',
    'views/quiz',
    'text!templates/generic_list.html'
], function (_, Backbone,
             Document,
             DocumentView,
             Link,
             LinkView,
             Quiz,
             QuizView,
             genericListTemplate) {

    var GenericListView = Backbone.View.extend({
        tagName: "ul",
        className: "list-group",
        id: "generic-list",

        initialize: function (options) {
            if (!options.parentId) {
                console.error("no directory id specified");
                return;
            }

            this.parentId = options.parentId;
            this.template = _.template(genericListTemplate);
            /* UGLY - SHOULD BE HANDLE WITH DYNAMIC TYPE */
            this.collectionDocuments = options.currentDocuments;
            this.collectionLinks = options.currentLinks;
            this.collectionQuiz = options.currentQuiz;

            this.collectionDocuments.on('render', this.render, this);
            this.collectionDocuments.on('unlink', this.unlink, this);
            this.collectionLinks.on('render', this.render, this);
            this.collectionLinks.on('unlink', this.unlink, this);
            this.collectionQuiz.on('render', this.render, this);
            this.collectionQuiz.on('unlink', this.unlink, this);
            _.bind(this.unlink, this);
        },

        unlink: function (documentModel) {
            var url,
                data = new Object(),
                that = this;

            url = cntapp.apiRoots.directories + this.parentId + '/' + documentModel.type + '/';

            data[documentModel.type] = documentModel.get('id');

            $.ajax({
                type: 'DELETE', url: url, data: data, traditional: true,
                success: function () {
          			/* UGLY - SHOULD BE HANDLE WITH DYNAMIC TYPE */
                	if (documentModel.type == 'document')
                    	that.collectionDocuments.remove(documentModel);
                	else if (documentModel.type == 'link')
                    	that.collectionLinks.remove(documentModel);
               		else
                    	that.collectionQuiz.remove(documentModel);
                    documentModel.trigger('destroy'); // remove the document view
                },
                error: function (request, status, error) {
                    alert(error);
                }
            });
        },

        render: function () {
            var docs = [];
            var quiz = [];
            var links = [];
            var that = this;
            var url = '/api/directories/' + this.parentId + '/sub_content/';
            that.$el.html('');
            $.get(url)
                .done(function (data) {
                    _(data.documents).each(function (obj) {
                        var m = new Document(obj);
                        that.$el.append(
                            new DocumentView({model: m, id: "document-" + m.id}).render().el);
                        docs.push(m);
                    });
                    _(data.links).each(function (obj) {
                        var m = new Link(obj);
                        that.$el.append(
                            new LinkView({model: m, id: "link-" + m.id}).render().el);
                        links.push(m);
                    });
                    _(data.quiz).each(function (obj) {
                        var m = new Quiz(obj);
                        that.$el.append(
                            new QuizView({model: m, id: "quiz-" + m.id}).render().el);
                        quiz.push(m);
                    });
                    // must use `reset` instead of `set`, otherwise the pre-existed models cannot fire events.
                    // it's a bug of Backbone.js?
                    that.collectionDocuments.reset(docs);
                    that.collectionLinks.reset(links);
                    that.collectionQuiz.reset(quiz);
                });
            return this;
        }
    });

    return GenericListView;
});
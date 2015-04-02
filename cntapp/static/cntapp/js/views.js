(function ($, Backbone, _, app) {
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    var TemplateView = Backbone.View.extend({
        templateName: '',
        initialize: function () {
            this.template = _.template($(this.templateName).html());
        },
        render: function () {
            var context = this.getContext(),
                html = this.template(context);
            this.$el.html(html);
            return this;
        },
        getContext: function () {
            return {};
        }
    });

    var DirectoriesView = TemplateView.extend({
        templateName: "#directories-template",

        initialize: function (options) {
            TemplateView.prototype.initialize.apply(this, arguments);
            this.listenTo(this, 'render', this.render);
            if (options.parentId) {
                this.parentId = options.parentId;
            }
        },

        render: function () {
            var that = this;
            FormView.prototype.render.apply(this);
            $("#create-directory").attr("href", function () {
                if (that.parentId) {
                    return "#" + that.parentId + "/create";
                } else {
                    return "#create";
                }
            });
            return this;
        },

        fetchAndRefresh: function () {
            var that = this;
            var url = "http://127.0.0.1:8000/api/directories";
            url = url + (this.parentId ? "/" + this.parentId + "/sub_directories" : "?root=true");

            $.getJSON(url)
                .done(function (data) {
                    that.directories = new Backbone.Collection(data);
                    app.currentDirectories = that.directories;
                    that.trigger('render');
                });
        },

        getContext: function () {
            return {directories: (this.directories && this.directories.models) || null};
        }
    });


    var FormView = TemplateView.extend({
        events: {
            'submit form': 'submit'
        },

        submit: function (event) {
            event.preventDefault();
            this.form = $(event.currentTarget);
        },

        done: function (event) {
            if (event) {
                event.preventDefault();
            }
            this.remove();
        },

        serializeForm: function (form) {
            return _.object(_.map(form.serializeArray(), function (item) {
                return [item.name, item.value];
            }));
        }
    });

    var CreateDirectoryView = FormView.extend({
        templateName: "#create-directory-template",

        initialize: function (options) {
            FormView.prototype.initialize.apply(this, options);
            if (options && options.parentId) {
                this.parentId = options.parentId;
            }
        },

        submit: function (event) {
            FormView.prototype.submit.apply(this, arguments);
            var data = this.serializeForm(this.form);
            var url = "http://127.0.0.1:8000/api/directories";
            if (this.parentId) {
                url = url + "/" + this.parentId + "/create_sub_directory";
            }

            $.post(url, data)
                .success($.proxy(this.createSuccess, this))
                .fail($.proxy(this.failure, this));
        },

        createSuccess: function () {
            console.log("create success");
            this.done();
            window.history.back();
        },

        failure: function () {
            console.warn("fail to create");
        }
    });

    var EditDirectoryView = FormView.extend({
        templateName: "#directory-edit-template",

        initialize: function (options) {
            FormView.prototype.initialize.apply(this, options);
            this.directory = options.directory;
        },

        getContext: function () {
            return {directory: this.directory};
        },

        submit: function (event) {
            FormView.prototype.submit.apply(this, arguments);
            var data = this.serializeForm(this.form);
            console.log(JSON.stringify(data));
            var url = "http://127.0.0.1:8000/api/directories/" + this.directory.id + "/update";
            $.ajax({
                type: "PUT",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (result) {
                    console.log("updated");
                    window.history.back();
                }
            });
        },

        events: {
            'submit form': 'submit',
            'click #dir-delete': 'deleteDirectory'
        },

        deleteDirectory: function (ev) {
            var that = this;
            $.ajax({
                url: "http://127.0.0.1:8000/api/directories/" + this.directory.id,
                type: 'DELETE',
                success: function (result) {
                    console.log("element deleted:" + result);
                    that.done();
                    window.history.back();
                }
            });
        }
    });

    app.views.DirectoriesView = DirectoriesView;
    app.views.CreateDirectoryView = CreateDirectoryView;
    app.views.EditDirectoryView = EditDirectoryView;

})(jQuery, Backbone, _, app);
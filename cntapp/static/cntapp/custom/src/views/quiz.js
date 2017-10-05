define([
    'underscore',
    'backbone',
    'text!templates/quiz.html',
    'text!templates/quiz_edit.html',
    'text!templates/confirm_modal.html',
    'text!templates/path_list.html',
    'models/answer',
    'models/question',
	'katex'
], function (_, Backbone,
             quizTemplate,
             quizEditTemplate,
             confirmModalTemplate,
             pathListTemplate,
             Answer,
             Question,
			 katex) {

    var TEMPLATE = _.template(quizTemplate);
    var EDIT_TEMPLATE = _.template(quizEditTemplate);
    var CONFIRM_MODAL_TEMPLATE = _.template(confirmModalTemplate);
    var PATH_LIST_TEMPLATE = _.template(pathListTemplate);

    var QuizView= Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",

        initialize: function (options) {
            options = options || {};

            this.isSearchResult = typeof options.isSearchResult === "boolean" ? options.isSearchResult : false;
            //this.model.on("change", this.render, this);
            this.model.on("destroy", this.destroy, this);

            this.model.on('invalid', function (model, error) {
                this.$('.error-msg').html(error);
            }, this);

            this.allPaths = [];
        },

        render: function () {
            this.$el.html(TEMPLATE({model: this.model, isSearchResult: this.isSearchResult}));
            this.$(".actions .glyphicon").hide();
            this.$(".error-msg").hide();
            this.$el.i18n();
            return this;
        },

        createInstantConfirmModal: function (message, confirmCallback) {
            var that = this,
                wrappedCallback;
            if (typeof confirmCallback === 'undefined') {
                throw Error('No callback function for confirm dialog.');
            }

            console.log('searching modal-area');
            this.$('.modal-area').html(CONFIRM_MODAL_TEMPLATE({
                title: null,
                message: message
            }));
            this.$(".modal").on('hidden.bs.modal', function () {
                $(this).data('bs.modal', null);
                $(this).remove();
            });
            this.$('.modal').on('shown.bs.modal', function () {
                that.$('.btn-confirmed').focus();
            });
            wrappedCallback = _.wrap(confirmCallback, function (callback) {
                callback();
                that.$('.modal').modal('hide');
            });

            this.$('.modal-area').i18n();
            this.$('.modal-area .btn-confirmed').click(wrappedCallback);
        },

        destroy: function () {
            // remove this view, only called when document model destroy event is triggered.
            this.$el.fadeOut(200, function () {
                $(this).remove();
            });
        },

		compileLaTeX: function (rawstring) {
	        if(!rawstring){
	            return rawstring;
	        }
	        var reg = /(^|[^\\])\$(([^\$]|\\\$)*[^\\])\$/g;
	        var match = reg.exec(rawstring);
	        var returnlist = [];
	        var loc = 0;
	        while(match){
	            var rawMath = match[2];
	            var mathlength = rawMath.length;
	            // the raw math will be surrounded by $ characters, which need to be
	            // removed. Since JS doesn't support negative lookbehinds in regex,
	            // the first character of the string will be the character before
	            // the $, unless it occurred at the beginning of the string. That
	            // needs to be removed too.
	            var mathStart = match.index;
	            if(mathStart === 0){
	                mathlength += 1;
	            }
	            else{
	                mathStart += 1;
	            }
	            var prestring = rawstring.slice(loc, mathStart);
	            prestring = prestring.replace('\\$', '$');
	            prestring = Encoder.htmlEncode(prestring);
	            returnlist.push(prestring);
	            loc += prestring.length;

	            rawMathSpaced = rawMath.replace('\\$', '\\$ ');
	            var html;
	            try{
	                var html = katex.renderToString(rawMathSpaced);
	                html = html.replace('\\$ ', '$');
	            }
	            catch(err){
	                // KaTeX failed, most likely because the user entired bad LaTeX.
	                // Display the user's raw text in red instead.
	                html = '<span style="color: red;">' + rawMath + '</span>'
	            }
	            returnlist.push(html);

	            loc += match[1].length + mathlength + 1;
	            match = reg.exec(rawstring);
	        }
	        returnlist.push(Encoder.htmlEncode(
	            rawstring.slice(loc, rawstring.length)
	        ));
	        return returnlist.join('');
	    },

	    nl2br: function (str, is_xhtml) {
		  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>';

		  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		},

		rebindEdit: function() {
		    that = this;
            this.$('.question').on('keyup', function(event) {
            	var raw = $('#' + event.target.id).val();
            	var html = that.compileLaTeX(raw);
            	$('#preview_' + event.target.id + ' .content').html(html);
            });
            this.$('.answer').on('keyup', function(event) {
            	var raw = $('#' + event.target.id).val();
            	var html = that.compileLaTeX(raw);
            	$('#preview_' + event.target.id).html(html);
            });
            this.$('.correct').on('change', function(event) {
            	if ($('#' + event.target.id).is(':checked'))
            	{
            		$('#li_preview_' + event.target.id).addClass('list-group-item-success');
           		} else {
           			$('#li_preview_' + event.target.id).removeClass('list-group-item-success');
     			}
            });
		},

		maxVal: function(inputs) {
			var highest = -Infinity;
			inputs.each(function() {
    			highest = Math.max(highest, parseFloat($(this).attr('rel') || $(this).val()));
			});
			if (highest == -Infinity)
			{
				return (1);
			}
			return (highest + 1);
		},

        events: {
            'mouseenter': function () {
                this.$(".actions .glyphicon").show();
            },
            'mouseleave': function () {
                this.$(".actions .glyphicon").hide();
            },
            'click .glyphicon-pencil': function () {
          		this.model.loadData();
                this.$el.html(EDIT_TEMPLATE({model: this.model}));
                this.$el.i18n();
                this.rebindEdit();
            },

            'click .btn-del-answer': function(event) {
            	$('#li_answer_' + $(event.target).parent().attr('rel')).remove();
            	$('#li_preview_correct_' + $(event.target).parent().attr('rel')).remove();
           	},
            'click .btn-del-question': function(event) {
            	$($(event.target).parents('.row')[0]).next().remove();
            	$(event.target).parents('.row')[0].remove();
           	},
            'click .btn-add-answer': function(event) {
            	var max_id = this.maxVal(this.$('#questions .correct'));

          		var html = this.$('#new-question #li_answer_MYNEWANSWERID').parent().html();
          		html = html.replace(/MYNEWANSWERID/g, max_id);
          		html = html.replace(/MYNEWQUESTIONID/g, $(event.target).attr('rel'));
          		$(event.target).prev().append(html);

          		var html = this.$('#new-question #li_preview_correct_MYNEWANSWERID').parent().html();
          		html = html.replace(/MYNEWANSWERID/g, max_id);
          		html = html.replace(/MYNEWQUESTIONID/g, $(event.target).attr('rel'));
            	$(event.target).parent().parent().parent().find('.li_preview').append(html);

                this.rebindEdit();
           	},
            'click .btn-add-question': function(event) {
            	var max_id = this.maxVal(this.$('#questions .correct'));
            	var html = this.$('#new-question').html();
          		html = html.replace(/MYNEWANSWERID/g, max_id);

          		var max_id = this.maxVal(this.$('#questions .row'));
          		html = html.replace(/MYNEWQUESTIONID/g, max_id);
            	$('#questions').append(html);
                this.rebindEdit();
           	},
            'click .btn-cancel': function () {
                this.render();
            },
            'click .glyphicon-link': function () {
                var that = this;
                this.createInstantConfirmModal(
                    i18n.t('doc-unlink-confirm-msg'),
                    function () {
                        that.model.trigger('unlink', that.model);
                    }
                );
            },
            'click .glyphicon-trash': function () {
                var that = this;
                this.createInstantConfirmModal(
                    i18n.t("doc-delete-confirm-msg"),
                    function () {
                        that.model.destroy();
                    }
                );
            },
            'click .btn-save': 'saveQuiz',
            'keypress': function (e) {
                var code = e.keyCode || e.which;
                if (code === 10) {  // ctrl + enter
                    this.saveQuiz();
                }
            },
            'click .paths': function () {
                if (this.allPaths.length > 0) {
                    return;
                }

                var that = this;
                var parents = that.model.get('directory_set');
                var fetchedNum = 0;
                for (var i = 0; i < parents.length; i++) {
                    $.get(cntapp.apiRoots.directories + parents[i]['id'] + '/paths/')
                        .done(function (paths) {
                            that.allPaths = that.allPaths.concat(paths);
                            if (++fetchedNum === parents.length) {
                                // TODO: find a proper way to sort the result
                                that.allPaths = that.allPaths.sort(function (a, b) {
                                    return a[0]['name'] >= b['0']['name'];
                                });

                                that.$('span[data-toggle="path-popover"]').popover({
                                    html: true,
                                    container: 'body',
                                    content: function () {
                                        return PATH_LIST_TEMPLATE({
                                            paths: that.allPaths
                                        });
                                    }
                                }).popover('show');
                            }
                        });
                }
            }
        },

        saveQuiz: function () {
            var name = this.$('input[name="name"]').val().trim();
            var description = this.$('textarea[name="description"]').val().trim();
			timeout = null;

			this.model.save({
                "name": name,
                "description": description
            }, {success : function(quiz) {
            	that.model.questions.reset();
	            $('#questions .row').each(function(index, obj) {
	                var id = $(obj).attr('rel');
	                q = new Question();
	                q.set({
	                    quiz : that.model.id,
	                    content : $(obj).find('textarea.question').val(),
	                    /*figure : $(obj).find('input[type="file"]').val(),*/
	                    explanation : ""
	                });
	                q.save(null, { success: function (question, resp) {
	                	$(obj).find('li').each(function(index2, obj2) {
                			if ($(obj2).find('input.answer').length)
                			{
			                    var a = new Answer();
			                    a.set({
			                        question : question.id,
			                        content : $(obj2).find('input.answer').val(),
			                        correct : $(obj2).find('input.correct').is(':checked')
			                    });
			                    a.save();

			                    clearTimeout(timeout);
					            timeout = setTimeout(function(){
					            	request = $.get('/api/quiz/' + that.model.id);
					            	request.done(function (data) {
							                that.model.set(data);
							                that.model.loadData();
							                that.render();
						            });
					            }, 500);
		                    }
		                });

	                	clearTimeout(timeout);
			            timeout = setTimeout(function(){
			            	request = $.get('/api/quiz/' + that.model.id);
			            	request.done(function (data) {
					                that.model.set(data);
					                that.model.loadData();
					                that.render();
				            });
			            }, 500);
	                }});
	            });
            }});
	        clearTimeout(timeout);
            timeout = setTimeout(function(){
            	request = $.get('/api/quiz/' + that.model.id);
            	request.done(function (data) {
		                that.model.set(data);
		                that.model.loadData();
		                that.render();
	            });
            }, 500);
        }
    });

    return QuizView;
});
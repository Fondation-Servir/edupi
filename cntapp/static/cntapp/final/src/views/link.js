define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/link.html'
], function ($, _, Backbone,
             linkTemplate) {

    var TEMPLATE = _.template(linkTemplate);

    var LinkView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",

        initialize: function () {
            this.model.on("change", this.render, this);
        },

        render: function () {
            this.$el.html(TEMPLATE({model: this.model}));
            return this;
        },

        events: {
            'click .document-row': function () {
                window.open(this.model.get('url'), '_blank');
            }
        }
    });

    return LinkView;
});
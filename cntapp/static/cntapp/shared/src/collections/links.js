define([
    'backbone',
    'models/link'
], function (Backbone, Link) {

    var LinkCollection = Backbone.Collection.extend({
        url: '/api/links/',
        model: Link
    });

    return LinkCollection;
});
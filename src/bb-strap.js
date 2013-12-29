/**
 *
 */

(function($, _, Backbone) {

  'use strict';

  var noop = function() {
  };

  Backbone.Helpers = {
    noop: noop,

    identity: function(params) {
      return params;
    }
  };

  Backbone.TemplateManager = function() {
    this.$cache = {};
    this.prefix = '/templates/';
    this.suffix = '.template.html';
    this.initialize.apply(this, Array.prototype.slice.call(arguments, 0));
  };

  Backbone.TemplateManager.prototype = {
    initialize: noop,

    /**
     * Load a template and store result in cache.
     * @param {string} templateId Id of template to load.
     * @returns {*} Promise.
     */
    loadAsync: function(templateId) {
      var promises = this.$cache;
      var promise = promises[templateId] || $.get(this.url(templateId));
      promises[templateId] = promise;
      return promise;
    },

    /**
     * Build url of template from its id.
     * @param {string} templateId Template id.
     * @returns {string} Url of template.
     */
    url: function(templateId) {
      return this.prefix + templateId + this.suffix;
    },

    /**
     * Build a template's id from url of template.
     * @param {string} url Url of template.
     * @returns {string} Template id.
     */
    id: function(url) {
      return url.replace(this.prefix, '').replace(this.suffix, '');
    },

    /**
     * Load a template and store result in cache.
     * @param {string|array<string>} templateId Id of template to load.
     * @param {function} callback Callback to call when template is loaded.
     * @param {object?} context Context to give to callback.
     */
    load: function(templateId, callback, context) {
      if ($.isArray(templateId)) {
        this.loads(templateId, callback, context);
      }
      else {
        var that = context || this;
        this.loadAsync(templateId).done(function(template) {
          callback.call(that, template);
        });
      }
    },

    /**
     * Load an array of templates and store result in cache.
     * @param {array<string>|string} templatesId Id of template to load.
     * @param {function} callback Callback to call when template is loaded.
     * @param {object?} context Context to give to callback.
     */
    loads: function(templatesId, callback, context) {
      if (_.isString(templatesId)) {
        this.load(templatesId, callback, context);
      }
      else {
        var count = templatesId.length;
        var results = {};
        var self = this;
        var that = context || self;

        var onDone = _.after(count, function() {
          callback.call(that, results);
        });

        var onTemplateLoaded = function(template) {
          var templateId = self.id(this.url);
          results[templateId] = template;
          onDone.call(that, results);
        };

        for (var i = 0; i < count; i++) {
          this.loadAsync(templatesId[i]).done(onTemplateLoaded);
        }
      }
    }
  };

  // Initialize a template manager (singleton by default)
  Backbone.templateManager = new Backbone.TemplateManager();

  Backbone.Mediator = {
    /** Channels */
    channels: {},

    /** Subscribe to a channel */
    subscribe: function(channel, subscription, context, once) {
      var channels = Backbone.Mediator.channels;

      if (!channels[channel]) {
        channels[channel] = [];
      }

      channels[channel].push({
        fn: subscription,
        context: context || this,
        once: once || false
      });
    },

    /** Trigger all callbacks for a channel */
    publish: function(channel) {
      var channels = Backbone.Mediator.channels;

      if (!channels[channel]) {
        return;
      }

      var args = [].slice.call(arguments, 1);

      for (var i = 0; i < channels[channel].length; i++) {
        var subscription = channels[channel][i];
        subscription.fn.apply(subscription.context, args);
        if (subscription.once) {
          Backbone.Mediator.unsubscribe(channel, subscription.fn, subscription.context);
          i--;
        }
      }
    },

    /** Cancel subscriptions */
    unsubscribe: function(channel, fn, context) {
      var channels = Backbone.Mediator.channels;

      if (!channels[channel]) {
        return;
      }

      if (arguments.length === 1) {
        channels[channel] = [];
      }
      else {
        for (var i = 0; i < channels[channel].length; i++) {
          var subscription = channels[channel][i];
          if (subscription.fn === fn && (!context || subscription.context === context)) {
            channels[channel].splice(i, 1);
            i--;
          }
        }
      }
    },

    /** Subscribe to a channel for one event */
    subscribeOnce: function(channel, subscription, context) {
      Backbone.Mediator.subscribe(channel, subscription, context, true);
    }
  };

  // Shortcuts
  Backbone.Mediator.pub = Backbone.Mediator.publish;
  Backbone.Mediator.sub = Backbone.Mediator.subscribe;

  Backbone.App = Backbone.View.extend({

    /** App Element */
    el: 'body',

    /** App initialization */
    initialize: function() {
      var that = this;

      // Expose app
      window.app = that;

      // Store $window / $body / url
      that.$window = $(window);
      that.$html = $('html');
      that.$body = $('body');

      that.$html
        .addClass('js')
        .removeClass('no-js');

      var location = window.location;
      that.url = location.protocol + '//' + location.host + location.pathname;

      var args = [].slice.call(arguments, 0);
      that.preInit.apply(that, args);
      that.views = that.buildViews();
      that.router = that.buildRouter();
      that.onInit.apply(that, args);
    },

    /** Hook initialization (before views and router are built) */
    preInit: noop,

    /** Build app main views */
    buildViews: function() {
      return {};
    },

    /** Build app router */
    buildRouter: function() {
      return null;
    },

    /** Initialization hook */
    onInit: noop,

    /** Default app events */
    events: {
      'click .js-link': 'nav'
    },

    /** App navigation */
    nav: function(e) {
      e.preventDefault();
      var href = $(e.currentTarget).attr('href');
      this.navigate(href);
    },

    /**
     * Navigate to a new url using app router.
     * @param {string} hash Url to navigate to.
     * @param {boolean?} trigger If navigation must triggered event to change main view.
     */
    navigate: function(hash, trigger) {
      var router = this.router;
      if (router) {
        if (_.isUndefined(trigger)) {
          trigger = true;
        }

        // IE7 always add url in href
        hash = hash.replace(this.url, '');

        router.navigate(hash, {
          trigger: trigger
        });
      }
    },

    /** Clear current view */
    replaceCurrentView: function(ViewImpl, opts) {
      if (this.views.current && this.views.current.clear) {
        this.views.current.clear();
        delete this.views.current;
      }
      this.views.current = new ViewImpl(opts);
    },

    /** Scroll to given y */
    scrollTop: function(y) {
      this.$window.scrollTop(y || 0);
    }
  });

  Backbone.StrapRouter = Backbone.Router.extend({

    initialize: function(options) {
      // Main content
      this.$content = $((options || {}).content || '#content');

      Backbone.history.start({
        silent: false,
        pushState: true
      });
    },

    show: function(ViewImpl, options) {
      var opts = options || {};
      opts.el = this.$content;

      var app = window.app;
      app.replaceCurrentView(ViewImpl, opts);
      app.scrollTop(0);
    }
  });

  Backbone.StrapView = Backbone.View.extend({

    /** Initialize view. */
    initialize: function(options) {
      var that = this;

      that.templateManager = Backbone.templateManager;

      var opts = options || {};
      _.each(opts, function(value, key) {
        that[key] = value;
      });

      that.$cache = {};
      that.subviews = [];

      var args = [].slice.call(arguments, 0);
      if (!args || !args.length) {
        args = [
          {}
        ];
      }

      that.onInit.apply(that, args);

      if (that.isEmpty()) {
        that.postInit.apply(that, args);
      }
      else {
        that.onReady.apply(that, args);
      }
    },

    /** Hook to implement for view initialization */
    onInit: noop,

    /** View subscriptions */
    subscriptions: {},

    /** Override delegate events to subscribe to subscriptions */
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, [].slice.call(arguments, 0));
      this.setSubscriptions();
    },

    /** Override undelegate events to unsubscribe to subscriptions */
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, [].slice.call(arguments, 0));
      this.unsetSubscriptions();
    },

    /** Subscribe to new subscriptions */
    setSubscriptions: function(subscriptions) {
      var callbacks = subscriptions || this.subscriptions;
      if (!callbacks || _.isEmpty(callbacks)) {
        return;
      }

      // Ensure we don't subscribe twice
      this.unsetSubscriptions(callbacks);

      _.each(callbacks, function(subscription, channel) {
        var once = !!subscription.once;

        if (_.isString(subscription)) {
          subscription = this[subscription];
        }

        Backbone.Mediator.subscribe(channel, subscription, this, once);
      }, this);
    },

    /** Unsubscribe to each subscription */
    unsetSubscriptions: function(subscriptions) {
      var callbacks = subscriptions || this.subscriptions;

      if (!callbacks || _.isEmpty(callbacks)) {
        return;
      }

      _.each(callbacks, function(subscription, channel) {
        if (_.isString(subscription)) {
          subscription = this[subscription];
        }
        Backbone.Mediator.unsubscribe(channel, subscription.$once || subscription, this);
      }, this);
    },

    /**
     * Check if view is empty, i.e. dom is empty.
     * @returns {boolean} True if view is empty, false otherwise.
     */
    isEmpty: function() {
      return !$.trim(this.$el.html());
    },

    /**
     * Check if view is ready to render.
     * @returns {boolean} True if view is ready to render, false otherwise.
     */
    isReady: function() {
      return true;
    },

    /** Hook to implement for view initialization (view is already rendered) */
    postInit: function() {
      this.render();
    },

    /** Hook to implement after view rendering */
    onReady: noop,

    /**
     * Get item from dom and store result in internal cache.
     * @param {string} selector Selector.
     * @returns {jQuery} Result.
     */
    $c: function(selector) {
      var $item = this.$cache[selector];
      if (!$item) {
        $item = this.$(selector);
        this.$cache[selector] = $item;
      }
      return $item;
    },

    /** Clear internal cache. */
    clearCache: function() {
      this.$cache = {};
    },

    /** Hook to implement, called before view rendering */
    preRender: noop,

    /** Alias to hook that give data used to populate view */
    datas: noop,

    /** Hook that give data used to populate view */
    toJSON: noop,

    /** Hook that give partials used to populate view */
    partials: function(tmpls, mainTemplate) {
      var results = {};

      _.each(tmpls, function(value, key) {
        if (key !== mainTemplate) {
          var id = key.split('/');
          id = id[id.length - 1];
          results[id] = value;
        }
      });

      return results;
    },

    /** Callback when templates are fully loaded */
    onLoaded: function(tmpl) {
      var datas = _.result(this, 'toJSON');

      if (_.isUndefined(datas) || _.isNull(datas)) {
        datas = _.result(this, 'datas');
      }

      if (_.isString(tmpl)) {
        // Don't need partials
        this.populate(tmpl, datas || {});
      } else {
        // Load partials
        var templates = _.result(this, 'templates');
        var mainTemplate = tmpl[templates[0]];
        this.populate(mainTemplate, datas, this.partials(tmpl, templates[0]));
      }
    },

    /** Render Function */
    render: function() {
      var isReady = _.result(this, 'isReady');
      if (isReady) {
        var templates = _.result(this, 'templates');
        if (templates) {
          var fn = _.isArray(templates) ? 'loads' : 'load';
          this.templateManager[fn](templates, this.onLoaded, this);
        }
      }
      return this;
    },

    /**
     * Dispose view :
     * - Stop listening to events from models or collections.
     * - Undelegate dom events.
     * - Close subviews and clear internal cache.
     */
    dispose: function() {
      var that = this;
      that.onDispose();
      that.clearCache();
      that.closeSubviews();
      that.stopListening();
      that.undelegateEvents();
    },

    /** Close all subviews of view (i.e. dispose all subviews). */
    closeSubviews: function() {
      _.each(this.subviews, function(subview) {
        if (subview.dispose) {
          subview.dispose();
        }
      });
      this.subviews = [];
    },

    /** Hook to implement when view is disposed */
    onDispose: noop,

    /**
     * Close view:
     * - Dispose view events.
     * - Remove el from DOM.
     */
    close: function() {
      this.dispose();
      this.remove();
    },

    /**
     * Clear view:
     * - Dispose view events.
     * - Empty el element (does not remove el but clear content).
     */
    clear: function() {
      this.dispose();
      this.$el.empty();
    },

    /**
     * Populate view with template, datas and partials.
     * @param template
     * @param datas
     * @param partials
     */
    populate: function(template, datas, partials) {
      var that = this;
      var args = [].slice.call(arguments, 0);
      var html = that.toHtml.apply(that, args);

      // Close dom elements before rendering
      that.closeSubviews();

      // Clear cache and call callbacks
      that.preRender();
      that.clearCache();

      // Render
      that.$el.html(html);
      that.onReady();
    },

    /** Generate html */
    toHtml: function() {
      return this.compileTemplate.apply(this, [].slice.call(arguments, 0));
    },

    /** Compile template using underscore */
    compileTemplate: function(template, datas) {
      return _.template(template, datas || {});
    },

    /**
     * Add subview to the view.
     * @param view Subview to add.
     */
    addSubview: function(view) {
      if (!this.subviews) {
        this.subviews = [];
      }

      if (!_.isArray(view)) {
        view = [view];
      }

      _.each(view, function(v) {
        this.subviews.push(v);
      }, this);
    },

    /** Show loader icon */
    showLoader: function() {
      if (!this.$loader) {
        this.$loader = $('<i class="loader"></i>');
        this.$el.html(this.$loader);
      }
    },

    /** Hide loader icon */
    hideLoader: function() {
      if (this.$loader) {
        this.$loader.remove();
        this.$loader = null;
      }
    }
  });

  /** Compile template using Mustache */
  Backbone.MustacheView = Backbone.StrapView.extend({
    compileTemplate: function(template, datas, partials) {
      return Mustache.to_html(template, datas || {}, partials || {});
    }
  });

  Backbone.PaginatedCollection = Backbone.Collection.extend({

    /** Initialize collection */
    initialize: function(models, options) {
      var opts = options || {};
      var that = this;
      that.page = options.page || 0;
      that.pageSize = opts.pageSize || 10;

      var total = opts.total;
      if (_.isNull(total) || _.isUndefined(total)) {
        total = Number.MAX_VALUE;
      }
      this.total = total;

      that.onInit.apply(that, [].slice.call(arguments, 0));
    },

    /** Initialization hook */
    onInit: function() {
    },

    /** Get id of last item of collection */
    lastId: function() {
      return this.last().get('id');
    },

    /**
     * Fetch next page using id of last item in collection.
     * @param {object?} options Fetch options.
     */
    nextPageById: function(options) {
      this.next(options || {}, {
        'next-id': this.lastId(),
        'page-size': this.pageSize
      });
    },

    /**
     * Fetch next page using number of next page.
     * @param {object?} options Fetch options.
     */
    nextPage: function(options) {
      this.next(options, {
        'page': this.page + 1,
        'page-size': this.pageSize
      });
    },

    /**
     * Fetch next page using pagination parameters.
     * @param {object?} options Fetch options.
     * @param {object?} paginationParameters Pagination parameters.
     */
    next: function(options, paginationParameters) {
      if (this.length < this.total) {
        var params = options || {};
        params.data = _.extend(params.data || {}, paginationParameters);
        params.processDatas = true;
        params.remove = false;
        params.merge = false;
        params.add = true;

        var that = this;
        var success = params.success;

        params.success = function(collection, datas) {
          that.page++;

          if (datas.length === 0) {
            that.total = that.length;
          }

          if (success) {
            success.apply(this, [].slice.call(arguments, 0));
          }

          that.trigger('sync:page', collection, datas, options);
        };

        return this.fetch(params);
      }
    }
  });

})(jQuery, _, Backbone);

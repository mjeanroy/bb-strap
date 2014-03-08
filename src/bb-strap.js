/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Mickael Jeanroy <mickael.jeanroy@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery', 'underscore', 'backbone', 'mustache'], factory);
  } else {
    // Browser globals
    factory(jQuery, _, Backbone, window.Mustache || null);
  }

}(function($, _, Backbone, Mustache) {

  'use strict';

  var BackboneView = Backbone.View.prototype;
  var BackboneCollection = Backbone.Collection.prototype;
  var BackboneRouter = Backbone.Router.prototype;

  var noop = function() {
  };

  Backbone.TemplateManager = function() {
    this.$cache = {};
    this.prefix = '/templates/';
    this.suffix = '.template.html';
    this.initialize.apply(this, [].slice.call(arguments, 0));
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

    /**
     * Clear all subscriptions.
     * @return {object} this.
     */
    clear: function() {
      Backbone.Mediator.channels = {};
      return this;
    },

    /**
     * Subscribe to a channel.
     * @param {string} channel Channel name.
     * @param {function} subscription Callback.
     * @param {*=} context Optional context use on callbacks call.
     * @param {boolean=} once Flag to subscribe only once (and remove subscription after first call).
     * @return {object} this.
     */
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

      return this;
    },

    /**
     * Trigger all callbacks for a channel.
     * @param {string} channel Channel name.
     * @return {object} this.
     */
    publish: function(channel) {
      var channels = Backbone.Mediator.channels;

      if (channels[channel]) {
        var args = [].slice.call(arguments, 1);

        for (var i = 0; i < channels[channel].length; i++) {
          var subscription = channels[channel][i];
          subscription.fn.apply(subscription.context, args);
          if (subscription.once) {
            Backbone.Mediator.unsubscribe(channel, subscription.fn, subscription.context);
            i--;
          }
        }
      }

      return this;
    },

    /**
     * Cancel subscriptions.
     * @param {string=} channel Channel name to un subscribe.
     * @param {function=} fn Callback to un subscribe.
     * @param {*=} context Context to match on subscription.
     * @return {object} this
     */
    unsubscribe: function(channel, fn, context) {
      if (arguments.length === 0) {
        return Backbone.Mediator.clear();
      }

      var channels = Backbone.Mediator.channels;

      if (channels[channel]) {
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
      }

      return this;
    },

    /**
     * Subscribe to a channel for one event.
     * @param {string} channel Channel name.
     * @param {function=} subscription Callback.
     * @param {object=} context Callback context.
     * @return {object} this.
     */
    subscribeOnce: function(channel, subscription, context) {
      return Backbone.Mediator.subscribe(channel, subscription, context, true);
    }
  };

  // Shortcuts
  Backbone.Mediator.pub = Backbone.Mediator.publish;
  Backbone.Mediator.sub = Backbone.Mediator.subscribe;

  Backbone.App = Backbone.View.extend({

    /** App Element */
    el: 'body',

    /** App initialization */
    constructor: function() {
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

      BackboneView.constructor.call(that);

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

    /**
     * Link navigation.
     * @param {Event} e Click event.
     * @return {object} this
     */
    nav: function(e) {
      e.preventDefault();
      var href = $(e.currentTarget).attr('href');
      return this.navigate(href);
    },

    /**
     * Navigate to a new url using app router.
     * @param {string} hash Url to navigate to.
     * @param {boolean?} trigger If navigation must triggered event to change main view.
     * @return {object} this
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
      return this;
    },

    /**
     * Clear current view and open new one.
     * @param {object} ViewImpl New view class.
     * @param {object=} opts Optional view options.
     * @return {object} this
     */
    replaceCurrentView: function(ViewImpl, opts) {
      var current = this.views.current;
      if (current && _.isFunction(current.clear)) {
        current.clear();
        delete this.views.current;
      }

      this.views.current = new ViewImpl(opts);
      return this;
    },

    /**
     * Scroll to given y.
     * @param {number=} y Y coordinate (optional, default is zero).
     * @return {object} this
     */
    scrollTop: function(y) {
      this.$window.scrollTop(y || 0);
      return this;
    }
  });

  Backbone.StrapRouter = Backbone.Router.extend({

    /**
     * Initialize router.
     * @param {object=} options Optional options.
     * @returns {object} this.
     */
    constructor: function(options) {
      // Main content
      var opts = options || {};
      var content = opts.content || '#content';
      this.$content = $(content);

      BackboneRouter.constructor.call(this);

      if (!Backbone.history.started) {
        var defaults = {
          silent: false,
          pushState: true
        };

        Backbone.history.start(_.extend(defaults, _.pick(opts, 'silent', 'pushState')));
      }
    },

    /**
     * Show new view.
     * @param {*} ViewImpl View class.
     * @param {*=} options Optional view options.
     * @returns {*} this.
     */
    show: function(ViewImpl, options) {
      var opts = options || {};
      opts.el = this.$content;

      window.app.replaceCurrentView(ViewImpl, opts).scrollTop(0);
      return this;
    }
  });

  Backbone.StrapView = Backbone.View.extend({

    /**
     * Initialize view.
     * @param {*=} options Optional view options.
     */
    constructor: function(options) {
      var that = this;

      var opts = options || {};
      _.each(opts, function(value, key) {
        that[key] = value;
      });

      // Initialize jQuery cache elements
      that.$cache = {};

      // Initialize map of subviews
      that.$subviews = {};

      // Shortcut to template manager
      that.templateManager = Backbone.templateManager;

      BackboneView.constructor.call(that, opts);

      var args = [].slice.call(arguments, 0);
      if (!args || !args.length) {
        args = [{}];
      }

      // Shortcut to initialize
      that.onInit.apply(that, args);

      if (that.isEmpty()) {
        that.postInit.apply(that, args);
      } else {
        that.onReady.apply(that, args);
      }

      return that;
    },

    /** Hook to implement for view initialization */
    onInit: noop,

    /** View subscriptions */
    subscriptions: {},

    /**
     * Override delegate events to subscribe to subscriptions.
     * @return {object} this
     * @override
     */
    delegateEvents: function() {
      BackboneView.delegateEvents.apply(this, [].slice.call(arguments, 0));
      return this.setSubscriptions();
    },

    /**
     * Override undelegate events to unsubscribe to subscriptions.
     * @return {object} this
     * @override
     */
    undelegateEvents: function() {
      BackboneView.undelegateEvents.apply(this, [].slice.call(arguments, 0));
      return this.unsetSubscriptions();
    },

    /**
     * Subscribe to new subscriptions.
     * @param {*=} subscriptions Optional subscriptions.
     * @return {object} this
     */
    setSubscriptions: function(subscriptions) {
      var callbacks = subscriptions || this.subscriptions;
      if (callbacks && !_.isEmpty(callbacks)) {

        // Ensure we don't subscribe twice
        this.unsetSubscriptions(callbacks);

        var callback = function(subscription, channel) {
          var once = !!subscription.once;

          if (_.isString(subscription)) {
            subscription = this[subscription];
          }

          Backbone.Mediator.subscribe(channel, subscription, this, once);
        };

        _.each(callbacks, callback, this);
      }

      return this;
    },

    /**
     * Unsubscribe to each subscription.
     * @return {object} this
     */
    unsetSubscriptions: function(subscriptions) {
      var callbacks = subscriptions || this.subscriptions;

      if (callbacks && !_.isEmpty(callbacks)) {

        var callback = function(subscription, channel) {
          if (_.isString(subscription)) {
            subscription = this[subscription];
          }

          Backbone.Mediator.unsubscribe(channel, subscription.$once || subscription, this);
        };

        _.each(callbacks, callback, this);
      }

      return this;
    },

    /**
     * Check if view is empty, i.e. dom is empty.
     * @return {boolean} True if view is empty, false otherwise.
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

    /**
     * Read data from window object and set model/collection from its value.
     * Window object value is automatically destroyed.
     * @param {string} varName Name of variable on window object.
     * @param {string?} objName Object name on view, default is name on window object.
     * @return {object} this
     */
    $read: function(varName, objName) {
      if (window[varName]) {
        var obj = objName || varName;
        this[obj].set(window[varName]);
        delete window[varName];
      }
      return this;
    },

    /**
     * Read data from window object and set model/collection from its value.
     * Window object value is automatically destroyed.
     * Window value is expected to be equal to '$$[varName]' and model/collection name
     * is expected to be [varName].
     * @param {string} varName Name of variable.
     * @return {object} this
     */
    $$read: function(varName) {
      return this.$read('$$' + varName, varName);
    },

    /**
     * Clear internal cache.
     * @return {object} this
     */
    $clear: function() {
      this.$cache = {};
      return this;
    },

    /** Hook to implement, called before view rendering */
    preRender: noop,

    /** Alias to hook that give data used to populate view */
    datas: noop,

    /** Hook that give data used to populate view */
    toJSON: noop,

    /** Hook that give partials used to populate view */
    $partials: function(tmpls, mainTemplate) {
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

    /**
     * Hook that give custom partials used to populate view.
     * Default is empty object.
     * @return {object} Partials.
     */
    partials: function() {
      return {};
    },

    /** Callback when templates are fully loaded */
    onLoaded: function(tmpl) {
      var data = _.result(this, 'toJSON');

      if (_.isString(tmpl)) {
        // Don't need partials
        this.populate(tmpl, data || {});
      } else {
        // Load partials
        var templates = _.result(this, 'templates');
        var mainTemplate = tmpl[templates[0]];
        var partials = this.$partials(tmpl, templates[0]);
        partials = _.extend(partials, this.partials(tmpl, templates[0]) || {});
        this.populate(mainTemplate, data, partials);
      }
    },

    /**
     * Render Function.
     * @return {object} this
     */
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
     * @return {object} this.
     */
    dispose: function() {
      var that = this;
      that.onDispose();
      that.$clear();
      that.closeSubviews();
      that.stopListening();
      that.undelegateEvents();
      return this;
    },

    /** Destroy view internal data. */
    destroy: function() {
      var that = this;

      var exclude = {
        $cache: true,
        $subviews: true,
        cid: true,
        $el: true,
        el: true
      };

      for (var key in that) {
        if (that.hasOwnProperty(key) && !exclude[key]) {
          var value = that[key];
          if (value instanceof Backbone.StrapView) {
            value.close();
          }

          that[key] = null;
        }
      }

      return that;
    },

    /** Close all subviews of view (i.e. dispose all subviews). */
    closeSubviews: function() {
      var that = this;

      _.each(that.$subviews, function(subview) {
        that.stopListening(subview);
        subview.close();
      });

      that.$subviews = {};

      // Close subviews not previously stored in subviews array
      for (var i in that) {
        var value = that[i];
        if (that.hasOwnProperty(i) && value instanceof Backbone.StrapView) {
          value.close();
          that[i] = null;
        }
      }

      return that;
    },

    /** Hook to implement when view is disposed */
    onDispose: noop,

    /**
     * Close view:
     * - Dispose view events.
     * - Remove el from DOM.
     * - Destroy internal data.
     * @return {object} this
     */
    close: function() {
      var that = this;
      that.trigger('close', that);
      that.dispose();
      that.remove();
      that.destroy();
      return that;
    },

    /**
     * Clear view:
     * - Dispose view events.
     * - Empty el element (does not remove el but clear content).
     * - Destroy internal data.
     * @return {object} this
     */
    clear: function() {
      var that = this;
      that.trigger('clear', that);
      that.dispose();
      that.$el.empty();
      that.destroy();
      return that;
    },

    /**
     * Populate view with template, data and partials.
     * @param {string} template Template.
     * @param {*=} data Optional data.
     * @param {object=} partials Optional partials.
     * @return {object} this
     */
    populate: function(template, data, partials) {
      var that = this;
      var args = [].slice.call(arguments, 0);
      var html = that.toHtml.apply(that, args);

      // Close dom elements before rendering
      that.closeSubviews()
          .preRender();

      // Hide loader and render
      that.$clear()
          .hideLoader();

      that.$el.html(html);

      // Ready callback
      that.onReady();
      return that;
    },

    /** Generate html from view. */
    toHtml: function() {
      return this.compileTemplate.apply(this, [].slice.call(arguments, 0));
    },

    /**
     * Compile template using underscore.
     * @param {string} template Template.
     * @param {*=} data Optional data.
     * @return {string} Compiled template.
     */
    compileTemplate: function(template, data) {
      return _.template(template, data || {});
    },

    /**
     * Add subview to the view.
     * @param view Subview to add.
     * @return {object|array} Added view or array of added subviews.
     */
    addSubview: function(view) {
      if (!this.$subviews) {
        this.$subviews = {};
      }

      var array = view;
      if (!_.isArray(array)) {
        array = [array];
      }

      var callback = function(v) {
        this.$subviews[v.cid] = v;
        this.listenToOnce(v, 'close', this.removeSubview);
      };

      _.each(array, callback, this);

      return view;
    },

    /**
     * Remove view from subviews object.
     * @param view Subview.
     * @return {object} this.
     */
    removeSubview: function(view) {
      this.stopListening(view);
      var cid = view.cid;
      delete this.$subviews[cid];
      return this;
    },

    /**
     * Read subview from html and append it to subviews objects.
     * @param {*} $el Subview selector.
     * @param {*} ViewClass Subview class.
     * @param {*=} params View initialization parameters (function or object).
     * @return {object|array} Added subview or array of added subviews.
     */
    $addSubview: function($el, ViewClass, params) {
      var that = this;

      if (!($el instanceof Backbone.$)) {
        $el = that.$c($el);
      }

      if (_.isNull(params) || _.isUndefined(params)) {
        params = {};
      }

      var fn = params;
      if (!_.isFunction(fn)) {
        fn = function() {
          return params;
        };
      }

      var added = [];
      var callback = function(idx, $current) {
        var options = _.extend(fn.call(that, idx, $current), {
          el: $current
        });

        var currentSubView = new ViewClass(options);
        that.addSubview(currentSubView);
        added.push(currentSubView);
      };

      $el.each(callback);

      return added.length === 1 ? added[0] : added;
    },

    /** Css class appended to el element when loader is visible. */
    elLoader: 'loading',

    /** Css class set to loader icon. */
    iconLoader: 'icon-loader',

    /**
     * Show loader icon.
     * @return {object} this.
     */
    showLoader: function() {
      var that = this;
      var $i = that.$loader;
      var iconLoader = _.result(that, 'iconLoader');
      var loadingClass = _.result(that, 'elLoader');
      if (!$i && iconLoader) {
        that.$loading = true;
        $i = $('<i></i>').addClass(iconLoader);
        that.$el.addClass(loadingClass).html($i);
        that.$loader = $i;
      }
      return this;
    },

    /**
     * Hide loader icon.
     * @return {object} this.
     */
    hideLoader: function() {
      var that = this;
      if (that.$loader) {
        that.$loading = false;
        var loadingClass = _.result(that, 'elLoader');
        that.$el.removeClass(loadingClass);
        that.$loader.remove();
        that.$loader = null;
      }
      return this;
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
    constructor: function(models, options) {
      var opts = options || {};

      var total = opts.total;
      if (_.isNull(total) || _.isUndefined(total)) {
        total = Number.MAX_VALUE;
      }

      var that = this;
      that.total = total;
      that.page = opts.page || 0;
      that.pageSize = opts.pageSize || 10;

      BackboneCollection.constructor.apply(that, arguments);
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

}));

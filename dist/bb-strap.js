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

(function(window, document) {

  (function(factory) {

    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['jquery', 'underscore', 'backbone'], factory);
    } else {
      // Browser globals
      factory(jQuery, _, Backbone);
    }
  } (function($, _, Backbone) {

// Turn on safe synchronization operations
Backbone.safeSync = 'abort';

// Simple bindings can be disabled to used a dedicated plugin
// like Backbone.stickit.
Backbone.bindings = true;

// Id of default template manager
Backbone.defaultTemplateManager = 'remote';

// By default model / collections and view options are automatically
// attach before initialize function
Backbone.attachOptions = true;

// Default template compilation function
Backbone.$compile = function(template) {
  return _.isFunction(template) ?
    template.apply(this, [].slice.call(arguments, 1)) :
    _.template.apply(_, arguments);
};

// Default attach function, can be overriden to attach options
// to a particuler attribute of given object
// For example, this can be overriden to set options object to an 'options'
// attribute on object:
//
//   Backbone.$attach = function(obj, options) {
//     obj.options = options;
//     return obj;
//   };
Backbone.$attach = function(obj, options) {
  return _.extend(obj, options);
};

var sync = Backbone.sync;

Backbone.sync = function(method, model, options) {
  var opts = options || {};

  if (!Backbone.safeSync || opts.safe === false) {
    return sync.apply(this, arguments);
  }

  if (!model.$xhr) {
    model.$xhr = {};
  }

  var $xhr = model.$xhr[method];

  // Abort current operation
  if ($xhr) {
    var safeOp = opts.safe || Backbone.safeSync;
    if (safeOp === 'abort') {
      $xhr.abort();
    } else if (safeOp === 'skip') {
      return $xhr;
    }
  }

  var success = options.success;
  var error = options.error;

  var done = function() {
    model.$xhr[method] = null;
    success = error = done = null;
  };

  options.success = function() {
    success.apply(this, arguments);
    done();
  };

  options.error = function() {
    if (_.isFunction(error)) {
      error.apply(this, arguments);
    }
    done();
  };

  // Call original function
  var xhr = sync.apply(this, arguments);

  // Store current operation
  model.$xhr[method] = xhr;

  return xhr;
};

var modelKeys = _.keys(Backbone.Model.prototype);

Backbone.Model = (function(Model) {
	return Model.extend({
      constructor: function(attributes, options) {
        if (Backbone.attachOptions && options) {
          Backbone.$attach(this, _.omit(options, modelKeys));
        }
        Model.apply(this, arguments);
      }
    });
})(Backbone.Model);

var collectionKeys = _.keys(Backbone.Collection.prototype);

Backbone.Collection = (function(Collection) {
	return Collection.extend({
      constructor: function(models, options) {
        if (Backbone.attachOptions && options) {
          Backbone.$attach(this, _.omit(options, collectionKeys));
        }
        Collection.apply(this, arguments);
      }
    });
})(Backbone.Collection);

Backbone.View = (function(View) {
  return View.extend({
      constructor: function(options) {
        // Attach options
        if (Backbone.attachOptions) {
          Backbone.$attach(this, _.defaults(options || {}, _.result(this, 'defaults')));
        }

        // Trigger original constructor
        View.apply(this, arguments);

        // Attach subscriptions
        this.setSubscriptions();

        // Attach bindings
        if (this.model && this.bindings) {
          this.bind(this.model, this.bindings);
        }
      }
    });
})(Backbone.View);

_.extend(Backbone.View.prototype, {

  /**
   * Read data from DOM element.
   * Suppose you have an element in your dom such as:
   *
   *   <script id="foo" type="application/json">{id: 1, name: 'foo'}</script>
   *
   * This function allow you to read json content and set values to model previously
   * created on your view.
   *
   * Using this function, you can avoid useless round-trip to your backend to fetch
   * external object.
   *
   * For example:
   *
   *  // Create model on the view
   *  this.foo = new Backbone.Model();
   *
   *  // Read data from DOM:
   *  this.$readData('foo');
   *
   *  // Now, this.foo.toJSON() is equal to {id: 1, name: 'foo'}
   *
   * You can also set value on a model with a different name:
   *
   *  this.model = new Backbone.Model();
   *  this.$readDate('foo', 'model');
   *
   * Or set values on a created model:
   *  this.model = new Backbone.Model();
   *  this.$readDate('foo', this.model);
   *
   * This function need a polyfill to use JSON.parse function.
   *
   * @param {string} name Id of element to read from DOM.
   * @param {string=} varName Name of model on view object, first parameter will be used if missing.
   * @return {object} Updated model.
   */
  $readData: function(name, varName) {
    var $ = Backbone.$;
    var $elem = $('#' + name);
    var content = $.trim($elem.text());
    var modelName = varName || name;
    var model = _.isString(modelName) ? this[modelName] : modelName;

    if (content && model) {
      var json = JSON.parse(content);
      model.set(json);
    }

    // Remove DOM element
    $elem.remove();

    return model;
  },

  /**
   * Check if view content is empty.
   * View is empty if and only if view html content only contains spaces or blank lines.
   * If view contains empty tags, such '<span></span>', view is not considered to be empty.
   *
   * @return {boolean} True if view content is empty, false otherwise.
   */
  isEmpty: function() {
    return !Backbone.$.trim(this.$el.html());
  },

  /**
   * Loading icon.
   * This property can be overriden to display a custom icon.
   * @type {string|function}
   */
  loader: 'icon-loader',

  /**
   * Css class added to el element when view display a loading spinner.
   * This property can be overriden to add custom css class.
   * @type {string|function}
   */
  classLoading: 'loading',

  /**
   * Display a spinner in view element.
   *
   * A css class will be added to el element that can be used to customize
   * layout when view is loading.
   * By default, css class is 'loading' but it can be overriden per view
   * with 'loader' property.
   *
   * View HTML content will be replaced with an icon that should display
   * a spinner.
   *
   * For example, view content will be:
   *
   *   <div class="loading"> <!-- This is the el element. -->
   *     <i class="icon-loader"></i>
   *   </div>
   *
   * @return {Backbone.CompositeView} this.
   */
  $showLoader: function() {
    var $i = this.$loader;
    var icon = _.result(this, 'loader');
    var css = _.result(this, 'classLoading');
    if (!$i && icon) {
      $i = Backbone.$('<i>').addClass(icon);
      this.$el.addClass(css).html($i);
      this.$loader = $i;
    }
    return this;
  },

  /**
   * Remove current spinner if one has been previously added.
   * Loading css class is also removed from el element.
   * @return {object} this.
   */
  $hideLoader: function() {
    if (this.$loader) {
      this.$el.removeClass(_.result(this, 'classLoading'));
      this.$loader.remove();
      this.$loader = null;
    }
    return this;
  },

  /**
   * No-Op function that should be override when view is disposed.
   * to run custom logic.
   */
  onDispose: function() {},

  /**
   * Dispose view:
   * - Trigger 'dispose' event.
   * - Undelegate events.
   * - Stop listening to everything.
   * @return {Backbone.View} this.
   */
  dispose: function() {
    this.trigger('dispose', this);
    this.onDispose();
    this.undelegateEvents();
    this.stopListening();
    this.unsetSubscriptions();
    return this;
  },

  /**
   * Remove view:
   * - Dispose view.
   * - Trigger 'close' event.
   * - Remove view from DOM.
   * - Destroy view.
   * @return {Backbone.View} this.
   */
  remove: function() {
    this.dispose();
    this.trigger('close', this);
    this.$el.remove();
    this.$destroy();
    return this;
  },

  /**
   * Close view.
   * Alias to remove function (to be backward compatible).
   * @return {Backbone.View} this.
   * @deprecated
   */
  close: function() {
    return this.remove();
  },

  /**
   * Clear view:
   * - Dispose.
   * - Trigger 'clear' event.
   * - Clear view content from DOM.
   * - Destroy view.
   * @return {Backbone.View} this.
   */
  clear: function() {
    this.dispose();
    this.trigger('clear', this);
    this.$el.empty();
    this.$destroy();
    return this;
  },

  /**
   * Destroy view: remove everything attached to view object.
   * @return {Backbone.View} this.
   */
  $destroy: function() {
    var iterator = function(val, key) {
      this[key] = null;
    };

    _.each(this, iterator, this);

    return this;
  },

  /**
   * A really simple one-way bindings that can be used to update DOM elements when a model attribute is updated.
   * This has to be really simple, for more complex use case, see Backbone.stickit project
   * (https://github.com/NYTimes/backbone.stickit).
   *
   * @param {object} model Model to watch.
   * @param {object} bindings View bindings.
   */
  bind: function(model, bindings) {
    model = model || this.model;
    bindings = bindings || this.bindings;

    if (model && bindings) {
      _.each(bindings, function(value, key) {
        var eventName = 'change:' + value;

        // Remove previous handler.
        this.stopListening(model, eventName);

        // Add new handler.
        this.listenTo(model, eventName, function(model, value) {
          this.$(key).text(value);
        });
      }, this);
    }

    return this;
  },

  /**
   * Set subscriptions.
   * @param {object=} subscriptions New subscriptions.
   * @return {Backbone.View} this.
   */
  setSubscriptions: function(subscriptions) {
    var callbacks = subscriptions || this.subscriptions;
    if (callbacks && !_.isEmpty(callbacks)) {

      // Ensure we don't subscribe twice
      this.unsetSubscriptions(callbacks);

      var iterator = function(subscription, channel) {
        var once = !!subscription.once;

        if (_.isString(subscription)) {
          subscription = this[subscription];
        }

        Backbone.Mediator.sub(channel, subscription, this, once);
      };

      _.each(callbacks, iterator, this);
    }

    return this;
  },

  /**
   * Remove subscriptions.
   * @param {object=} subscriptions Subscriptions to remove.
   * @return {Backbone.View} this.
   */
  unsetSubscriptions: function(subscriptions) {
    var callbacks = subscriptions || this.subscriptions;

    if (callbacks && !_.isEmpty(callbacks)) {

      var iterator = function(subscription, channel) {
        if (_.isString(subscription)) {
          subscription = this[subscription];
        }
        Backbone.Mediator.unsubscribe(channel, subscription, this);
      };

      _.each(callbacks, iterator, this);
    }

    return this;
  }
});

Backbone.Mediator = {
  $channels: {},

  /**
   * Subscribe to a channel.
   * @param {string} channel Channel name.
   * @param {function} subscription Callback.
   * @param {*=} context Optional context use on callbacks call.
   * @param {boolean=} once Flag to subscribe only once (and remove subscription after first call).
   */
  subscribe: function(channel, subscription, context, once) {
    var channels = Backbone.Mediator.$channels;

    if (!channels[channel]) {
      channels[channel] = [];
    }

    channels[channel].push({
      fn: subscription,
      ctx: context,
      once: once || false
    });
  },

   /**
   * Subscribe to a channel once.
   * @param {string} channel Channel name.
   * @param {function} subscription Callback.
   * @param {*=} context Optional context use on callbacks call.
   */
  subscribeOnce: function(channel, subscription, context) {
    Backbone.Mediator.sub(channel, subscription, context, true);
  },

  /**
   * Trigger all callbacks for a channel.
   * @param {string} channel Channel name.
   */
  publish: function(channel) {
    var channels = Backbone.Mediator.$channels;
    var subscriptions = channels[channel];

    if (subscriptions) {
      var args = [].slice.call(arguments, 1);
      Backbone.Mediator.$channels[channel] = _.reject(subscriptions, function(subscription) {
        subscription.fn.apply(subscription.ctx, args);
        return subscription.once;
      });
    }
  },

  /**
   * Cancel subscriptions.
   * @param {string=} channel Channel name to un subscribe.
   * @param {function=} fn Callback to un subscribe.
   * @param {*=} context Context to match on subscription.
   */
  unsubscribe: function(channel, fn, context) {
    var nbArgs = _.size(arguments);
    if (!nbArgs) {
      Backbone.Mediator.$channels = {};
      return;
    }

    var channels = Backbone.Mediator.$channels;
    var subscriptions = channels[channel];
    if (subscriptions) {
      var newSubscriptions = [];
      if (nbArgs > 1) {
        newSubscriptions = _.reject(subscriptions, function(subscription) {
          return subscription.fn === fn && (!context || subscription.ctx === context);
        });
      }

      Backbone.Mediator.$channels[channel] = newSubscriptions;
    }
  }
};

// Shortcuts
Backbone.Mediator.sub = Backbone.Mediator.subscribe;
Backbone.Mediator.subOnce = Backbone.Mediator.subscribeOnce;
Backbone.Mediator.pub = Backbone.Mediator.publish;

Backbone.InlineTemplateManager = function() {
  this.initialize.apply(this, arguments);
};

Backbone.InlineTemplateManager.prototype = {
  initialize: function() {},

  /**
   * Load a template, store result in cache and execute callback
   * when template has been fetched.
   * @param {string} id Id of template to load.
   * @param {function} callback Callback to call with result of template.
   */
  $get: function(id, callback) {
    var html = id;
    if (_.isObject(id)) {
      html = id.tmpl;
      id = id.id;
    }
    callback.call(this, html, id);
  },

  /**
   * Fetch template and execute callback when template is retrieved.
   * @param {string} id Template id.
   * @param {function} done Callback function.
   * @param {*?} ctx Optional callback context (a.k.a this object).
   */
  $load: function(id, done, ctx) {
    this.$get(id, function(html, id) {
      done.call(ctx, html, id);
    });
  },

  $loads: function(array, done, ctx) {
    var map = {};
    var size = _.size(array);

    var onDone = _.after(size, function() {
      done.call(ctx, map);
    });

    var callback = function(html, id) {
      map[id] = html;
      onDone();
    };

    var iterator = function(id) {
      this.$get(id, callback);
    };

    _.each(array, iterator, this);
  },

  /**
   * Load template(s) and execute callback when template(s)
   * have been fetched.
   * @param {string|array} id Templates.
   * @param {function} callback Callback to call when templates are loaded.
   * @param {object=} context Callback context.
   */
  load: function(id, callback, context) {
    var fn = _.isArray(id) ? '$loads' : '$load';
    this[fn](id, callback, context);
  }
};

Backbone.inlineTemplateManager = new Backbone.InlineTemplateManager();

Backbone.DOMTemplateManager = function() {
  this.$cache = {};
  this.initialize.apply(this, arguments);
};

_.extend(Backbone.DOMTemplateManager.prototype, Backbone.InlineTemplateManager.prototype, {
  /**
   * Load a template, store result in cache and execute callback
   * when template has been retrieved.
   * @param {string} id Id of template to load.
   * @param {function} callback Callback to call with result of template.
   * @override
   */
  $get: function(id, callback) {
    var $objects = this.$cache;
    $objects[id] = $objects[id] || Backbone.$(id);
    callback.call(this, $objects[id].html(), id);
  },

  /**
   * Clear cache: clear a specific entry or entire cache.
   * @param {id?} id Id of cache entry to clear, optional.
   */
  $clear: function(id) {
    if (id) {
      delete this.$cache[id];
    } else {
      this.$cache = {};
    }
  }
});

Backbone.domTemplateManager = new Backbone.DOMTemplateManager();

Backbone.RemoteTemplateManager = function(options) {
  // Save bytes
  var that = this;
  var opts = options || {};

  that.$cache = {};
  that.prefix = opts.prefix || '/templates/';
  that.suffix = opts.suffix || '.template.html';
  that.initialize.apply(that, arguments);
};

_.extend(Backbone.RemoteTemplateManager.prototype, Backbone.DOMTemplateManager.prototype, {
  /**
   * Load a template, store result in cache and execute callback
   * when template has been fetched.
   * @param {string} id Id of template to load.
   * @param {function} callback Callback to call with result of template.
   * @override
   */
  $get: function(id, callback) {
    var promises = this.$cache;
    promises[id] = promises[id] || Backbone.$.get(this.$url(id));
    promises[id].done(function(html) {
      callback.call(this, html, id);
    });
  },

  /**
   * Build url related to a given template id.
   * @param {string} id Template id.
   * @return {string} Template URL.
   */
  $url: function(id) {
    return this.prefix + id + this.suffix;
  }
});

Backbone.remoteTemplateManager = new Backbone.RemoteTemplateManager();

Backbone.App = Backbone.View.extend({
  el: 'body',

  constructor: function() {
    window.app = this;

    var $ = Backbone.$;
    this.$window = $(window);
    this.$document = $(document);
    this.$body = $('body');
    this.$html = $('html');

    // Add css to know that javascript is enabled
    this.$html.addClass('js').removeClass('no-js');

    var location = window.location;
    this.url = location.protocol + '//' + location.host + location.pathname;

    this.views = {};
    this.router = null;

    Backbone.View.apply(this, arguments);
  },

  /** App events. */
  events: {
    'click .js-link': 'nav'
  },

  /**
   * Click handler used to manage navigation.
   * @param {Event} e Click event.
   */
  nav: function(e) {
    e.preventDefault();
    this.navigate(Backbone.$(e.currentTarget).attr('href'));
  },

  /**
   * Navigate to a given url.
   * @param {string} hash Path to navigate to.
   * @param {*=} trigger Flag to disable route event.
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
        trigger: !!trigger
      });
    }
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
Backbone.Router = (function(Router) {
  return Router.extend({
    constructor: function(options) {
      Router.apply(this, arguments);

      // Trigger history
      if (!Backbone.history.started) {
        var opts = options || {};

        var defaults = {
          silent: false,
          pushState: true
        };

        Backbone.history.start(_.extend(defaults, _.pick(opts, 'silent', 'pushState')));
      }
    }
  });
})(Backbone.Router);
Backbone.CompositeView = Backbone.View.extend({
  constructor: function(options) {
    this.$subviews = {};
    this.$cache = {};

    // Define default template manager
    var tmplManager = Backbone.defaultTemplateManager;
    if (tmplManager) {
      this.tmplManager = Backbone[tmplManager + 'TemplateManager'];
    }

    Backbone.View.apply(this, arguments);

    var opts = options || {};

    this.onInit(opts);
    if (this.isEmpty()) {
      this.postInit(opts);
    } else {
      this.onReady(opts);

      // View is already rendered, so this hook has to be triggered
      this.onRendered();
    }
  },

  /**
   * Hook that may be implemented and is called when view is fully initialized, i.e:
   * - Initialize function has been triggered.
   * - Event delegation is done.
   * - Subscriptions are done.
   */
  onInit: function() {},

  /**
   * Hook that may be implemented and is called when view is fully initialized but empty.
   * Default is to render view.
   * This function should be overriden to fetch view data.
   */
  postInit: function() {
    this.render();
  },

  /** Hook that may be implemented and is called when view is fully initialized but alreay rendered. */
  onReady: function() {},

  /**
   * Serialize view to json object that will be used to
   * render view.
   * @return {*} View Object.
   */
  toJSON: function() {
    return {};
  },

  /**
   * Override original dispose method to:
   * - Clear jQuery cache.
   * - Close current suviews.
   * @return {Backbone.CompositeView} this.
   * @override
   */
  dispose: function() {
    Backbone.View.prototype.dispose.apply(this, arguments);
    this.$clear();
    this.$closeSubviews();
    return this;
  },

  /**
   * Store jQuery element in jQuery cache.
   * @param {string} selector jQuery selector.
   * @return {Backbone.$} jQuery element.
   */
  $c: function(selector) {
    var $cache = this.$cache;
    if (!_.has($cache, selector)) {
      $cache[selector] = this.$(selector);
    }
    return $cache[selector];
  },

  /**
   * Clear jQuery cache.
   * @param {string=} selector jQuery selector to clear (optional, by default entire cache is cleared).
   * @return {Backbone.CompositeView} this.
   */
  $clear: function(selector) {
    if (!selector) {
      this.$cache = {};
    } else {
      delete this.$cache[selector];
    }
    return this;
  },

  /**
   * Close view.
   * @return {Backbone.CompositeView} this.
   */
  $closeSubview: function() {
    var views = [].slice.call(arguments);
    var iterator = function(view) {
      var cid = _.isString(view) ? view : view.cid;
      var subview = this.$subviews[cid];
      if (subview) {
        this.stopListening(subview);
        subview.remove();
        delete this.$subviews[cid];
      }
    };
    _.each(views, iterator, this);
    return this;
  },

  /**
   * Close all subviews.
   * @return {Backbone.CompositeView} this.
   */
  $closeSubviews: function() {
    _.each(this.$subviews, this.$closeSubview, this);

    // Try to search for subviews attached to view object
    var iterator = function(val, i) {
      if (val instanceof Backbone.View) {
        val.remove();
        this[i] = null;
      }
    };

    _.each(this, iterator, this);

    return this;
  },

  /**
   * Add subviews given in parameters.
   * @return {Backbone.CompositeView} this.
   */
  $addSubview: function() {
    var views = [].slice.call(arguments);
    var iterator = function(view) {
      this.listenToOnce(view, 'dispose', this.$closeSubView);
      this.$subviews[view.cid] = view;
    };
    _.each(views, iterator, this);
    return this;
  },

  /**
   * Read subview from DOM element.
   * For example:
   *   <div id="foo">
   *     Hello Subview
   *   </div>
   *
   * You can create a subview from this dom element with:
   *
   *    this.$readSubview('#foo', Backbone.View, {
   *      foo: 'bar'
   *    });
   *
   * This will create a new subview.
   * Options are optional and can be a function to execute.
   *
   * @param {string|Backbone.$} el View DOM element.
   * @param {*} ViewClass View class to instantiate.
   * @param {object|function=} options New view options.
   * @return {Backbone.CompositeView} this.
   */
  $readSubview: function(el, ViewClass, options) {
    var subviews = [];

    var iterator = function($elem, index) {
      var viewOptions = options || {};
      if (_.isFunction(viewOptions)) {
        viewOptions = viewOptions.call(this, index, $elem);
      }

      if (!viewOptions.el) {
        viewOptions.el = $elem;
      }

      subviews.push(new ViewClass(viewOptions));
    };

    _.each(this.$(el), iterator, this);
    return this.$addSubview.apply(this, subviews);
  },

  /**
   * Append subview to current view.
   * @param {object} view Sub view to append.
   * @param {string|object=} el Element to append to, optional, by default view element is used.
   * @return {Backbone.CompositeView} this.
   */
  append: function(view, el) {
    // Get element to append to: by default this is $el element
    var $el = el ? this.$(el) : this.$el;

    // Append subview
    $el.append(view.$el);

    // Add to subviews object
    this.$addSubview(view);

    return this;
  },

  /**
   * Append collection of models to view.
   * @param {Backbone.Collection} collection Collection to append.
   * @param {object} ViewClass Class of view to append.
   * @param {object|function=} opts Optios that will be give to created view.
   * @param {string|object=} el Element to append view to.
   * @return {Backbone.CompositeView} this.
   */
  appendCollection: function(collection, ViewClass, opts, el) {
    collection.each(function(model) {
      this.appendModel(model, ViewClass, opts, el);
    }, this);
    return this;
  },

  /**
   * Append models to view.
   * @param {Backbone.Model} model Model to append.
   * @param {object} ViewClass Class of view to append.
   * @param {object|function=} opts Optios that will be give to created view.
   * @param {string|object=} el Element to append view to.
   * @return {Backbone.CompositeView} this.
   */
  appendModel: function(model, ViewClass, opts, el) {
    var options = {};

    if (opts) {
      options = _.isFunction(opts) ? opts.call(this, model) : _.clone(opts);
    } else {
      options.model = model;
    }

    return this.append(new ViewClass(options), el);
  },

  /**
   * Get size of composite view, i.e. current number of subviews.
   * @return {number} Number of subviews.
   */
  $size: function() {
    return _.size(this.$subviews);
  },

  /** Hook to implement and called after view is rendered. */
  onRendered: function() {},

  /** Hook to implement and called before view is rendered. */
  preRender: function() {},

  /**
   * Render view.
   * @return {Backbone.CompositeView} this.
   */
  render: function() {
    // Try to get defined templates
    var templates = _.result(this, 'templates');

    if (templates) {
      // Fetch templates to render
      this.tmplManager.load(templates, this.$loaded, this);
    } else {
      // Else it is an empty view
      this.$el.empty();
    }

    return this;
  },

  /**
   * Transform partial object.
   * Each key may be an url, so by default only the last part of
   * url is keep, it is the id of partial template.
   *
   * Suppose you have following partials object:
   *
   *   {
   *      '/path/foo': 'foo template html',
   *      '/path/sub/bar': 'bar template html'
   *   }
   *
   * This function will return a new partials object equal to:
   *
   *  {
   *    'foo': 'foo template html',
   *    'bar': 'bar template html'
   *  }
   *
   * Note that you will have to be careful to not have same templates id.
   * For example: '/path/foo' and '/path/sub/foo' will have same template id.
   *
   * You should override this function with your custom logic if it does not fit
   * your need.
   *
   * @param {object} partials Original partials object.
   * @return {object} New partials object.
   */
  $partials: function(partials) {
    var results = {};
    _.each(partials, function(value, key) {
      var parts = key.split('/');
      var id = _.last(parts);
      results[id] = value;
    });
    return results;
  },

  /**
   * Function called when templates have been fetched.
   * @param {string|object} templates Loaded templates.
   * @return {Backbone.CompositeView} this.
   */
  $loaded: function(templates) {
    if (_.isString(templates)) {
      // Simple template that don't need partials
      this.$populate(templates);
    } else {
      // Need to extract partials
      // By default, main template is the first declared in original templates array
      var tmpl = templates[_.result(this, 'templates')[0]];
      var partials = _.extend(this.$partials(templates), _.result(this, 'partials'));
      this.$populate(tmpl, partials);
    }

    return this;
  },

  /**
   * Populate view, i.e. replace current html
   * with new html.
   * @return {Backbone.CompositeView} this.
   */
  $populate: function() {
    this.trigger('render:start', this);
    this.preRender();

    // HTML will be entirely redraw, so jQuery cache need to be cleared to avoid detached elements and memory leak.
    this.$clear();

    // Subviews will have to be redrawed.
    this.$closeSubviews();

    // Need to remove loader
    this.$hideLoader();

    var html = this.toHTML.apply(this, arguments);
    this.$el.html(html);

    this.onRendered();
    this.trigger('render:end', this);

    return this;
  },

  /**
   * Generate html view.
   * @return {string} HTLM.
   */
  toHTML: function(templates, partials) {
    var data = _.result(this, 'toJSON');
    return this.$compile(templates, data, partials);
  },

  /**
   * Compile function.
   * Default behavior is to delegate to Backbone.$compile function.
   */
  $compile: function() {
    return Backbone.$compile.apply(null, arguments);
  }
});
	return Backbone;
  }));
})(window, window.document);

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

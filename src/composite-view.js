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
  constructor: function() {
    this.$subviews = {};
    this.$cache = {};
    Backbone.View.apply(this, arguments);
  },

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
    for (var i in this) {
      if (_.has(this, i) && this[i] instanceof Backbone.View) {
        this[i].remove();
        this[i] = null;
      }
    }

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
   * Get size of composite view, i.e. current number of subviews.
   * @return {number} Number of subviews.
   */
  $size: function() {
    return _.size(this.$subviews);
  }
});

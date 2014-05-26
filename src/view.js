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
    for (var i in this) {
      if (_.has(this, i)) {
        this[i] = null;
      }
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
  },
});

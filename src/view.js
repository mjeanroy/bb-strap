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
        _.extend(this, options || {});
        View.apply(this, arguments);
        this.setSubscriptions();
      }
    });
})(Backbone.View);

_.extend(Backbone.View.prototype, {

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

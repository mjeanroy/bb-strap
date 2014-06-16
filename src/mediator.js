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

      // Use standard loop to keep same array instance
      for (var i = 0, size = subscriptions.length; i < size; ++i) {
        var subscription = subscriptions[i];
        subscription.fn.apply(subscription.ctx, args);
        if (subscription.once) {
          subscriptions.splice(i, 1);
          i--;
          size--;
        }
      }
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
      var size = subscriptions.length;
      if (nbArgs > 1) {
        // Use standard loop to keep same array instance
        for (var i = 0; i < size; ++i) {
          var subscription = subscriptions[i];
          if (subscription.fn === fn && (!context || subscription.ctx === context)) {
            subscriptions.splice(i, 1);
            i--;
            size--;
          }
        }
      } else {
        subscriptions.splice(0, size);
      }
    }
  }
};

// Shortcuts
Backbone.Mediator.sub = Backbone.Mediator.subscribe;
Backbone.Mediator.subOnce = Backbone.Mediator.subscribeOnce;
Backbone.Mediator.pub = Backbone.Mediator.publish;

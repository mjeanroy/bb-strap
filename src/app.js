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
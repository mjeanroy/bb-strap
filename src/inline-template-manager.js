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

Backbone.InlineTemplateManager = function() {
  this.initialize.apply(this, arguments);
};

Backbone.InlineTemplateManager.prototype = {
  initialize: function() {},

  /**
   * Load a template, store result in cache and execute callback
   * when template has been fetched.
   * @param {string} id Id of template to load.
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
   */
  load: function(id, callback, context) {
    var fn = _.isArray(id) ? '$loads' : '$load';
    this[fn](id, callback, context);
  }
};

Backbone.inlineTemplateManager = new Backbone.InlineTemplateManager();

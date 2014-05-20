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

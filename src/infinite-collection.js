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

/**
 * Implementation of infinite collection that can be used
 * with an infinite scroll view.
 * This collection can be used to fetch collection page by page.
 *
 * When a page is fetched, current collection is not reset.
 *
 * Note that when a fetch occured with reset parameter set to true,
 * collection is re-initialized to the first page.
 *
 * For example:
 *
 *   // Collection is empty
 *   var myCollection = new Backbone.InfiniteCollection();
 *
 *   // First page is fetched
 *   // Event 'sync:page' will be triggered
 *   myCollection.nextPage();
 *
 *   // Second page is fetched
 *   // Event 'sync:page' will be triggered
 *   myCollection.nextPage();
 */
Backbone.InfiniteCollection = Backbone.Collection.extend({
  constructor: function() {
    var pagination = _.result(this, 'pagination');
    this.page = pagination.firstPage - 1;
    this.pageSize = pagination.pageSize;

    Backbone.Collection.apply(this, arguments);
  },

  pagination: {
    firstPage: 0,
    pageSize: 20,
    pageName: 'page',
    pageSizeName: 'pageSize'
  },

  nextPage: function(options) {
    // Extract pagination parameters names
    var paramsNames = _.result(this, 'queryParams');
    var pageName = paramsNames.pageName;
    var pageSizeName = paramsNames.pageSizeName;

    var params = {};
    params[pageName] = this.page + 1;
    params[pageSizeName] = this.pageSize;

    var opts = options || {};

    // Append pagination parameters as query string parameters
    opts.data = _.extend(opts.data, params);

    // Override original success function
    var success = opts.success;
    opts.success = function(collection, response, requestOptions) {
      // Update current page number
      collection.page = collection.page + 1;

      // Trigger event
      collection.trigger('sync:page');

      // Trigger original success
      if (success) {
        success.apply(this, arguments);
      }

      success = opts = null;
    };

    return this.fetch(options);
  }
});
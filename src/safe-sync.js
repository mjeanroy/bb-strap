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

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

// Turn on safe synchronization operations
Backbone.safeSync = 'abort';

// Simple bindings can be disabled to used a dedicated plugin
// like Backbone.stickit.
Backbone.bindings = true;

// Id of default template manager
Backbone.defaultTemplateManager = 'remote';

// By default model / collections and view options are automatically
// attach before initialize function
Backbone.attachOptions = true;

// Default settings for delegated events
Backbone.$events = {
  preventDefault: true,
  stopPropagation: false,
  stopImmediatePropagation: false
};

// Default template compilation function
Backbone.$compile = function(template) {
  return _.isFunction(template) ?
    template.apply(this, [].slice.call(arguments, 1)) :
    _.template.apply(_, arguments);
};

// Default attach function, can be overriden to attach options
// to a particuler attribute of given object
// For example, this can be overriden to set options object to an 'options'
// attribute on object:
//
//   Backbone.$attach = function(obj, options) {
//     obj.options = options;
//     return obj;
//   };
Backbone.$attach = function(obj, options) {
  return _.extend(obj, options);
};

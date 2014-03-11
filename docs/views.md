# BackboneStrap

## Views

Backbone is a really awesome framework that let you define models and collections.
On the opposite, you will need a lot of boilerplate code to easily create and manage views. Using BackboneStrap, you will be able to create views with a lot of new pre-built functions.

### API
___
```javascript
  /**
   * Initialization function called when view is empty.
   * Function is called after `initialize`function if and only if view is empty.
   * Default operation is a called to the `render`function but it should be overriden with
   * your own logic.
   */
  postInit()

  /**
   * Function called once a view is rendered.
   * This is a no-op function and should be overriden with your own logic.
   */
  onReady()

  /**
   * Check if view is empty, i.e. dom content is empty.
   * @return {boolean} True if view is empty, false otherwise.
   */
  {boolean} isEmpty()

  /**
   * Get item from dom and store result in internal cache.
   * @param {string} selector Selector.
   * @returns {Backbone.$} Result Element.
   */
  {Backbone.$} $c(selector)

  /**
   * Clear internal cache.
   * @return {object} this (for chaining)
   */
  {Backbone.StrapView} $clear()

  /**
   * 
   */
  {Backbone.StrapView} $read(varName, objName);
```

___
> postInit

This function should be used to fetch mandatory models or collections used to render view. Be careful, this function will be called if and only if your view is empty at initialization (i.e. is not already rendered server side).

Example:

```javascript
// Post initialization will be called because el element is empty

var myEmptyView = new Backbone.StrapView({
    el: '',
    postInit: function() {
        console.log('post initialization');
        this.render();
    }
});
```

___
> onReady

This function should be used to fetch mandatory models or collections used to render view. Be careful, this function will be called if and only if your view is empty at initialization (i.e. is not already rendered server side).

Example:

```javascript
// Post initialization will be called because el element is empty

var myEmptyView = new Backbone.StrapView({
    onReady: function() {
        // Add logic needed when view is rendered
        // For example, this can be used to initialize jQuery plugins
        $('input').autocomplete();
    }
});
```
___
> isEmpty

You will be able to check if a view is empty or not (i.e. if a content is displayed in el element).

Example:

```javascript
var myEmptyView = new Backbone.StrapView({
    el: $('<div></div>')
});

var myView = new Backbone.StrapView({
    el: $('<div>foo</div>')
});

// isEmpty will return true because no visible content is displayed
console.log(myEmptyView.isEmpty());

// isEmpty will return false because 'foo' is displayed
console.log(myView.isEmpty());
```
___
> $c

`$c` is an alias for `Backbone.$` but a cache will automatically be managed (next selector will not be retrieved from DOM if it is already available form internal cache).

```javascript
var myView = new Backbone.StrapView({
    el: $('<div><span id="foo">foo</span></div>')
});

console.log(myView.$c('#foo'));

// #foo element will not be retrieved from DOM because element is already in $cache
console.log(myView.$c('#foo'));
```
___
> $cache

Internal cache is accessible using `$cache` property.

```javascript
var myView = new Backbone.StrapView({
    el: $('<div><span id="foo">foo</span></div>')
});

console.log(myView.$c('#foo'));
console.log(myView.$cache);
```

___
> $clear

Note that you can clear internal cache using `$clear` function.

```javascript
var myView = new Backbone.StrapView({
    el: $('<div><span id="foo">foo</span></div>')
});

console.log(myView.$c('#foo'));
console.log(myView.$cache);

myView.$clear();
console.log(myView.$cache);
```


layer# offtonic-audioplayer
JavaScript and WebAudio-based tone generator and audio player for web apps

# Overview

Offtonic Audioplayer is a simple-to-use audio player in JS that can be used simply in any (modern-enough) browser-based project with no need for other dependencies.  Simply import offtonic-audioplayer.js and turn on your `Player`:

    import o from './offtonic-audioplayer.js';
    o.player.on();

Then, create your tones and play them!

	let tone = o.createComponent({
		className: 'Tone',
		frequency: 432, // TROLOLOL
		gain: 0.1
	});
	tone.play();
	// ...
	tone.stop();

When you no longer want the `Player` active, just turn it off:

	`o.player.off()`

Offtonic Audioplayer can be used in an entirely configuration-based manner, meaning that you can use JSON to describe your sound rather than actual code.

Behind the scenes, Offtonic Audioplayer uses `AudioWorkletNode`s, which may not yet be supported in all browsers.  As of this writing, most of its features are supported on the latest Chrome, Firefox, and Safari (caveat: not all users are *on* the latest Safari), though there might be some things that don't work on iOS.  Previous iterations were based on `ScriptProcessorNode`s, which are available on all modern browsers, but that API is deprecated (and its performance is terrible since it executes an audio callback on the main thread).  As of this writing, Firefox doesn't allow you to import modules in a worklet, so to get around this and allow processor classes to inherit from other processor classes, a global object called `OfftonicAudioplayer` is added to the `AudioWorkletGlobalScope`, and the processor classes are added there so that they can be retrieved in other processor class files.  This workaround circumvents the module system, so it's up to you to ensure that modules are added to the `AudioContext` in the correct order.  It's a bit of a headache, but at least Firefox users can still use your app, right?

I'm sure you'll want to define your own custom oscillators and filters and whatnot, so the basic abstract classes should be fairly easy to subclass, but the best documentation for how to do that is, naturally, the code itself.  This document will not list every single detail of what you need to know to do that, but I'll give you hints where applicable.




## Properties in the API

The Offtonic Audioplayer API is based on setting properties on components.  A component (subclass of `Component`) is basically any bit of the Offtonic Audioplayer with its own behavior, and a property is some fundamental aspect of the component.  For example, a `Tone` is a component that produces an audio signal when played, and `frequency` is one of its properties, which can be a simple number or even another component that produces a number.  You can access the value by calling `tone.getProperty('frequency')` (assuming `tone` is an instance of `Tone`), and you can set the value at `Tone` creation by passing in an object to `o.createComponent` with a `frequency` field or later through `setProperties()`, again by passing it an object with a `frequency` field.  If the component holds an `AudioNode`, then it is also an `AudioComponent`.

A property value can frequently be a properties object defining another `Component` instance.  For example, the `generator` property of `Tone` can be a properties object defining, say, a `SineOscillator`.  This property could itself have other `Component` instances as properties, etc.  If the value for a property is an object with `className` as a field, it will recursively be turned into a component with `o.createComponent`.

In this document, I'm using "field" to refer to the simple JS language construct of sticking a thing in a thing, and "property" is reserved for these fundamental aspects set through the API.  In JS lingo generally, what I'm calling a field is often called a property, but I'm not doing that.  Why?  Because I'm using "property" for the fundamental aspects and I don't want to confuse people further, so I'm using "field" for the JS property and "property" for the Offtonic Audioplayer property.  Got it?

Properties are set at component instantiation by calling either `(new <ComponentType>()).withPlayer(<player>).withRegistry(<registry>).withTuning(<tuning>, <hasOwnTuning>).withProperties(<props>)` or `o.createComponent(<props>, <player>, <registry>, <tuning>)`, with `<props>` being an object containing values for some or all of the properties, and are modified later by calling `component.setProperties(<props>)`.  The only difference is that `withProperties(<props>)` will use default values for missing properties in the `<props>` object, while `setProperties(<props>)` will ignore missing properties.  You should *always* call `withProperties(<props>)` to ensure that the component gets initialized correctly.  (Note that `<props>.className` has a special meaning, so `className` should never be a property name or bad things will happen!)  If you create a component from the global object `o`, the `player` is optional and will default to the default player, as are the `registry` and `tuning`.  More about the `Player`, `Registry`, and `Tuning` instances later.

Each property is set via a setter method named in the property definition.  These setter methods get called in the order the properties were defined, starting with the highest superclass, `Component`.

To define a property, stick an object in the `static newPropertyDescriptors` object of the component class you're creating with the fields below.  You can override a property in a subclass by redefining it in the subclass's `newPropertyDescriptors` array, which could be useful if you want to change a default.  When the class is first instantiated, the static field `propertyDescriptors` will hold all of the component's properties.

`Component`s always have a `Player` instance, a `Registry` instance, and a `Tuning` instance, and in most cases, the `Player` and `Registry` at least are the default instances.  The `Player` also sets up a default `Tuning`.  You can specify a different `Tuning` as a pseudo-property: simply include it as the `tuning` field in the `<props>` object defined above.




### Property Descriptor Fields

#### `name` — *string* (required) — key in `propertyDescriptors` object
Property name, which is also the key in the `propertyDescriptors` object (the value is an object containing any other fields of the descriptor).  When creating a new `Component` or setting its properties, you pass in a property object; the property name is the key you should use to provide a value for this property.  You can get a property from a component with `getProperty(<propName>)`, but it's generally assumed that the value will be stored in the `<propName>` field of the component.

#### `defaultValue` — value or *object* (optional)
Default value of the property if no value is provided at object creation (as part of the `withProperties()` call).  This can be an object containing the properties to define a new component.  A default value for a property is set on the component at the same time that a non-default value would have been set for that property; if a value *is* provided, a `Component` instance defined in the `defaultValue` property does not get instantiated.

#### `value` — value or *object* (optional)
Value of the property, regardless of whether a value is provided (any provided value is ignored).  Use this in subclasses that fix a specific value for a superclass property.

#### `getter` and `setter` — *string* (optional)
The values are method names that get called when `getProperty()` and `setProperty()` are called.  `Component` provides `genericGetter()` and `genericSetter()` that do the basics, but if you need more functionality, or if your property works differently from the default way of handling them, you can provide a getter and/or setter.  If `getter` is `null`, calling `getProperty()` will always return `undefined`; if `setter` is `null`, calling `setProperty()` will have no effect.

#### `connector` and `disconnector` — *string* (optional)
The values are method names that get called when `connectProperty` and `disconnectProperty()` are called.  `AudioComponent` assumes that properties that need it (those that have `isAudioParam` set to `true`, for example, or `inputIndex` set to a non-negative number) possess a `connectTo()` method that connects the property's `node` field to the primary component's `node` field, as well as a `disconnectFrom()` method to undo this.  These `node` fields are `AudioNode` instances, whether native nodes or `AudioWorkletNode`s, and they work as prescribed in the WebAudio API docs.  If you need any special behavior, perhaps because you're connecting to a node other than the component's `node` field, you should provide `connector` and/or `disconnector` methods for the property.  These should not be set to `null`.

#### `cleaner` — *string* (optional)
The value is a method name that gets called when `cleanupProperty()` is called, with the goal of freeing resources associated with this property.  `Component` provides `genericCleaner()` that does the basics, but if you need more functionality, or if your property works differently from the default way of handling them, you can provide a cleaner.  If `cleaner` is `null`, the property will not be cleaned up automatically at all, and you'll probably want to do that yourself somehow.

#### `isAudioParam` — *boolean* (optional) — default `false`
#### `paramName` — *string* (optional) — default value is the value of the `name` property
Indicates that a property represents an `AudioParam`, a parameter of an `AudioNode` named `paramName` (see the WebAudio API docs).  This means that the value must either be a number or an `AudioComponent` with a `connectTo()` method that connects some `AudioNode` (which provides numbers at the audio rate) to the `AudioParam`.  In addition, if the `node` is an `AudioWorkletNode` and the value of this property is a number, that number will be added to the `options.parameterData` object when creating the node as its initial value.  If the value is a string, it will be turned into a `Note` audio component that turns the string into a number via the component's `tuning`.

#### `isProcessorOption` — *boolean* (optional) — default `false`
#### `processorOptionName` — *string* (optional) — default value is the value of the `name` property
Indicates that a property value should be passed to the constructor of the `AudioComponent`'s `AudioWorkletNode` node; it will be added to `options.processorOptions` under a key specified by `processorOptionName` if that is present or just the `name` property if not.  The value can typically be anything, but objects get copied using the structured clone algorithm, which does not allow functions, so it's actually fairly limited.

#### `inputIndex` — *number* (optional)
Indicates which input on the audio component's `node` field this property should connect to.  The property must be an audio component, since `AudioNode` inputs must be other `AudioNode`s.  If `inputIndex` is not provided, it's assumed that the property is not connecting to an input on the `node` field.

#### `isAudioComponent` — *boolean* (optional) — default `false`
Indicates that the property must be an `AudioComponent` instance rather than, say, a number.  If the value for the property is a number, it will be turned into a `ConstantGenerator` audio component that outputs the number, and if it is a string, it will be turned into a `Note` audio component that turns the string into a number via the component's `tuning`.

#### `isComponentArray` — *boolean* (optional) — default `false`
Indicates that a property is an array of values to be individually created as `Component` instances (if appropriate).  If you pass an array to a property without `isComponentArray` set to `true`, the contents of the array will not be processed in any way, including any objects that would otherwise get created as `Component`s.  Setting this to `true` will instead create any `Component`s that need to be created.  Strings in the array will be interpreted as `Note`s.

#### `passThrough` — *string* (optional)
Indicates that a property actually belongs inside an inner `Component` of some sort.  Since this inner `Component` is generally not created at the same time as the outer `Component` itself, you are responsible for setting that property on that inner `Component`'s creation.  However, once it is created, calls to set the property will also set it on the inner `Component`, and calls to clean up the property will also clean it up on the inner `Component` (same for connecting/disconnecting the property in `AudioComponent`).




### Instruments

Having to keep entering the same properties can be annoying.  But there's a solution: instruments.  An instrument is an object with a collection of properties that gets stored in the `orchestra` with a `name`.  When a `Component` definition has an `instrument` field, the instrument (or instruments) named in the field populate the properties with their own if the definition doesn't already contain them.  It's best to explain this with an example:

	player.orchestra.add({
		name: 'test1',
		className: 'Tone',
		gain: 0.2,
		envelope: {
			instrument: ['test2', 'test3']
		}
	});
	player.orchestra.add({
		name: 'test2',
		release: 250
	});
	player.orchestra.add({
		name: 'test3',
		className: 'ADSREnvelope',
		attackGain: 3,
		release: 20
	});

	const tone1 = player.createComponent({
		instrument: 'test1',
		frequency: 256
	});

Here are three instruments added to the `orchestra` (which lives in the `Registry`, which lives in the `Player`).  The first one has a `name` of `test1`, and it contains several fields defining properties, including a `className`, and also including a property with its own `Component` definition inside, `envelope`, which has an `instrument` property of `[test2, test3]`.  Instruments are not resolved until `Component` creation, so it's OK that we haven't added `test2` and `test3` to our `orchestra` yet.  The second one has a `name` of `test2` and just one property, a `release` set to `250`, while the third one, with a `name` of `test3`, has a few properties, including a `release` of `20`.  To actually use an instrument in your definition, simply include the `instrument` key, where the value is either a string with the `name` of the instrument you want to use or an array of such `name`s.

Finally, we have a definition of a `Component` passed to `player.createComponent()` that features an `instrument`.  Let's see how it gets applied.  First, all of the properties of `test1` get added to (a copy of) the property definition:

	{
		frequency: 256,
		className: 'Tone',
		gain: 0.2,
		envelope: {
			instrument: ['test2', 'test3']
		}
	}

Actually, this isn't quite right, because the way the recursion works, `envelope` hasn't been added yet, but when it is added, it will contain the result of applying the instruments to its sub-object.  The instruments in the array get applied in the order they're given, so the first step of that envelope object would look like this:

	{
		instrument: 'test3',
		release: 250
	}

Now we apply `test3`.  Notice that instruments don't overwrite existing properties, so the fact that `test3` has `release: 20` gets ignored and we get:

	{
		release: 250,
		className: 'ADSREnvelope',
		attackGain: 3
	}

The whole `Component` definition is therefore:

	{
		frequency: 256,
		className: 'Tone',
		gain: 0.2,
		envelope: {
			release: 250,
			className: 'ADSREnvelope',
			attackGain: 3
		}
	}

If you want to play a whole sequence of `Tone`s that sound the same except for their frequency, you could define an instrument like `test1` and create components with a concise definition like above.  Note that instruments will be resolved inside other objects recursively only if those objects have either a `className` field or an `instrument` field, so something like the following will not be resolved because the object does not contain a `className` or `instrument` field, even though one of its sub-objects does:

	{
		foo: {
			instrument: 'bar'
		}
	}

Instruments are applied when `Component.create()` is called.




### References

A property can also be a reference to an existing `Component` rather than a whole new `Component` that gets built at instantiation.  Ordinarily, a `Component` manages the lifecycle of its subcomponents: the subcomponent is passed in as an object with a bunch of property values, and `o.createComponent()` is called on that object to build the `Component` recursively.  But if you want to share a `Component` instance across multiple `Component`s, you can't quite do that.  If you specify the `name: <name>` property when you define a `Component`, the `Component` instance will be added to the `Component`'s `registry` (which is `o.player.registry` by default).  Then, when you want to reference that `Component` as a property value, just use `{ref: <name>}` as the value.  For example:

	const ramp = o.createComponent({
		name: 'ramp',
		className: 'LinearGenerator',
		startValue: 0,
		startTime: 0,
		endValue: 0.2,
		endTime: 1000
	});

Now, a `LinearGenerator` named `ramp` is in the defaul `registry`.  Let's use it:

	const rampedTone = o.createComponent({
		className: 'Tone',
		frequency: 262,
		duration: 1000,
		gain: {
			ref: 'ramp'
		}
	});

`rampedTone` now has `ramp` for its `gain` property.  However, `rampedTone` is not managing `ramp`'s lifecycle, so if you want to use it, you'll have to turn it on (and clean it up) explicitly:

	ramp.on();
	rampedTone.play();
	... 
	ramp.cleanup();

Cleaning up the `name` property also removes the `Component` from the `registry`, so calling `cleanup()` on the `Component` when finished is good practice for decluttering things.  You can also register a `Component` that's a property of something long-lived, so that other `Components` can use it as a property inside the lifetime of the longer-lived `Component`.

Within a `Component`, a reference is stored as the reference object `{ref: <name>}`, so to get the actual `Component` behind it, you can call `getProperty(<propName>)`.  If you need access to the reference object itself, you can call `getProperty(<propName>, false)`, and if you already have the reference object, you can call `resolveReference(<referenceObject>)` to get the `Component` from the `registry`.  If you're implementing your own `connector`s, `disconnector`s, `cleaner`s, etc., you'll need to be cognizant of the fact that you shouldn't try to manage the lifecycle of a `Component` you've referenced.  For a `connector` or `disconnector`, remember *not* to turn the `AudioComponent` `on()` or `off()` if it's a reference.  In a `setter` or `cleaner`, remember not to call `cleanup()` on the referenced `Component` itself.  Note that a reference object is not a `Component`, so if you're looking at the actual contents of the field that holds the property rather than calling `getProperty()`, you can very easily tell whether you should call `cleanup()` on it.

You can also define multiple `Registry` instances (and pass them into `o.createComponent()`) to create multiple namespaces for your references.  This way, with multiple `Player`s and `Registry`s, you can have potentially multiple audio applications in the same page without conflict.




# Class Reference

## Global

The `Global` singleton class (found in `offtonic-audioplayer.js`, imported in the example as `o`) is the primary entry point for interacting with Offtonic Audioplayer.  All of the public classes are available from `Global`, as well as some other player-scope stuff.  For example, the `Tone` class is available at `o.Tone`.  If you implement your own `Component` subclasses, you should add them to the `Global` singleton using `registerClass()`, and if you write any new `AudioWorkletProcessor`s, you should add them using `addModule()`.

### Instance Fields

#### `debug` — *boolean* — default value: `false`
Set this to `true` if you want to see warnings in the console (anything displayed with `o.info()`, o.warn()`, or `o.error()`).

#### `modulesToAdd` — *`Array` of strings* — default value: `[]`
A queue of processor modules to add to the `AudioWorklet` in order.  Since `AudioWorklet.prototype.addModule()` is asynchronous and the processor modules require a specific order, this order needs to be preserved somewhere, and that somewhere is here.  Do not alter this field directly.  Use `queueModule()` to add modules to the list then `addAllModules()` to add the modules to the `AudioWorklet` and remove them from the list.

#### `ctx` — *`AudioContext`*
The `AudioContext` for the `AudioNode`s used by Offtonic Audioplayer.

#### `classRegistry` — *`ClassRegistry`*
An object mapping `className` property values to class constructors.  You should not have to access this directly.

#### `baseHref` — *string*
URL of the base directory of Offtonic Audioplayer.  Useful if you need to provide absolute paths to something.

#### `player` — *`Player`*
Default `Player` instance; all `Component`s created with `createComponent()` have this as their `player` instance if another is not provided.

### Instance Methods

#### `registerClass(<classInstance>)`
Adds a class to the class registry so that it can be instantiated when a properties object with a `className` is passed to `createComponent()`.  `<classInstance>` is the class itself (the constructor function), which should be a subclass of `Component` or instantiation will not work; the name will be the JS-provided `name` field on the class (the name that it was declared with, not the variable used to hold it).  If you are adding any new `Component` subclasses, you should register them here so that you can specify them in properties.  Registered classes are also added as instance properties of `o`, under the same name as the class itself.

#### `getClass(<className>)` — *`Component` subclass constructor*
Retrieves the class instance from the class registry with the given `<className>`, if it exists.  You shouldn't have to call this method directly, since this is called from `createComponent` already.

#### `addModule(<modulePath>)` — *`Promise`*
Adds to the `AudioContext`'s `AudioWorklet` an `AudioWorkletProcessor` subclass located at `<modulePath>`, a (string) URL path relative to the Offtonic Audioplayer's base directory.  If you create any `AudioWorkletProcessor` subclasses, you should add them here.  Adding the module to the audio context's `AudioWorklet` is a required step in the WebAudio API, but the paths can be confusing since relative URLs are actually compared to the HTML file the script is loaded from rather than the location of the module you're currently in.  This function simplifies this complication by considering all URLs to be relative to the base directory and turning them into absolute URLs with the `baseHref` field.  The operation to add a module is asynchronous, so this method returns a `Promise` that resolves when the module has been added (or rejects on error).  If the order of adding modules is important for your application, you may want to use `queueModule()` and `addAllModules()` instead.

#### `queueModule(<modulePath>)`
Adds to the `modulesToAdd` queue an `AudioWorkletProcessor` subclass located at `<modulePath>`, a (string) URL path relative to the Offtonic Audioplayer's base directory.  You must later call `addAllModules()` to actually add the processors (as in `addModule()`) and empty the queue.  See the documentation for `addModule()` for details on the `<modulePath>`.

#### `addAllModules()`
Adds to the `AudioContext`'s `AudioWorklet` all of the `AudioWorkletProcessor` subclasses located at the paths in `modulesToAdd`, in order from the first element to the last.  Since adding a module is asynchronous, this method waits until each module addition is completed before beginning the next, thus ensuring the proper order.

#### `addModulesFromList(<list>)`
`<list>` should be an `Array` of module paths, as described in the documentation for `addModule()`.  This method will add the first module in the list (if it isn't empty) to the `AudioWorklet`, then when that's done, it will call itself on the list starting from its second element.  You should probably not call this method directly; use `eueueModule()` and `addAllModules()` instead.

#### `createComponent(<properties>, <parent>, <player>, <registry>, <tuning>)` — *`Component` subclass*
Creates a `Component` instance based on `<properties>`, which is an object whose keys are property names and whose values are the property values, including the key `className`, whose value should be a class that has been previously registered with `registerClass()` (built-in classes are already registered).  `<player>` is the `Player` instance that should be attached to the component; if it is not provided (`null` or `undefined`), the default player (the global object's `player` field) will be used by default.  `<parent>` is the parent object of the `Component`; if it is not provided, the `Player` will also be the `<parent>`.  Similarly, `<registry>` is the player's `registry` unless another is provided, and `<tuning>` is the player's `tuning` unless another is provided.  If any properties themselves define a new component (by containing `className`), `createComponent()` will be recursively called on them, with the same `<player>` argument.

#### `info(...<args>)`
#### `warn(...<args>)`
#### `error(...<args>)`
If `debug` is set to `true`, calls `console.info(<args>)`, `console.warn(<args>)`, and `console.error(<args>)`, respectively.  Note that `info()` does not (currently) provide a call stack in Chrome, while `warn()` and `error()` do.





## OfftonicAudioplayer

The `OfftonicAudioplayer` is a global object (not a class) in the `AudioWorkletGlobalScope`.  You can access it in any processor class file by simply using its name, since it is in the global scope (but it is not in `window`, so you can't access it outside a worklet).  Its purpose is to allow processor classes to access other processor classes in other files without having to use ES6's module system, which Firefox has not implemented for worklets as of this writing.  You can simply use `OfftonicAudioplayer.<className>` to access any class that has been registered.  This object is defined in `AudioComponentProcessor.js`, which means that that module always must be added to the `AudioContext`'s `AudioWorklet` first.

### Object Fields

#### `<className>` — *`class`*
A class that has been registered.  For example, once `AudioComponentProcessor` has been registered, other classes can extend `OfftonicAudioplayer.AudioComponentProcessor` without needing any `import` statements.

#### `tunings` — *`object`*
An object whose keys are the registered names of `Tuning`s and whose corresponding values are their `TuningProcessor`s.  This allows tuning calculations to happen in the worklet scope.  (Defined in `TuningProcessor.js`.)

### Object Methods

#### `registerProcessor(<processorName>, <processorConstructor>)`
Adds the `<processorName>` key to `OfftonicAudioplayer`, with `<processorConstructor>` as the value, and also calls the `AudioWorkletGlobalScope`'s `registerProcessor(<processorName>, <processorConstructor>)`, which registers the processor with the global scope and allows an `AudioWorkletNode` to use a particular processor by name.  You must call the global scope's version of this method to actually use your processor, but if you call `OfftonicAudioplayer`'s version, you will also be able to access the constructor through this global object.

#### `getTuning(<tuningName>)` — *`TuningProcessor`*
Retrieves the `TuningProcessor` stored in the `tunings` object with key `<tuningName>`.  (Defined in `TuningProcessor.js`.)

#### `addTuning(<tuningName>, <tuningProcessor>)` — *boolean*
Adds the `<tuningName>` key to the `tunings` object, with `<tuningProcessor>` as the value.  This allows other processors to find the named tuning and query it.  Returns `false` if a different `TuningProcessor` already exists with that name (and doesn't add `<tuningProcessor>`); `true` otherwise.  (Defined in `TuningProcessor.js`.)

#### `removeTuning(<tuningName>)`
Deletes the key of `<tuningName>` from the `tunings` object to clean up tunings that no longer need to be kept around.  (Defined in `TuningProcessor.js`.)




## ClassRegistry

The `ClassRegistry` singleton simply contains an object whose keys are class names and whose values are constructors.  You shouldn't have to interact with this class directly.

### Instance Fields

#### `o` — *`Global`*
It's just here to access the logging functionality.

#### `classes` — *object*
An object whose keys are class name strings and whose values are their corresponding class instance (constructor function).

### Instance Methods

#### `register(<className>, <classInstance>, <overwrite>)`
Adds the `<className>` key with the `<classInstance>` value to the `classes` field.  If it already exists, an error is shown in the console unless `<overwrite>` is `true`, in which case the old value is overwritten by the new one.

#### `get(<className>)` — *`Component` subclass constructor*
Retrieves the value registered under `<className>`.




## Registry

A library/namespace for `Component` references, useful when multiple `Component`s share the same actual `Component` instance for some property.  This is *not* a singleton, since it could be useful to define separate namespaces (for example, in the case of multiple audio applications on the same page whose names may intersect).  The `Player` instance creates its own `Registry`, which is assigned by default to any new `Component`s associated with that `Player`.

### Instance Fields

#### `components` — *object where the keys are names and the values are `Component` instances* — default value `{}`
The object that holds the component library.

#### `orchestra` — *`Orchestra`*
An `Orchestra` instance.

### Instance Methods

#### `add(<component>)` — *boolean*
Adds `<component>` to `components`, provided that it has key `name`, and returns `true`.  If it doesn't, or the name already exists, returns `false`.

#### `get(<name>)` — *`Component`*
Retrieves the `Component` with the given `<name>`, or `null` if it can't find it.

#### `remove(<name>)`
Removes the `Component` with the given `<name>` from the registry (if it's there).

#### `contains(<name>)` — *boolean*
Returns `true` if `<name>` is in `components` and `false` otherwise.




## Orchestra

The `Orchestra` works similar to the `Registry` (and is contained inside it), but it stores instruments instead: its `instruments` field is an object whose keys are instrument `name`s and whose values are the instrument definitions (see the above section on Instruments).  When a `Component` is about to be instantiated and its definition has an `instrument` field, it first has to resolve that instrument through the `Orchestra`.  The `Orchestra` is available at `player.orchestra` or `this.orchestra` for any `Component`.

### Instance Fields

#### `instruments` — *object*
An object whose keys are instrument `name` strings and whose values are their corresponding instrument property definitions.

### Instance Methods

#### `applyInstruments(<properties>)` — *object*
Copies the `<properties>` to a new object, recursively adding any properties from instruments named by `instrument` fields inside.  For an example, see the section on Instruments above.  This gets called at `Component` creation; you should never have to call it yourself.

#### `add(<instrument>)` — *boolean*
Adds the `<instrument>` to the `instruments` object under key `<instrument>.name` if it exists, returning `true`.  If that field does not exist or if the key already exists, `false` is returned instead.  You should call this to register any instruments that you create.

#### `get(<name>)` — *object*
Returns the instrument with `name` `<name>`, if it exists.  If it does not, returns `{}`.

#### `remove(<name>)`
Removes the instrument named `<name>` from `instruments`, if it exists.




## Player

A `Player` instance represents a destination for the `AudioNode`s of the `AudioComponent`s (generally `Playable`s, but you can play pretty any object that implements a few methods).  The player's `node` field is a `GainNode` to which playable nodes are connected, and that `GainNode` is connected to the `AudioContext`'s `destination` (generally the speakers) by default, but you can connect it to something else if you'd like.  In previous iterations of Offtonic Audioplayer, the `Player` was the `ScriptProcessorNode` responsible for playing all of the sound generated by the `AudioComponent`s, but in this current `AudioWorklet` implementation, that is not possible, so the `Player`'s job is less involved.  The `Player` does provide an opportunity to adjust master volume, master filters, etc., and since it's easy to simply create multiple `Player` instances and connect them to different destinations, including other `Player`s, you can even create multiple configurations and have different sounds play through each of them simultaneously.  The `Player` also provides a `ground` node that simply silences all input if you need to connect a node to something without it playing sound.

Create a `Player` with `new o.Player()` if you want to use a `Player` other than the default.  You cannot use `o.createComponent()` because `Player` is not a `Component`.

### Class Fields

#### `o` — *`Global`*
Easily available `Global` singleton instance.

### Instance Fields

#### `ctx` — *`AudioContext`*
Default `AudioContext` from `o`, for convenience.

#### `destination` — *`AudioNode`* — default value: `ctx.destination`
Destination `AudioNode` to which all `Player` sound is sent.  Can be changed with `setDestination()`.

#### `destinationIndex` — *number* — default value: `0`
Index of the input in the `destination` `AudioNode` to which the `Player` sends its sound.  Can be changed with `setDestination()`.

#### `gain` — *number* — default value: `1`
Master gain for the `Player`.  Change it with `setGain()`.

#### `node` — *`GainNode`*
The sound-outputting `AudioNode` of the `Player`, to which `AudioComponent`s are connected to play sound, created when you turn the `Player` on.

#### `ground` — *`GainNode`*
The silence-outputting `AudioNode` of the `Player`, to which `AudioComponent`s are connected to not play any sound, created when you turn the `Player` on.  `ground` is a `GainNode` whose gain is always 0.

#### `inputIndex` — *number* — default value: `0`
Index of the input on `node` to which `AudioComponent`s should connect.  You probably shouldn't try to change this unless you override `setupNode()` to make `node` something other than a `GainNode` that has multiple inputs.

#### `playing` — *array of `AudioComponent`s*
Set of playable components that are playing right now.  When the `Player` plays a note, it goes into this array; when the `Player` stops a note, it's removed.  When `stopAll()` is called, all notes in the array are stopped and removed.

#### `registry` — *`Registry`*
The `Registry` instance associated with the `Player`.  All new `Component`s created with this `Player` are assigned this `registry` by default.

#### `orchestra` — *`Orchestra`*
The `Orchestra` instance associated with the `Registry` instance associated with the `Player`.

#### `timer` — *`Timer`* — `Component` created from `{name: 'Default Timer', className: 'Timer'}`
The default `Timer`, which counts the time since the `Player` was turned `on()`.  Its name is `'Default Timer'` and it's the default timer on most `AudioComponent`s that use one.

#### `tuning` — *`MeantoneTuning`* — `Component` created frp, `name: '12TET', className: 'MeantoneTuning', tuningName: '12TET'}`
The default `Tuning`, which is the usual 12-tone equal temperament (actually 24-tone, but anyway).  It is the default tuning for note names.

#### `isOn` — *boolean* — default value: `false`
Whether the `Player` is on.

### Instance Methods

#### `on()`
Calls `setupNodes()`, creates and starts the `timer`, and creates and starts the `tuning`.  Call this at the start of a session with this `Player`.  This will also call `resume()` on the `AudioContext`, which might otherwise remain inactive.

#### `off()`
Stops all notes, calls `cleanupNodes()`, and cleans up the `timer`.  Call this at the end of a session with this `Player` to make sure that there aren't errant `AudioNode`s hanging around and leaking CPU time and memory.

#### `setupNodes()`
Called when the `Player` is turned `on()`.  Creates the `node` and `ground`, sets the gain, and connects it to `destination`.

#### `cleanupNodes()`
Called when the `Player` is turned `off()`.  Disconnects the `node` and `ground` from the `destination` and tears it down.

#### `setGain(<gain>)`
Sets the `node`'s gain to `<gain>`.

#### `setDestination(<destination>, <destinationIndex>)`
Disconnects `node` from its current destination and instead connects it to `<destination>` at input index `<destinationIndex>`.

#### `play(<playable>)`
Plays the sound in `<playable>`.  First it calls `on()` on the `<playable>`, which should ensure that the necessary `AudioNode` has been created, then it calls `connectTo()` on the `<playable>` to connect its `AudioNode` to `node` here, and finally it pushes the `<playable>` to the `playing` array.  Any object that properly responds to `on()` and `connectTo()`, as well as companion methods `off()` and `disconnectFrom()`, should be playable by `Player`.

#### `stop(<playable>)`
Stops the sound in `<playable>`.  First it attempts to find the `<playable>` in the `playing` array; if it does, it removes it.  Then, it calls `disconnectFrom()` on `<playable>` followed by `off()` on `<playable>`, which breaks down the `<playable>`'s `AudioNode`.  Any object that properly responds to `off()` and `disconnectFrom()`, as well as companion methods `on()` and `connectTo()`, should be playable by `Player`.

#### `stopAll()`
Stops all playable notes by calling `disconnectFrom()` and `off()` on them, then empties the `playing` array.

#### `createComponent(<properties>)` — *`Component`*
Calls `o.createComponent()` with the given `<properties>`, setting this `Player` as `parent` and `player`, this `player`'s `registry` as `registry`, and this `Player`'s `tuning` as `tuning`.




## Component

A `Component` is a piece of the sound-producing apparatus of Offtonic Audioplayer that can be instantiated by means of a properties object.  `Component` should probably never be directly instantiated, since a `Component` doesn't actually *do* anything on its own; the `Component` superclass simply provides the necessary methods to parse the properties for its subclasses to inherit.

### Properties

#### `name` — *string* — `defaultValue`: `null` — `setter`: `'setName'` — `cleaner`: `'cleanupName'`
A name, if provided, to use to store this instance in the `Registry`.

### Pseudoproperties

#### `tuning` — *`Tuning` definition (or a `Tuning` instance, or a reference to a `Tuning` instance)*
Despite specifying it like a property, `tuning` is not a property, since it must be set before the actual properties are set (in case those properties need to access the tuning).  If this property is a `Tuning` definition (rather than an actual `Tuning` or reference), this `Component` will own the resulting `Tuning` instance's lifecycle, calling `play()` on it at instantiation and calling `stop()` on it at cleanup.

### Class Fields

#### `o` — *`Global`*
Easily available `Global` singleton instance.

#### `newPropertyDescriptors` — *array of property descriptors* (see Property Descriptor Fields above) — value `[]`
Any subclass that wants to define properties should stick them in its own `newPropertyDescriptors` field as an array.

#### `propertyDescriptors` — *object of property descriptors, where the keys are the property names and the values are the descriptors* (see Property Descriptor Fields above) — value `{}` (read-only)
Any subclass inheriting from `Component` has this field automatically populated by `Component`'s static getter for this field, so you should not ever need to set it, just read from it.  Reading this field for the first time calls `generatePropertyDescriptors()`, which stores the value in the `generatedPropertyDescriptors` class field (which you should probably not touch); reading this field subsequently just retrieves the latter.

### Class Methods

#### `generatePropertyDescriptors()`
Copies the superclass's `propertyDescriptors` into a new object, adds this class's `newPropertyDescriptors` to the object (if present), then saves it in this class's `generatedPropertyDescriptors` for future retrieval through `propertyDescriptors`.  You shouldn't ever have to touch this method.

#### `create(<properties>, <parent>, <player>, <registry>, <tuning>)` — `Component` subclass instance
`o.createComponent()`, the `Player`'s `createComponent()`, and the `Component`'s `create()` just call this method, so you should probably call them instead since it's easier.  Creates a new object with `<properties>` (after resolving all instruments named in it) as its properties, `<parent>` as its parent, `<player>` as its player, `<registry>` as its registry, and `<tuning>` as its tuning by calling the constructor specified in `<properties>.className` if present (if not, calls the current class's constructor), then `.withParent(<parent>).withPlayer(<player>).withRegistry(<registry>).withTuning(<tuning>, <hasOwnTuning>).withProperties(<properties>)` on the constructed object.

### Constructor

You should probably not call the constructor for `Component` or its subclasses yourself.  The constructor takes no arguments, sets all new properties to `null`, and does whatever basic setup is necessary.  Subclasses need to declare a constructor, but that constructor should probably take no arguments (and must call `super()` because that's how JS works).

### Instance Fields

#### `ctx` — *`AudioContext`*
Default `AudioContext` from `o`, for convenience.

#### `isComponent` — *boolean* — `true`
So you can easily check if a given object is a `Component` and therefore responds to `Component`'s methods.

#### `parent` — *`Component` or `Player`*
The parent `Component` of this `Component`, or, in other words, the `Component` that owns this one's lifecycle.  If the `parent` is the `Player`, you will need to manage this `Component`'s lifecycle yourself.

#### `player` — *`Player`*
The `Player` instance passed to `create()` when creating this `Component`.  It's only really applicable for `Playable` instances, but since `Component` property definitions can be chained, all `Component`s created with a particular `create()` call are given the `Player`.

#### `registry` — *`Registry`*
The `Registry` instance passed to `create()` when creating this `Component`.  When any sub-component needs to resolve a reference, it will look inside this `registry`.

#### `orchestra` — *`Orchestra`*
The `Orchestra` instance associated with the `registry`.

#### `tuning` — *`Tuning`*
The `tuning` instance passed to `create()` when creating this `Component`.  Any sub-component will inherit this.

#### `hasOwnTuning` — *boolean* — `false`
Whether the `Component` is managing the `tuning`'s lifecycle.  If so, it will call `play()` on the tuning at instantiation and `stop()` at cleanup.

### Instance Methods

#### `withParent(<parent>)` — *`this`*
Sets `parent` to `<parent>` (by calling `setParent(<parent>)`) and returns the object itself.

#### `setParent(<parent>)`
Sets `parent` to `<parent>`.  This gets called at object creation *before* the properties are set.

#### `withPlayer(<player>)` — *`this`*
Sets `player` to `<player>` (by calling `setPlayer(<player>)`) and returns the object itself.

#### `setPlayer(<player>)`
Sets `player` to `<player>`.  Override if you want more interesting behavior, but remember that this gets called at object creation *before* the properties are set.

#### `withRegistry(<registry>)` — *`this`*
Sets `registry` to `<registry>` (by calling `setRegistry(<registry>)`) and returns the object itself.

#### `setRegistry(<registry>)`
Sets `registry` to `<registry>`, and sets `orchestra` to `<registry>.orchestra`.  This gets called at object creation *before* the properties are set.

#### `withTuning(<tuning>, <hasOwnTuning>)` — *`this`*
Sets `tuning` to `<tuning>` and `hasOwnTuning` to `<hasOwnTuning>)` (by calling `setTuning(<tuning>)`) and returns the object itself.

#### `setTuning(<tuning>, <hasOwnTuning>)`
Sets `tuning` to `<tuning>` and `hasOwnTuning` to `<hasOwnTuning>)`.  If `hasOwnTuning` is true, also called `setParent(this)` on the `tuning`, since that was not able to be done at tuning creation since the object did not yet exist.  This gets called at object creation *before* the properties are set.

#### `withProperties(<properties>)` — *`this`*
Sets the properties to the values in `<properties>` (by calling `setProperties(<properties>, true)`) and returns the object itself.

#### `setProperties(<properties>, <useDefault>)`
Sets the properties to the values in `<properties>`.  If `<useDefault>` is `true`, a property name is not present in `<properties>`, and that property's descriptor has a `defaultValue`, then the property is set to that `defaultValue`.  The properties are set with `setProperty()`.  After the properties are set, `finishSetup()` is called in case there's anything left to do.  You can call `setProperties()` on a `Component` at any time, not just at instantiation, to change the properties of the `Component` while it's playing or doing whatever it does.

#### `finishSetup()`
Does nothing in `Component`, but you can override it if you need.  Gets called at the end of `setProperties()` to initialize the `Component` and perform any tasks that need multiple properties to be around at the same time, like calculations.

#### `hasProperty(<propName>)` — *boolean*
Returns `true` if `<propName>` is a property of this object's class and `false` if not.  The property value might still be `null`; only whether the property is defined in the `propertyDescriptors` class field matters for the purposes of this method.

#### `getProperty(<propName>, <resolveReference>)` — *anything*
Returns the value of the property with the specified `<propName>`, which may be a number, a `Component`, or really anything else.  If the property descriptor specifies a `getter`, that function will be called to retrieve the value; otherwise, `genericGetter()` is called.  If the value is a reference (an object with a `ref` field) and `<resolveReference>` is not explicitly set to `false`, the object returned will be the `Component` referenced, but if `resolveReference` is `false`, the object returned will be the object with the `ref` field.

#### `resolveReference(<reference>)` — *anything*
If `<reference>` is a non-`null` object with a `ref` field, returns the component stored in the `registry` under the value of `ref`; otherwise simply returns `<reference>`.

#### `genericGetter(<propName>)` — *anything*
Returns the value of `this.<propName>`, which is the default way to store property values.  When implementing a custom getter, you may want to consider calling `genericGetter()` during the process.

#### `setProperty(<propName>, <propDefinition>)`
Provided the property exists in the first place, calls `createPropertyValue()` then sets it as a value for the property named `<propName>`.  If a `setter` is provided in the descriptor, that value gets passed to that setter; if not, the previous value is cleaned up (with `cleanupProperty()`) and `genericSetter()` is called.  If you are implementing a custom setter, you should make sure to handle cleaning up the previous value of the property if applicable.

#### `createPropertyValue(<descriptor>, <propDefinition>)` — *anything*
Instantiates `<propDefinition>` if necessary (meaning that `<propDefinition>.className` is present) and returns the instance.  If `<propDefinition>` is a number and the `<descriptor>` has `isAudioComponent` set to `true`, a `ConstantGenerator` is instantiated and becomes the value instead of the number.  If instead `<propDefinition>` is a string and the descriptor has `isAudioComponent` or `isAudioParam` set to `true`, a `Note` is instantiated with the current object's `tuning`'s name as its `tuningName` and with a `note` of `<propDefinition>`.  If the `<descriptor>` has `isComponentArray` set to `true` and the `<propDefinition>` is an array, the created value will be an array where each element is a created `Component` of the corresponding element in `<propDefinition>` or the value itself (strings are converted to `Note`s, but numbers stay numbers).  Otherwise, the `<propDefinition>` is returned as-is (including if it's a reference).  This method can be used to instantiate objects that are not technically properties by passing in an arbitrary `<descriptor>`; for example, a property may be an array of objects that should be interpreted as `AudioParam`s; a custom setter can then call this method, with a `<descriptor>` object containing `isAudioParam` set to `true`, on the individual array elements to create the proper `Component`s.

#### `genericSetter(<propName>, <propValue>)`
Simply sets `this.<propName>` to `<propValue>`, which is the default way to store property values.  When implementing a custom setter, you may want to consider calling `genericSetter()` during the process.  If the property has a `passThrough` and the pass-through `Component` has been instantiated already, it also calls `setProperty()` on that object.

#### `setName(<name>)`
Cleans up the existing `name`, sets the new `<name>`, and if that `<name>` isn't `null`, adds this `Component` to the `registry` under `<name>`.

#### `cleanup()`
Performs any cleanup tasks necessary, like dismantling `AudioNode`s that should no longer run and otherwise freeing resources.  If you override `cleanup()`, you should probably call `super.cleanup()` to make sure you don't miss something important.  In `Component`, `cleanup()` goes through every property and calls `cleanupProperty()` for the property (if it isn't a reference).  `cleanup()` is called automatically by `Playable` instances on `stop()`, but if you manually start any other `Component`, you'll want to call `cleanup()` on it yourself.

#### `cleanupProperty(<propName>)`
If the property named by `<propName>` has a `cleaner` in its descriptor, this method calls that cleaner to clean up the property; if it does not, it calls `genericCleaner(<propName>)`.

#### `genericCleaner(<propName>)`
If the property named by `<propName>` is itself a `Component`, calls `cleanup()` on the property (by calling `cleanupComponent()`), then sets `this.<propName>` to `null`.  If you need more specialized behavior and override this method, you should probably still call it from your override.  If the property has a `passThrough` and the pass-through `Component` has been instantiated already, it also calls `cleanupProperty()` on that object.

#### `cleanupComponent(<component>)`
If the `<component>` is a `Component`, calls `cleanup()` on it.

#### `cleanupName()`
Removes this `Component` from the `registry` (if `name` isn't `null`) and sets `name` to `null`.

#### `createComponent(<properties>)` — *`Component`*
Convenience method; calls `o.createComponent()` using the `player`, `registry`, and `tuning` of the current `Component`, and sets the `parent` to the current `Component`.

#### `identify()`
Logs the current object to the console.  Useful for debugging.




## AudioComponent < Component

An `AudioComponent` is a `Component` that produces a-rate data through an `AudioNode` (or a chain thereof).  It doesn't have to produce data intended to produce a *sound*, and in fact, most `AudioComponent`s don't.  An `Envelope`, for example, is an `AudioComponent` that produces gains in time which are multiplied by a signal to create a tone that has articulation, and a `ConstantGenerator` is an `AudioComponent` that produces a specified constant number every audio frame.  `AudioComponent`s can connect to `AudioNode`s or `AudioParam`s depending on the specific use case.

`AudioComponent` assumes that it contains one primary `AudioWorkletNode`, `node`, to produce or provide its data, and its properties are connected to this node.  This data may or may not get passed to a `filter` before it goes to wherever it's supposed to go.  If `node` is not an `AudioWorkletNode`, `isNativeNode` should be set to `true` for the class.  Different arrangements are possible and depend on overriding a few methods: `getFirstNode()` is the node to which external nodes should connect (`node` by default), `getNodeToFilter()` is the node that connects to the `filter` (`node` by default), `getNodeFromFilter()` is the node that the `filter` connects to, if any (`null` by default), and `getNodeToDestination()` is the ultimate output node of the `AudioComponent`, which by default is `node` if `filter` is `null` and `filter`'s `getNodeToDestination()` if not.  So if we wanted to connect node A to an `AudioComponent` and then connect the `AudioComponent` to node B, we would have A connected to `getFirstNode()`, which is the start of a chain ending in `getNodeToFilter()`, which connects to `filter` if present, which connects to a (possibly empty) chain beginning with `getNodeFromFilter()` and ending with `getNodeToDestination()` (which may have already occurred in the chain), which connects to B.

You never instantiate an `AudioComponent` itself, since an `AudioComponent` doesn't actually *do* anything.  Rather, you use its subclasses.  `AudioComponent` contains default methods for dealing with `AudioWorkletNode`s, instantiating them, passing them properties, and so on, and many can be overridden for custom behavior in subclasses.

### Properties

#### `timer` — *`Timer`* — `defaultValue`: `null` — `isAudioParam`: `true`
A timer that can be used for timing events.  You can register timed events with the processor; the processor checks the timer every frame and, if the timer has advanced sufficiently, the processor sends back a message to the `AudioComponent` via the `port`, which can be handled with `handleTriggeredEvent()`.

#### `filter` — *`Filter`* — `defaultValue`: `null` — `connector`: `'connectFilter'` — `disconnector`: `'disconnectFilter'`
A `Filter` instance (or `null`) through which the signal is passed after whatever's supposed to happen in `node`.  Since `Filter` is also an `AudioComponent`, it may itself have a `filter`, which allows for `Filter` chaining.

### Class Fields

#### `processorName` — *string* — default `null`
The name of the `AudioWorkletProcessor` subclass (the name registered into the `AudioWorkletGlobalScope`) that this `AudioComponent` class uses.  If a subclass uses a native `AudioNode` (hard-coded into the WebAudio API), you can leave this `null` — or not, since it won't get used.

#### `numberOfInputs` — *number* — default `0`
Number of inputs for the `AudioWorkletProcessor` subclass (see the `options` for the `AudioWorkletProcessor` constructor in the WebAudio API docs).

#### `numberOfOutputs` — *number* — default `1`
Number of outputs for the `AudioWorkletProcessor` subclass (see the `options` for the `AudioWorkletProcessor` constructor in the WebAudio API docs).

#### `outputChannelCount` — *array of numbers* — default `null`
Array with the number of channels for each output (see the `options` for the `AudioWorkletProcessor` constructor in the WebAudio API docs).  Left unspecified by default, which allows the `AudioWorkletProcessor` to use the default values.

#### `isNativeNode` — *boolean* — default `false`
If the `node` is a native WebAudio API `AudioNode`, set this to `true`.  It changes the way `AudioParam`s are connected.

### Class Methods

#### `getParamName(<propName>)` — *string* — default value `<propName>`
Returns the name of the `AudioParam` that the property named by `<propName>`, which is `<propName>` itself by default but can be overridden by providing a `paramName` in the descriptor for the property.

#### `getProcessorOptionName(<propName>)` — *string* — default value `<propName>`
Returns the name of the processor option that the property named by `<propName>`, which is `<propName>` itself by default but can be overridden by providing a `processorOptionName` in the descriptor for the property.

#### `getParamFromNode(<node>, <paramName>, <isNativeNode>)` — `AudioParam`
Utility method that returns the `AudioParam` object with the given `<paramName>` from the given `<node>`.  Params are accessed differently depending on whether the node is a native node or an `AudioWorkletNode`, so that switch is necessary.  You can use this `AudioParam` to connect `AudioNodes` to it.

#### `disconnectNodes(<node1>, <outputIndex>, <node2>, <inputIndex>)`
Disconnects `<node1>`'s output number `<outputIndex>` from `<node2>`'s input number `<inputIndex>`.  `<inputIndex>` is optional and should be omitted if `<node2>` is actually an `AudioParam`.  Disconnecting nodes can fail if the connection no longer exists for whatever reason, so the disconnection here happens in a `try`/`catch`, and if it fails, a warning is logged (if `o.debug` is `true`).  You should use this instead of simply calling `disconnect` on the node unless you *know* the connection is still there.  Cases where it might not be are when the `player` is turned `off()`, which destroys the default timer, while `AudioComponents` still using that default timer live in the `registry`.  Offtonic Audioplayer can't guarantee that resources in the `registry` will be cleaned up in the proper order, so it's likely that this will result in references being cleaned up before their dependencies.

### Instance Fields

#### `isAudioComponent` — *boolean* — `true`
Allows for quick checking that a given object is an `AudioComponent`.  Note that `isAudioComponent` is also a key in a property descriptor object, but you shouldn't end up getting them confused.

#### `node` — *AudioNode* — default `null`
The node that does all of this `AudioComponent`'s business.  By default, `AudioComponent` assumes that `node` is an `AudioWorkletNode`, but it doesn't have to be.  This is the `AudioNode` to which you connect your properties, and this is the `AudioNode` that you connect to somewhere else like a `Player` or an `AudioParam` or what have you.  The node is generally created when the `AudioComponent` is turned on and destroyed when it's turned off, so when it's not playing, `node` is `null`.  Therefore, always check for `null` when doing something with the node.

#### `outputIndex` — *number* — `0`
The output index of the `node` that connects to its destination.  It is `0` by default, but subclasses can override this value.

### Instance Methods

#### `on()`
If the `node` field is `null`, creates a node (using `createNode()`) and called `connectProperties()` to set up the node.  Since Chrome requires that processors be connected to something in order for the `outputs` array to be properly constructed, each of the `node`'s outputs is also connected to the `Player` instance's `ground` node.

#### `off()`
Disconnects the `node`'s outputs from the `Player` instance's `ground`; calls `disconnectProperties()` and `cleanupNode()` to tear everything down.

#### `createNode()`
Creates a custom `AudioWorkletNode` with this class's `processorName` as its processor name and sticks it in the `node` field.  It also opens up the node's `port` for messaging.  If you're using a native `AudioNode` instead of a custom `AudioWorkletNode`, or you have multiple different node objects in your class, you need to override `createNode()` to do the thing you need it to do.  This gets called during `on()`.

#### `cleanupNode()`
Sets the `node`'s `done` parameter to `1` (if `isNativeNode` is `false` for this class) then sets the `node` field to `null`.  Override this if you need to do something more complicated, but you'll probably still want to call `super.cleanupNode()` at the end if you're not using a native node.  Gets called during `off()`.

#### `receiveMessage(<messageEvent>)`
This function gets called whenever `node.port` receives a message from the processor (see the WebAudio API docs).  The message contents are in `<messageEvent>.data`.  If those contents contain a `triggerEvent`, `handleTriggeredEvent()` gets called on it.  You should override it to handle whatever messages you want to send back and forth, but you should probably make sure to call `super.receiveMessage()` to make sure that `timerEvent`s are handled.  A similar method is defined in `AudioComponentProcessor` to handle messages sent to the processor.  To send a message, call `node.port.postMessage()` (see the `MessagePort` API docs for details).  Note that messages are copied using structured clone, so functions can't be sent (or received, obviously).

#### `registerTimedEvent(<time>, <event>, <isAbsolute>)`
Posts a message via `node.port` containing a `timedEvent` key with a value that is an object with a `time` or `duration` key, depending on whether `<isAbsolute>` is `true` (the value is `<time>`) and an `event` key (value `<event>`).  Once the `timer`, if there is one, reaches a time past `<time>`, it will send back a message containing a `triggerEvent` key with value `<event>`.  You can listen for this by overriding `handleTriggeredEvent()`.  `<event>` can be anything, but it's sent via structured clone, so it can't contain functions.  One possibility is for it to simply be a string.

#### `handleTriggeredEvent(<event>)`
Handles any events triggered by the `AudioComponentProcessor`.  The only event handled here is the `'identify'` event, which calls `identify()` on the `AudioComponent` instance.  Subclasses should always call `super.handleTriggeredEvent()` first when overriding this method to handle new events.

#### `connectTo(<destination>, <inputIndex>)`
#### `disconnectFrom(<destination>, <inputIndex>)`
Calls `connect()` or `disconnect()` on `getNodeToDestination()` to connect or disconnect its output at index `0` to or from the given `<destination>`; if `<inputIndex>` is a non-negative number, it will (dis)connect it to/from that input index.  The default input index is `0` for a `<destination>` that is an `AudioNode`, but if the `<destination>` is an `AudioParam`, including an input index at all (even `undefined`) will cause an error.

#### `getFirstNode()` — *`AudioNode`* — default value: `node`
#### `getNodeToFilter()` — *`AudioNode`* — default value: `node`
#### `getOutputIndexToFilter` — *number* — default value: `outputIndex`
#### `getNodeFromFilter()` — *`AudioNode`* — default value: `null`
#### `getNodeToDestination()` — *`AudioNode`* — default value: `filter.getNodeToDestination()` if `filter` is not `null`, or `getNodeToFilter()` if it is
#### `getOutputIndexToDestination()` — *number* — default value: `filter.getOutputIndexToDestination()` if `filter` is not `null`, or `outputIndex` if it is
The basic structure of the `AudioComponent`.  If we wanted to connect node A to an `AudioComponent` and then connect the `AudioComponent` to node B, we would have A connected to `getFirstNode()`, which is the start of a chain ending in `getNodeToFilter()`, which connects to `filter` if present, which connects to a (possibly empty) chain beginning with `getNodeFromFilter()` and ending with `getNodeToDestination()` (which may have already occurred in the chain), which connects to B.  Override these if your `AudioComponent` has a different structure.

#### `cleanup()`
Overrides `Component`'s `cleanup()` method; calls `off()` and `super.cleanup()`.  If you override this method, you should probably call `super.cleanup()` at the end as well.

#### `genericSetter(<propName, propValue>)`
Overrides `Component`'s `genericSetter()` method to call `connectProperty(<propName>)` after setting the value.  Before you turn the `AudioComponent` on, this has no effect since there's nothing to connect it to, but if you set a property while the `AudioComponent` is running, this setter will connect the new property to the correct spot.  If you're providing a `setter` for a property or overriding this method, don't forget to perform the necessary connections.

#### `connectProperties()`
#### `disconnectProperties()`
Calls `connectProperty()` or `disconnectProperty()` on all of this `AudioComponent`'s properties.

#### `connectProperty(<propName>)`
#### `disconnectProperty(<propName>)`
If a `connector` or `disconnector` is provided for this property, that method is called.  If a `passThrough` is provided. `connectProperty()` or `disconnectProperty()` is called on the `passThrough` object (if it has been instantiated — calling these methods has no effect on the current `Component` itself if `passThrough` is set on the property).  Otherwise, `genericConnector()` or `genericDisconnector()` is called.

#### `genericConnector(<propName>)`
#### `genericDisconnector(<propName>)`
If the property descriptor has `isAudioParam` set to `true`, `connectAudioParam()` or `disconnectAudioParam()` is called; if the property descriptor has a non-negative `inputIndex`, then `connectInputIndex()` or `disconnectInputIndex()` are called.  These two methods have no default behavior, so if you want to create special handlers for other property types, just override these methods and call `super.genericConnector(<propName>)` or `super.genericDisconnector(<propName>)` before adding new cases.

#### `connectAudioParam(<propName>)`
#### `disconnectAudioParam(<propName>)`
Called by `connectProperty()` and `disconnectProperty()` to handle properties with `isAudioParam` set to `true`.  If the value of the property named by `<propName>` is an `AudioComponent`, `value.on()` (if it's not a reference) and `value.connectTo()` are called to connect it to the `AudioParam` object it needs to be connected to, and `value.disconnectFrom()` and `value.off()` (if it's not a reference) are called to disconnect.  If the value is not an `AudioComponent`, it's simply assigned into the `AudioParam`'s `value` field on connection; there is no need to disconnect it afterward.  The `value` is set to `0` when nothing is connected to it, both before connecting the param and after disconnecting.

#### `connectComponentOrRefToAudioParamName(<rawValue>, <paramName>, <zeroParamDuringTransition>)`
#### `disconnectComponentOrRefFromAudioParamName(<rawValue>, <paramName>, <zeroParamDuringTransition>)`
Connects or disconnects an arbitrary `AudioComponent`'s (the `<rawValue>`, which may be an `AudioComponent` or a reference) node to or from the `AudioParam` on the `AudioComponent`'s `node` with the given `<paramName>`, and `on()`/`off()` are called on it only if the `<rawValue>` is not a reference.  Called by `connectAudioParam()` and `disconnectAudioParam()` with a `<zeroParamDuringTransition>` value of `true`.  If that value is `false` instead, the `value` of the `AudioParam` will not be set to `0` and will just keep its previous value, which can be useful when the `AudioParam` represents some kind of control and you don't want it to change after it was set to whatever it was set to by the last thing that changed it.  Calls `connectComponentOrRefToAudioParam()` or `disconnectComponentOrRefFromAudioParam()`.

#### `connectComponentOrRefToAudioParam(<rawValue>, <param>, <zeroParamDuringTransition>)`
#### `disconnectComponentOrRefFromAudioParam(<rawValue>, <param>, <zeroParamDuringTransition>)`
Connects or disconnects an arbitrary `AudioComponent`'s (the `<rawValue>`, which may be an `AudioComponent` or a reference) node to or from an arbitrary `AudioParam` `<param>` (on an arbitrary `AudioNode`), and `on()`/`off()` are called on it only if the `<rawValue>` is not a reference.  Called by `connectAudioParam()` and `disconnectAudioParam()` with a `<zeroParamDuringTransition>` value of `true`.  If that value is `false` instead, the `value` of the `AudioParam` will not be set to `0` and will just keep its previous value, which can be useful when the `AudioParam` represents some kind of control and you don't want it to change after it was set to whatever it was set to by the last thing that changed it.

#### `connectInputIndex(<propName>)`
#### `disconnectInputIndex(<propName>)`
Called by `connectProperty()` and `disconnectProperty()` to handle properties with `inputIndex` set to a non-negative number.  The value is assumed to be an `AudioComponent`, and `value.on()` (if it's not a reference) and `value.connectTo()` are called on connection and `value.disconnectFrom()` and `value.off()` (if it's not a reference) are called on disconnection.

#### `connectComponentOrRefToInputIndex(<rawValue>, <node>, <inputIndex>)`
#### `disconnectComponentOrRefFromInputIndex(<rawValue>, <node>, <inputIndex>)`
Called by `connectInputIndex()` and `disconnectInputIndex()`, respectively.  These methods connect or disconnect an arbitrary `AudioComponent`'s (the `<rawValue>`, which may be an `AudioComponent` or a reference) node to or from an arbitrary input index on an arbitrary `AudioNode`, and `on()`/`off()` are called on it only if the `<rawValue>` is not a reference.

#### `connectFilter()`
#### `disconnectFilter()`
The `filter`, if not `null`, is assumed to be an `AudioComponent`.  When connecting, it's turned `on()`, then `getNodeToFilter()` is connected to it, then it is connected to `getNodeFromFilter()` if that is not `null`.  If `filter` is `null`, `getNodeToFilter()` is connected directly to `getNodeFromFilter()` if that is not `null`.  When disconnecting, these connections are undone instead, and `filter` is turned `off()`.

#### `getProcessorOptions()` — *object*
Creates and returns the `options` object that the `AudioWorkletProcessor` is instantiated with.  The static fields `numberOfInputs`, `numberOfOutputs`, and `outputChannelCount` are added to this object if they're not `null`, as well as empty objects `parameterData` and `processorOptions`.  `parameterData` holds initial values for the `AudioParam`s of the node, which you should *not* set, and `processorOptions` holds extra options that are read only at the processor's instantiation.  See the WebAudio API docs for more details on this object.  After this basic object is set up, `addProcessorOption()` is called with each property descriptor.  If you want to set up some custom behavior in the `options` object, you should override this method, but you'll likely want to call `super.getProcessorOptions()` first to populate the object.

#### `addProcessorOption(<options>, <descriptor>)` — *object*
Adds the appropriate value to the `<options>` object and returns it, calling `addProcessorOptionOption()` if `isProcessorOption` is `true` in the `<descriptor>`.  If you have other kinds of options that need special treatment, you can override this method, call `super.addProcessorOption()` first, and handle your new kind of option.

#### `addProcessorOptionOption(<options>, <propName>)` — *object*
Adds the value of the `<propName>` property to the `<options>` object under `processorOptions`, with the key being the processor option name (`processorOptionName` if provided in the descriptor, or just `<propName>` if not).  This value can be anything, but since it gets passed via structured clone, it shouldn't contain functions.  The processor can read this value at construction time and handle it however is necessary.  Returns the `<options>` object.

#### `nodeOutputDefinition(<outputIndex>)` — *object*
Convenience method; returns a properties object for a `NodeOutput` with `node` as the `node` and `<outputIndex>` as the `outputIndex`.




## AudioComponentProcessor < AudioWorkletProcessor

This is the base class for the custom processors that drive `AudioWorkletNode`s in Offtonic Audioplayer.  It provides some common interfaces to reduce boilerplate and process parameters, which function sort of like properties except that their descriptors are actually part of the WebAudio API, and they represent `AudioParam`s that are constructed in native code that you don't yourself get to touch.  The `outputs` array comes filled with `0`'s that you can replace with something else if you want to actually output any data, but `AudioComponentProcessor` doesn't populate that array with anything, so you should subclass it if you want it to actually produce a signal.  However, since `AudioComponentProcessor` also interacts with a `timer`, you can use this class if you only need that `timer` interaction and nothing else.

Note that if you want to directly use a processor, any processor, you need to call `registerProcessor(<processorName>, <processorClass>)`, generally right after the class definition.  Also, these processors need to be in their own file since they live in a different global scope.  That global scope has `sampleRate` as an available constant, so the sample rate is always available (in frames per second, usually 44100).  Since the processors are registered with the global audio context's `AudioWorklet`, there's no need to add these processors to the `classRegistry`, especially since they aren't `Component`s.

### AudioParams

#### `done` — `0` or `1` — `defaultValue`: `0` — `automationRate`: `'k-rate'`
Set this to `1` (or, really, anything other than `0`) if the processor should be dismantled.  The return value of `process()` is based on this value.

#### `timer`
A beat count at a specified tempo.  It can be used to register `timedEvent`s to trigger at specific times.

### Class Fields

#### `newParameterDescriptors` — *array of `ParameterDescriptor`-like objects* — `[]`
See the WebAudio API docs for the fields in a `ParameterDescriptor` object.  These descriptors are used to create the `AudioParam`s used by the `AudioWorkletProcessor`.  When the `parameterDescriptors` class field is read, the objects in this array get added to the superclass's `parameterDescriptors` to create this class's `parameterDescriptors`.  Be careful about setting default values for these, because if a parameter has a `value` and another `AudioNode` connects to it, that `value` will be added to the output of the `AudioNode`.

#### `parameterDescriptors` — *array of `ParameterDescriptor`-like objects* — `[]`
See the WebAudio API docs for the fields in a `ParameterDescriptor` object.  This field, actually a static getter, is part of `AudioWorkletProcessor` and is fundamental to how it gets set up.  The parameters described get built into `AudioParam` objects to which you can connect `AudioNode`s and set values and such.  The getter checks if `generatedParameterDescriptors` is an own property of this class, and if not, it calls `generateParameterDescriptors()`, which saves the result, and this getter returns it.  You should not need to override this.  Note that it is an array, not an object like `Component.propertyDescriptors`.  This is a requirement of the WebAudio API.

#### `C0` — 440·2^(–4.75)
#### `logC0` — ln(440) – 4.75·ln(2)
Useful constants to not have to re-calculate.  C0 serves as a floor for Shepard tones and an arbitrary reference pitch for pitch space calculations.

### Class Methods

#### `generateParameterDescriptors()`
Parses the `newParameterDescriptors` field, copies the superclass's `parameterDescriptors` field, and adds the new descriptors to the copied list.  This gets called automatically the first time the system tries to get `parameterDescriptors` on this class; you should not need to override this either (or call it directly).

### Constructor

The constructor takes an `<options>` argument, which contains information necessary for setting up the processor; this `<options>` object is created in the `getProcessorOptions()` method of `AudioComponent`.  It also sets up the `port` of the `AudioWorkletProcessor` to call `receiveMessage()` when a message is received.

### Instance Fields

#### `inputs` — *array of arrays of arrays of numbers* — default value: `null`
The `process()` method is called automatically; when it runs, its `<inputs>` argument is saved as this instance field for convenience.

#### `parameters` — *object where the keys are parameter names and the values are arrays of numbers* — default value: `null`
The `process()` method is called automatically; when it runs, its `<parameters>` argument is saved as this instance field for convenience.

#### `bufferLength` — *number* — default value: `128`
Size of the output buffer, which is generally 128 unless the browser changes how it handles things.  It's calculated every time `process()` is called.

#### `timedEvents` — *array of event objects, which have a `time` key and an `event` key* — default value: `[]`
We add to this array any event that we want the `timer` to trigger using `handleTimedEvent()`.  This array is always kept ordered in increasing order of the `time` key of each element, and when an event is triggered, it's removed from this array.

#### `queuedDurationEvents` — *array of event objects, which have a `duration` key and an `event` key* — default value: `[]`
When a `timedEvent` that has a `duration` is sent to the processor before it has had a chance to run `process()` for the first time, the `time` cannot be computed since the `parameters` field is still `null`.  Therefore, it goes into this queue to be handled when `process()` is called.

### Instance Methods

#### `process(<inputs>, <outputs>, <parameters>)` — *boolean*
See the WebAudio API docs.  This method is the method that actually does work in an `AudioWorkletProcessor`; you should never call it yourself.  Its return value is whether the node should be kept alive even if there are no references to the node, which is `true` until the `value` of the `done` `AudioParam` is set to `1`.  Well, actually, what this method does is to save the `<inputs>` and `<parameters>` to their respective instance fields, set the `bufferLength`, check if the `timer` has triggered anything, and return `_process(<outputs>)` (so long as `outputs[0]` is not empty) , which returns this value.  `<inputs>` and `<outputs>` are audio buffers: arrays where the number of elements is the number of inputs and outputs, respectively, for the node.  Each element is itself an array corresponding to each input or output, and the elements of those arrays are the individual channels of the input or output.  Each channel is itself an array containing a number of numbers (usually 128) representing the sample at each audio frame for that channel.  This method is intended to fill the `<outputs>` array with numbers that get sent to the destination (and if that destination is the speakers, they should be between `-1` and `1` or there will be distortion).  The `<outputs>` array is supposed to come pre-initialized with `0`'s everywhere, representing silence, so long as the `AudioNode` is connected to something.  The `<parameters>` input is an object whose keys are the parameter names and whose values are arrays containing either 1 number or enough numbers to fill each frame (usually 128); you can read those with `getParameter()`.  You're generally supposed to override `process()` in `AudioWorkletProcessor` subclasses, but I'm using that override in `AudioComponentProcessor` to pass in the `<inputs>` and `<parameters>` to the instance fields, so don't override this one and override `_process()` instead.

#### `_process<outputs>` — *boolean*
Returns the opposite of the `value` of the `done` `AudioParam` and does nothing else.  You should override this if you want to, say, actually populate the `<outputs>` array (whose structure is described above in `process()`), but you should probably always return `!this.isDone()`.

#### `isDone()` — *boolean* — default `false`
Returns the `done` parameter as a boolean.  You can change this by setting the `value` of the `done` `AudioParam`.  You might want to override this in subclasses.

#### `getParameter(<paramName>, <frame>)` — *number*
Assumes that the `parameters` field has been filled with the parameters for the current audio buffer (returns `null` if not, which is the situation before `process()` has ever been called).  It looks for the value stored under the key `<paramName>`, which should be an array containing either one number or one number for each audio frame (usually 128); if it's the former, return that number; if the latter, returns the number at frame `<frame>`.

#### `receiveMessage(<messageEvent>)`
Receives messages; if `timedEvent` is a key in the message, it calls `handleTimedEvent` on its value.  Override if you want to respond to messages sent over the `port` (but don't forget to call `super.receiveMessage(<messageEvent>)` first); data is included in `<messageEvent>.data`.  To send a message yourself, call `this.port.postMessage()` with your message, but remember that object get copied via structured clone so functions can't be sent over.

#### `handleTimedEvent(<timedEvent>)`
Receives a `timedEvent` by sticking it in `timedEvents` in the proper place in the order (increasing by `time`).  If the `timedEvent` has a `duration`, computes the `time` by adding the `duration` to the `timer` value at the end of the current buffer.  If `duration` cannot be computed because `process()` hasn't been called yet to fill the `parameters` field, as is the case when a `timedEvent` with a `duration` arrives when the processor is first instantiated, the event goes into `queuedDurationEvents` instead for handling when `process()` is finally called for the first time.

#### `triggerEvent(<event>)`
Posts a message over the `port` with `{triggerEvent: <event>}`.  The `AudioComponent` can then respond to it.

#### `checkTimer()`
Called during `process()`.  First, it calls `handleQueuedDurationEvents()`.  It then looks at the *last* time in the `timer` `AudioParam` buffer, and if that time is later than the time at which the first event in the `timedEvents` array is supposed to be triggered, calls `triggerEvent()` on it and removes it from the array, looks at the next event, etc., up until it finds an event with a time that has not yet arrived or the end of the array.

#### `handleQueuedDurationEvents()`
Goes through the `queuedDurationEvents` array and calls `handleTimedEvent()` on each element in the array.




## NodeOutput < AudioComponent < Component

A bare-bones `AudioComponent` consisting of an *existing* `AudioNode` object and an output index (`0` by default).  This can be useful if you have set up an `AudioNode` somewhere independently and want it to connect to some property on an `AudioComponent`.  The `AudioComponent` functions that deal with creating nodes are disabled here, since this class should not manage their lifecycles.  `NodeOutput` should not be modified once created, since it does not keep track of connections to other `AudioComponent`s.  You can create a single `AudioNode` with multiple outputs to correspond to the different properties on some `AudioComponent`, then create a `NodeOutput` for each output to connect to the properties themselves.

### Properties

#### `node` — *`AudioNode`* — `defaultValue`: `null`
The `AudioNode` itself.  Note that `node` is already the instance property of `AudioComponent` that stores the `AudioNode` for the `AudioComponent`.

#### `outputIndex` — *number* — `defaultValue`: `0`
The output index of the `AudioNode` to connect to the `NodeOutput`'s destination.

### Class Fields

#### `isNativeNode` — `true`

### Instance Methods

#### `on()`
#### `off()`
#### `createNode()`
#### `cleanupNode()`
No-ops.  Since `NodeOutput` does not control its `node`, these `AudioComponent` methods have been disabled.




## Playable < AudioComponent < Component

The `Playable` subclass of `AudioComponent` provides some basic mechanics for playing and stopping a sound.  A sound does not play itself; rather, a `Player` instance plays it.  The `Playable` class provides `play()` and `stop()` methods to the `Playable` itself that simply call their `player` so that instead of something like `player.play(playable)` you can call `playable.play()`.  You should never instantiate a `Playable`, though, since `Playable` is intended to be an abstract class that doesn't actually *do* anything.  The `Playable` interface also provides a `duration` property that you can use to have your `Playable` call `release()` after a certain amount of time has elapsed.

### Properties

#### `timer` — `Timer` — `defaultValue`: `{ref: 'Default Timer'}` — `isAudioParam`: `true`
Overwrites the `timer` property in `AudioComponent` in order to provide a default value.  This default value is a reference to the `'Default Timer'`, which runs at 60000 BPM, so `duration` can be specified in ms by default.

#### `duration` — *number* — `defaultValue`: `null`
Specifies the duration of the `Playable`, in beats of the `timer` (ms by default).  If it's `null`, the `Playable` will only release when you call `release()`, but if it's a number, `release()` will get called after the value of `duration` has elapsed.

### Instance Fields

#### `callbacks` — *array of functions* — default value: `[]`
Callbacks to call after `stop()`.

### Instance Methods

#### `play(<callback>)`
Calls `registerCallback(<callback>)`, then calls `player.play()` on this object.  The `<callback>` will be executed when `stop()` is called, so you can essentially schedule a `Playable` to perform some cleanup task when it's done.

#### `stop()`
Calls `player.stop()` on this object; the `callbacks` are then called in the order in which they were registered, and the `callbacks` array is emptied, after which `cleanup()` is called.

#### `release(<callback>)`
Calls `registerCallback(<callback>)`, then calls `stop()`.  Override this if you want custom behavior before actually stopping the sound, like a reverb effect or something, as `stop()` will stop the sound immediately, but you should remember to register the `<callback>`.  The `<callback>` will be executed when `stop()` is called, so you can essentially schedule a `Playable` to perform some cleanup task when it's done.

#### `registerCallback(<callback>)`
If a `<callback>` is provided (as in, not `undefined` or `null`), adds it to the `callbacks` array.

#### `createNode()`
Also registers the `release` event with the processor to take place after `duration` has elapsed.

#### `handleTriggeredEvent(<event>)`
Also checks if `<event>` is `'release'`; if it is, calls `release()`.




## Tone < Playable < AudioComponent < Component

Produces an audible tone when played, hence the name.  You can customize it in a variety of ways, and this is the primary way in which you will likely be creating sound when using Offtonic Audioplayer.  A `Tone` has a `generator` that produces a signal (optionally at a `frequency`), moderated by an `envelope` that shapes the volume of the sound over its lifetime, and finally, multiplied by a `gain` that specifies an overall volume.  The primary `node` is a custom `AudioWorkletNode` with processor name `ToneProcessor`, whose inputs are the `generator` and the `envelope`, and that is connected to a `filter` if present, which is then connected to a `GainNode` that applies the `gain`; that `GainNode` is what's connected to the destination.  Note that `Filter` extends `AudioComponent`, which means that a `filter` can have its own `filter`, allowing you to chain `Filter`s.

### Properties

#### `gain` — *number or `AudioComponent`* — `defaultValue`: `0.1` — `isAudioParam`: `true` — `connector`: `connectGain` — `disconnector`: `disconnectGain`
Sets the volume of the tone.

#### `generator` — *`AudioComponent`* — `defaultValue`: `{className: 'SineOscillator'}` — `isAudioComponent`: `true` — `inputIndex`: `0`
The raw audio signal itself.  It should generally be between `-1` and `1`, but that's not strictly necessary, just convenient.

#### `envelope` — *`AudioComponent` (ideally `Envelope`)* — `defaultValue`: `{className: 'ADSREnvelope'}` — `isAudioComponent`: `true` — `inputIndex`: `1`
An `AudioComponent` that produces a time-varying gain, often ramping up from 0 at the point of articulation, staying at 1 for the duration of the tone, then ramping back down to 0 on release.  It can be any `AudioComponent` (a pure number will be changed into a `ConstantGenerator`), but if the value is an `Envelope`, post-`release()` functionality is available.

#### `frequency` — *number or `AudioComponent` or `null`* — `defaultValue`: `null` — `getter`: `getFrequency` — `setter`: `setFrequency`
This property allows for convenience when creating a `Tone`, since normally the `frequency` would be a property of the `generator`, not the `Tone`.  A `getter` and `setter` are needed to harmonize this property with the `frequency` of the `generator`.  A `null` value leaves the `generator`'s `frequency` alone.

### Class Fields

#### `processorName` — *string* — `'MultiplierProcessor'`
#### `numberOfInputs` — *number* — `2`

### Instance Fields

#### `gainNode` — *`GainNode`*
The `GainNode` that serves as the final output for the `Tone`.  The `node` is connected to it.

#### `isFrequencySetOnGenerator` — *boolean* — default value: `false`
When `frequency` is set on `generator`, this flag is set to `true`.  During instantiation, the properties may get set in the wrong order, with `frequency` being set before `generator`, in which case `frequency` would not have gotten set on `generator`.  If this is the case, during `finishSetup()`, that problem is rectified.

### Instance Methods

#### `finishSetup()`
Also propagates the `frequency` to the `generator`, if  isn't `null` (and this hasn't already happened).

#### `createNode()`
Also sets up the `gainNode`.

#### `cleanupNode()`
Also tears down the `gainNode`.

#### `connectGain()`
#### `disconnectGain()`
Connects/disconnects the `gain` property to/from the `gainNode`'s `gain` `AudioParam`.  If `gain` is just a number, simply assigns that number to the `value` of the `AudioParam`, but if it's an `AudioComponent`, we first need to set the `value` of the `AudioParam` to `0` so that the output of the `AudioComponent` doesn't add to the existing `value`.

#### `getNodeFromFilter()` — *`AudioNode`* — `gainNode`
#### `getNodeToDestination()` — *`AudioNode`* — `gainNode`
These methods provide the `AudioNode` structure for `Tone`.  The connection between `node` and `gainNode` happens automatically in `connectFilter()` thanks to these methods.

#### `getFrequency()` — *number or `AudioComponent`*
Gets the `frequency` property of the `generator` property.  If that is `null` or `undefined`, returns the value of the `frequency` field of the `Tone` itself.

#### `setFrequency(<frequency>)`
Sets the `frequency` field to `<frequency>` and, if `generator` is present, calls `generator.setPropery('frequency', <frequency>)`.

#### `release(<callback>)`
Calls `registerCallback(<callback>)`.  If `envelope` is an `Envelope`, calls `startRelease()` on it, passing in a callback that calls `this.stop()` when the `Envelope` is done; if not, calls `stop()`.




## Sequence < Playable < AudioComponent < Component

Activates a sequence of events on an audio-rate timer.  You can use this to play a whole song, for example.  Timer precision is necessarily within 128 samples, though, since that's the buffer size of the `AudioWorkletProcessor`.  The `Sequence` will not end unless you specifically end it, either by calling `stop()` or `release()` or setting a `duration` (property from `Playable`), or using a `SequenceAction` within the sequence to trigger one of these methods.

### Properties

#### `instruments` — *array of instruments* — `defaultValue`: `[]` — `setter`: `'setIntruments'` — `cleaner`: `'cleanupInstruments'`
A list of instruments (see the Instruments section above) to add to the `orchestra` when the `Sequence` is created.  The instruments are removed from the `orchestra` on cleanup.

#### `events` — *array of `Event`s* — `defaultValue`: `[]` — `getter`: `'getEvents'` — `setter`: `'setEvents'`
The `Event`s.  The events in the array are registered in order, and since events can be timed based on the previous registered event (by populating the `after` field rather than the `time` field in the event), it's probably a good idea to put the events in the order in which you want them to be executed.

#### `beforeEvents` — *array of `Event`s* — `defaultValue`: `[]`
#### `afterEvents` — *array of `Event`s* — `defaultValue`: `[]` — `cleaner`: `null`
When `play()` is called, `executeEvent()` is called on all `Event`s in `beforeEvents` before playing starts, and likewise, after `stop()` is called and the `Sequence` stops, all `Event`s in `afterEvents` are executed.  Both are called in the order they're in.  `afterEvents` are executed after the `cleanup()` step, so `cleaner` is `null`.

#### `componentCreationLeadTime` — *number* — `defaultValue`: `null`
If this value is not `null`, a special creation event will be added before every event that has an `action` to create the `action` as a `Component`.  This allows the `action` to start promptly, since `Component` creation can be costly.

### Class Fields

#### `processorName` — *string* — `'AudioComponentProcessor'`
Only the base features of the `AudioComponentProcessor` are required here, specifically, its `timer` and timed event handling capabilities.  No audio is actually produced.

### Instance Fields

#### `events` — *object where the keys are numbers and the values are the `Event`s* — default value: `null`
The `events` property contains an array, but when they get stored in the `Sequence`, they get added to the `events` object with a numeric key, making `events` similar to an array.  The message that triggers an event (or creates an event's `action`) refers to the event by its key in this array.

#### `necessaryEvents` — *array of `Event`s* — default value: `[]`
`Event`s in `events` that are part of cleanup.  These `Event`s are executed before the `afterEvents` when `stop()` is called (provided that the necessary `Event`s have been executed first).

#### `lastEventTime` — *number* — default value: `0`
The time of the most recent `Event` recorded.

#### `eventCounter` — *number* — default value: `0`
The key for the current event added to the `events` object.

#### `playing` — *array of `Playable`s* — default value: `[]`
When a `PlayAction` is performed, the action's `playable` is added to this array, so that if `stop()` or `releaseAll()` is called on the `Sequence` itself, it knows what dependent `Playable` objects it also needs to `stop()`.

#### `created` — *array of `Component`s* — default value: `[]`
When a `CreateAction` is performed, the action's `component` is added to this array, so that if `stop()` is called on the `Sequence` itself, it knows what dependent `Component` objects it also needs to `cleanup()` (and possibly turn `off()`).

### Instance Methods

#### `setInstruments(<instruments>)`
Calls `cleanupInstruments()`, sets the `instruments` field to `[]`, and calls `addInstrument()` on each instrument in the passed-in `<instruments>` array.

#### `addInstrument(<instrument>)`
If `<instrument>` is actually an array, calls `addInstrument()` on each element of the array (this is so that you can add instruments after the `Sequence` has been created).  Adds the `<instrument>` to the `orchestra` and to the `instruments` field.

#### `cleanupInstruments()`
Removes from the `orchestra` every instrument in the `instruments` field.

#### `getAllAfterEvents()` — *array of `Event`s*
Returns the concatenated contents of `necessaryEvents` and `afterEvents`.

#### `setEvents(<events>)`
Empties the `events` object and called `addEvent()` on each `Event` in the `<events>` array, in order.

#### `addEvent(<event>, <recordTime>)`
Adds the given `<event>` to the `events` object under the `eventCounter` key (and to `afterEvents` if `afterEvent` has a valid value), and, if `<recordTime>` is `true`, also sets `lastEventTime`.  If the `<event>` doesn't have a `time`, it's computed based on the `lastEventTime` and `<event>.after`; if the `node` is not `null`, `registerTimedEvent()` is called to set the processor up to trigger the `<event>` when its `time` comes.  If `componentCreationLeadTime` is `true` and `<event>.action` is an object and not already a created component, a new creation event is also created and `addEvent()` is called on it, with a `<recordTime>` of `false` since we don't want this automatically generated creation event to interfere with the timing of the other events.

#### `registerPlayable(<playable>)`
Adds `<playable>` to the `playing` array so that if `stop()` or `releaseAll()` is called on the `Sequence`, it knows what's playing.

#### `registerCreated(<component>)`
Adds `<component>` to the `created` array so that if `stop()` is called on the `Sequence`, it knows what needs to be cleaned up.

#### `handleTriggeredEvent(<eventIndex>)`
Calls the super's method, then executes the `Event` stored in `events.<eventIndex>` by calling `executeEvent()`.

#### `executeEvent(<event>)`
Executes the `<event>` if `<event>.isDone` is not `true`, then sets `<event>.isDone` to `true`.  See the documentation for `Event` for details on how `Event`s get executed.

#### `createNode()`
Calls the super's method, then registers all `Event`s in the `events` object with the processor.

#### `removeFromPlaying(<playable>, <stop>)`
Removes `<playable>` from `playing` array if it's there.  If `<stop>` is `true` and the `playing` array is empty, calls `stop()`.

#### `removeFromCreated(<component>)`
Calls `off()` on the `<component>` if it is an `AudioComponent`, then calls `cleanup()` on the `<component>` and removes it from the `created` array.

#### `release(<callback>)`
Calls `registerCallback(<callback>)`, then calls `release()` on all `Playable`s stored in `playing`, removing them from the array when they're done.  When the array is empty, `stop()` is called, which calls the `<callback>` if one was provided.

#### `releasePlaying()`
Calls `release()` on all `Playable`s stored in `playing`, removing them from the array when they're done.

#### `stop()`
Calls `stop()` on all `Playable`s stored in `playing`, calls `removeFromCreated()` on all `Component`s stored in `created`, then calls the super's method.  After this, executes all `necessaryEvents` that need to be executed, then all the `afterEvents`, calling `cleanup()` on their `action`s as necessary.




## Event *(interface)*

`Event` is not a real class; it's just the interface `Sequence` expects for its `events`.  You shouldn't attempt to instantiate it like a `Component`, and `o.Event` is not defined.  In general, an `Event` contains some timing information and some sort of action to be performed at the specified time, but that action can be `Component` creation, arbitrary code execution, or an `Action` object of some sort.

### Instance Fields

#### `id` — *string*
An arbitrary ID for the `Event`, in case you need to refer to it in another `Event`.  It's optional, but it should be unique in the `Sequence` if provided.

#### `isDone` — *`undefined` or `true`*
Set by the `Sequence` when the event is executed.

#### `time` — *number*
#### `after` — *number*
The time at which to trigger the `Event`.  Exactly one of these should be provided for timed events; these fields are ignored for untimed events (like those in `beforeEvents` and `afterEvents` in a `Sequence`).  If `time` is provided, the `Event` will trigger at time `time`; if `after` is provided, the `Event` will trigger at a time `after` after the previous `Event` in the `Sequence`.

#### `action` — *a function, an `Action`, or a definition of an `Action`*
#### `create` — *eventIndex*
The action to be performed.  Exactly one of `action` and `create` should be provided.  If `action` is a function, the function will be called at the specified time.  If `action` is an instance of `Action`, its `perform()` method will be called at the specified time.  If `action` is an object, it will be assumed to be the definition for an `Action`, so it will be created using `o.createComponent()` (with the `Sequence`'s `player` and `registry`) and then `perform()` will be called on it.  If `create` is provided instead, if the `Event` at the given `eventId` in the `Sequence`'s `events` object contains an `action` that is not an `Action`, `o.createComponent()` will be called on it but `perform()` will not be called (since it will presumably be called later).

#### `afterEvents` — *boolean, `id` string, or array of `id` strings*
The event will also be added to the `Sequence`'s `necessaryEvents` but executed only if the `Event`s corresponding to the passed-in `id`s have already been executed (which is always true if `afterEvents` is `true` or `[]`, as there are no referred-to `Event`s).  Since `Event`s only get executed once, if it is executed in the main sequence, it is not executed afterwards.  The `Event` will not get executed in the main sequence at all if the `Event`s named in `afterEvents` have not already been executed.




## Action < Component

An abstract `action` for an `Event`.  Doesn't do anything on its own.

### Instance Fields

#### `isAction` — *boolean* — `true`

### Instance Methods

#### `perform(<sequence>)`
Does nothing in this class, then calls `cleanup()`; override it in subclasses, but call `super.perform()` to ensure that `cleanup()` gets called (though it may not actually do anything either).  `<sequence>` should be the `Sequence` that is executing the `Event` hosting this `Action`.




## PlayAction < Action < Component

An `Action` that plays a given `Playable` and stores it in the parent `Sequence`'s `playing` array to make sure it can be `release()`d or `stop()`d as necessary.  

### Properties

#### `playable` — *`Playable`* — `defaultValue`: `null` — `cleaner`: `null`
The `Playable` that will be `play()`d.  `Playable`s clean themselves up, so there's no need for a `cleaner`.

### Instance Methods

#### `perform(<sequence>)`
Calls `play()` on `playable` then calls `<sequence>.registerPlayable()` with the `playable`.




## MethodAction < Action < Component

An `Action` that calls a named `method` on the `target` object, passing in `arguments`.  In a pure JSON context, this allows for code execution without needing to use actual code.

### Properties

#### `target` — *object* — `defaultValue`: `null` — `cleaner`: `null`
#### `method` — *string* — `defaultValue`: `null`
Assuming both `target` and `method` are populated and valid, `method` will be called on `target` with the arguments specified in `arguments`.  `target` is assumed to need to live beyond the lifetime of the `Action` itself and thus does not need a `cleaner`, and `method` is a string so it doesn't get cleaned up in the first place.

#### `arguments` — *value or array* — `defaultValue`: `null` — `cleaner`: `null`
The arguments to pass into `method`.  If it's `null`, no arguments will be passed.  If it's a value that is not an array, that value will be passed as the only argument.  If it's an array, the elements of the array will be the arguments.  If you want to pass in a single argument that is an array (or you want to pass in `null` as an argument), you should put it in an array.  So, for example, if you want to have `[foo]` as an argument, `arguments` should be `[[foo]]`; if you want `null` as an argument, `arguments` should be `[null]`.  It is assumed that the `arguments` will not need to be cleaned up at the same time as the `Action`.

### Instance Methods

#### `perform(<sequence>)`
If things are valid, calls `method` on `target`, with the provided `arguments` if there are any.




## SequenceAction < MethodAction < Action < Component

A `MethodAction` whose target is the `Sequence` that called `perform()` on it.  Useful for having a `Sequence` call `release()` on itself.

### Properties

#### `target` — *object* — `value`: `null` — `cleaner`: `null`
This gets set by the `perform()` method to the `Sequence` instance that called said method.

### Instance Methods

#### `perform(<sequence>)`

Sets the `target` property to `<sequence>`, then calls the superclass's `perform()` method.




## CreateAction < Action < Component

Creates a `component` and, optionally, turns it `on()` and manages its lifecycle through the `Sequence` that performs this `Action`.

### Properties

#### `component` — *`Component`* — `defaultValue`: `null` — `cleaner`: `null`
The `Component` to be created.  Technically speaking, creation actually happens when the `Action` itself is created.  If you want this `component` to actually *do* anything, you will probably want to give it a `name` so that it can be added to the `Sequence`'s `registry`.

#### `store` — *boolean* — `defaultValue`: `true`
If `true`, adds the created `component` to the `<sequence>`'s `created` array when `perform(<sequence>)` is called.  This allows the `<sequence>` to call `cleanup()` on the `component` when `stop()` is called on the `<sequence>`.  If you don't do this, you'll probably want to call `cleanup()` yourself somehow.

#### `run` — *boolean* — `defaultValue`: `true`
If `true` and `component` is an `AudioComponent`, calls `on()`.

### Instance Methods

#### `perform(<sequence>)`
If the `component` is not null, it turns it `on()` if it's an `AudioComponent` and `run` is true, and it adds it to the `<sequence>`'s `created` array if `store` is `true`, then calls the superclass's method.




## CleanupAction < Action < Component

Cleans up a `component` that has been stored in the `Sequence` (through a `CreateAction`), removing it from the `Sequence`'s `created` array.

### Properties

#### `component` — *`Component` or ref* — `defaultValue`: `null` — `cleaner`: `null`
The `Component` to be cleaned up.  It should probably be a ref rather than a definition or a `Component`, since presumably you want to clean up an existing `Component`.

### Instance Methods

#### `perform(<sequence>)`
Calls `<sequence>.removeFromCreated()` (if `component` is not `null`) then the super's method.




## PropertyAction < Action < Component

Sets properties on a `Component` (or other object), traversing a `path` of properties, fields, and indices.

### Properties

#### `component` — *`Component` or object* — `defaultValue`: `null` — `cleaner`: `null`
The object on which to set the properties.  If you want to set a property of a property of this object, simply use the `path` property.  If the target object at the end of the `path` is not a `Component`, the fields named in `properties` will simply be set to the values named in `properties`.

#### `properties` — *object* — `defaultValue`: `{}`
An object whose keys are property names and whose values are the property values to set (the argument to a `Component`'s `setProperties()` method).

#### `path` — *strings or array of strings* — `defaultValue`: `[]`
A list of property names and fields to traverse in order to reach the actual object whose properties will be set.  Leave as `[]` to set properties on the passed-in `component` itself.  If, when traversing the `path`, a particular property value is not a `Component`, the `path` is treated as a dot path instead.  For example, if a particular property value is an array, the next `path` element could be a numerical index into that array.

### Instance Methods

#### `perform(<sequence>)`
Sets the `properties` on the `component` at the specified `path`.  If the path doesn't actually exist on the `component`, nothing happens.




## Tuning < Playable < AudioComponent < Component

An `AudioComponent` whose processor parses a note name into a frequency (or a number in general).  You might pass in, for example, `'Eb5'`, and the `Tuning`'s processor may be able to interpret that as around 622.25, or whatever number.  The `Tuning` processor itself only provides the framework; you should generally use one of its subclasses.  `Tuning` is a `Playable` and its processor actually outputs (silence) directly to the `Player`, since otherwise the worklet would have 0 outputs and wouldn't be part of the audio graph; therefore, you must call `play()` on this to make it work, and `stop()` and `cleanup()` to clean up.  All of the note parsing logic lives in the `TuningProcessor` subclass used by subclasses of `Tuning`.

### Properties

#### `tuningName` — *string* — `defaultValue`: `null` — `isProcessorOption`: `true`
The name of this `Tuning`.  This is important, because any `Note` that uses this `Tuning` will need to refer to it by its name.  The `Player` instance's default `Tuning` is named `12TET`.  This name is actually stored in the `OfftonicAudioplayer` object (inside its `tunings` field) in the `AudioWorkletGlobalScope` so that `NoteProcessor`s can query the tunings for note values in `AudioWorklet`-land.

### Class Fields

#### `processorName` — *string* — `'TuningProcessor'`

### Instance Methods

#### `getTuningName()` — *string*
Returns the value of the `tuningName` property as a convenience.  This method is used to create components, so maybe don't override it.



## TuningProcessor < AudioComponentProcessor < AudioWorkletProcessor

Provides a (not very useful) `parseNote()` method for subclasses to override and handles registering the tuning under its `tuningName`.  Subclasses should actually implement note-parsing logic.  The processor is registered in the constructor, whereupon `NoteProcessor`s may access it through the `OfftonicAudioplayer` object in the `AudioWorkletGlobalScope` (by calling `OfftonicAudioplayer.getTuning(<tuningName>)`).  The processor is unregistered when it receives a `done` message.  The functions of `OfftonicAudioplayer` that deal with tunings are defined in this file.

### Processor Options

#### `tuningName` — *string*
The name by which this `TuningProcessor` is registered.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
Listens for when `done` is set to `true`, at which point it deregisters the `TuningProcessor`.  If this is overridden, `super._process(<outputs>)` should probably be called last.

#### `parseNote(<note>, <frame>)` — *number*
Returns `0`.  Subclasses should override this.  The intention is that `<note>` is the name of a note, in whatever note-naming syntax happens to be appropriate, and `<frame>` is the frame of the processor, in case that matters.



## MeantoneTuning < Tuning < Playable < AudioComponent < Component

The standard Western tuning.  Give it an `octave` and a `fifth`, in cents, and its processor can parse any standard note name.

### Properties

#### `octave` — *number* — `defaultValue`: `1200` — `isAudioParam`: `true`
The size, in cents, of the octave.  The standard octave is 1200¢, so this is the default value, but there are musical reasons to change this (usually not by very much).

#### `fifth` — *number* — `defaultValue`: `700` — `isAudioParam`: `true`
The size, in cents, of the perfect fifth.  In 12-tone equal temperament, where 12 notes in an octave are equally spaced, the fifth is 700¢, so this is the default value, but other tunings use other values.  For example, 31-tone equal temperament (which is very close to quarter-comma meantone) has a fifth of 1200¢·18/31 ≈ 696.774.  A discussion of the musical effects of this value is outside the scope of this documentation.

### Class Fields

#### `processorName` — *string* — `'MeantoneTuningProcessor'`



## MeantoneTuningProcessor < TuningProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor for parsing the names of meantone notes into frequencies.  To use it, access it through its `tuningName` by calling `OfftonicAudioplayer.getTuning(<tuningName>).parseNote()`.  See the `parseNote()` method reference for the syntax.

### AudioParams

#### `octave`
#### `fifth`
The size of the octave and fifth, in cents, used in the tuning.  These can change dynamically, which is why they're `AudioParam`s.

### Class Fields

#### `noteRegex` — *string*
Regex to parse the note name.  It contains two capture groups; group 1 is the name of the note (Eb, Fx, etc.) and group 2 is the octave number (4, –3, etc.).  Subclasses should probably reimplement this if they intend to change the note name parsing behavior.

#### `nameMap` — *object*
This is a map where the keys are characters in a note name (`'G'`, `'#'`, etc.) and the values are objects where the keys are `octaves` and `fifths` and the values are how many octaves or fifths up that character is.  All note letter names are measured up from C, so `'D'`, for example, maps to `{octaves: -1, fifths: 2}` since to get a D from C you go up two fifths and down an octave.

#### `standardC4` — *number*
The frequency of a *standard* C4, Middle C, in Hz, which is exactly 440/2^0.75.  C4 doesn't have to correspond to this value in practice, but this number is used as a point of reference.

### Instance Methods

#### `parseNote(<note>, <frame>)` — *number*
This method is called by other classes (such as `NoteProcessor`s) via this tuning's `tuningName` (see the `TuningProcessor` documentation).  Parses a note name (at a given frame of the buffer) and returns its frequency.  The `<frame>` is important if the tuning is changing dynamically.  `<note>` should be of the form [letter(s)][accidentals][octave], where [letter(s)] is one (or more) uppercase `A`, `B`, `C`, `D`, `E`, `F`, or `G`, [accidentals] is any combination of `b`, `#`, `x`, `d`, and `t`, and [octave] is the octave number, which must be digits only, possibly preceded by a `-`.  Examples: `'Bbb7'`, `'Ct#-1`, `Gb#15`.  `d` is a half-flat and lowers the pitch by exactly half of a flat, and `t` is a half-sharp and raises the pitch by exactly half of a sharp (which is the same as half of a flat).  Accidentals can be combined at will.  Actually, you can combine letter names too, though that's possibly a bit weird; the note `'EE4'` is equivalent to `'G#4'` because under the hood `E` raises C by a major third, and `'EE'` would just be doing that twice.  But you *can* do it if you really want, since the note name is parsed character by character (so long as it follows the [letter(s)][accidentals][octave] pattern).  Note that octave numbers are applied independently of the letters/accidentals, which is standard, so B#3 is actually higher than Cb4.  This might seem weird to you, but again, it's standard behavior for octave numbers.





## ConstantGenerator < AudioComponent < Component

An `AudioComponent` whose `node` is a `ConstantSourceNode`.  Useful when a value is a number but an `AudioComponent` is expected.  Note that, despite the name, `ConstantGenerator` is *not* a `Generator`.

### Properties

#### `value` — *number* — `defaultValue`: `0` — `isAudioParam`: `true` — `paramName`: `'offset'`
The number output by the `node`.  You can change it by setting this property.

### Class Fields

#### `isNativeNode` — *boolean* — `true`
Reflects the fact that `node` is a `ConstantSourceNode` rather than an `AudioWorkletNode`.

### Instance Methods

#### `createNode()`
Sets up the `ConstantSourceNode`, assigns it the `value` property if possible, and calls `start()` on it.

#### `cleanupNode()`
Stops the `ConstantSourceNode` then calls the overridden method.




## Generator < AudioComponent < Component

A base class for any `AudioComponent` that wants to generate a signal.  It provides a `scaling` and an `offset` to linearly transform a signal.  Note that any `AudioComponent` with a processor that extends `GeneratorProcessor` should extend `Generator` as well.

### Properties

#### `scaling` — *number or `AudioComponent`* — `defaultValue`: `1`
#### `offset` — *number or `AudioComponent`* — `defaultValue`: `0`
A generated signal, produced by `generate()` in a processor that extends `GeneratorProcessor`, gets multiplied by `scaling` and added to `offset` each frame.  If, for example, you have a `SineOscillatorProcessor` generating a sine wave centered at 0 with amplitude 1, going from –1 to 1, you can use the `scaling` to reduce the amplitude to 0.1 and the `offset` to center the wave around 1, causing it to go from 0.9 to 1.1 instead.  This transformation is applied *after* `generate()` is called, so it doesn't affect any internal variables.

### Class Fields

#### `processorName` — *string* — `'GeneratorProcessor'`




## GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Superclass for 0-input 1-output processors that generate a signal.  It generates a single value per audio frame, scales it and applies an offset, and populates all channels of the output with that value at each frame.  Note that any `AudioComponent` with a processor that extends `GeneratorProcessor` should extend `Generator` as well.

### AudioParams

#### `scaling`
#### `offset`
A generated signal, produced by `generate()`, gets multiplied by `scaling` and added to `offset` each frame.  If, for example, you have a `SineOscillatorProcessor` generating a sine wave centered at 0 with amplitude 1, going from –1 to 1, you can use the `scaling` to reduce the amplitude to 0.1 and the `offset` to center the wave around 1, causing it to go from 0.9 to 1.1 instead.  This transformation is applied *after* `generate()` is called, so it doesn't affect any internal variables.

### Instance Fields

#### `frame` — *number* — default value: `0`
The current frame of the buffer, which is usually 128 frames long so this number typically goes from `0` to `127`.  This allows you to use `this.frame` whenever you need to get a parameter in the generator function.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
On each frame, sets the `frame` field, calls `generate()`, multiplies that value by the `value` of the `scaling` `AudioParam` and adds the `value` of the `offset` `AudioParam`, and puts that value into all of the channels of the output.  You should probably not override this method in subclasses.

#### `generate()` — *number* — `0`
Returns 0.  You should override this method in subclasses.




## GeneratorSequence < Generator < AudioComponent < Component

Generates a signal that combines other generators in sequence to create a piecewise signal.  For example, you could combine a `LinearGenerator` to ramp a signal up from, say, 500 to 1000 over 3000 ms, then use a `SineOscillator` to wave the signal from 1000 down to 900 and up to 1100 for the next 4000 ms, etc.

### Properties

#### `timer` — *`Timer`* — `defaultValue`: `{ref: 'Default Timer'}` — `isAudioParam`: `true`
Overrides `AudioComponent`'s `timer` property to set a default.

#### `pieces` — *array of `Piece`s* — `defaultValue`: `[]` — `setter`: `'setPieces'`
List of generators to play and times to play them according to the `timer`.  `Piece` is not an actual class, just an interface similar to `Event` in `Sequence`.  See below.

#### `componentCreationLeadTime` — *number* — `defaultValue`: `null`
How long before a generator is active that its `Component` should be created.  If it's null, it will be created at the time scheduled for playing it then played right away.

### Class Fields

#### `processorName` — *string* — `GeneratorSequenceProcessor`

### Instance Fields

#### `pieces` — *object with numberic keys and `Piece` values* — `{}`
The list of `Piece`s for the `GeneratorSequence` to play.  The property with this name is an array, but the array is processed by `setPieces()` in order and the `Piece`s are added here one at a time, then executed via their numeric key.

#### `lastPieceTime` — *number* — `0`
Keeps track of the time scheduled for the last `Piece` added to the sequence.

#### `pieceCounter` — *number* — `0`
Keeps track of the index of the next `Piece` to add.

#### `currentGenerator` — *`AudioComponent`*
The generator that is currently playing.

#### `heldCallback` — *function*
A callback that will be executed when a `'hold'` message is sent to the `node` and acknowledged.  See `connectGenerator()` for details.

### Instance Methods

#### `setPieces(<pieces>)`
Calls `addPiece()` on each piece, in order.

#### `addPiece(<piece>, <recordTime>)`
Adds the `<piece>`.  If the `<piece>` has a `time` field, that will be the time at which the `Piece` is executed, but if it has an `after` field, a `time` will be populated by adding the `lastPieceTime` to the `after` time of the `<piece>`.  This time will be the new `lastPieceTime` if `<recordTime>` is `true`, but for events that shouldn't disturb other `Piece`s, you may want this to be `false`.  If there is an active `node`, the event will be registered.  If there is a `componentCreationLeadTime`, a new creation `Piece` will be added, with an earlier `time`, pointing to this `Piece`.

#### `handleTriggeredEvent(<pieceIndex>)`
Calls the superclass's method, then if `<pieceIndex>` is a valid index of a `Piece` in `pieces`, executes that `Piece`.

#### `executePiece(<piece>)`
Executes the given `<piece>` if `<piece>.isDone` is not `true`, then sets `<piece>.isDone` to `true`.  If the `<piece>` has a `generator`, that `generator` is created if necessary and `connectGenerator()` is called on it; if the `<piece>` has a `create` instead, the `generator` of the `Piece` with index `create` is created and put in that `Piece`'s `generator` field.

#### `createNode()`
Creates the `node` (by calling the superclass's method) and registers all of the `Piece`s as timed events with the processor.  If a piece is currently active, connects that generator to the `node` as well.

#### `connectGenerator(<generator>)`
Connects the given `<generator>`, possibly only after asking the current generator to hold by sending a `'hold'` message to the processor and setting up a `heldCallback` that actually connects the `<generator>`.  The processor replies with a `'held'` message, and the `SequenceGenerator` upon receipt executes the `heldCallback` function.

#### `performGeneratorConnection(<generator>)`
Actually performs the connection; called by `connectGenerator()`.  Once the `<generator>` is connected, the processor's value is unheld.

#### `disconnectCurrentGenerator()`
Disconnects `currentGenerator` from the `node`.

#### `holdValue(<heldCallback>)`
Sends a `'hold'` message to the processor to hold its current value and saves the `<heldCallback>` function in `heldCallback` for when the processor acknowledges with a `'held'`.

#### `receiveMessage(<message>)`
Calls the superclass method; if `<message>.data` has the value `'held'`, calls the `heldCallback` and sets it to `null`.

#### `unholdValue()`
Sends an `'unhold'` message to the processor to stop holding its current value.




## Piece *(interface)*

`Piece` is not an actual class; you cannot instantiate it with `o.createComponent()`.  Rather, it's just a format for the individual piecewise generators and associated events for `GeneratorSequence`s.  You pass in an array of `Piece`s to the `pieces` property of `GeneratorSequence`, and `GeneratorSequence` stores these `Piece`s internally in a slightly different format.

### Instance Fields

#### `isDone` — *`undefined` or `true`*
Set by the `GeneratorSequence` when the `Piece` is executed.

#### `time` — *number*
#### `after` — *number*
The time at which to trigger the `Piece`.  Exactly one of these should be provided.  If `time` is provided, the `Piece` will trigger at time `time`; if `after` is provided, the `Piece` will trigger at a time `after` after the previous `Piece` in the `GeneratorSequence`.  Internally, `after` is converted to `time` when the `pieces` array is compiled.

#### `generator` — *`AudioComponent`*
The generator to connect when the `Piece` is executed.

#### `create` — *number*
The numeric key of the `generator` to create (using `o.createComponent()`) when this `Piece` is executed.  A `Piece` with a `create` field does not directly affect the output of the `GeneratorSequence`'s `node`, but it may improve performance.




## GeneratorSequenceProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Simply outputs whatever is in its `generator` `AudioParam`, possibly holding the last value if there's nothing connected there.

### AudioParams

#### `generator`
A connected source of numbers.  The underlying `GeneratorSequence` will connect these and replace them in the course of the execution of the sequence.

### Instance Fields

#### `lastValue` — *number* — '0'
#### `isHolding` — *boolean* — 'false'
Fields to keep track of the last value generated and whether that value is being held, which happens when the `generator` is disconnected since generally you don't want to output 0's in between generators.

### Instance Methods

#### `generate()` — *number*
If `isHolding` is `false`, grabs the next value from the `generator` `AudioParam` and saves it to `lastValue`; returns `lastValue`.

#### `receiveMessage(<message>)`
Calls the superclass method; if `<message>` contains `'hold'`, sets `isHolding` to `true`; if `'unhold'`, sets `isHolding` to `false`.




## LinearGenerator < Generator < AudioComponent < Component

Generates a linear change in value.  This can be useful when varying a parameter.

### Properties

#### `timer` — *`Timer`* — `defaultValue`: `{ref: 'Default Timer'}` — `isAudioParam`: `true`
Overrides `AudioComponent`'s `timer` property to set a default.

#### `startTime` — *number* — `defaultValue`: `0` — `isProcessorOption`: `true`
#### `startValue` — *number or `AudioComponent`* — `defaultValue`: `0` — `isAudioParam`: `true`
#### `endTime` — *number* — `defaultValue`: `1000` — `isProcessorOption`: `true`
#### `endValue` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
The `LinearGenerator` starts with `startValue`.  At time `startTime` according to the `timer` (see `isAbsolute`), it starts ramping the value linearly to reach `endValue` at `endTime`, which it will keep outputting.  Note that `startValue` and `endValue` can be dynamic.

#### `isAbsolute` — *boolean* — `defaultValue`: `false` — `isProcessorOption`: `true`
Whether `startTime` and `endTime` are absolute or relative to when the `LinearGenerator` was first turned `on()`.  If `isAbsolute` is `true`, a `startTime` of 500 will mean that the ramp-up will start when the `timer` says 500; if `isAbsolute` is `false`, a `startTime` of 500 will mean that the ramp-up will start 500 `timer` counts after the processor starts.

### Class Fields

#### `processorName` — *string* — `LinearGeneratorProcessor`




## LinearGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Generates a linear change in value.  This can be useful when varying a parameter.

### AudioParams

#### `startValue`
#### `endValue`
The start and end values, respectively.

### Processor Options

#### `isAbsolute` — *boolean*
Whether `startTime` and `endTime` are absolute numbers on `timer` or are relative to when the processor starts.

#### `startTime` — *number*
#### `endTime` — *number*
The `LinearGeneratorProcessor` starts with `startValue`.  At time `startTime` according to the `timer` (see `isAbsolute`), it starts ramping the value linearly to reach `endValue` at `endTime`, which it will keep outputting.

### Instance Fields

#### `timesSet` — *boolean* — default value: `isAbsolute`
When the processor is constructed, we don't actually have any data from its `AudioParam`s, so we don't know what time the `timer` says.  If `isAbsolute` is `false`, we still need to calculate `startTime` and `endTime`, so we set this flag to `false` and fix the issue when we do have the data available.

### Instance Methods

#### `generate()` — *number*
If `timesSet` is `false`, adds the current `timer` time to `startTime` and `endTime` and sets `timesSet` to `true`.  If the current time according to the `timer` is before `startTime`, returns `startValue`; if after `endTime`, returns `endValue`; otherwise, returns an interpolation between them by calling `interpolate()`.

#### `interpolate(<time>)` — *number*
Returns a linear interpolation such that at `<time>` equal to `startTime` the value is `startValue` and at `<time>` equal to `endTime` the value is `endValue`, which is equivalent to the formula `startValue` + (`endValue` – `startValue`) · timeFraction, where timeFraction is computed by calling `timeFraction()`.  This can be overridden in subclasses that keep the same general behavior but interpolate using a different method.  Note that `startValue` and `endValue` can change, so the interpolation is always between the *current* `startValue` and `endValue`.

#### `timeFraction(<time>)` — *number*
Returns the fraction of the way through the time of the generator, equal to (`<time>` – `startTime`)/(`endTime` – `startTime`).




## ExponentialGenerator < LinearGenerator < Generator < AudioComponent < Component

Generates an exponential (or geometric) change in value, which can be useful when varying a frequency by applying a constant change in pitch.

### Properties

#### `startValue` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `endValue` — *number or `AudioComponent`* — `defaultValue`: `2` — `isAudioParam`: `true`
The start and end values, inherited from `LinearGenerator` but with their default values changed since `0` is not a valid value for an exponential.

#### `baseline` — *number or `AudioComponent`* — `defaultValue`: `0` — `isAudioParam`: `true`
The quantity that changes exponentially is the distance from this `baseline`.  For example, if the `baseline` is 100, the `startValue` is 101, and the `endValue` is 104, what's really happening here is that the value starts at 1 above the `baseline` and grows to 4 above the `baseline`, meaning that at the midpoint in time, it's at 102, which is 2 above the `baseline`.  The values can also lie below the `baseline`, so if the `baseline` is still 100 but the start and end values are 91 and 99, respectively, those values are 9 below the `baseline` and 1 below the `baseline`, meaning that halfway through the time, the value will be 3 below the `baseline`, or 97.  It is not valid for the value to cross the `baseline`, meaning that the exponential changes sign (or goes to 0), because exponentials are always positive (we're dealing only with real numbers here).

### Class Fields

#### `processorName` — *string* — `ExponentialGeneratorProcessor`




## ExponentialGeneratorProcessor < LinearGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Generates an exponential (or geometric) change in value, which can be useful when varying a frequency by applying a constant change in pitch.

### AudioParams

#### `baseline`
See the property in `ExponentialGenerator`.  The quantity that changes exponentially is the distance to the `baseline`.

### Instance Methods

#### `interpolate(<time>)`
Interpolates the value exponentially.  If startDelta = `startValue` – `baseline` and endDelta = `endValue` – `baseline`, then the current value is `baseline` + startDelta · (endDelta/startDelta)^timeFraction, where timeFraction is computed using `timeFraction()`.  To avoid this arbitrary-base exponential, we do this computation using logs instead: logDelta = logStartDelta + (logEndDelta – logStartDelta)·timeFraction, and the current value is `baseline` ± exp(logDelta), where the sign matches the direction of the original deltas.




## Oscillator < Generator < AudioComponent < Component

Generates a wave at a given `frequency`.  Initial phase can also be specified.  This can be your basic sound wave, but it can also be a used in LFO (low-frequency oscillation), maybe to guide a vibrato, for example.  The wave shape here is unspecified; its subclasses provide the wave shape.  You should subclass this when you want a wave that is generated as a function of a single phase, like a sine wave.

### Properties

#### `frequency` — *number or `AudioComponent`* — `defaultValue`: `440` — `isAudioParam`: `true`
The frequency of the oscillator, in Hz.

#### `initialPhase` — *number* — `defaultValue`: `null` — `isProcessorOption`: `true`
The initial phase of the oscillator.  It probably doesn't matter very much for sound waves, but it does matter in some applications, especially if you want to sync up multiple waves.

### Class Fields

#### `processorName` — *string* — `'OscillatorProcessor'`




## OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor to generate a wave at a given frequency.  This class is intended to be abstract; the wave it produces is just silence.  However, subclassing `OscillatorProcessor` is extremely easy, since you just need to provide one single function, the `wave()` method.

This works by keeping track of a `phase` and incrementing it every frame by the `frequency` times 2π/`sampleRate` (`sampleRate` is available globally in audio worklets; see the WebAudio API docs) and reducing it so that it's between 0 (inclusive) and 2π (not inclusive).  When `generate()` is called, `wave()` is evaluated at `phase`, then `updatePhase()` is called to increment/reduce it.

### AudioParams

#### `frequency`
Number of wave cycles per second.

### Processor Options

#### `initialPhase` — *number* — default value: `null`
If this option is not `null`, the `phase` field is set to it when the `OscillatorProcessor` is constructed.

### Instance Fields

#### `phase` — *number* — default value: random number from 0 (inclusive) to 2π (exclusive)
Starts out at a random number from 0 (inclusive) to 2π (exclusive), or at the value of the `initialPhase` processor option.  The `phase` represents where in the wave cycle the processor currently is.  The `wave()` function is evaluated at the `phase` every frame, and `updatePhase()` is subsequently called to increment the phase by the value of the `frequency` `AudioParam` times 2π/`sampleRate` then reduced to be between 0 (inclusive) and 2π (exclusive).

### Instance Methods

#### `generate()` — *number*
Calls `wave()` and stores the result, calls `updatePhase()`, and returns the result.  `wave()` is therefore always called with the old phase.  You probably shouldn't need to override this method, but if you do, you should probably call `super.generate()` in the overriding method.

#### `updatePhase()`
Increments `phase` by the value of the `frequency` `AudioParam` times 2π/`sampleRate` then reduces it to be between 0 (inclusive) and 2π (exclusive).

#### `wave()` — *number* — default value: `0`
Returns `0`.  This is not very interesting.  You should override this if you want something more useful.




## SineOscillator < Oscillator < Generator < AudioComponent < Component

Generates a sine wave.

### Properties

#### `pulseWidth` — *number or `AudioComponent`* — `defaultValue`: `0.5` — `isAudioParam`: `true`
This parameter alters the shape of the wave.  The wave is always 0 at phase 0 and π, but it reaches its maximum at kπ and its minimum at (2 – k)π, where k is the value of `pulseWidth`.  If k = 1/2, the wave is an ordinary sine wave, but if it's lower, it will linearly squeeze the upward portion of the wave while stretching the downward portion, and if k is higher, it will stretch the upward portion and squeeze the downward portion.  The effect is the introduction of higher frequency components.  Note that k = 0.5 – t is exactly the same as k = 0.5 + t, just shifted by π and multiplied by –1.  For an audible signal, this difference is inaudible, but in LFO use cases it might be important.

### Class Fields

#### `processorName` — *string* — `'SineOscillatorProcessor'`




## SineOscillatorProcessor < OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor to generate a sine wave.

### AudioParams

#### `pulseWidth`
This parameter alters the shape of the wave.  The wave is always 0 at phase 0 and π, but it reaches its maximum at kπ and its minimum at (2 – k)π, where k is the value of `pulseWidth`.  If k = 1/2, the wave is an ordinary sine wave, but if it's lower, it will linearly squeeze the upward portion of the wave while stretching the downward portion, and if k is higher, it will stretch the upward portion and squeeze the downward portion.  The effect is the introduction of higher frequency components.  Note that k = 0.5 – t is exactly the same as k = 0.5 + t, just shifted by π and multiplied by –1.  For an audible signal, this difference is inaudible, but in LFO use cases it might be important.

### Instance Methods

#### `wave()` — *number*
Normalizes the `phase` to undo the squeezing and stretching described above under `pulseWidth` (this calculation is not performed if the `pulseWidth` is `0.5` to save processing), then returns the sine of the normalized phase.  To be more specific, if k is the `pulseWidth`, ø is the `phase`, and N(ø) is the normalized phase, if ø < kπ, then N(ø) = π/(2k); if ø > (2 – k)π, then N(ø) = (ø – 2π)/(2k) + 2π; else (kπ ≤ ø ≤ (2 – k)π) N(ø) = (ø – π)/(2 – 2k) + π.




## TriangleOscillator < Oscillator < Generator < AudioComponent < Component

Generates a triangle wave.  Triangle waves start at 0, go up to 1 at π/2, go down to –1 at 3π/2, and back up to 0 at 2π, so they look essentially like sine waves but with straight lines from max to min and back.

### Properties

#### `pulseWidth` — *number or `AudioComponent`* — `defaultValue`: `0.5` — `isAudioParam`: `true`
This parameter alters the shape of the wave.  The wave is always 0 at phase 0 and π, but it reaches its maximum at kπ and its minimum at (2 – k)π, where k is the value of `pulseWidth`.  If k = 1/2, the wave is an ordinary triangle wave, but if it's lower, it will linearly squeeze the upward portion of the wave while stretching the downward portion, and if k is higher, it will stretch the upward portion and squeeze the downward portion.  The effect is the introduction of higher frequency components.  Note that k = 0.5 – t is exactly the same as k = 0.5 + t, just shifted by π and multiplied by –1.  For an audible signal, this difference is inaudible, but in LFO use cases it might be important.  k = 0 (or k = 1) is a sawtooth wave.

### Class Fields

#### `processorName` — *string* — `'TriangleOscillatorProcessor'`




## TriangleOscillatorProcessor < OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor to generate a triangle wave.

### AudioParams

#### `pulseWidth`
This parameter alters the shape of the wave.  The wave is always 0 at phase 0 and π, but it reaches its maximum at kπ and its minimum at (2 – k)π, where k is the value of `pulseWidth`.  If k = 1/2, the wave is an ordinary triangle wave, but if it's lower, it will linearly squeeze the upward portion of the wave while stretching the downward portion, and if k is higher, it will stretch the upward portion and squeeze the downward portion.  The effect is the introduction of higher frequency components.  Note that k = 0.5 – t is exactly the same as k = 0.5 + t, just shifted by π and multiplied by –1.  For an audible signal, this difference is inaudible, but in LFO use cases it might be important.  k = 0 (or k = 1) is a sawtooth wave.

### Instance Methods

#### `wave()` — *number*
Normalizes the `phase` to undo the squeezing and stretching described above under `pulseWidth` (this calculation is not performed if the `pulseWidth` is `0.5` to save processing), then returns the triangle wave value of the normalized phase.  To be more specific, if k is the `pulseWidth`, ø is the `phase`, and N(ø) is the normalized phase, if ø < kπ, then N(ø) = π/(2k); if ø > (2 – k)π, then N(ø) = (ø – 2π)/(2k) + 2π; else (kπ ≤ ø ≤ (2 – k)π) N(ø) = (ø – π)/(2 – 2k) + π.




## SquareOscillator < Oscillator < Generator < AudioComponent < Component

Generates a square wave.  Square waves start at 1 for the first half of the wave then go to –1 for the second half.  By using the `pulseWidth` parameter, the proportion can be altered.

### Properties

#### `pulseWidth` — *number or `AudioComponent`* — `defaultValue`: `0.5` — `isAudioParam`: `true`
This parameter alters the shape of the wave.  The wave always starts at 1 and ends at –1, but the point at which it switches is the `pulseWidth` multiplied by 2π.  Note that k < 0.5 is exactly the same as k > 0.5 (where k is the `pulseWidth`, just multiplied by –1 and shifted over by 2πk.  For audible signals this makes no difference, but in LFO applications it might.

### Class Fields

#### `processorName` — *string* — `'SquareOscillatorProcessor'`




## SquareOscillatorProcessor < OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor to generate a square wave.

### AudioParams

#### `pulseWidth`
This parameter alters the shape of the wave.  The wave always starts at 1 and ends at –1, but the point at which it switches is the `pulseWidth` multiplied by 2π.  Note that k < 0.5 is exactly the same as k > 0.5 (where k is the `pulseWidth`, just multiplied by –1 and shifted over by 2πk.  For audible signals this makes no difference, but in LFO applications it might.

### Instance Methods

#### `wave()` — *number*
Returns `1` is the `phase` is less than 2πk (where k is the `phaseWidth`) and `–1` if not.




## SawtoothOscillator < Oscillator < Generator < AudioComponent < Component

Generates a sawtooth wave.  Sawtooth waves start at 1 and linearly go down to –1 at the end of the period.

### Properties

#### `pulseWidth` — *number or `AudioComponent`* — `defaultValue`: `0.5` — `isAudioParam`: `true`
This parameter alters the shape of the wave.  The wave always starts at 1 and ends at –1, but the point at which it's 0 is the `pulseWidth` multiplied by 2π.  The wave decreases linearly from 1 to 0 until it reaches that point, then it decreases linearly from 0 to –1 thereafter.  This is not a very dramatic change in the sound.  Note that, if k is the `pulseWidth`, k < 0.5 has exactly the same shape as k > 0.5, just multiplied by –1 and reversed.  For audible signals this makes no difference, but in LFO applications it might.

### Class Fields

#### `processorName` — *string* — `'SawtoothOscillatorProcessor'`




## SawtoothOscillatorProcessor < OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor to generate a sawtooth wave.

### AudioParams

#### `pulseWidth`
This parameter alters the shape of the wave.  The wave always starts at 1 and ends at –1, but the point at which it's 0 is the `pulseWidth` multiplied by 2π.  The wave decreases linearly from 1 to 0 until it reaches that point, then it decreases linearly from 0 to –1 thereafter.  This is not a very dramatic change in the sound.  Note that, if k is the `pulseWidth`, k < 0.5 has exactly the same shape as k > 0.5, just multiplied by –1 and reversed.  For audible signals this makes no difference, but in LFO applications it might.

### Instance Methods

#### `wave()` — *number*
If the `phase` is less than 2πk, where k is the `pulseWidth`, linearly interpolates between 1 and 0 and returns the result; otherwise, linearly interpolates between 0 and –1 and returns the result.




## ExponentialSineOscillator < Oscillator < Generator < AudioComponent < Component

Generates a sine curve in pitch space (or, more precisely, generates the exponential of a sine curve).  This can be useful as a low-frequency oscillator for modulating a frequency, for example.  The baseline for the exponential can be specified as well.  The formula for this wave is complicated, but it's essentially the baseline ± exp(center + amplitude·sin(2π·frequency·t + ø)), where the center in the formula is relative to the baseline (so if the actual center is 100 and the baseline is 15, the center in this formula will be 85).

### Properties

#### `frequency` — *number or `AudioComponent`* — `defaultValue`: `0.5` — `isAudioParam`: `true`
#### `initialPhase` — *number* — `defaultValue`: 3π/2 — `isProcessorOption`: `true`
New default values for these parameters.  The `frequency` is in Hz (cycles per second).  When the phase is 0, π/2, π, and 3π/2, respectively, the oscillator's value is at the center, `maxValue`, center, and `minValue`, respectively, so the 3π/2 default value for the `initialPhase` ensures that the wave always starts at the bottom unless otherwise specified.

#### `minValue` — *number or `AudioComponent`* — `defaultValue`: `440/Math.pow(2, 0.75)` — `isAudioParam`: `true`
#### `maxValue` — *number or `AudioComponent`* — `defaultValue`: `440*Math.pow(2, 0.25)` — `isAudioParam`: `true`
Minimum and maximum values for the oscillation, with values corresponding to the standard (12TET) frequencies of C4 and C5, respectively.  If you leave the `initialPhase` as default, the wave will start at `minValue`, go up to `maxValue`, and come back down to `minValue` in an exponential sinusoidal pattern, repeating `frequency` times per second.  These two values do not need to be in order: `maxValue` could be less than `minValue` and that's OK.  However, a phase of 3π/2 would still correspond to `minValue`, so the wave would sound upside-down.

#### `baseline` — *number or `AudioComponent` — `defaultValue`: `0` — `isAudioParam`: `true`
The exponential baseline.  The values that change exponentially are the difference, either positive or negative, from the `baseline`.  A good way of thinking about this is in terms of exponentials.  For example, consider an oscillator with a `minValue` of 100 and a `maxValue` of 400.  If the `baseline` is 0, then we can see that 100·2 = 200 and 200·2 = 400, so the center of the two is 200.  On the other hand, if the `baseline` is 420, then the `minValue` is 320 below the `baseline` and the `maxValue` is 20 below, and 20·4 = 80 and 80·4 = 320, so the center is 80 below the `baseline`, or 340.  In both cases, the wave will oscillate from 100 to 400 and back (assuming the default `initialPhase`), but at phases 0 and π the wave will have a value of 200 when the `baseline` is 0 and 340 when the `baseline` is 420.  For pitch space applications, you generally want the `baseline` to be 0.

#### `processorName` — *string* — `'ExponentialSineOscillatorProcessor'`




## ExponentialSineOscillatorProcessor  < OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor for the `ExponentialSineOscillator`, generating a wave of the form B ± exp(C + A·sin(2πft)).

### AudioParams

#### `baseline`
#### `minValue`
#### `maxValue`
The oscillation produced is between `minValue` and `maxValue`, and exponentials are calculated relative to the `baseline`.  See `ExponentialSineOscillator` for details.

### Instance Methods

#### `wave()` — *number*
Calculates B ± exp(C + A·sin(ø)), where B is the `baseline`, C is the natural log of the center of the wave relative to the `baseline`, A is the amplitude in natural log space, and ø is the `phase`.  If the `baseline` is 0, the center is just sqrt(`minValue`·`maxValue`), their geometric mean.  If not, then the center is the geometric mean of |`minValue` – `baseline`| and |`maxValue` – `baseline`|.  The amplitude is then going to be sqrt(|`maxValue` – `baseline`|/|`minValue` – `baseline`|), which is just the right number to ensure that the minimum value really is `minValue` and the maximum really is `maxValue`.




## WhiteNoiseGenerator < Generator < AudioComponent < Component

Generates white noise, which is a signal of a random value from –1 to 1 every frame.

### Class Fields

#### `processorName` — *string* — `'WhiteNoiseGeneratorProcessor'`




## WhiteNoiseGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Generates white noise, which is a signal of a random value from –1 to 1 every frame.

### Instance Methods

#### `generate()` — *number*
Generates a random value between –1 and 1.




## RedNoiseGenerator < Generator < AudioComponent < Component

Generates red noise (also known as Brownian noise, named after Brownian motion), which is a kind of noise that is biased towards low frequencies.  It takes a `frequency`, but this isn't a real frequency; it's just the reciprocal of a characteristic time constant.

### Properties

#### `frequency` — *number or `AudioComponent`* — `defaultValue`: 440 — `isAudioParam`: `true`
The inverse time constant of the red noise, which, on the power spectrum, is the frequency where the power drops by a factor of 2 from its maximum at 0 Hz.

#### `initialValue` — *number* — `defaultValue`: `null` — `isProcessorOption`: `true`
The initial value of the output.  In LFO applications, it's good to keep track of where it starts.

### Class Fields

#### `processorName` — *string* — `'RedNoiseGeneratorProcessor'`




## RedNoiseGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Generates red noise (also known as Brownian noise, named after Brownian motion), which is a kind of noise that is biased towards low frequencies.  It takes a `frequency`, but this isn't a real frequency; it's just the reciprocal of a characteristic time constant.

### AudioParams

#### `frequency`
The inverse time constant of the red noise, which, on the power spectrum, is the frequency where the power drops by a factor of 2 from its maximum at 0 Hz.

### Processor Options

#### `initialValue` — *number* — default value: `null`
The `value` that the processor begins with.  If it's `null`, the `value` is a random number from –1 to 1.

### Instance Fields

#### `value` — *number* — default value: `initialValue` if not `null`; random between –1 and 1 if `null`
The value returned by `generate()`, used in the next frame to calculate the new `value`.

### Instance Methods

#### `generate()` — *number*
If x is the previous `value` and w is the `frequency`, returns r·x + s·(random number between –1 and 1), where r = e^(–∆t/T) = e^(–w/`sampleRate`) (with ∆t being seconds per frame and T being the time constant, 1/`frequency`) and s = sqrt(1 – r^(2)).  This keeps the `value` mostly hovering between –1 and 1, with occasional extremes.




## FourierGenerator < AudioComponent < Component

Allows additive synthesis using native JS `AudioNode`s (rather than custom `AudioWorkletNode`s).  You pass in a list of Fourier coefficients `a` and multiples `n`, and you get a sum of sines: ∑a·sin(n·2πft), where f is the `frequency`.  `a` and `n` in each Fourier component can be `AudioComponent`s, so the Fourier spectrum can change dynamically, include inharmonic components, etc.  As a consequence of using only the native JS `AudioNode`s, it can't use any of the functionality of the `AudioComponentProcessor`, at least not by default.  The internal structure of the `FourierGenerator` is that the `frequency` is connected to the `frequencyNode`, a `GainNode` (with `gain.value` set to `1`), which connects to each of an array of `FourierComponent`s, each of which then connects to the principal `node`, another `GainNode` (with `gain.value` set to `1`).  It is this final `node` that connects to whatever destination the generator is supposed to connect to.

### Properties

#### `frequency` — *number or `AudioComponent`* — `isAudioComponent`: `true` — `defaultValue`: `440` — `connector`: `'connectFrequency'` — `disconnector`: `'disconnectFrequency'`
The base frequency of the Fourier spectrum, of which all of the components are multiples.  This is usually set by the parent `Tone`, with the added caveat that if it is a number, it will be converted to a `ConstantGenerator`.

#### `fourierComponents` — *array of `FourierComponent`s or shorthand objects* — `defaultValue`: `[{a: 1, n: 1}]` — `setter`: `'setFourierComponents'` — `cleaner`: `'cleanFourierComponents'` — `connector`: `'connectFourierComponents'` — `disconnector`: `'disconnectFourierComponents'`
The array of Fourier components.  When specifying each component, you can either specify a `FourierComponent` itself (or, really, anything that you can connect the `frequency` to) or a shorthand object of the form `{a: <coeff>, n: <multiple>}`.  Such an object will be converted into a `FourierComponent` using the definition `{className: 'FourierComponent', coeff: <coeff>, multiple: <multiple>}`.  A `FourierComponent`, for the purposes of `FourierGenerator`, is an `AudioComponent` that takes a `frequency` as an input and produces a signal as an output; it does not have to be an actual `FourierComponent`.

### Class Fields

#### `isNativeNode` — `true`

### Instance Fields

#### `frequencyNode` — `GainNode` — `null`
The `frequency` `AudioComponent` is connected to this node, which has a `gain` value of `1`, making it essentially just a pass-through node.  It exists for the sole purpose of keeping the `fourierComponents` connected only internally: the `frequencyNode` connects to each of the `fourierComponents`, which in turn each connect to the `node`, which is a `GainNode` with a `gain` of `1` as well.

### Instance Methods

#### `createNode`
Creates the `node` and `frequencyNode`, both `gainNode`s with `gain` `1`.

#### `connectFrequency()`
#### `disconnectFrequency()`
Custom connector and disconnector for `frequency` since it needs to connect to `frequencyNode` rather than to `node`.

#### `setFourierComponents(<componentDefinitions>)`
Creates the `FourierComponent`s specified in the `<componentDefinitions>` array (including converting shorthand objects as defined above into fully-fledged `FourierComponents`s) and puts them into the `fourierComponents` property, which is also an array.  Connects them if necessary as well.

#### `cleanFourierComponents()`
Custom cleaner to call `cleanupComponent()` on each element of the `fourierComponents` array.

#### `connectFourierComponents()`
#### `disconnectFourierComponents()`
Custom connector and disconnector; they call `connectFourierComponent()` or `disconnectFourierComponent()`, respectively, on each element of `fourierComponents`.

#### `connectFourierComponent(<component>)`
#### `disconnectFourierComponent(<component>)`
Turns the `<component>` `on()` or `off()` if it isn't a reference, then connects `frequencyNode` to it and connects it to `node`, or disconnects it from `node` and disconnects `frequencyNode` from it, respectively.




## FourierComponent < AudioComponent < Component

A simple set of native JS `AudioNode`s to simply generate a scaled sine wave at a multiple of the given frequency, such as would be useful when building a spectrum using additive synthesis.  A `FourierComponent` consists of three `AudioNode`s: a `GainNode` called the `multipleNode` that multiplies the given frequency by the `multiple`, `oscillator`, an `OscillatorNode` to produce a sine wave at the frequency given by the `multipleNode`, and the final `node`, another `GainNode`, that scales the sine wave by `coeff`.  If the `coeff` is a and the `multiple` is n, the resultant signal is a·sin(n·2πft).

### Properties

#### `coeff` — `defaultValue`: `1` — `isAudioParam`: `true` — `paramName`: `null` — `connector`: `'connectCoeff'` — `disconnector`: `'disconnectCoeff'`
#### `multiple` — `defaultValue`: `1` — `isAudioParam`: `true` — `paramName`: `null` — `connector`: `'connectMultiple'` — `disconnector`: `'disconnectMultiple'`
The coefficient and frequency muliple (a and n, respectively) in the formula a·sin(n·2πft).  The `multiple` is the `gain` `AudioParam` of the `multipleNode`, while the `coeff` is the `gain` `AudioParam` of the `node`, which is why both properties have `isAudioParam`: `true`, but to prevent weird bugs from popping up later, `paramName` is explicitly `null` since these properties should be connected only carefully.

### Class Fields

#### `isNativeNode` — `true`

### Instance Fields

#### `multipleNode` — `GainNode`
#### `oscillator` — `OscillatorNode`
These two, together with the `node` (which is also a `GainNode`), form the pipeline of the `FourierComponent`.  The frequency `AudioComponent`, generally a `FourierGenerator`'s `frequencyNode`, connects to the input of the `multipleNode`, while the `multiple` connects to its `gain`.  The `multipleNode` connects to the `oscillator`'s `frequency`, and the `oscillator`'s `type` is `'sine'`.  The `oscillator` connects to the `node`'s input, while `coeff` connects to its `gain`.  The `node` then connects to the destination, generally the `FourierGenerator`'s `node`.  This whole thing *could* have been done using `AudioComponent`s instead of native nodes, but that level of control is likely not needed in the `FourierGenerator`'s application, so there's no need to take the performance hit.

### Instance Methods

#### `createNode()`
Creates all of the relevant nodes (`multipleNode`, `oscillator`, `node`) and connects them to each other, also calling `start()` on the `oscillator`.

#### `cleanupNode()`
Disconnects the relevant nodes, calls `stop()` on the `oscillator`, and sets their fields to `null`.

#### `getFirstNode()` — `multipleNode`
Called by `FourierGenerator` when connecting its `frequencyNode` to the `FourierComponent`.

#### `connectCoeff()`
#### `disconnectCoeff()`
#### `connectMultiple()`
#### `disconnectMultiple()`
Custom connectors/disconnectors to attach the `coeff` and `multiple` properties to the right places.




## FourierSawtooth < AudioComponent < Component

A wrapper around a `FourierGenerator` that generates the first however many Fourier components of a sawtooth.  An ideal sawtooth wave can be analyzed as ∑(1/n)·sin(n·2πft) for n from 1 to ∞ (ignoring phase, that is), so a `FourierSawtooth` takes a maximum n and outputs a partial sum of that series up to that maximum.

### Properties

#### `frequency` — *`AudioComponent`* — `isAudioComponent`: `true` — `defaultValue`: `440` — `setter`: `'setFrequency'`
The base frequency of the wave.  Note that it needs to be an `AudioComponent` (it will be converted to a `ConstantGenerator` if it's a number) since it's an input to the `FourierGenerator`.

#### `highestMultiple` — *number* — `defaultValue`: `5`
The maximum n for the sum ∑(1/n)·sin(n·2πft).  This is *not* an `AudioComponent`, and furthermore it should not change.

#### `includeEven` — *boolean* — `defaultValue`: `true`
#### `includeOdd` — *boolean* — `defaultValue`: `true`
Whether to include the even and odd terms of the sum, respectively.  Excluding the even terms creates a different kind of sound that's darker than the very bright sawtooth, while excluding the odd terms just... makes the sawtooth an octave higher, so maybe it's not a good idea.  Note that if the `highestMultiple` is `5` and `includeEven` is `false`, the included terms will be for n = 1, 3, and 5, because 5 is the highest multiple allowed.  If both even and odd terms are excluded, there will be no sound.

### Class Fields

#### `isNativeNode` — `true`
Technically speaking, it isn't`, but actually, `FourierSawtooth` does not have a `node`.  Be careful if you need to subclass this.

### Instance Fields

#### `fourierGenerator` — *`FourierGenerator`* — `null`
The thing that makes the sound, which is not an `AudioNode`.

### Instance Methods

#### `on()`
#### `off()`
Overridden from `AudioComponent` to create/destroy the `fourierGenerator`, connect/disconnect properties, and pass the `on()`/`off()` command to said `fourierGenerator`.

#### `createNode()`
Creates the `fourierGenerator` with the parameters specified in `highestMultiple`, `includeEven`, and `includeOdd`, and using the `frequency` as the `FourierGenerator`'s `frequency` property.

#### `cleanupNode()`
Passes the command to the `fourierGenerator` and sets it to `null`.

#### `getNodeToFilter()` — `AudioNode`
Overridden from `AudioComponent` to return `fourierGenerator.getNodeToFilter()` if there is a `fourierGenerator`; `null` if not.

#### `setFrequency(<frequency>)`
Passes the `<frequency>` to the `fourierGenerator`.




## ShepardGenerator < Generator < AudioComponent < Component

Generates Shepard tones.  A Shepard tone is basically present in all octaves at once, with a tapering effect at the top octaves and bottom octaves where, as the tone rises, new frequency components fade in at the bottom while old frequency components fade out at the top.  You can make an endlessly-rising scale by simply repeating the tones on the second octave as if they were the first.  The frequency components are sine waves and range from C0 to C10, with a tapering function of sin(πø), where ø is 1/10 times the number of octaves a frequency component is above C0.  By default, the ratio between successive frequency components is 2 (an octave), but you can set that to whatever you want (dynamically).

### Properties

#### `frequency` — *number or `AudioComponent`* — `defaultValue`: `440` — `isAudioParam`: `true`
The primary frequency.  Note that the sound is exactly the same if you multiply or divide by the `ratio`, so if the `ratio` is 2, then a `frequency` of C4 or C8 or C–11 will result in exactly the same sound.  (Note that C–11 isn't even in the range of frequencies produced!)

#### `ratio` — *number or `AudioComponent`* — `defaultValue`: `2` — `isAudioParam`: `true`
The ratio between frequency components.  For a traditional Shepard tone, this is an octave, or `2`, but there's no reason why it can't be something else.  For example, if the `ratio` is 3/2, you'll hear a tall stack of perfect fifths that includes the given `frequency` (at least if it's in range).  Note that computing Shepard tones is fairly computationally intensive, so try not to make the `ratio` too low or you might cause stuttering.

### Class Fields

#### `processorName` — *string* — `'ShepardGeneratorProcessor'`




## ShepardGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor for generating Shepard tones.  Most of the calculations are done with logs to lessen the computational load.

### AudioParams

#### `frequency`
#### `ratio`
The Shepard tone will have a lowest frequency component of `frequency` divided by `ratio` as many times as necessary such that the *next* division will result in a frequency lower than C0.  The next frequency component will be the last one times the `ratio` up to C10.  So, for example, a `frequency` of D3 with a `ratio` of 2 will have its lowest frequency at D0 (because D–1 is too small), the next at 2 · D0 = D1, the next at D2, etc., up to D9 (because D10 is too big).

### Class Fields

#### `logC10` — ln(440) + 5.25·ln(2)
Natural log of the frequency of C10.  C0 and C10 are the bounds of the frequency components (inclusive at C0, exclusive at C10), so logs of these are used in the calculation; `logC0` is defined in `AudioComponentProcessor`.

### Instance Fields

#### `lastFrequency` — *number* — `NaN`
#### `lastRatio` — *number* — `NaN`
The values of `frequency` and `ratio` in the previous frame.  If they haven't changed, the `updateFrequencies()` step of computing the `baseFrequency` and other associated quantities is skipped.  Both fields start at `NaN` to ensure that comparisons to them always fail properly.

#### `baseFrequency` — *number* — `NaN`
Computed by `updateFrequencies()`, this is the lowest frequency component in the tone.  Starts at `NaN` to ensure that comparisons fail properly.

#### `logRatio` — *number* — `NaN`
#### `logBaseFrequency` — *number* — `NaN`
Computed by `updateFrequencies()`; these are the natural logs of `ratio` and `baseFrequency`, respectively, for use in calculations for reducing computational complexity.  Both start at `NaN`.

#### `totalWaves` — *number* — `0`
Number of frequency components, calculated by `updateFrequencies()`.

#### `nudgePhases` — `-1`, `0`, or `1`
Whether phases need to be moved over to prevent clicks.  As the frequency changes, the `baseFrequency` may jump a bit less than an octave (for example, if the `ratio` is 2) even though the `frequency` changed only by a tiny amount.  If this happens, all of the phases of the frequency components will suddenly jump, causing clicks.  For example, suppose you have a B `frequency`, with frequency components B0, B1, B2, etc., and suppose that B slowly moves up to C.  The B0 will go all the way down a major seventh to C0, B1 down to C1, B2 down to C2, etc.  It would be smoother for B0 to go up to C1, B1 up to C2, B2 up to C3, etc., and for a *new* frequency component to arise at C0 (which is basically the point of Shepard tones in the first place).  In this situation, `nudgePhases` is set to `1` in `updateFrequencies()`, and in `updatePhases()` a new phase is inserted at the front of the `phases` array.  For the opposite situation, like a C going to a B and the `baseFrequency` jumping up nearly an octave rather than down, `nudgePhases` is set to `-1` and the first phase in the `phases` array is removed instead in `updatePhases()`.  After the nudge, `nudgePhases` is always set back to `0`.

#### `phases` — *array of numbers* — `[]`
The current phases of each of the frequency components.  There are `totalWaves` phases in this array, which is updated at `updatePhases()`, with element `0` corresponding to `baseFrequency`.  If `totalWaves` is calculated to be greater than the current number of elements, more phases are added with random values from 0 to 2π, and if `totalWaves` is calculated to be smaller, elements are removed from the end until the size matches.

### Instance Methods

#### `generate()`
Calls `updateFrequencies()` if the `frequency` or `ratio` have changed in this frame from the stored values from last frame, then calls `updatePhases()`, and finally returns `calculateWave()`.

#### `updateFrequencies(<frequency>, <ratio>)`
Only called when either `frequency` or `ratio` (or both) have changed.  Calculates `baseFrequency`, `totalWaves`, and `nudgePhases`, as well as the helper quantities: `lastFrequency`, `lastRatio`, `logRatio`, and `logBaseFrequency`.  `nudgePhases` is set to `1` or `-1` only if the difference between the last `baseFrequency` and the current one is greater than half the interval `ratio` (so, the frequency ratio is greater than sqrt(`ratio`), but we're using logs for these computations).

#### `updatePhases()`
Nudges the `phases` array if `nudgePhases` is `1` or `-1` and sets it to `0`.  Pads the `phases` array with random numbers in [0, 2π) if it has fewer elements than `totalWaves` or pops phases off the end if it has more.  Updates each phase in the array by adding 2πf/`sampleRate`, where f is the frequency of that particular frequency component.

#### `calculateWave()` — *number*
Returns the sum of C(ø)·sin(phase), where phase is each element of `phases`, and ø is the frequency of the corresponding frequency component, expressed as a fraction of the way from C0 to C10.  A frequency of C0 has ø = 0, C5 has ø = 1/2, and C10 has ø = 1.  C(ø) is a coefficient computed by `calculateCoefficient()`.

#### `calculateCoefficient(<phi>)` — *number*
The coefficient of the frequency component given by `<phi>`, which is the frequency of a frequency component expressed as a fraction of the way from C0 to C10.  To achieve the tapering effect at high and low frequencies, this coefficient is 0.25·sin(πø), which is 0 at ø = 0 and ø = 1 and maximum at ø = 1/2.  The 0.25 is a scaling factor to ensure that the tone is not too loud, and it's essentially an arbitrary number.  You can always just set the gain yourself.  This method is meant to be overridden by implementations of the Shepard tone that change the coefficient.




## ShepardOctaveGenerator < ShepardGenerator < Generator < AudioComponent < Component

Generates a Shepard-type tone with a frequency distribution whose peak is not in the middle of the C0-C10 gamut (namely, C5).  Instead, you can pass in a `peakFrequency` parameter that determines that peak, meaning that you could have a low Shepard tone or a high Shepard tone.  This sounds contradictory, except that how high or low the tone is is actually independent from the pitch.  You could have a rising pitch with a falling peak, for example, which is a pretty interesting effect.

### Properties

#### `peakFrequency` — *number or `AudioComponent` — `defaultValue`: `440` — `isAudioParam`: `true`
The peak of the frequency distribution of the Shepard tone.  This should be strictly between C0 and C10, otherwise you run into some nasty singularities.  If k is the fraction of the way from C0 to C10 of the `peakFrequency` (for example, a `peakFrequency` of C4 would be 0.2 of the way), and ø is the fraction of the frequency component, the coefficient for that component will be 0.25 · ((ø^k · (1 – ø)^(1 – k))/(k^k · (1 – k)^(1 – k)))^5.  The exponent of 5 is just to narrow the distribution so that it's not just a normal Shepard tone.

### Class Fields

#### `processorName` — *string* — `'ShepardOctaveGeneratorProcessor'`




## ShepardOctaveGeneratorProcessor < ShepardGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor for generating Shepard octave tones.  Coefficient calculations are done via logs for performance.

### AudioParams

#### `peakFrequency`
The frequency of the peak of the distribution of frequency components in the Shepard tone.

### Instance Fields

#### `lastPeak` — *number* — `NaN`
The most recent value of `peakFrequency`, used to determine if peak calculations need to be repeated.

#### `peakFraction` — *number* — `NaN`
#### `logPeakFraction` — *number* — `NaN`
#### `logPeakFractionComplement` — *number* — `NaN`
The `peakFraction` is the fraction of the way `peakFrequency` is from C0 to C10.  If that fraction is k, then `logPeakFraction` is ln(k) and `logPeakFractionComplement` is log(1 – k).

### Instance Methods

#### `generate()` — *number*
Calls `updatePeak()` if necessary, then returns `super.generate()`.

#### `updatePeak(<peakFrequency>)`
Calculates the `peakFraction`, `logPeakFraction`, and `logPeakFractionComplement`, and sets the `lastPeak`.

#### `calculateCoefficient(<phi>)` — *number*
Calculates the coefficient of the frequency component with fraction `<phi>` = ø using the formula 0.25 · ((ø^k · (1 – ø)^(1 – k))/(k^k · (1 – k)^(1 – k)))^5, where k is the `peakFraction`.  The 0.25 scaling factor out front is to make sure the tone isn't too loud, and the power of 5 is to make sure that the peak is sufficiently narrow that you can easily tell whether it's high or low.




## Envelope < Generator < AudioComponent < Component

An `Envelope` is actually just a gain that is varied over the lifetime of a `Tone`.  One typical envelope is the `ADSREnvelope`, which starts by ramping the gain up from 0 to some maximum over some period of time, then down to 1 (over some time) for the rest of the duration of the tone, and, when the tone is released, it ramps the gain back down to 0 over some time.  This ramping of the gain from and to 0 removes the very high-frequency components inherent in an instantaneous jump from 0 to 1, which cause an audible pop.  `Envelope`s also provide articulation at the front of the note and can provide vibrato or other effects as well.  This `Envelope` class is intended to be abstract; its processor doesn't actually do anything useful (it just outputs `1`).

### Class Fields

#### `processorName` — *string* — `'EnvelopeProcessor'`

### Instance Fields

#### `isEnvelope` — *boolean* — `true`
Allows a check for whether an `AudioComponent` is an `Envelope`, meaning that it implements `startRelease()` and calls `playable.stop()` on its own.

#### `callbacks` — *array of functions* — default value: `[]`
Callbacks to call when `stop()` is called.  Populated on `startRelease()` or just `registerCallback()`.

#### `phase` — *string* — default value: `'main'`
Unlike an `OscillatorProcessor`'s `phase`, this `phase` is the phase of the lifetime of the `Envelope`.  By default, an `Envelope` starts in the `'main'` phase; after `startRelease()` is called, it switches to the `'release'` phase, and when that's done, to the `'stop'` phase.  More phases (or different phases) could be added by subclasses, but keep in mind that a `port` message must be sent to change the phase in the processor, so this phase system has some inherent latency as the processor processes a whole buffer of frames at a time.

#### `phaseHandlers` — *object where the keys are phases and the values are functions*
Registry of functions to handle phase changes.  When the phase changes, if there's a handler for it, that handler gets called.  Subclasses should add their own functions to this object if appropriate.

### Instance Methods

#### `createNode()`
Also sets the `phase` on the processor.

#### `changePhase(<phase>)`
Sets the `phase` as `<phase>` (if it's different from the current `phase`), posts a message through `node.port` that is an object that looks like `{phase: <phase>}`, and calls `phaseHandlers.<phase>` if it exists.

#### `receiveMessage(<messageEvent>)`
First calls `super.receiveMessage(<messageEvent>)`.  If the message has a `phase` different from the current `phase`, sets the `phase` and calls the appropriate handler if it exists.

#### `startRelease(<callback>)`
Calls `registerCallback(<callback>)` and changes the phase to `'release'`.

#### `registerCallback(<callback>)`
Adds `<callback>` to the `callbacks` array, if provided (meaning that it's not `undefined` or `null`).

#### `stop()`
Calls each of the `callbacks` and empties that array.

#### `phaseHandlers.stop()`
Calls `stop()`.




## EnvelopeProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Implements a basic processor that responds to changes in phase.  This is intended to be an abstract processor; it just outputs `1`.

### Instance Fields

#### `phase` — *string* — default value: `'main'`
Unlike an `OscillatorProcessor`'s `phase`, this `phase` is the phase of the lifetime of the `EnvelopeProcessor`.  By default, an `EnvelopeProcessor` starts in the `'main'` phase; after `startRelease()` is called on the `Envelope`, it switches to the `'release'` phase, and when that's done, to the `'stop'` phase.  More phases (or different phases) could be added by subclasses, but keep in mind that a `port` message must be sent to change the phase in the `Envelope`, so this phase system has some inherent latency as the processor processes a whole buffer of frames at a time.

#### `phaseHandlers` — *object where the keys are phases and the values are functions*
Registry of functions to handle phase changes.  When the phase changes, if there's a handler for it, that handler gets called.  Subclasses should add their own functions to this object if appropriate.

### Instance Methods

#### `generate()`
Returns `1`.  You should probably override this to do something more interesting.

#### `changePhase(<phase>)`
Sets the `phase`, posts a message through `port` that is an object that looks like `{phase: <phase>}`, and calls `phaseHandlers.<phase>` if it exists.

#### `receiveMessage(<messageEvent>)`
First calls `super.receiveMessage(<messageEvent>)`.  If the message has a `phase`, sets the `phase` and calls the appropriate handler if it exists.

#### `startRelease()`
Immediately changes phase to `'stop'`.  You should probably override this if you want to implement more interesting release behavior.

#### `phaseHandlers.release()`
Calls `startRelease()`.




## ADSREnvelope < Envelope < Generator < AudioComponent < Component

An `Envelope` with Attack, Decay, Sustain, and Release (ADSR) phases, standard in audio synthesis.  The `ADSREnvelope` class itself doesn't actually have any of its own behavior; the magic is all in the `ADSREnvelopeProcessor` that lives in the `ADSREnvelope`'s `node`.  The Attack, Decay, and Sustain phases are all just part of the `'main'` `phase`, with the Release phase being the `'release'` `phase`, so they don't correspond exactly.

During the Attack phase, which lasts `attack` ms, the gain starts at `0` and ramps up linearly to `attackGain`.  Then the Decay phase starts, and the gain ramps down linearly from `attackGain` to `1` over `decay` ms.  Then the Sustain phase starts, and the gain stays at `1`.  When the Release phase begins (by calling `startRelease()` on this object), the gain ramps from `1` to `0` over `release` ms.  A small value for `attack` makes the sound appear struck by an object, with a hard start; a larger value makes the attack feel softer.  A long `release` makes the sound taper off slowly.  If any of the `attack`, `decay`, or `release` durations are too short, you may hear pops and such, so be careful.  Note that all of these parameters are immutable once the processor starts, since they're all processor options.

### Properties

#### `attack` — *number* — `defaultValue`: `20` — `isProcessorOption`: `true`
Time in ms for the initial ramp-up from `0` to `attackGain`.

#### `attackGain` — *number* — `defaultValue`: `2` — `isProcessorOption`: `true`
How high to ramp up the attack.  It's generally greater than `1`, but it doesn't have to be; all that will change is that the `decay` phase will get louder rather than softer to get to `1`.

#### `decay` — *number* — `defaultValue`: `20` — `isProcessorOption`: `true`
Time in ms for the initial attack to decay from `attackGain` down to `1` (or to go up if `attackGain` is less than `1`).

#### `release` — *number* — `defaultValue`: `50` — `isProcessorOption`: `true`
Time in ms for the sustained `1` to finally release down to `0` when `startRelease()` is called.

### Class Fields

#### `processorName` — *string* — `ADSREnvelopeProcessor`




## ADSREnvelopeProcessor < EnvelopeProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

The magic behind `ADSREnvelope` (see that description for details).  Implements all the ramps.

### Processor Options

#### `attack` — *number*
How long the Attack phase lasts, in ms.

#### `attackGain` — *number*
How high the Attaack phase ramps up to.

#### `decay` — *number*
How long the Decay phase lasts, in ms.

#### `release` — *number*
How long the Release phase lasts, in ms.

### Instance Fields

#### `currentFrame` — *number* — default value: `0`
The current audio frame relative to when the processor was first started.  It's incremented every frame and acts as a timer for the processor.

#### `attackUntilFrame` — *number*
Frame at which Attack switches to Decay, calculated at construction from the processor options.

#### `decayUntilFrame` — *number*
Frame at which Decay switches to Sustain, calculated at construction from the processor options.

#### `releaseStartFrame` — *number* — default value: `null`
Current frame when `startRelease()` is called.

#### `releaseUntilFrame` — *number* — default value: `null`
Frame at which Release ends; calculated when `startRelease()` is called.

#### `releaseFromValue` — *number* — default value: `null`
Current value when `startRelease()` is called, which gets ramped down to 0.  This will generally be `1`, but if `startRelease()` is called before the Attack and Decay phases are done, or if a subclass changes the Sustain behavior, this number could be different.

#### `value` — *number* — default value: `0`
Number that gets output each frame, saved here so that `releaseFromValue` can be computed.

### Instance Methods

#### `generate()` — *number*
Produces a gain for the current frame.  If the `phase` is `'main'`, checks the current frame against `attackUntilFrame` and `decayUntilFrame` to calculate the value; if the `phase` is `'release'`, checks the current frame against `releaseUntilFrame` to calculate the value, and if the current frame is past `releaseUntilFrame`, returns `0` and calls `changePhase('stop')`; if the `phase` is `'stop'`, returns `0`.  After it calculates the value, it increments `currentFrame` before returning the value.

#### `startRelease()`
Calculates `releaseStartFrame`, `releaseUntilFrame`, and `releaseFromValue`.  Note that this gets called from `phaseHandlers.release()` when a message of `{phase: 'release'}` is received by the processor from the `Envelope`.




## Timer < Generator < AudioCopmonent < Component

The `Timer` is an `AudioComponent` that outputs a time, with a specified `tempo` (in beats per minute).  It essentially counts the number of beats.  Another `AudioComponent` can use connect a `Timer` to an `AudioParam` to have access to the current beat count according to this `Timer`.  The `tempo` is itself an `AudioParam`, which can be controlled by other `Timer`s, etc., but be careful because the WebAudio API doesn't like cycles in the audio graph; you will have a problem if you connect an `AudioNode` to itself without a `DelayNode` in between.  The default values have a `tempo` of `60000` BPM, which is just a fancy way of saying that it's counting milliseconds.

### Properties

#### `tempo` — *number or `AudioComponent`* — `defaultValue`: `60000` — `isAudioParam`: `true`
The tempo of the timer, which essentially just means how quickly the time advances, in units per minute.  The default value of `60000` means that the time advances by 60000 every minute, which means that it advances by 1000 evern second.  While `AudioParam` values are limited to 32-bit floats, the internal representation of the time is still a 64-bit double, so while you will lose some precision if you leave a 60000 BPM timer running for, say, a whole day (on the order of 10 ms or so, which you probably wouldn't even notice for most applications), the internal representation will still keep ticking for a few years without much of a problem.  Not that you would do that.  I hope.

#### `initialTime` — *number* — `defaultValue`: `0` — `isProcessorOption`: `true`
The beat on which the timer should start.  Give it a little lead time by setting this negative if you're worried about the absolute timing of things starting.

### Class Fields

#### `processorName` — *string* — `'TimerProcessor'`




## TimerProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Outputs the number of beats since the start at a specified `tempo` (in beats per minute).  Useful when connected to an `AudioParam` to time things.

### AudioParams

#### `tempo`
Number of beats per minute.

### Processor Options

#### `initialTime` — *number*
The number of beats when this processor is constructed, from which to start counting.

### Instance Fields

#### `time` — *number*
Current output value, which gets incremented every step during `generate()`.

### Instance Methods

#### `generate()`
Increments `time` by the current `tempo` divided by 60 times `sampleRate`, then returns it.



## Note < Generator < AudioCopmonent < Component

An `AudioComponent` that generates the frequency of a note given its name.  `Note`s are created automatically when a property has `isAudioParam` or `isAudioComponent` set to `true` and its value is a string.

### Properties

#### `note` — *string* — `defaultValue`: `'C4'` — `isProcessorOption`: `true`
The note name.  Which strings are allowed depends on the tuning in question.  For a `MeantoneTuning` like `'12TET'`, see the documentation for `MeantoneTuningProcessor`.

#### `tuningName` — *string* — `defaultValue`: `null` — `isProcessorOption`: `true` — `getter`: `getTuningName`
The tuning name.  A `Tuning` with this `tuningName` should be currently playing; it indicates the source of the frequency that will be output by the `NoteProcessor`.  If it is `null` (the default value), the tuning used will be the `Player`'s `Tuning`, and this name will be the name of that `Tuning` (which is `'12TET'` by default).

### Class Fields

#### `processorName` — *string* — `'NoteProcessor'`

### Instance Methods

#### `getTuningName()` — *string*
If a separate `tuningName` is provided as a property, returns that; if not, calls `getTuningName()` on the `tuning` belonging to the `Note`.



## NoteProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Calls `parseNote()` on the specified `TuningProcessor` every frame to retrieve a frequency value, which it outputs to whatever it's connected to in the audio graph.

### Processor Options

#### `tuningName` — *string*
The name of the `TuningProcessor`, which will be accessed by calling `OfftonicAudioplayer.getTuning(<tuningName>)`.  `parseNote()` will be called on the tuning.

#### `note` — *string*
The name of the note to parse, like `'C4'`, `'Eb6'`, `'B-1'`, etc.  Which notes are able to be parsed depends on the tuning's specifics.

### Instance Methods

#### `generate()`
Calls `OfftonicAudioplayer.getTuning(<tuningName>)` to get the relevant `TuningProcessor` then returns the value of `parseNote()` called on it.




## Adder < AudioComponent < Component

Adds the values of two `AudioComponent`s.  Actually, connecting multiple `AudioNode`s to the same destination does that automatically, so `Adder` doesn't need to actually *do* anything other than channel calls where they need to go.  To that end, it doesn't actually have a `node`.

### Properties

#### `term1` — *`AudioComponent`* — `defaultValue`: `null` — `isAudioComponent`: `true`
#### `term2` — *`AudioComponent`* — `defaultValue`: `null` — `isAudioComponent`: `true`
The `AudioComponent`s to add together.

### Class Fields

#### `isNativeNode` — *boolean* — `true`
There is no node here, so strictly speaking the node isn't native, but... `null` *is* a native JS object, so...  Point is, `AudioComponent` doesn't try to instantiate a processor.

### Instance Methods

#### `on()`
#### `off()`
Calls `on()` or `off()` on `term1` and `term2` (if they aren't `null`).

#### `connectTo(<destination>, <input>)`
#### `disconnectFrom(<destination>, <input>)`
Simply calls the corresponding methods on `term1` and `term2` (if they aren't `null`), relying on the fact that connecting two `AudioNode`s to the same destination will automatically add them.




## Multiplier < AudioComponent < Component

Multiplies two signals denoted by `term1` and `term2`.

### Properties

#### `term1` — *`AudioComponent`* — `defaultValue`: `null` — `isAudioComponent`: `true` — `inputIndex`: `0`
#### `term2` — *`AudioComponent`* — `defaultValue`: `null` — `isAudioComponent`: `true` — `inputIndex`: `1`
The `AudioComponent`s to multiply together.

### Class Fields

#### `processorName` — *string* — `'MultiplierProcessor'`

#### `numberOfInputs` — *number* — `2`




## MultiplierProcessor < AudioComponentProcessor < AudioWorkletProcessor

Can be instantiated with any number of inputs.  Simply multiplies together all of the inputs.  Connecting multiple `AudioNode` to the same destination adds their signals, so we need another solution for multiplication; this is it.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
For each channel and frame, multiplies together all of the inputs and sticks the result in `<outputs>` for that channel and frame.  Returns `true`.  If there are no inputs to multiply together, stores `0`'s in the `<outputs>`.  This last bit may seem counterintuitive, since the empty product is actually equal to 1 rather than 0, but if there are no inputs, we should assume that the inputs have ended and are therefore just `0`.




## Filter < AudioComponent < Component

Any `AudioComponent` can be routed through a `Filter`, which is an `AudioComponent` that takes the `AudioComponent`'s output as its input signal and produces a filtered output signal.  A `Filter`, being an `AudioComponent`, can have its own `Filter` as well, which just means that the filters get chained: the output from the first filter becomes the input of the second, etc.  The last filter in a chain is the one whose `AudioNode` connects to whatever destination the original `AudioComponent` is supposed to have, at least by default (depending on the value of `getNodeToDestination()`).  This base `Filter` class would ordinarily not do anything, but since it provides `scaling` and `offset` properties (similar to `Generator`), there's a use case for using this `Filter` class on its own, but most likely you'll want to subclass it instead.

### Properties

#### `scaling` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `offset` — *number or `AudioComponent`* — `defaultValue`: `0` — `isAudioParam`: `true`
Multiplies the output of the filter by the value of `scaling` and adds the value of `offset` to it.

### Class Fields

#### `numberOfInputs` — *number* — `1`
A `Filter` only has one input.  If you want to deal with more inputs, you'll probably want to create a new class.

#### `processorName` — *string* — `'FilterProcessor'`

### Instance Fields

#### `isFilter` — *boolean* — `true`
Identifies this `Component` as a `Filter`.




## FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

Turns an input into an output.  There are many types of filter, linear and nonlinear, but the thing they mostly do is execute some function on the input to produce the output.

### AudioParams

#### `scaling`
#### `offset`
Multiplies the output by the `value` of `scaling` and adds the `value` of `offset` to it.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
Returns `!this.isDone()`.  Before that, it goes through each frame and channel of the output, and if there is an input at all, it calls `filter()` on the input and applies the `scaling` and `offset` to populate the `<outputs>`.

#### `filter(<input>, <frame>, <channel>)` — *number*
Returns `<input>`.  Override this if you want more interesting behavior.  The other arguments are necessary (well, not *necessary* necessary; they could have been stored as instance fields) because some filters store past values, and if `filter()` is being called on multiple input channels, their past values need to be kept separately.




## ParallelFilter < Filter < AudioComponent < Component

A `Filter` that simply adds two other `Filter`s in parallel.  To add more `Filter`s in parallel, simply make one of the `Filter`s itself a `ParallelFilter`.  The `ParallelFilter` actually has two `AudioNode`s, a `firstNode` that's a `GainNode` to receive input and a `node` that has a vanilla `FilterProcessor` to channel the output.  The `firstNode` connects to the first nodes of both parallel `Filter`s, which then both connect to the input of the `node` in a fan-out-fan-in fashion.

### Properties

#### `filter1` — *`Filter`* — `defaultValue`: `{className: 'Filter'}` — `isAudioComponent`: `true` — `inputIndex`: `0` — `connector`: `'connectFiler1'` — `disconnector`: `'disconnectFilter1'`
#### `filter2` — *`Filter`* — `defaultValue`: `null` — `isAudioComponent`: `true` — `inputIndex`: `0` — `connector`: `'connectFiler2'` — `disconnector`: `'disconnectFilter2'`
The two `Filter`s to add in parallel.  By default, `filter2` is null while `filter1` is the trivial `Filter`, so the default output is exactly the same as the input.

### Instance Fields

#### `firstNode` — *`GainNode`*
A `GainNode` with gain 1 to simply receive input and forward it to the two parallel `Filter`s.

### Instance Methods

#### `createNode()`
Creates the `firstNode` as well as calling the superclass's method.

#### `getFirstNode()` — *`AudioNode`*
Returns the `firstNode`, overriding the behavior of the superclass.

#### `connectParallelFilter(<propName>)`
#### `disconnectParallelFilter(<propName>)`
Calls the `genericConnector()` or `genericDisconnector()` to deal with the main `node`, and connects/disconnects the `firstNode` to/from the property.

#### `connectFilter1`()
#### `disconnectFilter1()`
#### `connectFilter2()`
#### `disconnectFilter2()`
Calls `connectParallelFilter()` or `disconnectParallelFilter()`.




## LinearFilter < Filter < AudioComponent < Component

A `Filter` that can be subclassed to be a linear filter, meaning that it remembers the last few inputs and outputs and the new output is a linear combination of the old inputs and outputs.  For an input x(n) and output y(n), where x(n) is the nth sample of the input, x(n – 1) is the (n – 1)th, etc., a general linear filter has the relation a0·y(n) + a1·y(n – 1) + a2·y(n – 2) + ... = b0·x(n) + b1·x(n – 1) + b2·x(n – 2) + ....  The ai terms are called the feedback coefficients and the bi terms are called the feedforward coefficients.  If a0 = 0, we can't actually determine y(n), which is the output, and if b0 = 0, the input x(n) is ignored, so it's usually a bad idea for either value to be 0.  The `LinearFilter` itself doesn't do anything; you should use its subclasses for interesting behavior.

### Properties

#### `memory` — *nonnegative integer* — `value`: `0` — `isProcessorOption`: `true`
How many previous inputs and outputs are necessary to keep around.  If this is `0`, you might as well just use a `GainNode`, so any subclasses should set this value to whatever makes sense for the subclass.

### Class Fields

#### `processorName` — *string* — `'LinearFilterProcessor'`




## LinearFilterProcessor < FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

A base processor class for linear filters.  For an input x(n) and output y(n), where x(n) is the nth sample of the input, x(n – 1) is the (n – 1)th, etc., a general linear filter has the relation a0·y(n) + a1·y(n – 1) + a2·y(n – 2) + ... = b0·x(n) + b1·x(n – 1) + b2·x(n – 2) + ....  The ai terms are called the feedback coefficients and the bi terms are called the feedforward coefficients.  If a0 = 0, we can't actually determine y(n), which is the output, and if b0 = 0, the input x(n) is ignored, so it's usually a bad idea for either value to be 0.  If you subclass this, the only things you actually need to override are `getFeedbackCoefficients()` and `getFeedforwardCoefficients()`, which return the ai and bi, respectively.

### Processor Options

#### `memory` — *nonnegative integer*
How many old input and output values to keep around.  The same number is used for both inputs and outputs for simplicity, so don't worry if you need less of one than the other.

### Instance Fields

#### `lastInputs` — *array of arrays of numbers* — default value: `[]`
#### `lastOutputs` — *array of arrays of numbers* — default value: `[]`
The values to keep.  Each of these is an array where the array index is the channel index, and the values are arrays containing the last `memory` inputs and outputs.  So, if you want the second-to-last input in channel 0, you'd get `lastInputs[0][1]` (since `lastInputs[0][0]` is the last index).  When `prefillMemory()` is called, the arrays of inputs and outputs are prefilled with `0`.

### Instance Methods

#### `filter(<input>, <frame>, <channel>)` — *number*
Calls `prefillMemory()`, `getFeedbackCoefficients()`, and `getFeedforwardCoefficients()`, calculates the output, calls `addToMemory()`, and returns the output.  If the output is not finite, it's set to `0`.  This is because if for whatever reason a value in the filter becomes infinite, *all* subsequent values will be infinite as well due to the memory, so this allows the processor to recover gracefully.  You should not need to override this method if you're implementing a linear filter (and it's actually linear).

#### `getFeedbackCoefficients(<frame>)` — *array of numbers*
#### `getFeedforwardCoefficients(<frame>)` — *array of numbers*
Both return `[1]`.  You should probably override these methods to do something rather than doing nothing, but the 0th element of both return values should probably be nonzero.

#### `prefillMemory(<channel>)`
Since we don't know how many channels this `AudioNode` will have, when we call `filter()` with a particular `<channel>`, we check in this method whether `lastInputs` and `lastOutputs` have a `<channel>` element, and if not, we add it and fill it with `memory` `0`'s.

#### `addToMemory(<input>, <output>, <channel>)`
If `memory` is greater than 0, pops the last value of `lastInputs` and `lastOutputs` and inserts `<input>` and `<output>`, respectively, at the beginning of the arrays.  This keeps the most recent values at position 0.




## FirstOrderFilter < LinearFilter < Filter < AudioComponent < Component

A `Filter` that applies a first-order transfer function.  In layman's terms (well... relatively speaking), if your input is x(n) and your output is y(n), a first-order filter is defined by a0·y(n) + a1·y(n – 1) = b0·x(n) + b1·x(n – 1).  There are other formulations of the same thing, but for our purposes, what this means is that we output a kind of average between the current input and the previous output.

### Properties

#### `a0` — *number or `AudioParam`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `a1` — *number or `AudioParam`* — `defaultValue`: `0` — `isAudioParam`: `true`
#### `b0` — *number or `AudioParam`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `b1` — *number or `AudioParam`* — `defaultValue`: `0` — `isAudioParam`: `true`
If x(n) is the input signal and y(n) is the output, `a0`·y(n) + `a1`·y(n – 1) = `b0`·x(n) + `b1`·x(n – 1).

#### `memory` — *nonnegative integer* — `value`: `1` — `isProcessorOption`: `true`
How many previous inputs and outputs are necessary to keep around.  For this filter, it's `1`.

### Class Fields

#### `processorName` — *string* — `'FirstOrderFiterProcessor'`




## FirstOrderFilterProcessor < LinearFilterProcessor < FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor for a filter that executes a0·y(n) + a1·y(n – 1) = b0·x(n) + b1·x(n – 1) (see above).  It does this by keeping the last inputs and outputs (which start at `0` when the processor first starts to run) and doing the arithmetic.

### AudioParams

#### `a0`
#### `a1`
#### `b0`
#### `b1`
If x(n) is the input signal and y(n) is the output, `a0`·y(n) + `a1`·y(n – 1) = `b0`·x(n) + `b1`·x(n – 1).

### Instance Methods

#### `getFeedbackCoefficients(<frame>)` — *array of numbers*
#### `getFeedforwardCoefficients(<frame>)` — *array of numbers*
Returns the values of `AudioParam`s [`a0`, `a1`] and [`b0`, `b1`], respectively.




## BiquadFilter < FirstOrderFilter < LinearFilter < Filter < AudioComponent < Component

A `Filter` that applies a second-order (biquadratic) transfer function.  In layman's terms (well... relatively speaking), if your input is x(n) and your output is y(n), a second-order filter is defined by a0·y(n) + a1·y(n – 1) + a2·y(n – 2) = b0·x(n) + b1·x(n – 1) + b2·x(x – 2).  There are other formulations of the same thing, but for our purposes, what this means is that we can make useful low-pass and high-pass filters.

### Properties

#### `a2` — *number or `AudioParam`* — `defaultValue`: `0` — `isAudioParam`: `true`
#### `b2` — *number or `AudioParam`* — `defaultValue`: `0` — `isAudioParam`: `true`
If x(n) is the input signal and y(n) is the output, `a0`·y(n) + `a1`·y(n – 1) + `a2`·y(n – 2) = `b0`·x(n) + `b1`·x(n – 1) + `b2`·x(n – 2).

#### `memory` — *nonnegative integer* — `value`: `2` — `isProcessorOption`: `true`
How many previous inputs and outputs are necessary to keep around.  For this filter, it's `2`.

### Class Fields

#### `processorName` — *string* — `'BiquadFiterProcessor'`




## BiquadFilterProcessor < FirstOrderFilterProcessor < LinearFilterProcessor < FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor for a filter that executes a0·y(n) + a1·y(n – 1) + a2·y(n – 2) = b0·x(n) + b1·x(n – 1) + b2·x(n – 2) (see above).  It does this by keeping the last inputs and outputs (which start at `0` when the processor first starts to run) and doing the arithmetic.

### AudioParams

#### `a2`
#### `b2`
If x(n) is the input signal and y(n) is the output, `a0`·y(n) + `a1`·y(n – 1) + `a2`·y(n – 2) = `b0`·x(n) + `b1`·x(n – 1) + `b2`·x(n – 2).

### Instance Methods

#### `getFeedbackCoefficients(<frame>)` — *array of numbers*
#### `getFeedforwardCoefficients(<frame>)` — *array of numbers*
Returns the values of `AudioParam`s [`a0`, `a1`, `a2`] and [`b0`, `b1`, `b2`], respectively.




## Cutoff Filter < Filter < AudioComponent < Component

A `Filter` that cuts off the top and bottom of a wave, setting them to the specified max and min values, and, optionally, renormalizes it (by scaling it and applying an offset) to be between –1 and 1 again.  (Note that you can achieve the same renormalization effect by providing a suitable `scaling` and `offset`).

### Properties

#### `highCutoff` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `lowCutoff` — *number or `AudioComponent`* — `defaultValue`: `-1` — `isAudioParam`: `true`
These two numbers are the high and low boundary of the signal; if the signal lies outside the boundary, it is set to the boundary value.  For example, if `highCutoff` is 0.6 and `lowCutoff` is –0.4, then a value of 0.7 will be changed to 0.6 and a value of –3 will be changed to –0.4.  If `highCutoff` is lower than `lowCutoff`, the roles will simply be interchanged: values above `lowCutoff` will be reduced to `lowCutoff` and values below `highCutoff` will be raised to `highCutoff`.  In either case, values in between the two will not be affected.

#### `isNormalized` — *boolean* — `defaultValue`: `true` — `isProcessorOption`: `true`
Whether to apply a scaling and offset to map the low and high cutoffs to –1 and 1, respectively.  This is useful when the filter is filtering an audio signal because cutting off pieces of the wave removes power from the wave, making it softer; normalizing to compensate maintains the volume (to an extent).

### Class Fields

#### `processorName` — *string* — `'CutoffFilterProcessor'`




## CutoffFilterProcessor < FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

Cuts off the top and bottom of an input signal and optionally renormalizes it so that the top and bottom are at 1 and –1, respectively.

### AudioParams

#### `highCutoff`
#### `lowCutoff`
The two cutoffs, one high and one low (it does not matter which is which).  Input values above the high one will be reduced to the high cutoff, and input values below the low one will be augmented to the low cutoff.

### Processor Options

#### `isNormalized`
Whether the signal is scaled/offset such that the high and low cutoffs are 1 and –1, respectively.

### Instance Methods

#### `filter(<input>, <frame>, <channel>)` — *number*
Cuts off the signal as appropriate, and normalizes it if appropriate.




## StepFilter < Filter < AudioComponent < Component

Kind of like a bitcrusher, except smoother.  It takes the input signal and sort of rounds it to one of `steps` equally-speaced steps, starting at the low cutoff and ending possibly at the high cutoff (if `steps` is an integer).  It turns a smooth curve into a jagged pixellated mess, which also adds high-frequency components to the sound while losing fidelity if you're using it on an audio signal.

### Properties

#### `steps` — *number or `AudioComponent`* — `defaultValue`: `Math.pow(2, 23)` — `isAudioParam`: `true`
The number of steps in which to divide the range.  If the range is from –1 to 1 and `steps` is 1, for example, every value will be replaced with 0.  If `steps` is 2, then every value will be either –1 or 1.  If `steps` is 3, every value will be –1, 0, or 1.  If `steps` is 4, every value will be –1, –1/3, 1/3, or 1.  And so on.  The rounding is not usual rounding: it's done such that, if you were to ramp smoothly from –1 to 1 with `steps` at 4, you'd spend 1/4 of the time at –1, 1/4 at –1/3, 1/4 at 1/3, and 1/4 at 1.  `steps` is always counted from the bottom of the range, so if it isn't an integer, the value at the bottom is a possible value for the output, but the top of the range isn't.

#### `highCutoff` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `lowCutoff` — *number or `AudioComponent`* — `defaultValue`: `-1` — `isAudioParam`: `true`
The boundaries which will be divided into `steps`.  Values outside this boundary don't actually get cut off, though the rounding does get weird.  It doesn't matter which is lower or higher.

### Class Fields

#### `processorName` — *string* — `StepFilterProcessor`




## StepFilterProcessor < FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

Kind of like a bitcrusher, except smoother.  It takes the input signal and sort of rounds it to one of `steps` equally-speaced steps, starting at the low cutoff and ending possibly at the high cutoff (if `steps` is an integer).  It turns a smooth curve into a jagged pixellated mess, which also adds high-frequency components to the sound while losing fidelity if you're using it on an audio signal.

### AudioParams

#### `steps`
The number of steps in which to divide the range.  If the range is from –1 to 1 and `steps` is 1, for example, every value will be replaced with 0.  If `steps` is 2, then every value will be either –1 or 1.  If `steps` is 3, every value will be –1, 0, or 1.  If `steps` is 4, every value will be –1, –1/3, 1/3, or 1.  And so on.  The rounding is not usual rounding: it's done such that, if you were to ramp smoothly from –1 to 1 with `steps` at 4, you'd spend 1/4 of the time at –1, 1/4 at –1/3, 1/4 at 1/3, and 1/4 at 1.  `steps` is always counted from the bottom of the range, so if it isn't an integer, the value at the bottom is a possible value for the output, but the top of the range isn't.

#### `highCutoff`
#### `lowCutoff`
The boundaries which will be divided into `steps`.  Values outside this boundary don't actually get cut off, though the rounding does get weird.  It doesn't matter which is lower or higher.

### Instance Methods

#### `filter(<input>, <frame>, <channel>)` — *number*
Identifies the boundaries and the width of a step (if the `value` of `steps` is ≤1, returns the center value, the average of the low and high boundaries).  The slice index is floor((input - low)/sliceWidth), and that slice index is multiplied by width/(`steps` – 1) (and added to low) to get the output.  If the input is equal to the high value, which would mathematically round to the next slice up, we make an exception and round it down, so for example, if the range is from –1 to 1 with the `value` of `steps` being 2, if –1 ≤ input < 0 it will get rounded to –1, while if 0 ≤ input ≤ 1 it will get rounded up to 1.  The bottom slice has an exclusive inequality on the upper end, while the top slice has inclusive inequalities on both ends.




## BiquadDriver < Filter < AudioComponent < Component

A `Filter` that drives a `BiquadFilter` with the outputs of its `node`.  This particular filter simply passes the signal through the default `BiquadFilter`, but you can subclass this to feed all six coefficients of the `BiquadFilter` with the results of formulas through an appropriate processor.

### Properties

#### `scaling` — *number or `AudioComponent`* — `defaultValue`: `1` — `passThrough`: `biquad`
#### `offset` — *number or `AudioComponent`* — `defaultValue`: `0` — `passThrough`: `biquad`
Pass-through properties of the `BiquadFilter` instance within the `BiquadDriver`.

### Instance Fields

#### `biquad` — *`BiquadFilter`*
The `Filter` that actually filters a signal.  The `node`'s outputs connect to its parameters.

### Instance Methods

#### `coefficientMap()` — *array of numbers, `AudioComponent`s, and `AudioComponent` definitions*
Returns an object containing values for the keys `'b0'`, `'b1'`, `'b2'`, `'a0'`, `'a1'`, and `'a2'`.  The default values are `1` for `'b0'` and `'a0'` and `0` for the other four, which results in the trivial identity filter that simply outputs its input.  Subclasses should override this method to provide different parameters.  The `biquad` will be constructed using these as the parameters.

#### `createNode()`
#### `cleanupNode()`
Also create and clean up the `biquad`.

#### `getFirstNode()` — `AudioNode`
#### `getNodeToFilter()` — `AudioNode`
Redirects both calls to the `biquad`, which ensures that the filter is connected properly.




## TwoPoleFilter < BiquadDriver < Filter < AudioComponent < Component

A biquad `Filter` with two complex poles at radius R from the origin and angle ±ø, no zeros, and a general gain of `b0`.  It's essentially a `BiquadFilter` with inputs `b0`, `b1` = `b2` = 0, `a0` = 1, `a1` = –2Rcos(ø), and `a2` = R^(2).  ø is calculated from the center frequency f_c as ø = 2π·f_c/`sampleRate`.  The effect is that frequencies near f_c are amplified, though note that the peak gain will not actually be right at f_c because the two poles combine their effects.  The `TwoPoleFilter` is implemented as a `BiquadFilter` part with a two-output `AudioNode` connected to it, generating the inputs.

### Properties

#### `b0` — *number or `AudioComponent`* — `defaultValue`: `1` — `passThrough`: `biquad`
Pass-through properties of the `BiquadFilter` instance within the `TwoPoleFilter`.

#### `radius` — *number or `AudioComponent` — `defaultValue`: `0` — `isAudioParam`: `true`
#### `frequency` — *number or `AudioComponent` — `defaultValue`: `0` — `isAudioParam`: `true`
Parameters R and f_c representing the location of the poles in the complex plane.  R should be less than 1, otherwise the filter will not be stable.  The poles are located at z = R·e^(±iø), where ø = 2π·f_c/`sampleRate`.

### Class Fields

#### `numberOfInputs` — `0`
#### `numberOfOutputs` — `2`
#### `processorName` — `'TwoPoleFilterDriverProcessor'`
The inputs and outputs relate to the `node`, while the actual filtering is done by the `biquad`.

### Instance Methods

#### `coefficientMap()` — *array of numbers, `AudioComponent`s, and `AudioComponent` definitions*
Returns an object with the appropriate coefficients, including `NodeOutput` definitions for `'a1'` and `'a2'`.




## TwoPoleFilterDriverProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor that provides the necessary inputs to drive the `TwoPoleFilter`'s `biquad`.  Its two outputs correspond to `a1` and `a2` on the `biquad`.

### AudioParams

#### `radius`
#### `frequency`
R and f_c to calculate the coefficients of the `biquad`.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
Returns `!this.isDone()`.  Before that, fills each frame and channel of the two outputs with values for `a1` and `a2` in the `biquad`.

#### `calculateA1(<frame>)` — *number*
#### `calculateA2(<frame>)` — *number*
Returns the calculated values for the `a1` and `a2` coefficients.  `a1` = –2R·cos(ø) and `a2` = R^(2), where R is the value of `radius` at the given `<frame>` and ø is 2π/`sampleRate` times the value of `frequency` at the given `<frame>`.




## TwoZeroFilter < BiquadDriver < Filter < AudioComponent < Component

A biquad `Filter` with two complex zeros at radius R from the origin and angle ±ø, no poles, and a general gain of `b0`.  It's essentially a `BiquadFilter` with inputs `b0`, `b1` = –2Rcos(ø)·`b0`, `b2` = R^(2)·`b0`, `a0` = 1, and `a1` = `a2` = 0.  ø is calculated from the center frequency f_c as ø = 2π·f_c/`sampleRate`.  The effect is that frequencies near f_c are attenuated, though note that the peak attenuation will not actually be right at f_c because the two zeros combine their effects.  The `TwoZeroFilter` is implemented as a `BiquadFilter` part with a three-output `AudioNode` connected to it, generating the inputs.

### Properties

#### `b0` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
#### `radius` — *number or `AudioComponent` — `defaultValue`: `0` — `isAudioParam`: `true`
#### `frequency` — *number or `AudioComponent` — `defaultValue`: `0` — `isAudioParam`: `true`
Parameters `b0`, R, and f_c representing the general gain and the location of the zeros in the complex plane.  R does not need to be less than 1.  The zeros are located at z = R·e^(±iø), where ø = 2π·f_c/`sampleRate`.

### Class Fields

#### `numberOfInputs` — `0`
#### `numberOfOutputs` — `3`
#### `processorName` — `'TwoZeroFilterDriverProcessor'`
The inputs and outputs relate to the `node`, while the actual filtering is done by the `biquad`.

### Instance Methods

#### `coefficientMap()` — *array of numbers, `AudioComponent`s, and `AudioComponent` definitions*
Returns an object with the appropriate coefficients, including `NodeOutput` definitions for `'b0'`, `'b1'`, and `'b2'`.




## TwoZeroFilterDriverProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor that provides the necessary inputs to drive the `TwoZeroFilter`'s `biquad`.  Its three outputs correspond to `b0`, `b1`, and `b2` on the `biquad`.

### AudioParams

#### `b0`
#### `radius`
#### `frequency`
`b0`, R, and f_c to calculate the coefficients of the `biquad`.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
Returns `!this.isDone()`.  Before that, fills each frame and channel of the three outputs with values for `b0`, `b1`, and `b2` in the `biquad`.

#### `calculateB1(<frame>)` — *number*
#### `calculateB2(<frame>)` — *number*
Returns the calculated values for the `b1` and `b2` coefficients.  `b1` = –2R·cos(ø)·`b0` and `b2` = R^(2)·`b0`, where R is the value of `radius` at the given `<frame>` and ø is 2π/`sampleRate` times the value of `frequency` at the given `<frame>`.




## LowShelfFilter < BiquadDriver < Filter < AudioComponent < Component

A first-order (one zero, one pole) `Filter` that boosts low frequencies less than the `frequency` of the filter and leaves higher frequencies alone.  It is essentially a `BiquadFilter` with `b0` = 1 + k·b, `b1` = –(1 – k·b), `b2` = 0, `a0` = 1 + k, `a1` = –(1 – k), and `a2` = 0, where b is the `boost` and k = tan(ø/2), where ø is calculated from the cutoff `frequency` f_c as ø = 2π·f_c/`sampleRate`.  You can check that the transfer function yields b at z = 1, which corresponds to a DC signal (frequency 0), and it yields 1 at z = –1, which corresponds to the Nyquist frequency (22,050 Hz).

### Properties

#### `boost` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
The gain of the signal at DC.  If this number is greater than 1, the signal is boosted; if less than 1, attenuated.  The gain at the Nyquist frequency is 1 (0 dB).

#### `frequency` — *number or `AudioComponent`* — `defaultValue`: `0` — `isAudioParam`: `true`
The cutoff frequency for the shelf; frequencies lower than this value will be boosted by `boost`, while frequencies higher will have an unchanged gain of 1.  However, in practice, there's a very gradual change around the cutoff frequency, since this is only a first-order filter.

### Class Fields

#### `numberOfInputs` — `0`
#### `numberOfOutputs` — `4`
#### `processorName` — `'LowShelfFilterDriverProcessor'`
The inputs and outputs relate to the `node`, while the actual filtering is done by the `biquad`.

### Instance Methods

#### `coefficientMap()` — *array of numbers, `AudioComponent`s, and `AudioComponent` definitions*
Returns an object with the appropriate coefficients, including `NodeOutput` definitions for `'b0'`, `'b1'`, `'a0'`, and `'a1'`.




## LowShelfFilterDriverProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor that provides the necessary inputs to drive the `LowShelfFilter`'s `biquad`.  Its four outputs correspond to `b0`, `b1`, `a0`, and `a1` on the `biquad`.

### AudioParams

#### `boost`
#### `frequency`
The parameters `b` and `f_c` used to calculate the coefficients of the `biquad`.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
Returns `!this.isDone()`.  Before that, fills each frame and channel of the four outputs with values for `b0`, `b1`, `a0`, and `a1` in the `biquad`.

#### `calculateK(<frame>)` — *number*
Returns the calculated value of k used in calculating the coefficients.  k = tan(ø/2), where ø = 2π·f_c/`sampleRate`, with f_c being the `frequency`.

#### `calculateB0(<b>, <k>)` — *number*
#### `calculateB1(<b>, <k>)` — *number*
#### `calculateA0(<b>, <k>)` — *number*
#### `calculateA1(<b>, <k>)` — *number*
Returns the calculated values for the `b0`, `b1`, `a0`, and `a1` coefficients using the frame's values for `<b>` and `<k>`.  With b = `<b>` and k = `<k>`, we have `b0` = 1 + k·b, `b1` = –(1 – k·b), `a0` = 1 + k, and `a1` = –(1 – k).




## HighShelfFilter < BiquadDriver < Filter < AudioComponent < Component

A first-order (one zero, one pole) `Filter` that boosts high frequencies greater than the `frequency` of the filter and leaves lower frequencies alone.  It is essentially a `BiquadFilter` with `b0` = b + k, `b1` = –(b – k), `b2` = 0, `a0` = 1 + k, `a1` = –(1 – k), and `a2` = 0, where b is the `boost` and k = tan(ø/2), where ø is calculated from the cutoff `frequency` f_c as ø = 2π·f_c/`sampleRate`.  You can check that the transfer function yields 1 at z = 1, which corresponds to a DC signal (frequency 0), and it yields b at z = –1, which corresponds to the Nyquist frequency (22,050 Hz).

### Properties

#### `boost` — *number or `AudioComponent`* — `defaultValue`: `1` — `isAudioParam`: `true`
The gain of the signal at the Nyquist frequency.  If this number is greater than 1, the signal is boosted; if less than 1, attenuated.  The gain at DC is 1 (0 dB).

#### `frequency` — *number or `AudioComponent`* — `defaultValue`: `0` — `isAudioParam`: `true`
The cutoff frequency for the shelf; frequencies higher than this value will be boosted by `boost`, while frequencies lower will have an unchanged gain of 1.  However, in practice, there's a very gradual change around the cutoff frequency, since this is only a first-order filter.

### Class Fields

#### `numberOfInputs` — `0`
#### `numberOfOutputs` — `4`
#### `processorName` — `'HighShelfFilterDriverProcessor'`
The inputs and outputs relate to the `node`, while the actual filtering is done by the `biquad`.

### Instance Methods

#### `coefficientMap()` — *array of numbers, `AudioComponent`s, and `AudioComponent` definitions*
Returns an object with the appropriate coefficients, including `NodeOutput` definitions for `'b0'`, `'b1'`, `'a0'`, and `'a1'`.




## HighShelfFilterDriverProcessor < AudioComponentProcessor < AudioWorkletProcessor

A processor that provides the necessary inputs to drive the `HighShelfFilter`'s `biquad`.  Its four outputs correspond to `b0`, `b1`, `a0`, and `a1` on the `biquad`.

### AudioParams

#### `boost`
#### `frequency`
The parameters `b` and `f_c` used to calculate the coefficients of the `biquad`.

### Instance Methods

#### `_process(<outputs>)` — *boolean*
Returns `!this.isDone()`.  Before that, fills each frame and channel of the four outputs with values for `b0`, `b1`, `a0`, and `a1` in the `biquad`.

#### `calculateK(<frame>)` — *number*
Returns the calculated value of k used in calculating the coefficients.  k = tan(ø/2), where ø = 2π·f_c/`sampleRate`, with f_c being the `frequency`.

#### `calculateB0(<b>, <k>)` — *number*
#### `calculateB1(<b>, <k>)` — *number*
#### `calculateA0(<b>, <k>)` — *number*
#### `calculateA1(<b>, <k>)` — *number*
Returns the calculated values for the `b0`, `b1`, `a0`, and `a1` coefficients using the frame's values for `<b>` and `<k>`.  With b = `<b>` and k = `<k>`, we have `b0` = b + k, `b1` = –(b – k), `a0` = 1 + k, and `a1` = –(1 – k).
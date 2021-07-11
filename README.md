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

Behind the scenes, Offtonic Audioplayer uses `AudioWorkletNode`s, which may not yet be supported in all browsers.  As of this writing, all of its features are supported on the latest Chrome and Firefox, but Safari does not yet support them, which means that Offtonic Audioplayer does not work on iOS.  Previous iterations were based on `ScriptProcessorNode`s, which *are* available on Safari, but that API is deprecated (and its performance is terrible since it executes an audio callback on the main thread).  So I guess don't use this if you want your web app to work on iOS.

I'm sure you'll want to define your own custom oscillators and filters and whatnot, so the basic abstract classes should be fairly easy to subclass, but the best documentation for how to do that is, naturally, the code itself.  This document will not list every single detail of what you need to know to do that, but I'll give you hints where applicable.




## Properties in the API

The Offtonic Audioplayer API is based on setting properties on components.  A component (subclass of `Component`) is basically any bit of the Offtonic Audioplayer with its own behavior, and a property is some fundamental aspect of the component.  For example, a `Tone` is a component that produces an audio signal when played, and `frequency` is one of its properties, which can be a simple number or even another component that produces a number.  You can access the value by calling `tone.getProperty('frequency')` (assuming `tone` is an instance of `Tone`), and you can set the value at `Tone` creation by passing in an object to `o.createComponent` with a `frequency` field or later through `setProperties()`, again by passing it an object with a `frequency` field.  If the component holds an `AudioNode`, then it is also an `AudioComponent`.

A property value can frequently be a properties object defining another `Component` instance.  For example, the `generator` property of `Tone` can be a properties object defining, say, a `SineOscillator`.  This property could itself have other `Component` instances as properties, etc.  If the value for a property is an object with `className` as a field, it will recursively be turned into a component with `o.createComponent`.

In this document, I'm using "field" to refer to the simple JS language construct of sticking a thing in a thing, and "property" is reserved for these fundamental aspects set through the API.  In JS lingo generally, what I'm calling a field is often called a property, but I'm not doing that.  Why?  Because I'm using "property" for the fundamental aspects and I don't want to confuse people further, so I'm using "field" for the JS property and "property" for the Offtonic Audioplayer property.  Got it?

Properties are set at component instantiation by calling either `(new <ComponentType>()).withPlayer(<player>).withProperties(<props>)` or `o.createComponent(<props>, *<player>*)`, with `<props>` being an object containing values for some or all of the properties, and are modified later by calling `component.setProperties(<props>)`.  The only difference is that `withProperties(<props>)` will use default values for missing properties in the `<props>` object, while `setProperties(<props>)` will ignore missing properties.  You should *always* call `withProperties(<props>)` to ensure that the component gets initialized correctly.  (Note that `<props>.className` has a special meaning, so `className` should never be a property name or bad things will happen!)  If you create a component from the global object `o`, the `player` is optional and will default to the default player.  More about the `Player` instance later.

Each property is set via a setter method named in the property definition.  These setter methods get called in the order the properties were defined, starting with the highest superclass, `Component`.

To define a property, stick an object in the `static newPropertyDescriptors` object of the component class you're creating with the fields below.  You can override a property in a subclass by redefining it in the subclass's `newPropertyDescriptors` array, which could be useful if you want to change a default.  When the class is first instantiated, the static field `propertyDescriptors` will hold all of the component's properties.




### Property Descriptor Fields

#### `name` — *string* (required) — key in `propertyDescriptors` object
Property name, which is also the key in the `propertyDescriptors` object (the value is an object containing any other fields of the descriptor).  When creating a new `Component` or setting its properties, you pass in a property object; the property name is the key you should use to provide a value for this property.  You can get a property from a component with `getProperty(<propName>)`, but it's generally assumed that the value will be stored in the `<propName>` field of the component.

#### `defaultValue` — value or *object* (optional)
Default value of the property if no value is provided at object creation (as part of the `withProperties()` call).  This can be an object containing the properties to define a new component.  A default value for a property is set on the component at the same time that a non-default value would have been set for that property; if a value *is* provided, a `Component` instance defined in the `defaultValue` property does not get instantiated.

#### `value` — value or *object* (optional)
Value of the property, regardless of whether a value is provided (any provided value is ignored).  Use this in subclasses that fix a specific value for a superclass property.

#### `getter` and `setter` — *string* (optional)
The values are method names that get called when `getProperty()` and `setProperty()` are called.  `Component` provides `genericGetter()` and `genericSetter()` that do the basics, but if you need more functionality, or if your property works differently from the default way of handling them, you can provide a getter and/or setter.

#### `connector` and `disconnector` — *string* (optional)
The values are method names that get called when `connectProperty` and `disconnectProperty()` are called.  `AudioComponent` assumes that properties that need it (those that have `isAudioParam` set to `true`, for example, or `inputIndex` set to a non-negative number) possess a `connectTo()` method that connects the property's `node` field to the primary component's `node` field, as well as a `disconnectFrom()` method to undo this.  These `node` fields are `AudioNode` instances, whether native nodes or `AudioWorkletNode`s, and they work as prescribed in the WebAudio API docs.  If you need any special behavior, perhaps because you're connecting to a node other than the component's `node` field, you should provide `connector` and/or `disconnector` methods for the property.

#### `cleaner` — *string* (optional)
The value is a method name that gets called when `cleanupProperty()` is called, with the goal of freeing resources associated with this property.  `Component` provides `genericCleaner()` that does the basics, but if you need more functionality, or if your property works differently from the default way of handling them, you can provide a cleaner.

#### `isAudioParam` — *boolean* (optional) — default `false`
#### `paramName` — *string* (optional) — default value is the value of the `name` property
Indicates that a property represents an `AudioParam`, a parameter of an `AudioNode` named `paramName` (see the WebAudio API docs).  This means that the value must either be a number or an `AudioComponent` with a `connectTo()` method that connects some `AudioNode` (which provides numbers at the audio rate) to the `AudioParam`.  In addition, if the `node` is an `AudioWorkletNode` and the value of this property is a number, that number will be added to the `options.parameterData` object when creating the node as its initial value.

#### `isProcessorOption` — *boolean* (optional) — default `false`
#### `processorOptionName` — *string* (optional) — default value is the value of the `name` property
Indicates that a property value should be passed to the constructor of the `AudioComponent`'s `AudioWorkletNode` node; it will be added to `options.processorOptions` under a key specified by `processorOptionName` if that is present or just the `name` property if not.  The value can typically be anything, but objects get copied using the structured clone algorithm, which does not allow functions, so it's actually fairly limited.

#### `inputIndex` — *number* (optional)
Indicates which input on the audio component's `node` field this property should connect to.  The property must be an audio component, since `AudioNode` inputs must be other `AudioNode`s.  If `inputIndex` is not provided, it's assumed that the property is not connecting to an input on the `node` field.

#### `isAudioComponent` — *boolean* (optional) — default `false`
Indicates that the property must be an `AudioComponent` instance rather than, say, a number.  If the value for the property is a number, it will be turned into a `ConstantGenerator` audio component that outputs the number.




### Instruments

Having to keep entering the same properties can be annoying.  But there's a solution: instruments.  An instrument is an object with a collection of properties that gets stored in the `orchestra` with a `name`.  When a `Component` definition has an `instrument` field, the instrument (or instruments) named in the field populate the properties with their own if the definition doesn't already contain them.  It's best to explain this with an example:

	o.orchestra.add({
		name: 'test1',
		className: 'Tone',
		gain: 0.2,
		envelope: {
			instrument: ['test2', 'test3']
		}
	});
	o.orchestra.add({
		name: 'test2',
		release: 250
	});
	o.orchestra.add({
		name: 'test3',
		className: 'ADSREnvelope',
		attackGain: 3,
		release: 20
	});

	const tone1 = o.createComponent({
		instrument: 'test1',
		frequency: 256
	});

Here are three instruments added to the `orchestra` (which lives in the global object `o`).  The first one has a `name` of `test1`, and it contains several fields defining properties, including a `className`, and also including a property with its own `Component` definition inside, `envelope`, which has an `instrument` property of `[test2, test3]`.  Instruments are not resolved until `Component` creation, so it's OK that we haven't added `test2` and `test3` to our `orchestra` yet.  The second one has a `name` of `test2` and just one property, a `release` set to `250`, while the third one, with a `name` of `test3`, has a few properties, including a `release` of `20`.  To actually use an instrument in your definition, simply include the `instrument` key, where the value is either a string with the `name` of the instrument you want to use or an array of such `name`s.

Finally, we have a definition of a `Component` passed to `o.createComponent()` that features an `instrument`.  Let's see how it gets applied.  First, all of the properties of `test1` get added to (a copy of) the property definition:

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

#### `ctx` — *`AudioContext`*
The `AudioContext` for the `AudioNode`s used by Offtonic Audioplayer.

#### `classRegistry` — *`ClassRegistry`*
An object mapping `className` property values to class constructors.  You should not have to access this directly.

#### `orchestra` — *`Orchestra`*
An object mapping `instrument` property values to sets of properties.  You should not have to access this directly.

#### `baseHref` — *string*
URL of the base directory of Offtonic Audioplayer.  Useful if you need to provide absolute paths to something.

#### `player` — *`Player`*
Default `Player` instance; all `Component`s created with `createComponent()` have this as their `player` instance if another is not provided.

### Instance Methods

#### `registerClass(<className>, <classInstance>, <overwrite>)`
Adds a class to the class registry so that it can be instantiated when a properties object with a `className` is passed to `createComponent()`.  `<className>` is the name of the class, and `<classInstance>` is the class itself (the constructor function), which should be a subclass of `Component` or instantiation will not work.  If you are adding any new `Component` subclasses, you should register them here so that you can specify them in properties.  The `<overwrite>` argument is optional; if it is not `true` and you attempt to register a class with a duplicate `<className>`, the registration will fail and you will get a console error, but if it is `true`, the new value will overwrite the old one.

#### `getClass(<className>)` — *`Component` subclass constructor*
Retrieves the class instance from the class registry with the given `<className>`, if it exists.  You shouldn't have to call this method directly, since this is called from `createComponent` already.

#### `addModule(<modulePath>)`
Adds to the `AudioContext`'s `AudioWorklet` an `AudioWorkletProcessor` subclass located at `<modulePath>`, a (string) URL path relative to the Offtonic Audioplayer's base directory.  If you create any `AudioWorkletProcessor` subclasses, you should add them here.  Adding the module to the audio context's `AudioWorklet` is a required step in the WebAudio API, but the paths can be confusing since relative URLs are actually compared to the HTML file the script is loaded from rather than the location of the module you're currently in.  This function simplifies this complication by considering all URLs to be relative to the base directory and turning them into absolute URLs with the `baseHref` field.

#### `createComponent(<properties>, <player>, <registry>)` — *`Component` subclass*
Creates a `Component` instance based on `<properties>`, which is an object whose keys are property names and whose values are the property values, including the key `className`, whose value should be a class that has been previously registered with `registerClass()` (built-in classes are already registered).  `<player>` is the `Player` instance that should be attached to the component; if it is not provided (`null` or `undefined`), the default player (the global object's `player` field) will be used by default.  Similarly, `<registry>` is the player's `registry` unless another is provided.  If any properties themselves define a new component (by containing `className`), `createComponent()` will be recursively called on them, with the same `<player>` argument.

#### `info(...<args>)`
#### `warn(...<args>)`
#### `error(...<args>)`
If `debug` is set to `true`, calls `console.info(<args>)`, `console.warn(<args>)`, and `console.error(<args>)`, respectively.  Note that `info()` does not (currently) provide a call stack in Chrome, while `warn()` and `error()` do.




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




## Orchestra

The `Orchestra` singleton works similar to the `ClassRegistry`, but it stores instruments instead: its `instruments` field is an object whose keys are instrument `name`s and whose values are the instrument definitions (see the above section on Instruments).  When a `Component` is about to be instantiated and its definition has an `instrument` field, it first has to resolve that instrument through the `Orchestra`.  The `Orchestra` singleton is available at `o.orchestra`.

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




## Registry

A library/namespace for `Component` references, useful when multiple `Component`s share the same actual `Component` instance for some property.  This is *not* a singleton, since it could be useful to define separate namespaces (for example, in the case of multiple audio applications on the same page whose names may intersect).  The `Player` instance creates its own `Registry`, which is assigned by default to any new `Component`s associated with that `Player`.

### Instance Fields

#### `components` — *object where the keys are names and the values are `Component` instances* — default value `{}`
The object that holds the component library.

### Instance Methods

#### `add(<component>)` — *boolean*
Adds `<component>` to `components`, provided that it has key `name`, and returns `true`.  If it doesn't, or the name already exists, returns `false`.

#### `get(<name>)` — *`Component`*
Retrieves the `Component` with the given `<name>`, or `null` if it can't find it.

#### `remove(<name>)`
Removes the `Component` with the given `<name>` from the registry (if it's there).

#### `contains(<name>)` — *boolean*
Returns `true` if `<name>` is in `components` and `false` otherwise.




## Player

A `Player` instance represents a destination for the `AudioNode`s of the `AudioComponent`s (generally `Playable`s, but you can play pretty any object that implements a few methods).  The player's `node` field is a `GainNode` to which playable nodes are connected, and that `GainNode` is connected to the `AudioContext`'s `destination` (generally the speakers) by default, but you can connect it to something else if you'd like.  In previous iterations of Offtonic Audioplayer, the `Player` was the `ScriptProcessorNode` responsible for playing all of the sound generated by the `AudioComponent`s, but in this current `AudioWorklet` implementation, that is not possible, so the `Player`'s job is less involved.  The `Player` does provide an opportunity to adjust master volume, master filters, etc., and since it's easy to simply create multiple `Player` instances and connect them to different destinations, including other `Player`s, you can even create multiple configurations and have different sounds play through each of them simultaneously.

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
The sound-outputting `AudioNode` of the `Player`, to which `AudioComponent`s are connected to play sound, created at `Player` instance construction.

#### `inputIndex` — *number* — default value: `0`
Index of the input on `node` to which `AudioComponent`s should connect.  You probably shouldn't try to change this unless you override `setupNode()` to make `node` something other than a `GainNode` that has multiple inputs.

#### `playing` — *array of `AudioComponent`s*
Set of playable components that are playing right now.  When the `Player` plays a note, it goes into this array; when the `Player` stops a note, it's removed.  When `stopAll()` is called, all notes in the array are stopped and removed.

#### `registry` — *`Registry`*
The `Registry` instance associated with the `Player`.  All new `Component`s created with this `Player` are assigned this `registry` by default.

#### `timer` — *`Timer`* — `Component` created from `{name: 'Default Timer', className: 'Timer'}`
The default `Timer`, which counts the time since the `Player` was turned `on()`.  Its name is `'Default Timer'` and it's the default timer on most `AudioComponent`s that use one.

#### `isOn` — *boolean* — default value: `false`
Whether the `Player` is on.

### Instance Methods

#### `on()`
Calls `setupNode()` and creates and starts the `timer`.  Call this at the start of a session with this `Player`.

#### `off()`
Stops all notes, calls `cleanupNode()`, and cleans up the `timer`.  Call this at the end of a session with this `Player` to make sure that there aren't errant `AudioNode`s hanging around and leaking CPU time and memory.

#### `setupNode()`
Called when the `Player` is turned `on()`.  Creates the `node`, sets the gain, and connects it to `destination`.

#### `cleanupNode()`
Called when the `Player` is turned `off()`.  Disconnects the `node` from the `destination` and tears it down.

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




## Component

A `Component` is a piece of the sound-producing apparatus of Offtonic Audioplayer that can be instantiated by means of a properties object.  `Component` should probably never be directly instantiated, since a `Component` doesn't actually *do* anything on its own; the `Component` superclass simply provides the necessary methods to parse the properties for its subclasses to inherit.

### Properties

#### `name` — *string* — `defaultValue`: `null` — `setter`: `'setName'` — `cleaner`: `'cleanupName'`

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

#### `create(<properties>, <player>, <registry>)` — `Component` subclass instance
`o.createComponent()` just calls this method, so you should probably call that instead since it's easier.  Creates a new object with `<properties>` (after resolving all instruments named in it) as its properties, `<player>` as its player, and `<registry>` as its registry by calling the constructor specified in `<properties>.className` if present (if not, calls the current class's constructor), then `.withPlayer(<player>).withRegistry(<registry>).withProperties(<properties>)` on the constructed object.

### Constructor

You should probably not call the constructor for `Component` or its subclasses yourself.  The constructor takes no arguments, sets all new properties to `null`, and does whatever basic setup is necessary.  Subclasses need to declare a constructor, but that constructor should probably take no arguments (and must call `super()` because that's how JS works).

### Instance Fields

#### `ctx` — *`AudioContext`*
Default `AudioContext` from `o`, for convenience.

#### `isComponent` — *boolean* — `true`
So you can easily check if a given object is a `Component` and therefore responds to `Component`'s methods.

#### `player` — *Player*
The `Player` instance passed to `create()` when creating this `Component`.  It's only really applicable for `Playable` instances, but since `Component` property definitions can be chained, all `Component`s created with a particular `create()` call are given the `Player`.

#### `registry` — *Registry*
The `Registry` instance passed to `create()` when creating this `Component`.  When any sub-component needs to resolve a reference, it will look inside this `registry`.

### Instance Methods

#### `withPlayer(<player>)` — *`this`*
Sets `player` to `<player>` (by calling `setPlayer(<player>)`) and returns the object itself.

#### `setPlayer(<player>)`
Sets `player` to `<player>`.  Override if you want more interesting behavior, but remember that this gets called at object creation *before* the properties are set.

#### `withProperties(<properties>)` — *`this`*
Sets the properties to the values in `<properties>` (by calling `setProperties(<properties>, true)`) and returns the object itself.

#### `setProperties(<properties>, <useDefault>)`
Sets the properties to the values in `<properties>`.  If `<useDefault>` is `true`, a property name is not present in `<properties>`, and that property's descriptor has a `defaultValue`, then the property is set to that `defaultValue`.  The properties are set with `setProperty()`.  After the properties are set, `finishSetup()` is called in case there's anything left to do.  You can call `setProperties()` on a `Component` at any time, not just at instantiation, to change the properties of the `Component` while it's playing or doing whatever it does.

#### `finishSetup()`
Does nothing in `Component`, but you can override it if you need.  Gets called at the end of `setProperties()` to initialize the `Component` and perform any tasks that need multiple properties to be around at the same time, like calculations.

#### `getProperty(<propName>, <resolveReference>)` — *anything*
Returns the value of the property with the specified `<propName>`, which may be a number, a `Component`, or really anything else.  If the property descriptor specifies a `getter`, that function will be called to retrieve the value; otherwise, `genericGetter()` is called.  If the value is a reference (an object with a `ref` field) and `<resolveReference>` is not explicitly set to `false`, the object returned will be the `Component` referenced, but if `resolveReference` is `false`, the object returned will be the object with the `ref` field.

#### `resolveReference(<reference>)` — *anything*
If `<reference>` is a non-`null` object with a `ref` field, returns the component stored in the `registry` under the value of `ref`; otherwise simply returns `<reference>`.

#### `genericGetter(<propName>)` — *anything*
Returns the value of `this.<propName>`, which is the default way to store property values.  When implementing a custom getter, you may want to consider calling `genericGetter()` during the process.

#### `setProperty(<propName>, <propDefinition>)`
Instantiates `<propDefinition>` if necessary (meaning that `<propDefinition>.className` is present), then sets it as a value for the property named `<propName>` (if it exists).  If `<propDefinition>` is a number and the descriptor has `isAudioComponent` set to `true`, a `ConstantGenerator` is instantiated and becomes the value instead of the number.  If a `setter` is provided in the descriptor, that value gets passed to that setter; if not, the previous value is cleaned up (with `cleanupProperty()`) and `genericSetter()` is called.  If you are implementing a custom setter, you should make sure to handle cleaning up the previous value of the property if applicable.

#### `genericSetter(<propName>, <propValue>)`
Simply sets `this.<propName>` to `<propValue>`, which is the default way to store property values.  When implementing a custom setter, you may want to consider calling `genericSetter()` during the process.

#### `setName(<name>)`
Cleans up the existing `name`, sets the new `<name>`, and if that `<name>` isn't `null`, adds this `Component` to the `registry` under `<name>`.

#### `cleanup()`
Performs any cleanup tasks necessary, like dismantling `AudioNode`s that should no longer run and otherwise freeing resources.  If you override `cleanup()`, you should probably call `super.cleanup()` to make sure you don't miss something important.  In `Component`, `cleanup()` goes through every property and calls `cleanupProperty()` for the property.

#### `cleanupProperty(<propName>)`
If the property named by `<propName>` has a `cleaner` in its descriptor, this method calls that cleaner to clean up the property; if it does not, it calls `genericCleaner(<propName>)`.

#### `genericCleaner(<propName>)`
If the property named by `<propName>` is itself a `Component`, calls `cleanup()` on the property, then sets `this.<propName>` to `null`.  If you need more specialized behavior and override this method, you should probably still call it from your override.

#### `cleanupName()`
Removes this `Component` from the `registry` (if `name` isn't `null`) and sets `name` to `null`.




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

### Instance Methods

#### `on()`
If the `node` field is `null`, creates a node (using `createNode()`) and called `connectProperties()` to set up the node.

#### `off()`
Calls `disconnectProperties()` and `cleanupNode()` to tear everything down.

#### `createNode()`
Creates a custom `AudioWorkletNode` with this class's `processorName` as its processor name and sticks it in the `node` field.  It also opens up the node's `port` for messaging.  If you're using a native `AudioNode` instead of a custom `AudioWorkletNode`, or you have multiple different node objects in your class, you need to override `createNode()` to do the thing you need it to do.  This gets called during `on()`.

#### `cleanupNode()`
Sets the `node`'s `done` parameter to `1` (if `isNativeNode` is `false` for this class) then sets the `node` field to `null`.  Override this if you need to do something more complicated, but you'll probably still want to call `super.cleanupNode()` at the end if you're not using a native node.  Gets called during `off()`.

#### `receiveMessage(<messageEvent>)`
This function gets called whenever `node.port` receives a message from the processor (see the WebAudio API docs).  The message contents are in `<messageEvent>.data`.  If those contents contain a `triggerEvent`, `handleTriggeredEvent()` gets called on it.  You should override it to handle whatever messages you want to send back and forth, but you should probably make sure to call `super.receiveMessage()` to make sure that `timerEvent`s are handled.  A similar method is defined in `AudioComponentProcessor` to handle messages sent to the processor.  To send a message, call `node.port.postMessage()` (see the `MessagePort` API docs for details).  Note that messages are copied using structured clone, so functions can't be sent (or received, obviously).

#### `registerTimedEvent(<time>, <event>, <isAbsolute>)`
Posts a message via `node.port` containing a `timedEvent` key with a value that is an object with a `time` or `duration` key, depending on whether `<isAbsolute>` is `true` (the value is `<time>`) and an `event` key (value `<event>`).  Once the `timer`, if there is one, reaches a time past `<time>`, it will send back a message containing a `triggerEvent` key with value `<event>`.  You can listen for this by overriding `handleTriggeredEvent()`.  `<event>` can be anything, but it's sent via structured clone, so it can't contain functions.  One possibility is for it to simply be a string.

#### `handleTriggeredEvent(<event>)`
Does nothing in `AudioComponent`.  You should override this to provide custom behavior.

#### `connectTo(<destination>, <inputIndex>)`
#### `disconnectFrom(<destination>, <inputIndex>)`
Calls `connect()` or `disconnect()` on `getNodeToDestination()` to connect or disconnect its output at index `0` to or from the given `<destination>`; if `<inputIndex>` is a non-negative number, it will (dis)connect it to/from that input index.  The default input index is `0` for a `<destination>` that is an `AudioNode`, but if the `<destination>` is an `AudioParam`, including an input index at all (even `undefined`) will cause an error.

#### `getFirstNode()` — *`AudioNode`* — default value: `node`
#### `getNodeToFilter()` — *`AudioNode`* — default value: `node`
#### `getNodeFromFilter()` — *`AudioNode`* — default value: `null`
#### `getNodeToDestination()` — *`AudioNode`* — default value: `filter.getNodeToDestination()` if `filter` is not `null`, or `node` if it is
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
If a `connector` or `disconnector` is provided for this property, that method is called.  If not, if the property descriptor has `isAudioParam` set to `true`, `connectAudioParam()` or `disconnectAudioParam()` is called; if the property descriptor has a non-negative `inputIndex`, then `connectInputIndex()` or `disconnectInputIndex()` are called.  These two methods have no default behavior, so if you want to create special handlers for other property types, just override these methods and call `super.connectProperty(<propName>)` or `super.disconnectProperty<propName>)` before adding new cases.

#### `connectAudioParam(<propName>)`
#### `disconnectAudioParam(<propName>)`
Called by `connectProperty()` and `disconnectProperty()` to handle properties with `isAudioParam` set to `true`.  If the value of the property named by `<propName>` is an `AudioComponent`, `value.on()` (if it's not a reference) and `value.connectTo()` are called to connect it to the `AudioParam` object it needs to be connected to, and `value.disconnectFrom()` and `value.off()` (if it's not a reference) are called to disconnect.  If the value is not an `AudioComponent`, it's simply assigned into the `AudioParam`'s `value` field on connection; there is no need to disconnect it afterward.

#### `connectInputIndex(<propName>)`
#### `disconnectInputIndex(<propName>)`
Called by `connectProperty()` and `disconnectProperty()` to handle properties with `inputIndex` set to a non-negative number.  The value is assumed to be an `AudioComponent`, and `value.on()` (if it's not a reference) and `value.connectTo()` are called on connection and `value.disconnectFrom()` and `value.off()` (if it's not a reference) are called on disconnection.

#### `connectFilter()`
#### `disconnectFilter()`
The `filter`, if not `null`, is assumed to be an `AudioComponent`.  When connecting, it's turned `on()`, then `getNodeToFilter()` is connected to it, then it is connected to `getNodeFromFilter()` if that is not `null`.  If `filter` is `null`, `getNodeToFilter()` is connected directly to `getNodeFromFilter()` if that is not `null`.  When disconnecting, these connections are undone instead, and `filter` is turned `off()`.

#### `getProcessorOptions()` — *object*
Creates and returns the `options` object that the `AudioWorkletProcessor` is instantiated with.  The static fields `numberOfInputs`, `numberOfOutputs`, and `outputChannelCount` are added to this object if they're not `null`, as well as empty objects `parameterData` and `processorOptions`.  `parameterData` holds initial values for the `AudioParam`s of the node, which you should *not* set, and `processorOptions` holds extra options that are read only at the processor's instantiation.  See the WebAudio API docs for more details on this object.  After this basic object is set up, `addProcessorOption()` is called with each property descriptor.  If you want to set up some custom behavior in the `options` object, you should override this method, but you'll likely want to call `super.getProcessorOptions()` first to populate the object.

#### `addProcessorOption(<options>, <descriptor>)` — *object*
Adds the appropriate value to the `<options>` object and returns it, calling `addProcessorOptionOption()` if `isProcessorOption` is `true` in the `<descriptor>`.  If you have other kinds of options that need special treatment, you can override this method, call `super.addProcessorOption()` first, and handle your new kind of option.

#### `addProcessorOptionOption(<options>, <propName>)` — *object*
Adds the value of the `<propName>` property to the `<options>` object under `processorOptions`, with the key being the processor option name (`processorOptionName` if provided in the descriptor, or just `<propName>` if not).  This value can be anything, but since it gets passed via structured clone, it shouldn't contain functions.  The processor can read this value at construction time and handle it however is necessary.  Returns the `<options>` object.




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
See the WebAudio API docs.  This method is the method that actually does work in an `AudioWorkletProcessor`; you should never call it yourself.  Its return value is whether the node should be kept alive even if there are no references to the node, which is `true` until the `value` of the `done` `AudioParam` is set to `1`.  Well, actually, what this method does is to save the `<inputs>` and `<parameters>` to their respective instance fields, set the `bufferLength`, check if the `timer` has triggered anything, and return `_process(<outputs>)`, which returns this value.  `<inputs>` and `<outputs>` are audio buffers: arrays where the number of elements is the number of inputs and outputs, respectively, for the node.  Each element is itself an array corresponding to each input or output, and the elements of those arrays are the individual channels of the input or output.  Each channel is itself an array containing a number of numbers (usually 128) representing the sample at each audio frame for that channel.  This method is intended to fill the `<outputs>` array with numbers that get sent to the destination (and if that destination is the speakers, they should be between `-1` and `1` or there will be distortion).  The `<outputs>` array is supposed to come pre-initialized with `0`'s everywhere, representing silence.  The `<parameters>` input is an object whose keys are the parameter names and whose values are arrays containing either 1 number or enough numbers to fill each frame (usually 128); you can read those with `getParameter()`.  You're generally supposed to override `process()` in `AudioWorkletProcessor` subclasses, but I'm using that override in `AudioComponentProcessor` to pass in the `<inputs>` and `<parameters>` to the instance fields, so don't override this one and override `_process()` instead.

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




## Playable < AudioComponent < Component

The `Playable` subclass of `AudioComponent` provides some basic mechanics for playing and stopping a sound.  A sound does not play itself; rather, a `Player` instance plays it.  The `Playable` class provides `play()` and `stop()` methods to the `Playable` itself that simply call their `player` so that instead of something like `player.play(playable)` you can call `playable.play()`.  You should never instantiate a `Playable`, though, since `Playable` is intended to be an abstract class that doesn't actually *do* anything.  The `Playable` interface also provides a `duration` property that you can use to have your `Playable` call `release()` after a certain amount of time has elapsed.

### Properties

#### `timer` — `Timer` — `defaultValue`: `{ref: 'Default Timer'}` — `isAudioParam`: `true`
Overwrites the `timer` property in `AudioComponent` in order to provide a default value.  This default value is a reference to the `'Default Timer'`, which runs at 60000 BPM, so `duration` can be specified in ms by default.

#### `duration` — *number* — `defaultValue`: `null`
Specifies the duration of the `Playable`, in beats of the `timer` (ms by default).  If it's `null`, the `Playable` will only release when you call `release()`, but if it's a number, `release()` will get called after the value of `duration` has elapsed.

### Instance Methods

#### `play()`
#### `stop()`
Calls `player.play()` or `player.stop()` on this object.

#### `release()`
Calls `stop()`.  Override this if you want custom behavior before actually stopping the sound, like a reverb effect or something, as `stop()` will stop the sound immediately.

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

#### `release()`
If `envelope` is an `Envelope`, calls `startRelease(this)` on it; if not, calls `stop()`.  If `startRelease(this)` is called on the `envelope`, it should eventually call `stop()` on this `Tone`, which is why we pass `this` as an argument.




## Sequence < Playable < AudioComponent < Component

Activates a sequence of events on an audio-rate timer.  You can use this to play a whole song, for example.  Timer precision is necessarily within 128 samples, though, since that's the buffer size of the `AudioWorkletProcessor`.

### Properties

#### `events` — *array of `Event`s* — `defaultValue`: `[]` — `getter`: `'getEvents'` — `setter`: `'setEvents'`
The `Event`s.  The events in the array are registered in order, and since events can be timed based on the previous registered event (by populating the `after` field rather than the `time` field in the event), it's probably a good idea to put the events in the order in which you want them to be executed.

#### `componentCreationLeadTime` — *number* — `defaultValue`: `null`
If this value is not `null`, a special creation event will be added before every event that has an `action` to create the `action` as a `Component`.  This allows the `action` to start promptly, since `Component` creation can be costly.

### Class Fields

#### `processorName` — *string* — `'AudioComponentProcessor'`
Only the base features of the `AudioComponentProcessor` are required here, specifically, its `timer` and timed event handling capabilities.  No audio is actually produced.

### Instance Fields

#### `events` — *object where the keys are numbers and the values are the `Event`s* — default value: `null`
The `events` property contains an array, but when they get stored in the `Sequence`, they get added to the `events` object with a numeric key, making `events` similar to an array.  The message that triggers an event (or creates an event's `action`) refers to the event by its key in this array.

#### `lastEventTime` — *number* — default value: `0`
The time of the most recent `Event` recorded.

#### `eventCounter` — *number* — default value: `0`
The key for the current event added to the `events` object.

#### `playing` — *array of `Playable`s* — default value: `[]`
When a `PlayAction` is performed, the action's `playable` is added to this array, so that if `stop()` or `releaseAll()` is called on the `Sequence` itself, it knows what dependent `Playable` objects it also needs to `stop()`.

### Instance Methods

#### `setEvents(<events>)`
Empties the `events` object and called `addEvent()` on each `Event` in the `<events>` array, in order.

#### `addEvent(<event>, <recordTime>)`
Adds the given `<event>` to the `events` object under the `eventCounter` key, and, if `<recordTime>` is `true`, also sets `lastEventTime`.  If the `<event>` doesn't have a `time`, it's computed based on the `lastEventTime` and `<event>.after`; if the `node` is not `null`, `registerTimedEvent()` is called to set the processor up to trigger the `<event>` when its `time` comes.  If `componentCreationLeadTime` is `true` and `<event>.action` is an object and not already a created component, a new creation event is also created and `addEvent()` is called on it, with a `<recordTime>` of `false` since we don't want this automatically generated creation event to interfere with the timing of the other events.

#### `registerPlayable(<playable>)`
Adds `<playable>` to the `playing` array so that if `stop()` or `releaseAll()` is called on the `Sequence`, it knows what's playing.

#### `handleTriggeredEvent(<eventId>)`
Calls the super's method, then executes the `Event` stored in `events.<eventId>`.  See the documentation for `Event` for details on how `Event`s get executed, but that functionality happens in this method.

#### `createNode()`
Calls the super's method, then registers all `Event`s in the `events` object with the processor.

#### `release()`
No-op.

#### `releaseAll()`
Calls `release()` on all `Playable`s stored in `playing`.

#### `stop()`
Calls the super's method, then calls `stop()` on all `Playable`s stored in `playing`.




## Event *(interface)*

`Event` is not a real class; it's just the interface `Sequence` expects for its `events`.  You should attempt to instantiate it like a `Component`, and `o.Event` is not defined.  In general, an `Event` contains some timing information and some sort of action to be performed at the specified time, but that action can be `Component` creation, arbitrary code execution, or an `Action` object of some sort.

### Instance Fields

#### `time` — *number*
#### `after` — *number*
The time at which to trigger the `Event`.  Exactly one of these should be provided.  If `time` is provided, the `Event` will trigger at time `time`; if `after` is provided, the `Event` will trigger at a time `after` after the previous `Event` in the `Sequence`.

#### `action` — *a function, an `Action`, or a definition of an `Action`*
#### `create` — *eventId*
The action to be performed.  Exactly one of `action` and `create` should be provided.  If `action` is a function, the function will be called at the specified time.  If `action` is an instance of `Action`, its `perform()` method will be called at the specified time.  If `action` is an object, it will be assumed to be the definition for an `Action`, so it will be created using `o.createComponent()` (with the `Sequence`'s `player` and `registry`) and then `perform()` will be called on it.  If `create` is provided instead, if the `Event` at the given `eventId` in the `Sequence`'s `events` object contains an `action` that is not an `Action`, `o.createComponent()` will be called on it but `perform()` will not be called (since it will presumably be called later).




## Action < Component

An abstract `action` for an `Event`.  Doesn't do anything on its own.

### Instance Fields

#### `isAction` — *boolean* — `true`

### Instance Methods

#### `perform(<sequence>)`
Does nothing in this class; override it in subclasses.  `<sequence>` should be the `Sequence` that is executing the `Event` hosting this `Action`.




## PlayAction < Action < Component

An `Action` that plays a given `Playable` and stores it in the parent `Sequence`'s `playing` array to make sure it can be `release()`d or `stop()`d as necessary.  

### Properties

#### `playable` — *`Playable`* — `defaultValue`: `null`
The `Playable` that will be `play()`d.

### Instance Methods

#### `perform(<sequence>)`
Calls `play()` on `playable` then calls `<sequence>.registerPlayable()` with the `playable`.




## MethodAction < Action < Component

An `Action` that calls a named `method` on the `target` object, passing in `arguments`.  In a pure JSON context, this allows for code execution without needing to use actual code.

### Properties

#### `target` — *object* — `defaultValue`: `null`
#### `method` — *string* — `defaultValue`: `null`
Assuming both `target` and `method` are populated and valid, `method` will be called on `target` with the arguments specified in `arguments`.

#### `arguments` — *value or array* — `defaultValue`: `null`
The arguments to pass into `method`.  If it's `null`, no arguments will be passed.  If it's a value that is not an array, that value will be passed as the only argument.  If it's an array, the elements of the array will be the arguments.  If you want to pass in a single argument that is an array (or you want to pass in `null` as an argument), you should put it in an array.  So, for example, if you want to have `[foo]` as an argument, `arguments` should be `[[foo]]`; if you want `null` as an argument, `arguments` should be `[null]`.

### Instance Methods

#### `perform(<sequence>)`
If things are valid, calls `method` on `target`, with the provided `arguments` if there are any.




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




## LinearGenerator < Generator < AudioComponent < Component

Generates a linear change in value.  This can be useful when varying a parameter.

### Properties

#### `timer` — *`Timer`* — `defaultValue`: `{ref: 'Default Timer'}` — `isAudioParam`: `true`
Overrides `AudioComponent`'s `timer` property to set a default.

#### `startTime` — *number* — `defaultValue`: `0` — `isProcessorOption`: `true`
#### `startValue` — *number* — `defaultValue`: `0` — `isProcessorOption`: `true`
#### `endTime` — *number* — `defaultValue`: `1000` — `isProcessorOption`: `true`
#### `endValue` — *number* — `defaultValue`: `1` — `isProcessorOption`: `true`
The `LinearGenerator` starts with `startValue`.  At time `startTime` according to the `timer` (see `isAbsolute`), it starts ramping the value linearly to reach `endValue` at `endTime`, which it will keep outputting.

#### `isAbsolute` — *boolean* — `defaultValue`: `false` — `isProcessorOption`: `true`
Whether `startTime` and `endTime` are absolute or relative to when the `LinearGenerator` was first turned `on()`.  If `isAbsolute` is `true`, a `startTime` of 500 will mean that the ramp-up will start when the `timer` says 500; if `isAbsolute` is `false`, a `startTime` of 500 will mean that the ramp-up will start 500 `timer` counts after the processor starts.

### Class Fields

#### ``processorName` — *string* — `LinearGeneratorProcessor`




## LinearGeneratorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Generates a linear change in value.  This can be useful when varying a parameter.

### Processor Options

#### `isAbsolute` — *boolean*
Whether `startTime` and `endTime` are absolute numbers on `timer` or are relative to when the processor starts.

#### `startTime` — *number*
#### `startValue` — *number*
#### `endTime` — *number*
#### `endValue` — *number*
The `LinearGeneratorProcessor` starts with `startValue`.  At time `startTime` according to the `timer` (see `isAbsolute`), it starts ramping the value linearly to reach `endValue` at `endTime`, which it will keep outputting.

### Instance Fields

#### `timesSet` — *boolean* — default value: `isAbsolute`
When the processor is constructed, we don't actually have any data from its `AudioParam`s, so we don't know what time the `timer` says.  If `isAbsolute` is `false`, we still need to calculate `startTime` and `endTime`, so we set this flag to `false` and fix the issue when we do have the data available.

### Instance Methods

#### `generate()` — *number*
If `timesSet` is `false`, adds the current `timer` time to `startTime` and `endTime` and sets `timesSet` to `true`.  If the current time according to the `timer` is before `startTime`, returns `startValue`; if after `endTime`, returns `endValue`; otherwise, returns a linear interpolation between them.




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




## RedNoiseGeneratorProcessor > GeneratorProcessor > AudioComponentProcessor > AudioWorkletProcessor

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




## Envelope < Generator < AudioComponent < Component

An `Envelope` is actually just a gain that is varied over the lifetime of a `Tone`.  One typical envelope is the `ADSREnvelope`, which starts by ramping the gain up from 0 to some maximum over some period of time, then down to 1 (over some time) for the rest of the duration of the tone, and, when the tone is released, it ramps the gain back down to 0 over some time.  This ramping of the gain from and to 0 removes the very high-frequency components inherent in an instantaneous jump from 0 to 1, which cause an audible pop.  `Envelope`s also provide articulation at the front of the note and can provide vibrato or other effects as well.  This `Envelope` class is intended to be abstract; its processor doesn't actually do anything useful (it just outputs `1`).

### Class Fields

#### `processorName` — *string* — `'EnvelopeProcessor'`

### Instance Fields

#### `isEnvelope` — *boolean* — `true`
Allows a check for whether an `AudioComponent` is an `Envelope`, meaning that it implements `startRelease()` and calls `playable.stop()` on its own.

#### `playable` — *`Playable`* — default value: `null`
The `Playable` object that the `Envelope` needs to call `stop()` on after `startRelease()` is called.  Gets set on `startRelease()`.

#### `phase` — *string* — default value: `'main'`
Unlike an `OscillatorProcessor`'s `phase`, this `phase` is the phase of the lifetime of the `Envelope`.  By default, an `Envelope` starts in the `'main'` phase; after `startRelease()` is called, it switches to the `'release'` phase, and when that's done, to the `'stop'` phase.  More phases (or different phases) could be added by subclasses, but keep in mind that a `port` message must be sent to change the phase in the processor, so this phase system has some inherent latency as the processor processes a whole buffer of frames at a time.

#### `phaseHandlers` — *object where the keys are phases and the values are functions*
Registry of functions to handle phase changes.  When the phase changes, if there's a handler for it, that handler gets called.  Subclasses should add their own functions to this object if appropriate.

### Instance Methods

#### `createNode()`
Also sets the `phase` on the processor.

#### `changePhase(<phase>)`
Sets the `phase`, posts a message through `node.port` that is an object that looks like `{phase: <phase>}`, and calls `phaseHandlers.<phase>` if it exists.

#### `receiveMessage(<messageEvent>)`
First calls `super.receiveMessage(<messageEvent>)`.  If the message has a `phase`, sets the `phase` and calls the appropriate handler if it exists.

#### `startRelease(<playable>)`
Sets the `playable` field and changes the phase to `'release'`.

#### `stop()`
Calls `stop()` on `playable` if it isn't `null`.

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




## FirstOrderFilter < Filter < AudioComponent < Component

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




## FirstOrderFilterProcessor < FilterProcessor < AudioComponentProcessor < AudioWorkletProcessor

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
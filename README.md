layer# offtonic-audioplayer
JavaScript and WebAudio-based tone generator and audio player for web apps

# Overview

Offtonic Audioplayer is a simple-to-use audio player in JS that can be used simply in any (modern-enough) browser-based project with no need for other dependencies.  Simply import offtonic-audioplayer.js:

    import o from './offtonic-audioplayer.js';

Then, create your tones and play them!

	let tone = o.createComponent({
		className: 'Tone',
		frequency: 432, // TROLOLOL
		gain: 0.1
	});
	tone.play();
	// ...
	tone.stop();

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

#### `getter` and `setter` — *string* (optional)
The values are method names that get called when `getProperty()` and `setProperty()` are called.  `Component` provides `genericGetter()` and `genericSetter()` that do the basics, but if you need more functionality, or if your property works differently from the default way of handling them, you can provide a getter and/or setter.

#### `connector` and `disconnector` — *string* (optional)
The values are method names that get called when `connectProperty` and `disconnectProperty()` are called.  `AudioComponent` assumes that properties that need it (those that have `isAudioParam` set to `true`, for example, or `inputIndex` set to a non-negative number) possess a `connectTo()` method that connects the property's `node` field to the primary component's `node` field, as well as a `disconnectFrom()` method to undo this.  These `node` fields are `AudioNode` instances, whether native nodes or `AudioWorkletNode`s, and they work as prescribed in the Web Audio API docs.  If you need any special behavior, perhaps because you're connecting to a node other than the component's `node` field, you should provide `connector` and/or `disconnector` methods for the property.

#### `isAudioParam` — *boolean* (optional) — default `false`
#### `paramName` — *string* (optional) — default value is the value of the `name` property
Indicates that a property represents an `AudioParam`, a parameter of an `AudioNode` named `paramName` (see the Web Audio API docs).  This means that the value must either be a number or an `AudioComponent` with a `connectTo()` method that connects some `AudioNode` (which provides numbers at the audio rate) to the `AudioParam`.  In addition, if the `node` is an `AudioWorkletNode` and the value of this property is a number, that number will be added to the `options.parameterData` object when creating the node as its initial value.

#### `isProcessorOption` — *boolean* (optional) — default `false`
Indicates that a property value should be passed to the constructor of the `AudioComponent`'s `AudioWorkletNode` node; it will be added to `options.processorOptions`.  The value can typically be anything, but objects get copied using the structured clone algorithm, which does not allow functions, so it's actually fairly limited.

#### `inputIndex` — *number* (optional)
Indicates which input on the audio component's `node` field this property should connect to.  The property must be an audio component, since `AudioNode` inputs must be other `AudioNode`s.  If `inputIndex` is not provided, it's assumed that the property is not connecting to an input on the `node` field.

#### `isAudioComponent` — *boolean* (optional) — default `false`
Indicates that the property must be an `AudioComponent` instance rather than, say, a number.  If the value for the property is a number, it will be turned into a `ConstantGenerator` audio component that outputs the number.




# Class Reference

## Global

The `Global` singleton class (found in `offtonic-audioplayer.js`, imported in the example as `o`) is the primary entry point for interacting with Offtonic Audioplayer.  All of the public classes are available from `Global`, as well as some other player-scope stuff.  For example, the `Tone` class is available at `o.Tone`.  If you implement your own `Component` subclasses, you should add them to the `Global` singleton using `registerClass()`, and if you write any new `AudioWorkletProcessor`s, you should add them using `addModule()`.

### Instance Fields

#### `ctx` — *`AudioContext`*
The `AudioContext` for the `AudioNode`s used by Offtonic Audioplayer.

#### `classRegistry` — *`ClassRegistry`*
An object mapping `className` property values to class constructors.  You should not have to access this directly.

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
Adds to the `AudioContext`'s `AudioWorklet` an `AudioWorkletProcessor` subclass located at `<modulePath>`, a (string) URL path relative to the Offtonic Audioplayer's base directory.  If you create any `AudioWorkletProcessor` subclasses, you should add them here.  Adding the module to the audio context's `AudioWorklet` is a required step in the Web Audio API, but the paths can be confusing since relative URLs are actually compared to the HTML file the script is loaded from rather than the location of the module you're currently in.  This function simplifies this complication by considering all URLs to be relative to the base directory and turning them into absolute URLs with the `baseHref` field.

#### `createComponent(<properties>, <player>)` — *`Component` subclass*
Creates a `Component` instance based on `<properties>`, which is an object whose keys are property names and whose values are the property values, including the key `className`, whose value should be a class that has been previously registered with `registerClass()` (built-in classes are already registered).  `<player>` is the `Player` instance that should be attached to the component; if it is not provided (`null` or `undefined`), the default player (the global object's `player` field) will be used by default.  If any properties themselves define a new component (by containing `className`), `createComponent()` will be recursively called on them, with the same `<player>` argument.




## ClassRegistry

The `ClassRegistry` singleton simply contains an object whose keys are class names and whose values are constructors.  You shouldn't have to interact with this class directly.

### Instance Fields

#### `classes` — *object*
An object whose keys are class name strings and whose values are their corresponding class instance (constructor function).

### Instance Methods

#### `register(<className>, <classInstance>, <overwrite>)`
Adds the `<className>` key with the `<classInstance>` value to the `classes` field.  If it already exists, an error is shown in the console unless `<overwrite>` is `true`, in which case the old value is overwritten by the new one.

#### `get(<className>)` — *`Component` subclass constructor*
Retrieves the value registered under `<className>`.




## Player

A `Player` instance represents a destination for the `AudioNode`s of the `AudioComponent`s (generally `Playable`s, but you can play pretty any object that implements a few methods).  The player's `node` field is a `GainNode` to which playable nodes are connected, and that `GainNode` is connected to the `AudioContext`'s `destination` (generally the speakers) by default, but you can connect it to something else if you'd like.  In previous iterations of Offtonic Audioplayer, the `Player` was the `ScriptProcessorNode` responsible for playing all of the sound generated by the `AudioComponent`s, but in this current `AudioWorklet` implementation, that is not possible, so the `Player`'s job is less involved.  The `Player` does provide an opportunity to adjust master volume, master filters, etc., and since it's easy to simply create multiple `Player` instances and connect them to different destinations, including other `Player`s, you can even create multiple configurations and have different sounds play through each of them simultaneously.

Create a `Player` with `new o.Player()` if you want to use a `Player` other than the default.  You cannot use `o.createComponent()` because `Player` is not a `Component`.

### Class Fields

#### `o` — *`Global`* — default value
Easily available `Global` singleton instance.

### Instance Fields

#### `ctx` — *`AudioContext`*
Default `AudioContext` from `o`, for convenience.

#### `destination` — *`AudioNode`* — default `ctx.destination`
Destination `AudioNode` to which all `Player` sound is sent.  Can be changed with `setDestination()`.

#### `destinationIndex` — *number* — default `0`
Index of the input in the `destination` `AudioNode` to which the `Player` sends its sound.  Can be changed with `setDestination()`.

#### `gain` — *number* — default `1`
Master gain for the `Player`.  Change it with `setGain()`.

#### `node` — *`GainNode`*
The sound-outputting `AudioNode` of the `Player`, to which `AudioComponent`s are connected to play sound, created at `Player` instance construction.

#### `inputIndex` — *number* — default `0`
Index of the input on `node` to which `AudioComponent`s should connect.  You probably shouldn't try to change this unless you override `setupNode()` to make `node` something other than a `GainNode` that has multiple inputs.

#### `playing` — *array of `AudioComponent`s*
Set of playable components that are playing right now.  When the `Player` plays a note, it goes into this array; when the `Player` stops a note, it's removed.  When `stopAll()` is called, all notes in the array are stopped and removed.

### Instance Methods

#### `setupNode()`
Called at construction.  Creates the `node`, sets the gain, and connects it to `destination`.

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
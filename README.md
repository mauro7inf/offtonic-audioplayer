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
Adds to the `AudioContext`'s `AudioWorklet` an `AudioWorkletProcessor` subclass located at `<modulePath>`, a (string) URL path relative to the Offtonic Audioplayer's base directory.  If you create any `AudioWorkletProcessor` subclasses, you should add them here.  Adding the module to the audio context's `AudioWorklet` is a required step in the WebAudio API, but the paths can be confusing since relative URLs are actually compared to the HTML file the script is loaded from rather than the location of the module you're currently in.  This function simplifies this complication by considering all URLs to be relative to the base directory and turning them into absolute URLs with the `baseHref` field.

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

#### `o` — *`Global`*
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




## Component

A `Component` is a piece of the sound-producing apparatus of Offtonic Audioplayer that can be instantiated by means of a properties object.  `Component` should probably never be directly instantiated, since a `Component` doesn't actually *do* anything on its own; the `Component` superclass simply provides the necessary methods to parse the properties for its subclasses to inherit.

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

#### `create(<properties>, <player>)` — `Component` subclass instance
`o.createComponent()` just calls this method, so you should probably call that instead since it's easier.  Creates a new object with `<properties>` as its properties and `<player>` as its player by calling the constructor specified in `<properties>.className` if present (if not, calls the current class's constructor), then `.withPlayer(<player>).withProperties(<properties>)` on the constructed object.

### Constructor

You should probably not call the constructor for `Component` or its subclasses yourself.  The constructor takes no arguments, sets all new properties to `null`, and does whatever basic setup is necessary.  Subclasses need to declare a constructor, but that constructor should probably take no arguments (and must call `super()` because that's how JS works).

### Instance Fields

#### `ctx` — *`AudioContext`*
Default `AudioContext` from `o`, for convenience.

#### `isComponent` — *boolean* — `true`
So you can easily check if a given object is a `Component` and therefore responds to `Component`'s methods.

#### `player` — *Player*
The `Player` instance passed to `create()` when creating this `Component`.  It's only really applicable for `Playable` instances, but since `Component` property definitions can be chained, all `Component`s created with a particular `create()` call are given the `Player`.

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

#### `getProperty(<propName>)` — *anything*
Returns the value of the property with the specified `<propName>`, which may be a number, a `Component`, or really anything else.  If the property descriptor specifies a `getter`, that function will be called to retrieve the value; otherwise, `genericGetter()` is called.

#### `genericGetter(<propName>)` — *anything*
Returns the value of `this.<propName>`, which is the default way to store property values.  When implementing a custom getter, you may want to consider calling `genericGetter()` during the process.

#### `setProperty(<propName>, <propDefinition>)`
Instantiates `<propDefinition>` if necessary (meaning that `<propDefinition>.className` is present), then sets it as a value for the property named `<propName>` (if it exists).  If `<propDefinition>` is a number and the descriptor has `isAudioComponent` set to `true`, a `ConstantGenerator` is instantiated and becomes the value instead of the number.  If a `setter` is provided in the descriptor, that value gets passed to that setter; if not, the previous value is cleaned up (with `cleanupProperty()`) and `genericSetter()` is called.  If you are implementing a custom setter, you should make sure to handle cleaning up the previous value of the property if applicable.

#### `genericSetter(<propName>, <propValue>)`
Simply sets `this.<propName>` to `<propValue>`, which is the default way to store property values.  When implementing a custom setter, you may want to consider calling `genericSetter()` during the process.

#### `cleanup()`
Performs any cleanup tasks necessary, like dismantling `AudioNode`s that should no longer run and otherwise freeing resources.  If you override `cleanup()`, you should probably call `super.cleanup()` to make sure you don't miss something important.  In `Component`, `cleanup()` goes through every property and calls `cleanupProperty()` for the property.

#### `cleanupProperty(<propName>)`
If the property named by `<propName>` has a `cleaner` in its descriptor, this method calls that cleaner to clean up the property; if it does not, it calls `genericCleaner(<propName>)`.

#### `genericCleaner(<propName>)`
If the property named by `<propName>` is itself a `Component`, calls `cleanup()` on the property, then sets `this.<propName>` to `null`.  If you need more specialized behavior and override this method, you should probably still call it from your override.




## AudioComponent < Component

An `AudioComponent` is a `Component` that produces a-rate data through an `AudioNode`.  It doesn't have to produce data intended to produce a *sound*, and in fact, most `AudioComponent`s don't.  An `Envelope`, for example, is an `AudioComponent` that produces gains in time which are multiplied by a signal to create a tone that has articulation, and a `ConstantGenerator` is an `AudioComponent` that produces a specified constant number every audio frame.  `AudioComponent`s can connect to `AudioNode`s or `AudioParam`s depending on the specific use case.

You never instantiate an `AudioComponent` itself, since an `AudioComponent` doesn't actually *do* anything.  Rather, you use its subclasses.  `AudioComponent` contains default methods for dealing with `AudioWorkletNode`s, instantiating them, passing them properties, and so on, and many can be overridden for custom behavior in subclasses.

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
Simply sets the `node` field to `null`.  Override if you need to do something more complicated.  Gets called during `off()`.

#### `receiveMessage(<messageEvent>)`
This function gets called whenever `node.port` receives a message from the processor (see the WebAudio API docs).  The message contents are in `<messageEvent>.data`.  It doesn't do anything in `AudioComponent`, but you should override it to handle whatever messages you want to send back and forth.  A similar method is defined in `AudioComponentProcessor` to handle messages sent to the processor.  To send a message, call `node.port.postMessage()` (see the `MessagePort` API docs for details).  Note that messages are copied using structured clone, so functions can't be sent (or received, obviously).

#### `connectTo(<destination>, <inputIndex>)`
#### `disconnectFrom(<destination>, <inputIndex>)`
Calls `connect()` or `disconnect()` on `node` to connect or disconnect its output at index `0` to or from the given `<destination>`; if `<inputIndex>` is a non-negative number, it will (dis)connect it to/from that input index.  The default input index is `0` for a `<destination>` that is an `AudioNode`, but if the `<destination>` is an `AudioParam`, including an input index at all (even `undefined`) will cause an error.  If you need to (dis)connect a different output or have some other behavior, override these methods.

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
Called by `connectProperty()` and `disconnectProperty()` to handle properties with `isAudioParam` set to `true`.  If the value of the property named by `<propName>` is an `AudioComponent`, `value.on()` and `value.connectTo()` are called to connect it to the `AudioParam` object it needs to be connected to, and `value.disconnectFrom()` and `value.off()` are called to disconnect.  If the value is not an `AudioComponent`, it's simply assigned into the `AudioParam`'s `value` field on connection; there is no need to disconnect it afterward.

#### `connectInputIndex(<propName>)`
#### `disconnectInputIndex(<propName>)`
Called by `connectProperty()` and `disconnectProperty()` to handle properties with `inputIndex` set to a non-negative number.  The value is assumed to be an `AudioComponent`, and `value.on()` and `value.connectTo()` are called on connection and `value.disconnectFrom()` and `value.off()` are called on disconnection.

#### `getProcessorOptions()` — *object*
Creates and returns the `options` object that the `AudioWorkletProcessor` is instantiated with.  The static fields `numberOfInputs`, `numberOfOutputs`, and `outputChannelCount` are added to this object if they're not `null`, as well as empty objects `parameterData` and `processorOptions`.  `parameterData` holds initial values for the `AudioParam`s of the node, and `processorOptions` holds extra options that are read only at the processor's instantiation.  See the WebAudio API docs for more details on this object.  After this basic object is set up, `addProcessorOption()` is called with each property descriptor.  If you want to set up some custom behavior in the `options` object, you should override this method, but you'll likely want to call `super.getProcessorOptions()` first to populate the object.

#### `addProcessorOption(<options>, <descriptor>)` — *object*
Adds the appropriate value to the `<options>` object and returns it, calling `addAudioParamOption()` if `isAudioParam` is `true` in the `<descriptor>`, and calling `addProcessorOptionOption()` if `isProcessorOption` is `true` in the `<descriptor>`.  These are not (necessarily) mutually exclusive, so if you have other kinds of options that need special treatment, you can override this method, call `super.addProcessorOption()` first, and handle your new kind of option.

#### `addAudioParamOption(<options>, <propName>)` — *object*
If the value of the property named by `<propName>` is a number, adds it to the `<options>` object under `parameterData`, with the key being the param name (`paramName` if provided in the descriptor, or just `<propName>` if not).  This sets the initial value of the `AudioParam` to the number given.  If the property value is an `AudioComponent`, it is not provided at the processor's instantiation, since its node will eventually get connected to the `AudioParam`.  Returns the `<options>` object.

#### `addProcessorOptionOption(<options>, <propName>)` — *object*
Adds the value of the `<propName>` property to the `<options>` object under `processorOptions`, with the key being the processor option name (`processorOptionName` if provided in the descriptor, or just `<propName>` if not).  This value can be anything, but since it gets passed via structured clone, it shouldn't contain functions.  The processor can read this value at construction time and handle it however is necessary.  Returns the `<options>` object.




## AudioComponentProcessor < AudioWorkletProcessor

This is the base class for the custom processors that drive `AudioWorkletNode`s in Offtonic Audioplayer.  It provides some common interfaces to reduce boilerplate and process parameters, which function sort of like properties except that their descriptors are actually part of the WebAudio API, and they represent `AudioParam`s that are constructed in native code that you don't yourself get to touch.  The `outputs` array comes filled with `0`'s that you can replace with something else if you want to actually output any data, but `AudioComponentProcessor` doesn't populate that array with anything, so you should consider this an abstract class and subclass it to do what you want instead.

Note that if you want to directly use a processor, any processor, you need to call `registerProcessor(<processorName>, <processorClass>)`, generally right after the class definition.  Also, these processors need to be in their own file since they live in a different global scope.  That global scope has `sampleRate` as an available constant, so the sample rate is always available (in frames per second, usually 44100).  Since the processors are registered with the global audio context's `AudioWorklet`, there's no need to add these processors to the `classRegistry`, especially since they aren't `Component`s.

### Class Fields

#### `newParameterDescriptors` — *array of `ParameterDescriptor`-like objects* — `[]`
See the WebAudio API docs for the fields in a `ParameterDescriptor` object.  These descriptors are used to create the `AudioParam`s used by the `AudioWorkletProcessor`.  When the `parameterDescriptors` class field is read, the objects in this array get added to the superclass's `parameterDescriptors` to create this class's `parameterDescriptors`.

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

### Instance Methods

#### `process(<inputs>, <outputs>, <parameters>)` — *boolean*
See the WebAudio API docs.  This method is the method that actually does work in an `AudioWorkletProcessor`; you should never call it yourself.  Its return value is whether the node should be dismantled if there are no connections to the node; in this class it returns `true`.  Well, actually, what this method does is to save the `<inputs>` and `<parameters>` to their respective instance fields and return `_process(<outputs>)`, which returns `true`.  `<inputs>` and `<outputs>` are audio buffers: arrays where the number of elements is the number of inputs and outputs, respectively, for the node.  Each element is itself an array corresponding to each input or output, and the elements of those arrays are the individual channels of the input or output.  Each channel is itself an array containing a number of numbers (usually 128) representing the sample at each audio frame for that channel.  This method is intended to fill the `<outputs>` array with numbers that get sent to the destination (and if that destination is the speakers, they should be between `-1` and `1` or there will be distortion).  The `<outputs>` array is supposed to come pre-initialized with `0`'s everywhere, representing silence.  The `<parameters>` input is an object whose keys are the parameter names and whose values are arrays containing either 1 number or enough numbers to fill each frame (usually 128); you can read those with `getParameter()`.  You're generally supposed to override `process()` in `AudioWorkletProcessor` subclasses, but I'm using that override in `AudioComponentProcessor` to pass in the `<inputs>` and `<parameters>` to the instance fields, so don't override this one and override `_process()` instead.

#### `_process<outputs>` — *boolean* — `true`
Returns `true` and does nothing else.  You should override this if you want to, say, actually populate the `<outputs>` array (whose structure is described above in `process()`).

#### `getParameter(<paramName>, <frame>)` — *number*
Assumes that the `parameters` field has been filled with the parameters for the current audio buffer.  It looks for the value stored under the key `<paramName>`, which should be an array containing either one number or one number for each audio frame (usually 128); if it's the former, return that number; if the latter, returns the number at frame `<frame>`.

#### `receiveMessage(<messageEvent>)`
Does nothing in this class.  Override if you want to respond to messages sent over the `port`; data is included in `<messageEvent>.data`.  To send a message yourself, call `this.port.postMessage()` with your message, but remember that object get copied via structured clone so functions can't be sent over.




## Playable < AudioComponent < Component

The `Playable` subclass of `AudioComponent` provides some basic mechanics for playing and stopping a sound.  A sound does not play itself; rather, a `Player` instance plays it.  The `Playable` class provides `play()` and `stop()` methods to the `Playable` itself that simply call their `player` so that instead of something like `player.play(playable)` you can call `playable.play()`.  You should never instantiate a `Playable`, though, since `Playable` is intended to be an abstract class that doesn't actually *do* anything.

### Instance Methods

#### `play()`
#### `stop()`
Calls `player.play()` or `player.stop()` on this object.

#### `release()`
Calls `stop()`.  Override this if you want custom behavior before actually stopping the sound, like a reverb effect or something, as `stop()` will stop the sound immediately.




## Tone < Playable < AudioComponent < Component

Produces an audible tone when played, hence the name.  You can customize it in a variety of ways, and this is the primary way in which you will likely be creating sound when using Offtonic Audioplayer.  A `Tone` has a `generator` that produces a signal (optionally at a `frequency`), moderated by an `envelope` that shapes the volume of the sound over its lifetime, and finally, multiplied by a `gain` that specifies an overall volume.  The primary `node` is a custom `AudioWorkletNode` with processor name `ToneProcessor`, whose inputs are the `generator` and the `envelope`, and that is connected to a `GainNode` that applies the `gain`; that `GainNode` is what's connected to the destination.

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

### Instance Methods

#### `finishSetup()`
Also propagates the `frequency`, if it isn't `null` to the `generator`.

#### `createNode()`
Also sets up the `gainNode` and connects the `node` to it.

#### `cleanupNode()`
Also disconnects the `gainNode` and tears it down.

#### `connectGain()`
#### `disconnectGain()`
Connects/disconnects the `gain` property to/from the `gainNode`'s `gain` `AudioParam`.  If `gain` is just a number, simply assigns that number to the `value` of the `AudioParam`.

#### `connectTo(<destination>, <inputIndex>)`
#### `disconnectFrom(<destination>, <inputIndex>)`
Connects/disconnects the `gainNode` to the specified `<destination>` and `<inputIndex>`.

#### `getFrequency()` — *number or `AudioComponent`*
Gets the `frequency` property of the `generator` property.  If that is `null` or `undefined`, returns the value of the `frequency` field of the `Tone` itself.

#### `setFrequency(<frequency>)`
Sets the `frequency` field to `<frequency>` and, if `generator` is present, calls `generator.setPropery('frequency', <frequency>)`.

#### `release()`
If `envelope` is an `Envelope`, calls `startRelease(this)` on it; if not, calls `stop()`.  If `startRelease(this)` is called on the `envelope`, it should eventually call `stop()` on this `Tone`, which is why we pass `this` as an argument.




## MultiplierProcessor < AudioComponentProcessor < AudioWorkletProcessor

Can be instantiated with any number of inputs.  Simply multiplies together all of the inputs.  Connecting multiple `AudioNode` to the same destination adds their signals, so we need another solution for multiplication; this is it.

### Instance Methods

#### `_process(<outputs>)` — *boolean* — `true`
For each channel and frame, multiplies together all of the inputs and sticks the result in `<outputs>` for that channel and frame.  Returns `true`.  If there are no inputs to multiply together, stores `0`'s in the `<outputs>`.  This last bit may seem counterintuitive, since the empty product is actually equal to 1 rather than 0, but if there are no inputs, we should assume that the inputs have ended and are therefore just `0`.




## ConstantGenerator < AudioComponent < Component

An `AudioComponent` whose `node` is a `ConstantSourceNode`.  Useful when a value is a number but an `AudioComponent` is expected.

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




## GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Superclass for 0-input 1-output processors that generate a signal.  It generates a single value per audio frame and populates all channels of the output with that value at each frame.

### Instance Fields

#### `frame` — *number* — default value: `0`
The current frame of the buffer, which is usually 128 frames long so this number typically goes from `0` to `127`.  This allows you to use `this.frame` whenever you need to get a parameter in the generator function.

### Instance Methods

#### `_process(<outputs>)` — *boolean* — `true`
On each frame, sets the `frame` field, calls `generate()`, and puts that value into all of the channels of the output.  You should probably not override this method in subclasses.

#### `generate()` — *number* — `0`
Returns 0.  You should override this method in subclasses.




## Oscillator < AudioComponent < Component

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

### Audio Params

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




## SineOscillator < Oscillator < AudioComponent < Component

Generates a sine wave.

### Class Fields

#### `processorName` — *string* — `'SineOscillatorProcessor'`




## SineOscillatorProcessor < OscillatorProcessor < GeneratorProcessor < AudioComponentProcessor < AudioWorkletProcessor

Processor to generate a sine wave.

### Instance Methods

#### `wave()` — *number*
Sine of the phase.




## Envelope < AudioComponent < Component

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
If the message has a `phase`, sets the `phase` and calls the appropriate handler if it exists.

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
If the message has a `phase`, sets the `phase` and calls the appropriate handler if it exists.

#### `startRelease()`
Immediately changes phase to `'stop'`.  You should probably override this if you want to implement more interesting release behavior.

#### `phaseHandlers.release()`
Calls `startRelease()`.




## ADSREnvelope < Envelope < AudioComponent < Component

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
layer# offtonic-audioplayer
JavaScript and WebAudio-based tone generator and audio player for web apps

# Overview

Offtonic Audioplayer is a simple-to-use audio player in JS that can be used simply in any browser-based project with no need for other dependencies.  Simply import offtonic-audioplayer.js:

    import o from './offtonic-audioplayer.js';

Then start your player:

    let player = new o.Player();
    player.on();

Then, create your tones and play them!

(We'll show that when the API is finalized...)

I'm sure you'll want to define your own custom oscillators and filters and whatnot, so the basic abstract classes should be fairly easy to subclass, but the best documentation for how to do that is, naturally, the code itself.  This document will not list every single detail of what you need to know to do that, but I'll give you hints where applicable.





## Properties in the API

The Offtonic Audioplayer API is based on setting properties on components.  A component (subclass of `Component`) is basically any bit of the Offtonic Audioplayer with its own behavior, and a property is some fundamental aspect of the component.  For example, a `Tone` is a component that produces an audio signal when played, and `frequency` is one of its properties, which can be a simple number or even another component that produces a number.  You can access the value by calling `tone.getValue(tone.frequency)` (assuming `tone` is an instance of `Tone`), and you can set the value at `Tone` creation through its `options` object or later through `setOptions()`.

In contrast, a field is just a piece of data attached to an object, which may contain information about the state of the object.  For example, a component may have a field `playerFrame` that holds the `Player`'s audio frame in the most recent call to `update()`, or a field `isPlaying` that is set to `true` when it's playing and `false` when it isn't.  In other words, fields are anything that can be accessed with dot notation.

In this document, I'm using "field" to refer to the simple JS language construct of sticking a thing in a thing, and "property" is reserved for these fundamental aspects set through the API.  In JS lingo generally, what I'm calling a field is often called a property, but I'm not doing that.  Why?  Because I'm using "property" for the fundamental aspects and I don't want to confuse people further, so I'm using "field" for the JS property and "property" for the Offtonic Audioplayer property.  Got it?

Properties are set at component instantiation by calling `(new <ComponentType>()).withProperties(<props>)`, with `<props>` being an object containing values for some or all of the properties, and are modified later by calling `component.setProperties(<props>)`.  The only difference is that `withProperties(<props>)` will use default values for missing properties in the `<props>` object, while `setProperties(<props>)` will ignore missing properties.  You should *always* call `withProperties(<props>)` to ensure that the component gets initialized correctly.  (Note that `<props>.className` has a special meaning, so `className` should never be a property name or bad things will happen!)

Each property is set via a setter method named in the property definition.  These setter methods get called in the order the properties were defined, starting with the highest superclass, `Component`.

To define a property, stick an object in the `<ComponentClass>.newProperties` array of the component class you're creating with the fields below.  You can override a property in a subclass by redefining it in the subclass's `newProperties` array, which could be useful if you want to change a default.

If a property value is an array, it will be assumed to be an array of `Component` instances, so any `Component` definitions in the array will be resolved into actual `Component` instances in the object on which you're setting the property.

### Definition Fields

#### `name` — *string* (required)
Property name.  When creating a new `Component` or setting its properties, you pass in a property object; the property name is the key you should use to provide a value for this property.  You can get a property from a component with `getProperty(<propName>)`, or `getProperty(<propName>, <index>)` for list properties.

#### `setter` — *string (method name)* (optional if `list` is `false`)
This is the method that will be called when setting the property, which you will also need to define and implement as an instance method in the component class.  Subclasses may override this method to change how setting the property works.  If a setter is not provided, a generic setter will be called (see `_genericSetter(<propName>,<propValue>)` in `Component`).  A `null` value for `setter` does not allow the property to be set at all, which is useful when overwriting a settable property with a computed property.

#### `getter` — *string (method name)* (optional)
This method, if present, will get called by `getProperty(<propName>, <index>)` for this property.  It can be useful if a property defined in a superclass is a calculated quantity in a subclass; in that case, the property should be redefined in the subclass with a getter (remembering that redefining a property in a subclass overwrites the previous definition of that property).

#### `list` — *boolean* (optional) — default `false`
A property where `list` is `true` is called a list property.  This property is actually an array of values, not just a single value, and each of the elements of the array may be a `Component` or a reference, too.  Setting this property will always result in the array's elements being added to the values already present in the `Component`'s array for that property.  To remove a value, use the pseudo-property named in `removerName` with an index or an array of indices to remove the elements at those indices.

#### `adder` — *string (method name)* (required if `list` is `true`)
This method will be called on each element of the array for the property, just like the `setter`.  The assumed behavior is that each element of the array in the property input will be added, one at a time, to an array in the `Component` instance that has the property.

#### `remover` — *string (methodname)* (required if `list` is `true`)
This method will be called on each index given in the pseudo-property named in `removerName`.  It is assumed that this method will remove the given element from the array.

#### `removerName` — *string* (required if `list` is `true`)
A pseudo-property name.  When calling `setProperties(<props>)`, give this pseudo-property a value of an index or an array of indices to remove the elements at those indices from the property.  The array of indices will be sorted in descending order when removing elements.

#### `default` — *anything* (optional)
This is the default value of the property assigned to the component at instantiation if you don't provide a value for it (assuming `withOptions()` is called).

#### `componentProperty` — default: `true`
Whether this property can be a `Component`.  If `false`, `Component` definitions in properties will be treated as regular JS objects, allowing them to be created later.





## References

When creating a `Component`, you can give it the `name` property, which will save the component in a `Registry` instance (which is attached to the `Player` instance).  You can then use that component as a property in other components by using a reference.  A reference is simply an object that looks like `{ref: <refName>}`, no other fields.  Whenever the value for the property is retrieved, the system will get the component in the Registry and call `generate()` on it to get its value.  (This behavior may change if it's a bottleneck.)  Actions in a `Sequence` also take references as parameters.

This creates a problem in terms of memory management: if the component is saved in the registry, when does it get garbage collected?  Well, this is why you studied C.  (You studied C, right?)  You have to manage the component's presence in the registry by calling `cleanup()` on the component when you're done using it, which, among other things, unregisters the component from the registry.  This method will also clean up any properties that are `Component` instances, but it will *not clean up references*.  This is because you may instantiate a `Component` outside of the context of a property and use it as a property on many different components at different times — an example might be a crescendo, which applies to many different notes — and you don't want its lifetime to be limited to the note on which it's first used.  So you have to manage the memory yourself!  Keep track of which components you've created and clean them up when they're done.  This way you'll avoid memory leaks.





## Instruments

Creating `Component`s can be tedious when they have a lot of properties that you have to set.  It would be much easier if you could just specify a prototype and fill in the properties that deviate from that... and you can.  When passing in properties to the `setProperties()` or `withProperties()` methods on `Component`, you can add an `instrument` field whose value is the name of an instrument you've added to the `Orchestra` instance (accessible from the `Player` instance).  An instrument is just a JS object with properties and values (and it needs a `name` field as well so that it can be references in the `Orchestra`, which also means that you can't specify the `name` property of a component using an instrument).  Those properties and values get copied over to the properties object of the `Component` on which you're setting the properties.  For example, if you're playing a whole bunch of notes with a `frequency` of `440`, you can create an instrument with `frequency: 440` and `name: 'Tuning Fork A'` as fields, add it to the `Orchestra`, and, when creating the notes, just have a field `instrument: 'Tuning Fork A'`.  This will copy `frequency: 440` into the notes.  Of course, this doesn't help much when the instrument is setting just one property, but you could imagine a system of oscillators and filters that you don't want to repeat for every one of the thousands of notes that will use it, with a whole bunch of properties, and the instrument is a real time-saver.

Instruments can themselves reference other instruments, though you should make sure to add any instruments you're using to the `Orchestra` before you actually use them.

You can override the properties set in an instrument by simply providing them explicitly in the `<props>` object.  For example, if your instrument sets frequency to 440 but you want the frequency to be 432 for some note, just include `frequency: 432` in the properties object, which will override the instrument's `frequency: 440` in this case.  As a warning, though, you can't override sub-component properties.  If you want to change those, you'll have to call `setProperties` with a `<path>` after instantiation, or override the main component property with the right values for the sub-components.

Note that while the name "instrument" calls to mind the timbre of a tone, you can apply instruments to absolutely any type of `Component`.

You can also pass in an array of instruments.  They will be applied in the order of the array, but since instruments never override existing property values, only the first instrument in the array to set a property wins.  So you might have an instrument for an envelope, let's say, and a different instrument for a generator and filter setup.





# Class Reference

## Global

The `Global` singleton class (found in `offtonic-audioplayer.js`, imported in the example as `o`) is the primary entry point for interacting with Offtonic Audioplayer.  All of the public classes are available from `Global`, as well as some other player-scope stuff.

### Instance Fields

#### `audioCtx` — *`AudioContext`*
The window's audio context.  Note that browsers may limit the number of these you can have, and they may not let you use them without user input to prevent unwelcome behavior, so you may not want to connect anything to it until the user has performed an action.  Should not need to be changed.

#### `mspa` — *number*
Milliseconds per audio frame; if the audio context's sample rate is the usual 44100 Hz, there are 1000/44100 ≈ 0.0227 ms per audio frame (an audio frame is an instant of time at the sample rate).  Should not need to be changed.

#### `player` — *`Player`*
The active global audio player (`Player`).  By default, only one audio player can run at a time.  A `Player` that starts playing should set this to the player itself; if it stops playing, it should set this to `null`.  You may want to define separate `Player`s for separate applications on the same page; `Player`s should turn the current active player off when they turn on or you may have a leak.

#### `classRegistry` — *`ClassRegistry`*
The class registry, which is a singleton as well.  The class registry keeps track of all classes registered to it so that they can be instantiated without directly invoking them through code.





## ClassRegistry

The `ClassRegistry` is a singleton instance attached to the `Global` object that contains all the component classes by name.  This allows you to turn a string — a piece of data — into an instance of the named class.  All of the built-in component classes are registered in the class registry, but if you write your own, be sure to register them.

### Instance Methods

#### `register(<className>, <class>)`
Adds class `<class>` to the class registry under the name `<className>`.  This is what you call to register a new class (get the `ClassRegistry` instance from the `Global` object, `o.classRegistry`).

#### `get(<className>)` — *class*
Returns the class that was registered with the given `<className>`, if there is one.  If there isn't, you get nothing — `undefined`.  You probably shouldn't need to ever call this yourself, since its functionality is already wrapped in the `Component` class.





## Player

The `Player` instance is responsible for filling the audio buffer.  It contains a `ScriptProcessorNode` that creates an audio buffer (size 1024) and pushes it to the audio context's destination (generally the machine's audio device, whether speakers or headphones or whatever), which, if the audio buffer is filled with values that are well-behaved enough, will result in, ta-da, sound.  Cool, right?

The player maintains a list of playable items, and on each frame, it checks whether `<item>.isPlaying` is true for each item, and if so, it calls `<item>._generate()` and adds that value to the current value for the audio frame.  Then, for each item, if `<item>.isPlaying` is not set, the item is removed from the list.  Playable items should therefore set an `isPlaying` field when they get added to the player's list, and they should implement a `_generate()` function that returns a sound value for items that make sound (such as tones) and 0 for items that do not make sound (such as sequences).

### Instance Fields

#### `globalContext` — *`Global`*
A reference to the global context so that the player can access the current active player.  (This is propagated by means of a class field that you shouldn't have to touch.)

#### `globalPlayer` — *boolean* — default `true`
Sets whether the current player is a global player, meaning that only one can be run at a time.  Set to `false` to allow the player to run independently and ignore this limitation, though if you want to play any `Tone`s or other items, you will need to set the correct player there, since otherwise they will default to the global active player.  An audio player consumes quite a few CPU cycles to run, since it must provide 44100 values per second (even if they're all 0), so allowing only one at a time ensures that if you have multiple audio applications in the same page, they don't all take up audio-rate resources at the same time.

#### `isPlaying` — *boolean*
Tells you whether the player is playing.  You should not set this explicitly.

#### `audioFrame` — *number*
A count of how many audio frames have elapsed since the player started.  This is useful for absolute timing as well as ensuring that a function that's supposed to only get called once per audio frame only gets called once per audio frame.  Since the count is a JS integer, `audioFrame` will stop incrementing once it reaches 9007199254740992.  This will take approximately 6472 years, so if your application is expected to run that long, you might want to fork this project.

#### `registry` — *`Registry`*
A registry that keeps track of all registered `Component`s.  Registering a component simply means giving it a name so that it can be accessed by other components not directly related to it.  The registry instance is attached to the player instance so that separate widgets sharing the same `Global` instance don't run into namespace issues with each other.

$$$$ `orchestra` — *`Orchestra`*
An orchestra (a registry) that keeps track of all registered instruments.  This works the same way as the `registry` field.  See above for what instruments are and how to use them.

#### `id` — *number*
A random floating point number from 0 (inclusive) to 1 (exclusive), generated whenever the `Player` is turned on.  This allows you to uniquely identify the player.

#### `timer` — *`Timer`*
A `Timer` object with tempo 60,000 beats per minute (1 per ms) with name `"Global Timer"`.  When the player starts, it creates this timer and starts it.  Any `Component` with a `timer` property can then reference it by name.

### Class Methods

#### Constructor — *`Player`*
Simply call `new o.Player()` to get a new instance (assuming `o` is your `Global` singleton object).

### Instance Methods

#### `on()`
Turns the player on.  If `globalPlayer` is true, the active player in `Global` is set to this one; if another player was active, `off()` is called on that player.  The script processor node is created and set up; the items list is cleared; `isPlaying` is set to `true`; a `Registry` instance and an `Orchestra` instance are created; an `id` is generated.

#### `off()`
Turns the player off.  If `globalPlayer` is true, the active player in `Global` is set to `null`.  The script processor node is disconnected and its callback set to null; the items list is cleared; `isPlaying` is set to `false`; `registry`, `orchestra`, and `id` are set to null.

#### `add(<item>)`
Adds a playable item to the list.  This should generally be called by a `play()` method on the items themselves; you shouldn't have to add any items manually.  The down side is that items need to know about the player instance in order to do that, but it makes for code that is much easier to reason about.

#### `create(<component>)` — *anything*
Creates a component with the specified properties and sets the `Player` instance as the `player` field in the component.  It will only do anything if `className` is set in the `<component>` object to a class named registered in the `ClassRegistry` singleton instance; otherwise it will just return the `<component>` value itself.





## Registry

The `Registry` instance keeps track of named `Component`s so that other `Component`s can refer to them.  It's the equivalent of saving a component to a variable.  The registry is *not* a singleton because the registry acts as a namespace for the `Component` names, and multiple independent audio applications on the same page need separate namespaces.  The `Registry` instance is really just an object, a set of key-value pairs, where the key is the name and the value is a reference to the `Component` instance with that name.  While it's nice for you to understand this, you shouldn't ever have to deal with the registry directly.  So long as you inherit from `Component`, you should use the methods there to interact with the registry.

### Instance Methods

#### `add(<component>)` — *boolean*
Adds the given component under the name `<component>.name`.  This will not work if `<component>` does not have `name` set, for obvious reasons, and it will also fail if the name already exists in the registry.  Returns `true` on success and `false` on failure.

#### `get(<name>)` — *`Component` (or anything)*
Retrieves the component registered under `<name>`.  Will obviously fail if there isn't one, returning `null` (not `undefined`).

#### `remove(<name>)`
Removes the key-value pair with the key `<name>`.  This should be done to prevent old references from sticking around.  A good rule of thumb is that whenever a component stops being played, it should be unregistered (you can do this by setting its name to `null`).





## Orchestra

The `Orchestra` instance is essentially the same thing as the `Registry` instance: it's a key-value store attached to the `Player` instance.  However, while the `Registry` registers `Component`s, the `Orchestra` registers instruments, which are simple property lists used as prototypes for creating `Component`s.

### Instance Methods

#### `add(<instrument>)` — *boolean*
Adds the given instrument under the name `<instrument>.name`.  This will not work if `<instrument>` does not have `name` set, for obvious reasons, and it will also fail if the name already exists in the registry.  Returns `true` on success and `false` on failure.

#### `get(<name>)` — *instrument*
Retrieves the instrument added under `<name>`.  Will return the empty instrument `{}` if there isn't one.

#### `remove(<name>)`
Removes the key-value pair with the key `<name>`.  You probably won't need to do this unless you're creating a whole bunch of instruments dynamically and want to clean them up.





## Component

A `Component` is pretty much any chunk of the Offtonic Audioplayer that conforms to the pattern of the API.  All `Tone`s, `Generator`s, etc. should be subclasses of `Component`, and if you create a new type of widget that you want to incorporate into the Offtonic Audioplayer, you should probably subclass `Component` yourself.  `Component` secretly inherits from `BaseComponent`, a private superclass that is not available for other classes to use; this is because `Component` needs a superclass to do some of its magic.

`Component`s have properties, which are set by the user.  Examples of properties would include the frequency of an `Oscillator` and the `Oscillator` of a `Tone`; these properties can be set on `Component` instantiation or changed later through Offtonic Audioplayer's unified API.  See below for how to define new properties.  If the conventions are followed, a `Component`'s available properties are defined statically, which means that they're stored in the class object at loading time and can be retrieved through one function call, `properties()`, that doesn't need to keep calling things up the prototype chain.

### Properties

#### `name` — *string* — setter: `_setName`
The name of this component as passed to the registry.  Naming a component will allow other components to refer to it.  There's a good chance you won't need to do this very often, and since you may end up writing a lot of components, this is a very much optional property.

### Class Fields

#### `newProperties` — *`Array`*
All subclasses must redefine this (`<Subclass>.newProperties = [...];`), or else the immediate superclass's new properties will be repeated in the properties list.  All properties possessed by the subclass but not by its superclass should be in this array; if there aren't any, the array should be empty.

#### `properties` — *`Array`*
The list of properties, including all of the superclasses' properties.  Subclasses that add new ones should include the line `<Subclass>.properties = <Subclass>._getProperties();` in order to populate this array; if not, the properties list will be the same as that of the immediate superclass (which might be what you want).

#### `getters` — *object {string: string}*
The property getters.  The keys are the names of the properties and the values are the names of the getters.

#### `globalContext` — *`Global`*
A reference to the global object, from which instances can get the active player and therefore the registry.  You probably shouldn't override it in subclasses.

### Instance Fields

#### `isComponent` — *boolean* — default `true`
Allows one to quickly determine whether a particular object is an instance of `Component` (or one of its subclasses).  Don't change this value or the reference system will stop working.

#### `player` — *`Player`* — default `<Global>.player`
Assigned at construction as the active player in the global context unless the component is created through `player.create()`, in which case it's set to the player that created it, or if the component is created as a value for a property, in which case it's set to whatever player the parent component has set.  If you want to use a different `Player`, you'll need to set this field using `setPlayer(<player>)`.  Note that this assumes that the player is active when the `Component` is instantiated.  Since the `Registry` instance is an instance field on the `Player`, this field allows access to the registry as well.

#### `parent`— *`Player` or `Component`* — default `null`
Assigned at construction as the parent object of a `Component`, that is, the `Component` of which this `Component` is a property, or, if none, `null`.  You can use this to navigate the tree of properties upwards.

#### `registered` — *boolean* — default `false`
Whether the component has been added to the registry.  Its `name` property needs to be non-empty in order for this to happen.

#### `mspa` — *number* — constant
This number is taken from `Global` at instantiation as a convenience so that you can write `this.mspa` instead of `this.constructor.globalContext.mspa` every time you need it.

#### `getters` — *object {string: string}*
The names of any property getters are stored here during object creation.  To use the getter for property "property", call `this[this.getters["property"]]()`.

### Class Methods

#### `_getProperties()` — *`Array`*
This method builds the properties list; you shouldn't need to call it yourself outside of the line mentioned above.  The way it works is that it gets the prototype of the current class, which is the superclass, and concatenates that prototype's `_getProperties()` with this class's `newProperties`.  It needs a superclass to work, hence `BaseComponent`, but all subclasses inherit this and can thus build their properties list pretty much automagically.  For obvious reasons, if you override this method, the magic will be gone.  Don't make the magic disappear.

#### `create(<component>, <player>)` — *anything*
Returns a value or instantiates a component that is passed in, setting its `player` to the given `<player>`.  Used in setting properties.  You should generally use the `player.create(<component>)` method to create components, which calls this one, unless you're doing something funky with multiple `Player` instances at the same time.  Obviously, overriding this method is bad news.

#### `isComponent(<component>)` — *boolean*
Whether a given value is a component.  It actually checks whether `<component>` is not `null`, has type `'object'`, and has its `isComponent` field set to `true`, which is not the same thing as checking whether `Component` is in its prototype chain, so use proper caution.  This method is useful when dealing with properties that might be references rather than components, in particular when calling `cleanup()` on the old value of a property being set.

### Instance Methods

#### `_finalSetup()`
Performs a final initialization step after calling the constructor and setting the properties.  Override this to, for example, enforce specific values of properties for subclasses that are less general than superclasses in some way, but remember to call `super._finalSetup()` first.

#### `properties()` — *`Array`*
Retrieves the static `properties` array, containing the property definitions for the class.  More of a convenience method, really, but it's available for subclasses.  You probably shouldn't override this method either.

#### `withProperties(<props>)` — *`Component`*
Sets the given properties on the component.  If a property is not listed in `<props>`, the default value will be used instead.  This is used at component instantiation to provide reasonable values for all properties.  Returns the component itself.

#### `setProperties(<props>, <path>)` — *`Component`*
Same as `withProperties(<props>)` except that it does not set default values; if a property is not listed, it's just not set.  This is used to change the properties of a component after the component already exists; for example, you can change the frequency or volume or a sound in response to user input.  The `<path>` argument, an array of property names and indices into array/list properties, can be used to access properties of properties (so long as they're `Component`s and not references).  The way it works is like this.  Suppose that your component has a `frequency` property that is itself a component, and that component has an `amplifier` property that is a list of components, and the third item on that list (array index `2`) has a property that you want to set.  Then, your `<path>` would be `['frequency', 'amplifier', 2]`, and your `<props>` object would be as if you were calling `setProperties(<props>)` on the component at that path.

#### `_setProperties(<props>, <useDefault>, <path>)`
Allows you to specify whether to use default values for missing properties with the `<useDefault>` boolean.  The `<path>` argument works as in `setProperties(<props>, <path>)`.  You shouldn't need to call this method, since `withProperties(<props>)` and `setProperties(<props>)` cover both cases (and call this method under the hood).  Does not return a value.

#### `_applyInstruments(<props>, <instrumentName>)`
Adds the properties defined in the instrument named `<instrumentName>` to the object `<props>`, provided they aren't already there.

#### `_genericSetter(<propName>, <propValue>)`
Cleans up the existing property, calling `cleanupProperty(<propName>)` on it, and sets the `<propName>` instance field to `<propValue>`.  If a property doesn't have a setter defined, this will be used to set the property.  You should not override this method; if you need a property setter to have some extra behavior, just implement/override that particular setter.

#### `getValue(<property>)` — *anything*
Utility method to retrieve the value of a passed-in property, where `<property>` is the stored value of the property field within the component (say, `oscillator.frequency`).  If the property doesn't implement the `generate()` method, then this method returns the passed-in value itself; if it does, this method returns `generate()` on the property.  This is useful when, say, the `frequency` property of an `Oscillator` could be either a number like `440` or a component that returns a frequency when asked, like maybe something involving another `Oscillator` at a low frequency for a vibrato effect.  `getValue(<property>)` adjusts to whether `<property>` is constant or dynamic, and it reduces the need for components that do nothing but return a constant value.  There is likely no reason for you to call this method yourself; use the `getProperty(<propName>)` instance method instead (in this example, `oscillator.getProperty('frequency')`).  You probably shouldn't override this method, or a *lot* of stuff could break.

#### `getComponentValue`(<property>)` — *anything*
Similar to `getValue(<property>)` but returns the component itself (if the property holds a component) rather than its `generate()` output.  If the property contains a reference, it resolves that reference.  It's intended to be used in situations where an actual `Component` instance is expected as a value rather than a number or whatever.

#### `resolveReference(<reference>)` — *`Component`*
Assumes `reference` is an object that looks like `{ref: <name>}`; retrieves the `Component` instance stored under `<name>` in the registry.

#### `getProperty(<propName>, <index>)` — *anything*
Retrieves the value of the named property.  Use this instead of reaching for the property field directly, since a property field might contain either a value or a component that generates a value, and this method takes care of that for you.  If the property is an array or list property, you may specify an `<index>` in order to get the value of the desired element; otherwise, you will get an array of the generated values of the elements.  If the property has a getter, that method will be called instead, with `<index>` as the parameter.

#### `_getProperty(<propName>, <index>)` — *anything*
Helper for `getProperty(<propName>, <index>)` that does not call the getter if there is one.  You can use this in the getter to retrieve a value that is then processed somehow.

#### `getComponentProperty(<propName>, <index>)` — *anything*
Same as `getProperty(<propName>, <index>)` but retrieves the component value rather than the `generate()` value of the property.

#### `setPlayer(<player>)` — *`Component`*
Sets the `Player` instance the component references.  If the component has been added to its former `player.registry`, this method removes it from there and adds it to the new `player.registry`.  Returns the component itself.

#### `setParent(<parent>)` — *`Component`*
Sets the `parent` field as `<parent>`, which should generally be the containing `Component`, if any.  Returns the component itself.  You can override it if you want special behavior upon setting the parent, like navigating the parent tree upwards to find some particular `Component` type, but remember to `return this` or `Component` creation will fail!

#### `play()`
Calls `play()` on all properties that are actual `Component` instances (not references).  Subclasses of `Component` are responsible for overriding this method (remembering to call `super.play()`) to actually have `play()` do something useful.  This is important since a `Playable` component, which does implement `play()`, may have properties that are `Component` instances but not `Playable` ones, and those properties may themselves have `Playable` properties that would need a `play()` command as well.  Therefore, the `Component` implementation of `play()` serves as a bridge.

#### `off()`
Similar to `play()`, but calls `off()` on component properties instead.  This is so that everything gets cleaned up properly; subclasses overriding `off()` should call `super.off()` to make sure this still happens.

#### `register()`
Registers the component in its current player's registry.  You likely shouldn't need to call this yourself, since setting the `name` property registers the component automatically.

#### `unregister()`
Unregisters the component in its current player's registry.  You likely shouldn't need to call this yourself, since `cleanup()` does it for you, but I suppose you might need to for some reason.

#### `cleanup()`
Performs any cleanup of resources needed, like unregistering the component from the registry, then calls `cleanup()` on all properties that are also components (that are not references).  This is useful if you need to clean up references that don't get cleaned up in other ways in order to avoid memory leaks.  If you have additional resources that need to be cleaned up, you should override this method and make sure to call `super.cleanup()`.

#### `cleanupProperty(<propName>)`
If the named property is a `Component` instance, it calls `cleanup()` on it; otherwise it does nothing.  This is useful in property setters so that the old value can be properly cleaned up.





## AudioComponent < Component

An `AudioComponent` is a `Component` with additional functionality involving audio, intended to prouduce a value or behavior at the audio rate, 44100 Hz.  The `generate()` method should be called, which calls the `update()` method (if it hasn't run already in this audio frame) and returns a value.

### Instance Fields

#### `playerFrame` — *number*
The `player`'s `audioFrame` at the most recent call to `generate()`.  If it matches the current `player.audioFrame`, `update()` is not called and the most recent value is returned without calculation.  This is so that multiple consumers can use an `audioComponent` without updating it too quickly.

#### `value` — *anything* — default: `null`
The `update()` method should set this value to whatever `generate()` is meant to return (if anything at all).  Note that if the `AudioComponent` is `Playable`, `value` should be a number, even if it's not meant to make a sound, in which case it should be `0`.

### Instance Methods

#### `update()`
No-op in `AudioComponent`, meant to be overridden in subclasses.  This method should perform all of the audio rate updates for the object; for example, if there's a counter or phase to advance, it should perform that task.  It should also set `value` to whatever should be returned from `generate()`.  It may be useful when subclassing the subclasses of `AudioComponent` to call `super.update()` if there's work done in this method that you want to keep.  Note that this method should be called at most once per audio frame, but there's nothing checking to make sure that it's called at all; you need to be responsible for ensuring that it gets called (if you want it to get called, obviously).

#### `generate()` — *anything*
If the current `player.audioFrame` is different from `playerFrame`, it updates `playerFrame` and calls `update()`.  It returns `value`.  This function should not need to be overridden, since that would remove the functionality of ensuring that `update()` gets called at most once per audio frame.  Call `generate()`; override `update()`.





## Playable < AudioComponent < Component

A `Playable` component is one that can be run independently by the `Player`.  Examples include a `Sequence` or a `Tone`.  These components go in the `Player`'s item list, and the `Player`'s audio callback function directly calls `generate()` on the component.  This means that `generate()` should produce a number; by default, a `Playable`'s `value` field is `0`, meaning that it does not directly produce an audio signal.  This is appropriate for `Sequence`, which executes various actions at specified times, but `Tone` overrides `update()` to produce values that get added to the audio buffer.

`Playable` has three methods for controlling starting and stopping: `play()`, `stop()`, and `off()`.  `play()` and `off()` are meant to work immediately, while `stop()` is really more of a "stopWhenConvenient()".  If a `Playable` component is making sound, stopping the sound abruptly will result in an audible click due to the high-frequency spectral component of the discontinuity due to the sudden stop, but that can go away entirely if you ramp the sound down over a few dozen milliseconds.  `stop()` can be used to signal to the envelope component that this ramping phase should be entered now, and you can call `off()` later when it's done.

### Properties

#### `isIndependent` — *boolean* — default: `true`
Whether calling play will actually send the `Playable` to the `Player`.  Set this to `false` when you need the `Playable` behavior but you don't need the component to actually produce sound.  You will need to call `generate()` on this component yourself as the `Player` will no longer do it for you.

### Instance Fields

#### `isPlaying` — *boolean* — default `false`
Whether the `Playable` component is playing.  You should probably not set this directly.

#### `isStopping` — *boolean* — default `false`
Whether `stop()` has been called already.

### Instance Methods

#### `play()`
Sets `isPlaying` to `true` and calls `player.add()` to add this component to the player.  On its audio callback, the player will add the value returned by `generate()` to the sample at every audio frame.  If you override this method, you should probably call `super.play()` to maintain the functionality (if that's what you want to do, of course).

#### `stop()`
If `isStopping` is `false`, calls `super.stop()`, sets `isStopping` to `true`, and calls `_stop()`.  This method is responsible for propagating the `stop()` command down to component properties, so if you override it, you should probably call `super.stop()`.  The actual work to be done after a `stop()` should be handled in `_stop()`; override that method instead.

#### `_stop()`
Simply calls `off()` by default.  `Tone` overrides this method such that `stop()` triggers the stopping phase of the envelope, which causes `off()` to be called only when the envelope is done.  You can override this to do whatever you think should be done.

#### `off()`
Sets `isPlaying` to `false`, which will indicate to the player that this item should be removed from its list immediately, and calls `cleanup()`.  You do not have to tell the player to remove a component explicitly; the audio callback function checks whether `isPlaying` is set to `false`, and if it is, it will remove the item itself.  If you override this method, you should probably call `super.off()` to maintain the functionality (if that's what you want to do, of course).





## TimedComponent < Playable < AudioComponent < Component

This is a `Component` that will stop either after a given duration or at a specific time according to its timer.  There is no support for *starting* a `TimedComponent` at a given time, but you can do that by means of a `Sequence`, which does just that.  You can of course use the timer for other purposes as well, like timing different phases of a `TimedComponent`'s functions.  The `startTime` field is set when `play()` is called, and after either `endTime` is reached or `duration` has elapsed, whichever comes first, `stop()` (not `off()`) will be called.  If both `endTime` and `duration` are left empty, the `TimedComponent` will keep playing indefinitely; you can do this if you want `stop()` to trigger on user input rather than provide a specified duration.

### Properties

#### `timer` — *`Timer`* — default `{ref: "Global Timer"}` — setter: `_setTimer`
The `Timer` instance according to which things are timed.  By default, the timer is the global timer, created by the `Player` instance with a counter that increments by 1 every millisecond, so you can specify durations in ms.  You can provide some other running timer instead, like one running at a more reasonable 100 BPM, and specify that you want your `TimedComponent` to last until beat 28 or 1.9 beats or something.  The point of the `timer` is to offer this sort of flexibility.  To speed things up a bit, even if `timer` contains a reference to a `Timer` instance in the `Registry` instance, the timer is referenced in the `_timer` field, so instead of having to call `resolveReference()` every audio frame, you can just use `this._timer.time` to get the time.

#### `endTime` — *number* — setter: `_setEndTime`
The time on the `timer` that will trigger `stop()`.  If the `timer` has already advanced past `endTime` when `play()` is called, `stop()` will be triggered immediately.

#### `duration` — *number* — setter: `_setDuration`
How long the `TimedComponent` should play.  When `play()` is called, if an `endTime` has not already been set, one will be set based on the `duration`.

### Instance Fields

#### `_timer` — *`Timer`*
When a property is a reference rather than a value or an explicit `Component`, only the reference is stored in the `Component`.  This field holds a JS reference to the actual object that `timer` refers to, so when `timer` contains `{ref: <timerName>}`, `_timer` contains the actual timer referenced.

#### `startTime` — *number*
The time in the associated `Timer` instance when `play()` is called in the `TimedComponent` instance.

### Instance Methods

#### `_setupTimes()`
Sets `startTime` and harmonizes `endTime` and `duration` if both are present, choosing whichever value is soonest.

#### `play()`
Calls `_setupTimes()` then calls `super.play()`.

#### `update()`
Checks whether `_timer.time` is greater than or equal to `endTime`; if it is, calls `stop()`.  Calls `super.update()`.





## Timer < Playable < AudioComponent < Component

A `Timer`'s main function is to count audio time at a user-specified rate.  Every audio frame represents an interval of 1/44100 of a second from the last one, but these aren't exactly useful units, so you can specify a tempo, in beats per minute, for the timer to count the beats.  The current count is in the timer's `time` property (which is just a number, so you can just call `timer.time` instead of `timer.getProperty('time')`).  The tempo can be a component and you can change it over time, so the time between beats 1 and 2 may be different from the time between beats 2 and 3, as an example.  This allows flexibility with note durations and sequence actions, since you can use a non-constant timer to synchronize them and set durations and whatnot.  The timer itself is passive; other objects have to ask *it* what time it is.

It's often a good idea to give the `Timer` instance a `name` so that other `Component`s can refer to it.

There's a default `Timer` instance named `"Clock"` that is created by the `Player` on startup, with a tempo of `60000`.  This default timer is the default for various `Component` classes that use timers.

### Properties

#### `time` — *number* — setter: `_setTime` — default `0`
The current time of the timer.  Starts at 0 by default and is incremented according to the `tempo` every `update()`, but you can change the time if you want.  Note that `time` has to be an actual number, not just something that `generate()`s a number.

#### `tempo` — *number (or `AudioComponent`)* — default: `60000`
The tempo, in beats per minute (BPM).  The default value is `60000`, which might seem a bit fast.  60,000 beats per minute is, of course, 1 beat per millisecond, so a 60,000-BPM timer is useful for specifying durations in ms, which is a thing you may well want to do in non-musical applications or when, say, specifying the durations of the phases of an envelope.

### Instance Methods

#### `update()`
Increments the `time`.  Remember that you should never call `update()` yourself, except as `super.update()` when overriding this method in a subclass.





## Tone < TimedComponent < Playable < AudioComponent < Component

The `Tone` is the basic entry class for a thing that actually produces sound.  In general, the basic usage of the Offtonic Audioplayer is to create `Tone` instances and play them.  That's what this whole thing is for.  When you call `play()` on the tone, it gets added to the `Player` instance, which calls `generate()` on the tone every audio frame.  In turn, `generate()` calls `update()`, which sets the `value` field by following a pipeline: first, a value (generally between –1 and 1) is generated from the `generator`; then, it's passed through the `filter` (if there is one); after that, it's multiplied by the `gain`, the `envelope`, and each of the `amplifiers` in order.  The number remaining in `value` at the end of this pipeline gets added to the audio buffer.

The `Tone` provides several convenience parameters as well, which might make more logical sense as parameters of the components.  The main one is the `frequency`, which gets set in the `generator` *and* the `filter`.  This is because a filter may well depend on frequency; it's ultimately up to the filter instance to decide what to do with it.  Being a `TimedComponent`, `Tone` also provides `duration` by default.  `Tone` does not trigger `off()` when `stop()` is called; when the `duration` has elapsed (or when a user does it), `stop()` gets called.  This actually sends a `stop()` method call to the `envelope`, and in the `Tone`'s `update()` method, the `envelope` is checked for whether it's still going.  If it isn't, `update()` calls `off()`.  The idea is that the `envelope` can provide a smooth fade-out that doesn't click the speakers, because that's annoying.

### Properties

#### `generator` — *`AudioComponent`* — setter: `_setGenerator` — default: `{className: 'Oscillator'}`
The thing that actually produces values.  An example would be a class that provides the numbers in a sine function or a triangle function or something like that; that signal can then be filtered and scaled as necessary.  Technically, `generator` could be just a number, but that would probably not be very useful.  Or maybe it would, I don't know.  Should probably be a `Generator` subclass, but this is not necessary.  When a `frequency` is set, it's passed to the `generator`, but some `generators` don't actually take a `frequency`, like a white noise generator.  That's OK; the `frequency` is just ignored if that's the case.

#### `envelope` — *number or `Playable`* — default: `1`
Should probably be an instance of `Playable`, but really, any source of numbers will do.  An envelope in general provides a shape to the sound and removes discontinuities that sound like clicks.  A typical envelope might spend 10 ms ramping from 0 to 2, then another 20 ms ramping from 2 to 1, then it will stay at 1 until `stop()` is called, at which point it takes another 20 ms to ramp down to 0.  This is called an ADSR envelope, common in synthesis, and it ensures that there's no click at the start and end of the note, thanks to the ramping from and to 0, and there's a hard attack at the beginning.  Many other sorts of envelopes are possible, such as exponential ramping, more phases or fewer phases, etc.  If the envelope doesn't respond to `stop()`, then `stop()` on `Tone` will actually call `off()`.  A value of `1` leaves the sound unchanged.

#### `filter` — *`Filter`* — setter: `_setFilter`
A `Filter` implements a method, `filter(value)`, that returns another value.  There are many possible kinds of filters, and there are filters that will combine other filters as well, in series or in parallel, so that multiple filters can be used with the same `Tone`.  If there is no `filter` set, the filter step in the pipeline will simply be ignored.

#### `amplifiers` — *`Array` of `AudioComponent`s or numbers* — list: `true` — adder: `_addAmplifier` — remover: `_removeAmplifier` — removerName: `removeAmplifiers`
This is a list property that takes a bunch of amplifiers, which could be really any number source since they just get multiplied.  This could be useful to implement a crescendo, for example; add an amplifier that's ramping up slowly.  If the situation is more complex, you could have crescendos and diminuendos happening at the same time, which is why this is a list property.  A value of `1` leaves the sound unchanged.

#### `gain` — *number (or `AudioComponent`)* — default: `0.05`
Sets the expected volume for the `Tone`.  Now, you might be wondering why, if the `envelope` and `amplifiers` basically already do this.  The answer is that `gain` is intended to be an *absolute* volume, while the `envelope` and `amplifiers` are expected to assume an average of 1.  The `gain` should pretty emphatically NOT BE `1`.  The default is `0.05`, which is plenty loud.  If you set it much higher, you may blow your speakers!  You *could* encode amplifier information in the `gain`, but you don't have to.

#### `frequency` — *number* (or `AudioComponent`)* — setter: `_setFrequency` — default: `440`
Has no particular meaning within `Tone`, but it gets propagated to the `generator` and `filter`.  It's intended to be, well, the frequency of the `Tone`, right?  But not all `Tone`s have a meaningful ferquency.  Setting the `frequency` will send a `setProperties({frequency: <frequency>})` to the `generator` and `filter` properties if those are set to `Component`s.  You *can* set it to `null` if this is meaningful in the context of the `generator` and `filter`.

### Instance Methods

#### `_stop()`
Calls `stop()` on the `envelope` property if appropriate; if not, calls `off()` on the `Tone` itself.

#### `update()`
If the `envelope` indicates, calls `off()`.  Otherwise, sets `value` to the output from `generator`, replaces it with the value from `filter` when `value` is passed in to its `filter()` method, and multiplies by the outputs from `gain`, `envelope`, and each of the `amplifiers`.





## Generator < AudioComponent < Component

A `Generator` produces numbers, ideally between –1 and 1, and allows one to multiply by a scale coefficient `coeff` and add an `offset`.  `Generator` overrides `generate()` to apply the transformation to the value after it has been updated by `update()`, so `value` is unchanged.

### Properties

#### `coeff` — *number (or `AudioComponent`)* — default: `1`
#### `offset` — *number (or `AudioComponent`)* — default: `0`
The output of the `function` is multiplied by the `coeff` then added to the `offset`, allowing you to easily scale and translate a signal in case you need it, say, from 0 to 1 instead of from –1 to 1 (for example, if your signal is meant to be an envelope or modulate some parameter).

### Instance Methods

#### `transform(<x>)` — *number*
Multiplies `<x>` by `coeff` and adds `offset`, returning the result.




## Oscillator < Generator < AudioComponent < Component

An `Oscillator` produces a wave with a given frequency.  It keeps a `phase`, which is initialized to a random value between 0 and 2π, and at every time step its value is a given function of the phase, and its phase is incremented such that it goes from 0 to 2π `frequency` times per second.  You can set an arbitrary function to generate the wave, or you can subclass `Oscillator` and set a function there for convenience.  Since the `function` is generally expected to oscillate between –1 and 1, you may specify a multiplicative coefficient `coeff` and an additive `offset` to scale and translate the signal.

### Properties

#### `frequency` — *number* (or `AudioComponent`)* — default: `440`
The frequency of the oscillator.  The phase advances at a rate proportional to the frequency.

#### `function` — *function* — setter; `_setFunction` — default: `null`
The function called on the phase to set the `value` (which you can get via `generate()`).  It should take one parameter, which is expected to be 0 ≤ x < 2π, and spit out a number, which should probably be –1 ≤ y ≤ 1.  Nothing will break if you go outside these bounds, except possibly your speakers and/or your eardrums, depending on what you use the `Oscillator` for.  Remember that as part of a `Tone` the signal still gets multiplied by a `gain`.  But the beauty of this system is that you can use an `Oscillator` for pretty much whatever you want.  Use it at a low frequency to control a pitch or a dynamic or whatever, if you want!  The suggested range of –1 ≤ y ≤ 1 is just to keep things normalized for your convenience.  Do whatever you want!  If this property is `null`, the function returned in `getFunction()` will be used.

#### `phase` — *number* — setter: `_setPhase`
The phase of the oscillator.  It must be a number, not an `AudioComponent`.  If it's not provided, then the phase is initialized to a random number in the 0 ≤ phase < 2π range.  The value given is the initial phase, and it gets incremented every frame then reduced to stay within the 0 ≤ `phase` < 2π range.  Because it gets reduced, be careful with any application that uses the same phase for multiple frequencies.  For example, sin(wx) + sin(1.1wx) might appear to generate two sine waves at (angular) frequencies w and 1.1w, but x resets to 0 every time it passes 2π, so the second term goes through 1.1 sine waves before starting the wave again at the same frequency w.  This technique is used in audio synthesis, but it might not be what you actually want.  If you want two independent sine waves, you'll need two independent phases!  Remember that an `Oscillator` can be used for low-frequency oscillations, envelopes, or really whatever you want to use it for, which is why the ability to set the initial phase is important.

#### `phaseMod` — *number (or `AudioComponent`)* — default: `0`
A quantity to add to the phase every audio frame.  Depending on `isFrequencyMod`, it might get added when evaluating the `function` or just added to the phase itself, causing an accumulation of sorts.  The number that gets added to the phase every frame is `frequency`·`mspa`·π/500, so you should make sure that the `phaseMod` is scaled correctly.  The `phaseMod` can be used for frequency modulation; a good idea is to use some `Oscillator` or `Generator` to modulate the frequency and create some complex sounds.

#### `isFrequencyMod` — *boolean (or `AudioComponent`) — default: `true`
Whether the `phaseMod` is added to the phase itself or just to the argument of the `function`.  As an example, suppose that the phase is 0, and the phase will get updated to π/2 next frame without a `phaseMod`.  Suppose there is a `phaseMod` of 1.  Then the `function` will get called at phase 1 instead of 0.  If `isFrequencyMod` is `false`, the phase will still be 0 and get updated to π/2 next frame; if `isFrequencyMod` is `true`, then the phase becomes 1 and gets updated to π/2 + 1 next frame.  Assuming nothing else changes, if `isFrequencyMod` is `false`, the `function` will evaluate at π/2 + 1 and the phase will be π the frame after; if `true`, the `function` will evaluate at π/2 + 2, which will be the phase in the frame after.  `isFrequencyMod`, then, adds the `phaseMod` cumulatively if `true`, effectively changing the frequency.

### Instance Methods

#### `getFunction()`
Returns the default function of this `Oscillator` class.  Override it to set a different function.  The default for `Oscillator` is a sawtooth.  The `function` property allows you to set the function on a per-`Oscillator` basis, while `getFunction()` allows you to set it on a per-subclass basis.  The reason it's an instance method and not a static method is because its subclasses can implement more complex functions with parameters controlled by properties.

#### `update()`
Calls `super.update()`, evaluates the `function` at the phase (plus the `phaseMod` if `isFrequencyMod` is false), and updates the phase, adding `frequency`·`mspa`·π/500 to the `phase` (plus the `phaseMod` if `isFrequencyMod` is true), then resets it to be 0 ≤ `phase` < 2π.  Make sure to call `super.update()` in any subclasses if you override this method.





## SineOscillator < Oscillator < Generator < AudioComponent < Component

An `Oscillator` where the `function` property is the sine function.





## TriangleOscillator < Oscillator < Generator < AudioComponent < Component

An `Oscillator` where the `function` property is a triangle function t, with t(0) = t(2π) = –1 and t(2π·m) = 1, where 0 ≤ m ≤ 1 is the `mod` property.  Setting m to 0 or 1 will create a sawtooth.

### Properties

#### `mod` — *number (or `AudioComponent`)* — default: `0.5`
A mod parameter to vary the sound.  A standard triangle wave is symmetrical, going from –1 to 1 and back to –1 with the 1 right at the midpoint.  Of course, we don't *need* to do that.  The `mod` property should be between 0 and 1 (inclusive) and will smoothly modulate the sound from sawtooth at 0 to a pure triangle at 0.5 and back to a sawtooth at 1.




## SquareOscillator < Oscillator < Generator < AudioComponent < Component

An `Oscillator` where the `function` property is a square function s, with s(ø) = –1 for ø < 2π·m and s(ø) = 1 for ø ≥ 2π·m, where 0 ≤ m ≤ 1 is the `mod` property.  Setting m to 0 or 1 will create a constant function, which, while nice, is completely unnecessary since you can generally just use a plain number.

### Properties

#### `mod` — *number (or `AudioComponent`)* — default: `0.5`
A mod parameter to vary the sound.  A standard square wave is –1 for half a period and 1 for the other half, but setting the mod to some value 0 ≤ m ≤ 1 makes it –1 for m of the period and 1 for the rest, also sometimes called a pulse wave.




## PitchSpaceSineOscillator < Oscillator < Generator < AudioComponent < Component

An `Oscillator` intended to provide frequencies to oscillate evenly in pitch space, like in a pitch vibrato.  This isn't just a regular sine wave because pitch space isn't linear in frequency; for example, the halfway point between 440 Hz and 880 Hz in linear terms is 660 Hz, the arithmetic mean, but in pitch space it's the geometric mean, approximately 622.25 Hz.  The usual sine wave would spend more time above that midpoint than below.  If f0 is the `bottomFrequency` and f1 is the `topFrequency`, the formula for the wave is f0·(f1/f0)^((1 + sin(x))/2).  If `isNormalized` is `true`, then the signal is scaled and offset such that it goes between –1 and 1 like a usual oscillator.

### Properties

#### `isNormalized` — *boolean* — default: `false`
Whether the range goes between the two frequencies (`false`) or between –1 and 1 (`true`).  Note that in a normalized wave, the absolute frequencies don't matter, only the interval does.

#### `bottomFrequency` — *number (or `AudioComponent`) — default: `440`
#### `topFrequency` — *number (or `AudioComponent`) — default: `880`
THe numbers f0 and f1 between which the (non-normalized) oscillator oscillates in pitch space.  If `isNormalized` is `true`, then the oscillator will oscillate between –1 and 1, and only the ratio r = f1/f0 will be relevant.




## WhiteNoiseGenerator < Generator < AudioComponent < Component

Generates random numbers between –1 and 1.




## RedNoiseGenerator < Generator < AudioComponent < Component

Generates a signal that oscillates randomly with a frequency parameter, which sounds a little weird, so let's look at it mathematically.  `RedNoiseGenerator` is essentially a random number generator with a memory: `value` = r·lastValue + s·randomNumber, where randomNumber is between –1 and 1.  r is a memory parameter, equal to e^(1/t) for a time constant t, and s is a scaling parameter to make sure things stay roughly between –1 and 1 on average; s = sqrt(1 - r^2).  t is a time constant with units of time (physically, in number of time steps), but to make it work with the `Tone` infrastructure, t is proportional to 1/`frequency` (in the proper units).  This `frequency` is a cutoff frequency for the red noise power spectrum.

### Properties

#### `frequency` — *number (or `AudioComponent`) — default: `440`
The inverse of the time constant for the generator's memory, which is also the cutoff frequency of the power spectrum.  Red noise does not have a definite pitch, so you won't actually hear a note at this frequency, but the static will sound higher for higher frequencies and lower for lower frequencies.




## InharmonicGenerator < Generator < AudioComponent < Component

Generates arbitrary spectrum components: if you specify an array of coefficients (`coeffs`) and an array of `multiples`, the `InharmonicGenerator` instance will play sine waves (or whatever `function` you specify) at those multiples of the given `frequency`, multiplied by their respective coefficients.  In other words, if `coeffs` is `[1, 0.5, 0.2]` and `multiples` is `[1, 1.5, 1.75]`, with `frequency` `100`, then the `InharmonicGenerator` instance will generate a sine wave of amplitude 1 with frequency 100 Hz, another with amplitude 0.5 and frequency 150 Hz, and a third with amplitude 0.2 and frequency 175 Hz.  Be aware that creating very complex sounds this way can eat up a fair bit of processing power.

### Properties

#### `phases` — *`Array` of numbers* — setter: `_setPhases` — default: `[]`
An array of initial phases for the spectrum components.  Note that this should be an array of numbers, not `AudioComponent`s or anything like that.  If not enough phases are provided for the spectrum components, the remaining phases will be random numbers from 0 to 2π; if no initial phases are provided, then, all of the phases will be random.  If too many phases are specified, the other initial phases are simply never used.

#### `coeffs` — *`Array` of numbers (or `AudioComponents`, or an `AudioComponent` that `generate()`s an `Array`) — setter: `_setCoeffs` — default: `[1]`
#### `multiples` — *`Array` of numbers (or `AudioComponents`, or an `AudioComponent` that `generate()`s an `Array`) — setter: `_setMultiples` — default: `[1]`
Arrays of coefficients and multiples, respectively, to generate the spectrum components.  There will be as many spectrum components as the shorter of these two arrays; any array elements beyond that will be ignored.  There's nothing stopping you from using an `AudioComponent` that `generate()`s an array; if the number of spectrum components changes and there are no available phases, more phases will be added with random starting values.

#### `frequency` — *number (or `AudioComponent`) — default: `440`
The base frequency of the generator.  If one of the `multiples` is `1`, that's `frequency`.

#### `function` — *function* — setter: `_setFunction` — default: `null`
The function evaluated at every phase.  If it's `null`, the default function will be used, which is `Math.sin`.  You can't specify a different function for each spectrum component; the same function is used for all of them.

### Instance Methods

#### `_setupValues()`
When the setters for `phases`, `coeffs`, and `multiples` are called, they in turn call `_setupValues()`, which adds random phases to the `phases` array until there are enough for all of the spectrum components.

#### `getFunction()`
Returns the default function of this class.  Override it to set a different function.  The default for `InharmonicGenerator` is a sine.  The `function` property allows you to set the function on a per-`InharmonicGenerator` basis, while `getFunction()` allows you to set it on a per-subclass basis.  The reason it's an instance method and not a static method is because its subclasses can implement more complex functions with parameters controlled by properties.

#### `update()`
Calls `super.update()`, evaluates the `function` at the phases, and updates the phases, adding `multiples[i]`·`frequency`·`mspa`·π/500 to the phase, then resets it to be 0 ≤ `phase` < 2π.  Make sure to call `super.update()` in any subclasses if you override this method.




## FourierGenerator < InharmonicGenerator < Generator < AudioComponent < Component

An `InharmonicGenerator` where the `multiples` are the natural numbers, thus creating a harmonic spectrum.  If the `frequency` is f, then the spectrum components will be at f, 2f, 3f, 4f, etc.

### Properties

#### `multiples` — *`Array` of numbers* — setter: `null` — getter: `_getMultiples`
You can't set this property.  It is computed using `_getMultiples(<index>)`; it is simply an array of the natural numbers (beginning at 1) whose length is at least as large as the length of the value of `coeffs`.  If `coeffs` is an `AudioComponent` that `generate()`s an array whose length grows larger than the length of `multiples`, `multiples` will grow in response to match it, but it will not shrink.  `multiples` is initialized to `[]`.




## FourierSawtoothGenerator < FourierGenerator < InharmonicGenerator < Generator < AudioComponent < Component

A `FourierGenerator` where the coefficient for the spectrum component at frequency n·f (where f is the `frequency`) is 1/n, up to a number of `terms`.  Only odd components (n = 1, 3, 5, etc.) are nonzero if `isOddOnly` is `true`.

### Properties

#### `coeffs` — *`Array` of numbers* — setter: `null` — getter: `_getCoeffs`
You can't set this property.  It is computed using `terms` and `isOddOnly`, and it's always the array [1, 1/2, 1/3, 1/4, 1/5, ...] or [1, 0, 1/3, 0, 1/5, ...] depending on the value of `isOddOnly`.  Note that since `multiples` (in `FourierGenerator`) is computed based on `coeffs`, it's important that any reference to `multiples` is made *after* a reference to `coeffs`, since the property getter performs the calculation.

#### `isOddOnly` — *boolean (or 'AudioComponent') — default: `false`
Whether the Fourier expansion will contain only odd terms (which are at indices 0, 2, 4, ... in the `coeffs` array).

#### `terms` — *integer (or `AudioComponent`) — default: `5`
Number of terms of the Fourier expansion to use.  Note that `isOddOnly` doesn't change the number of terms; it just sets the even ones to 0.  If `terms` is `5` and `isOddOnly` is `true`, `coeffs` will be the array [1, 0, 1/3, 0, 1/5], which has 5 terms even though only 3 are nonzero.




## ShepardGenerator < InharmonicGenerator < Generator < AudioComponent < Component

Generates Shepard tones, which are sounds that have spectrum components in all octaves but where they fade out towards the top and bottom of that range, so as the frequency goes up, the top octave will fade out while the bottom octave fades in, and after the pitch has gone up by an octave, it's now exactly the same sound as it was before.  Shepard tones can keep going up (or down) forever.  If you specify a `ratio` other than 2, instead of the spectrum components being an octave apart, they will be at some other frequency ratio (though be aware that, as the ratio gets small, the processing power required to generate so many spectrum components gets pretty heavy.)  The frequencies go from C0 to C10, a span of 10 octaves (a factor of 1024).  Note that the array of phases can both grow and shrink if the number of `multiples` changes.

### Properties

#### `coeffs` — *`Array` of numbers* — setter: `null` — getter: `_getCoeffs`
#### `multiples` — *`Array` of numbers* — setter: `null` — getter: `_getMultiples`
You can't set these properties.  They are both computed whenever either getter is called, and if, from one time step to the next, the `frequency` changes such that a new spectrum component disappears off the top and appears at the bottom, with some tolerance, the phases are adjusted as well so that they are continuous and don't have a big click.

#### `ratio` — *number (or `AudioComponent`)* — default: `2`
The frequency ratio between spectrum components.  2 is an octave, but `ShepardGenerator` can generate Shepard-like tones using other ratios too!

#### `shepardFunction` — *function* — setter: `_setShepardFunction` — default: `null`
This function is evaluated at every spectrum component frequency to determine the `coeffs` array.  The argument is x = log(f/C0)/log(C10/C0), which is the fraction of the C0 - C10 spectrum that the `multiple`·`frequency` is at.  If it's null, the function returned by `getShepardFunction()` will be used instead.

### Instance Fields

#### `reducedFrequency` — *number*
The `frequency` divided by the `ratio` until C0 ≤ `reducedFrequency` < C0·`ratio`.  Any two notes with the same `reducedFrequency` will sound the same (provided the other parameters are also the same, naturally).

#### `lastFrequency` — *number*
#### `lastRatio` — *number*
#### `lastReducedFrequency` — *number*
Used to check whether anything has changed and therefore `multiples` needs to be recalculated (`coeffs` will be calculated regardless since it depends on the `shepardFunction`).  `lastReducedFrequency` is used to decide whether to shift/unshift the `phases`.

### Instance Methods

#### `_calculateParameters()`
If the `ratio` or `frequency` have changed, generates a `multiples` array and sets the `phases`, padding it with random values or removing extra ones, and shifting/unshifting `phases` if necessary to maintain continuity of phase in every spectrum component.  It gets called when both `_getCoeffs()` and `_getMultiples()`, the getters for `coeffs` and `multiples`, are called.

#### `_calculateCoeffs()`
Computes the array of `coeffs`, whether it is different from what's already there or not.  It's called by `_getCoeffs()` after `_calculateParameters()`.

#### `getShepardFunction()` — *function*
Returns the default `shepardFunction` for this class.  Override it if you want to return a different one in a subclass.  This function is f(x) = sin(πx), which, as x ranges from 0 to 1, starts at 0 at x = 0 (frequency C0), goes to 1 at x = 1/2 (frequency C5), and goes back to 0 at x = 1 (frequency C10).




## ShepardOctaveGenerator < ShepardGenerator < InharmonicGenerator < Generator < AudioComponent < Component

Produces a Shepard tone that can go higher and lower without changing its actual pitch by means of an `octaveParameter`, which chooses a part of the spectrum to emphasize.  This one is pretty computationally expensive.

### Properties

#### `octaveParameter` — *number (or `AudioComponent`)* — default: `4`
The part of the spectrum that is emphasized, in octaves above C0.  The default value of `4` represents Middle C on the piano, C4.

### Instance Fields

#### `a` — *number*
#### `b` — *number*
#### `c` — *number*
The numbers used in `getShepardFunction()`, cached for performance every `update()`.  `a` and `b` are as below; `c` = 10^10/((a^a)·(b^b)).

### Instance Methods

#### `getShepardFunction()` — *function*
Let a be the `octaveParameter` and b = 10 – a.  The parameter x goes from 0 (C0) to 1 (C10).  This function, then, is f(x) = [(x^a)·((1 – x)^b)·10^10/((a^a)·(b^b))]^0.8.




## ADSREnvelope < TimedComponent < Playable < AudioComponent < Component

A standard envelope with four linear phases, Attack, Decay, Sustain, and Release.  Calling `generate()` produces a value that begins at 0, rises linearly to `attackGain` over `attack` milliseconds (or beats of the `Timer`) during the Attack phase, decays linearly to 1 over `decay` milliseconds (or beats of the `Timer`) during the Decay phase, holds at 1 during the Sustain phase, decays linearly to 0 over `release` milliseconds (or beats of the `Timer`) during the Release phase, then calls `off()` on itself.  The Sustain phase continues indefinitely until `stop()` is called, at which point the Release phase begins.

### Properties

#### `isIndependent` — *boolean* — default: `false`
See the property description in `Playable`.  Note that the default value here is different.

#### `attack` — *number (or `AudioComponent`) — default: `10`
#### `decay` — *number (or `AudioComponent`) — default: `20`
#### `release` — *number (or `AudioComponent`) — default: `50`
The duration, in beats of the `Timer` (which are milliseconds by default), of the Attack, Decay, and Release phases, respectively.  Attack and Decay are responsible for the articulation of a tone; the `attack` duration specifically creates a hard attack when it's shorter and a soft attack when it's higher.  These phases are typically far too quick to hear individually, and they should probably be kept that way, but be aware that an attack that's too short (like, under 5 ms) might cause artifacts and clicking.

#### `attackGain` — *number (or `AudioComponent`) — default: `2`
How loud the attack is.  Combine with a longer `decay` for something that sounds like an accent.

### Instance Fields

#### `stopTime` — *number*
The `this._timer.time` — the current time of the `Timer` — at which `stop()` was called.  Note that `TimedComponent` also implements a `startTime`, which is the `Timer` time at which `play()` was called.

### Instance Methods

#### `_stop()`
Sets the `stopTime` but does not call `off()`.  `update()` is responsible for doing that after the Release phase is done.




## ExponentialEnvelope < TimedComponent < Playable < AudioComponent < Component

Creates an exponential curve from `startValue` to `endValue`.  It requires some sort of duration, whether that's the `duration` property or `endTime`, both in `TimedComponent`; this duration will default to `1000` if it's `null`, which is very likely not what you actually want (especially if your `timer` is not the `Global Timer`).  The value of the exponential curve can be given by Cr^(t/T), where C is `startValue`, r is `startValue`/`endValue`, t is the current time since starting, and T is the duration.  This is useful to, for example, move linearly in pitch space; if you move by two octaves, the first octave will take as much time as the second, in contrast with moving linearly, where the second octave takes twice as long as the first.

### Properties

#### `isIndependent` — *boolean* — default: `false`
See the property description in `Playable`.  Note that the default value here is different.

#### `startValue` — *number (or `AudioComponent`) — default: `1`
#### `endValue` — *number (or `AudioComponent`) — default: `2`
The start and end values.  If we think of them as parameters to the Cr^(t/T) function, we can understand what it means for them to change, but they probably shouldn't.




## LinearEnvelope < TimedComponent < Playable < AudioComponent < Component

Creates a line from `startValue` to `endValue`.  It requires some sort of duration, whether that's the `duration` property or `endTime`, both in `TimedComponent`; this duration will default to `1000` if it's `null`, which is very likely not what you actually want (especially if your `timer` is not the `Global Timer`).

### Properties

#### `isIndependent` — *boolean* — default: `false`
See the property description in `Playable`.  Note that the default value here is different.

#### `startValue` — *number (or `AudioComponent`) — default: `1`
#### `endValue` — *number (or `AudioComponent`) — default: `2`
The start and end values.





## Filter < Component

A `Filter` is conceptually just a function that takes a value and outputs a value, but the primary use case is to modify the sound of a `Tone`'s `generator` before it gets multiplied by the `envelope`, `gain`, and `amplifiers`.  `Filter` implements this function as the `_filter(<value>)` method, which, in this base class, only returns `<value>` itself.

### Properties

#### `nextFilter` — *`Filter`* — default: `null`
The value returned by this `Filter` will the be passed to the `nextFilter` before being returned.  This way you can create a `Filter` chain easily.

### Instance Methods

#### `filter(<value>)` — *number*
Performs the `Filter`'s `_filter<value>` function, then passes the result to the `nextFilter`.  You should call this method when you want to use a filter; you should probably not override it and instead override `_filter(<value>)` to implement a filter.

#### `_filter(<value>)` — *number*
Takes a numerical `<value>` and returns it.  You should probably override this in subclasses so that it actually does something useful instead.  Note that you are responsible for calling `filter(<value>)` only once per time step (or however often you want, I suppose); unlike `AudioComponent`, whose `generate()` method will call `update()` if necessary but will otherwise return the same value however often it's called within a given time step, `filter(<value>)` has no mechanism to ensure that things don't get called more or less often than you might expect.  In particular, if you have an implementation of `_filter(<value>)` that stores the previous value, and you call `filter<value>` twice in one time step, the previous value you saved in the first call will be overwritten (and, presumably, used) by the second.  In other words, different `Filter`-using `Component`s should use different `Filter` instances.





## CutoffFilter < Filter < Component

A `CutoffFilter` cuts off a signal's high and low points and brings them to the filter's `high` and `low` properties, respectively.  For, say, a sine wave, this would mean cutting off the peaks and valleys.  If `isNormalized` is `true`, then the signal is rescaled to be between –1 and 1.

### Properties

#### `low` — *number (or `AudioComponent`)* — default: `-1`
#### `high` — *number (or `AudioComponent`)* — default: `1`
The cutoff points; in `filter(<value>)`, if `<value>` is greater than `high` it's set to the value of `high`, and if it's less than `low` it's set to the value of `low`.

#### `isNormalized` — *boolean* — default: `true`
Whether the signal, once the high and low points are cut off, is rescaled such that the range is back to being from –1 to 1.




## LinearFilter < Filter < Component

A `LinearFilter` is a general IIR (infinite response) linear filter with a fairly naive implementation.  It implements the equation a0·y(0) + a1·y(–1) + a2·y(–2) + ... = b0·x(0) + b1·x(–1) + b2·x(–2) + ..., where the x's are the last several input values (x(0) being the current input) and the y's are the last several output values (y(0) being the current output, which is solved for).  Linear filters are useful in a large variety of applications.  The a's are the feedback coefficients (you probably want to make sure that a0 is nonzero) and the b's are the feedforward coefficients (you probably want to make sure that b0 is nonzero too, though that one at least won't blow up the filter).  Playing around with the filter's values might just not work because the filter could be unstable, so you might want to read up on filter design before you get too upset that you can't get a sound out.

### Properties

#### `feedbackCoeffs` — *`Array` of numbers (or `AudioComponents`, or an `AudioComponent` that `generate()`s an `Array`) — default: `[1]`
#### `feedforwardCoeffs` — *`Array` of numbers (or `AudioComponents`, or an `AudioComponent` that `generate()`s an `Array`) — default: `[1]`
The coefficients used in the filter.  Both arrays should have length > 0; `feedbackCoeffs`, in particular, should have a nonzero first element, since it's a0 in the equation above, and things get divided by a0 when solving.




## Score < Component

A `Score` contains definitions of `instruments` and a `mainSequence`, and it can essentially represent a piece of music.  You could, if you wanted to, make a file that represents a `Score`, then use the `Player` instance to create that `Score` and play it.  All of the code that actually represents any music would be in the score file.

### Properties

#### `instruments` — *`Array` of instrument definitions* — setter: `_setInstruments` — default: `[]`
An `Array` containing instrument definitions.  These get added to the `Orchestra` instance when the `Score` is instantiated.

#### `mainSequence` — *`Sequence`, but any `Playable` will do*
A `Sequence` executed by the `Score`, which can start other `Sequence`s if you want, but it serves as the entry point of the `Score`, where everything starts.




## Sequence < TimedComponent < Playable < AudioComponent < Component

A `Sequence` `execute()`s a sequence of `Action`s in time.  You can give it a `Timer` object (or just use the global millisecond timer; that's OK too) and an array of `Action`s to take, each with a specific `time`, and when that time comes (measured as time since `startTime`), any `Action`s whose `time` have passed are `execute()`d, which, depending on the `Action` subclass, could be creating and playing a `Tone`, setting a property, executing an arbitrary function, etc.  You can essentially put together a song using a `Sequence`.  `Sequence`s are `Playable` and have `isIndependent` set to `true` by default, which means that they're essentially root objects played by the `Player`.  Note that `Sequence`s have a time resolution of 1024/44100 seconds, since the audio buffer has 1024 samples and the sample rate is 44100 samples per second.  This comes out to about 23.2 ms, so if you need any more resolution than that, well, you can't get it.  This is not an issue for `Components`, since they go in the audio buffer when they're supposed to anyway, but if there are any other page features that depend on when stuff happens in a `Sequence`, like maybe an animation, you need to keep that resolution in mind.

### Properties

#### `actions` — *`Array` of `Action`s* — list: `true` — adder: `_addAction` — remover: `_removeAction` — removerName: `removeActions`
The `Action`s the `Sequence` will `execute()`.  The `Array` is always kept sorted by the `Action`'s `time`; when adding a new `Action`, `_addAction()` will check if it is at a later time than the last `Action` present; if so, it will add the new one right after it, but if not, it will check the next `Action` back from the end, all the way to the earliest `Action` in the array.  Therefore, it's more efficient to add actions in chronological order.

#### `isRepeating` — *boolean* — default: `false`
Whether the `Sequence` will repeat after `endTime`.

#### `removeExecutedActions` — *boolean* — default: `false`
Whether `Action`s should be removed after being `execute()`d.  You should probably not do this if the `Sequence` `isRepeating`, but for a long `Sequence` it could make sense to do this to keep memory costs down.




## Action < Component

An `Action` is a generic event that happens in a `Sequence` at a specified time.

### Properties

#### `time` — *number* — setter: `setTime` — default: `0`
Should probably not be an `AudioComponent`.  This is the time since a `Sequence`'s `startTime` at which the `Action` is triggered.  If you don't provide it, the default is time `0`, which is immediately unless something really funky is going on.  This number can't change; the `time` instance field is always a number (provided you gave it a numerical value or some `AudioComponent` that `generate()`d a number).  The setter doesn't do anything if the field has already been set.

### Instance Methods

#### `execute()`
Executes the action.  Doesn't do anything in this superclass.




## CreateAction < Action < Component

An `Action` that creates a `Component` and does nothing else with it.  Make sure your `component` has a `name` if you want to actually use it.

### Properties

#### `component` — *`Component` definition or an `Array` of them* — componentProperty: `false`
An object (or `Array` of objects) containing the definition of a `Component` instance, which, unlike most other properties in `Component` and its subclasses, don't immediately get built into actual `Component` instances until `execute()` is called.  Make sure you provide the `name` property or else you won't actually be able to use it!




## PlayableAction < Action < Component

An `Action` that creates a `Playable` and has the `Player` instance play it.  The `Playable` does not get created until `execute()` is called, so the same `PlayableAction` could be reused in a `Sequence` that `isRepeating` multiple times.

### Properties

#### `playable` — *`Playable` definition or an `Array` of them* — componentProperty: `false`
An object (or `Array` of objects) containing the definition of a `Playable` instance, which, unlike most other properties in `Component` and its subclasses, don't immediately get built into actual `Playable` instances until `execute()` is called; the `Playable` is then immediately played.




## FunctionAction < Action < Component

An `Action` that executes an arbitrary function with arbitrary arguments at the specified time, which is essentially a `setTimeout()` that uses the audio callback loop instead of whatever JS normally does.  Remember that `Sequence` has a resolution of about 23.2 ms, so whatever function you call might happen up to 23.2 ms earlier than you might expect.  This shouldn't be a big problem, as this is a bit more than 43 fps if you're scheduling animation frames in a `Sequence` (you definitely shouldn't directly draw things at the audio rate or you will sputter heavily, but you can always set some variable and have some non-audio process poll that variable to decide what to do).

### Properties

#### `executeFunction` — *function*
A function to apply.  Whichever function you supply will get `.apply(null, <arguments>)` called on it when `execute()` is called.  If you don't set this, `execute()` will do nothing at all.

#### `executeArguments` — *anything (or `Array` of anything)* — default: `undefined`
Arguments for the `executeFunction`.  Can be an array.




## ReferenceAction < Action < Component

An abstract `Action` that takes a `Component` reference.  `Action`s that do something with existing `Component`s should subclass `ReferenceAction`.

### Properties

#### `refName` — *string*
The `name` of the `Component` referenced.




## MethodAction < ReferenceAction < Action < Component

A `ReferenceAction` that calls a method on the referenced `Component`.

### Properties

#### `executeMethod` — *string*
The name of the method to apply.

#### `executeArguments` — *anything (or `Array` of anything)* — default: `undefined`
The arguments to apply in the method.  Can be an array.




## PropertyAction < ReferenceAction < Action < Component

A `ReferenceAction` that sets properties on the referenced `Component`.

### Properties

#### `properties` — *property object* — default: `{}` — componentProperty: `false`
The properties to set on the referenced `Component`.  In the property object, the keys are the property names and the values are the property values.  The properties don't actually get instantiated until `execute()` is called.
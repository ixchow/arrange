
### Mac OS X

```bash
npm install
./build.py
open index.html
```

## Loading
If we want to get something showing as soon as possible, would it make sense to attept to have a small subset of core start before body.onload() is called? Resources might then live in their own <script> blocks. Hmm.

## Scenes

### enter() [optional]
	called immediately when scene is made active

### leave() [optional]
	called immediately before scene is deactivated

### resize() [optional]
	called when canvas is resized while scene is active

### tick() [optional]
    called every engine.Tick seconds; possibly multiple times per frame. All calls to tick() for a frame will be made before a call to update().

### update(elapsed) [optional]
	called every frame; parameter is elapsed time in seconds

### draw()
	called every frame

### mouse(x, y, isDown) [optional]
  called when the mouse state changes

## Cutscene Script Actions

### appear:{x:,y:}
  set pawn's location to the parameter.

### vanish:null
  unset pawn's location. it will not be drawn. "say" actions will behave like "narrate" actions.

### wait:2.0 or wait:"signal"
  if called with a number, waits that number of seconds. called with a string, waits for a signal of that name to be set.

### emit:"signal"
  sets the given signal. signals are never unset

### say:"html"
  draws a dialog bubble with the given html over the pawn's head.

### narrate:"html"
  draws a bubble with the given html (not positioned relative to the pawn).

### walk:[{x:,y:},{x:,y:},...]
  walks through the given list of points. if the pawn is not visible, it will start at the first point. otherwise, it will start from its current location.

### do:function(){}
  Invoke an arbitrary function. The this pointer will be null.

## Tools

### play.js

Use this to test out music and synths.

```bash
./play.js music/gymnopedie.mml synths/bells.js
```


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

## Tools

### play.js

Use this to test out music and synths.

```bash
./play.js music/gymnopedie.mml synths/bells.js
```

Synth modules should export an object with two properties: "in" is a timbre
object that will receive note data, and "out" is a timbre object that will
be rendered to the audio device.

Other properties can be included in the exported object, and they will be
availble to the music module.

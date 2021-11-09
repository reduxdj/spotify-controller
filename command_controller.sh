#!/usr/bin/env node
const sc = require('./spotify_controller');
const apiHelp = () =>
  `
    Usage:
          <command>
            Commands:
              play                         # Resumes playback where Spotify last left off.
              play <album|playlist|track>  # Plays a song, album, or playlist by URI or URL
              next                         # Skips to the next song in a playlist.
              prev                         # Returns to the previous song in a playlist.
              replay                       # Replays the current track from the beginning.
              pos <time>                   # Jumps to a time (in secs) in the current song.
              pause                        # Pauses (or resumes) Spotify playback.
              stop                         # Stops playback.
              vol <amount>                 # Sets the volume to an amount between 0 and 100.
              info                         # Shows Info about the current track.
              toggle shuffle               # Toggles shuffle playback mode.
              toggle repeat                # Toggles repeat playback mode.
              help                         # Shows help.

            **  The following commands only worth with Audiou Hijack Pro, which only runs on Yoesmeite 10.10
              record <album|playlist|track> # Records a song, album, or playlist by URI or URL
              `;

const isCommandLine = require.main.filename.includes('command_controller.sh')
async function start() {
    if (isCommandLine) {
      const [arg1, arg2, arg3] = process.argv.slice(2);
      if (arg1 === 'record') {
        if (arg3) {
            await sc.record(arg3, arg2);
        } else if (arg2) {
            await sc.record(arg2);
        } else {
            await sc.record();
        }
      }

      if (arg1 === 'play') {
        if (arg3) {
            await sc.play(arg3, arg2);
        } else if (arg2) {
            await sc.play(arg2);
        } else {
            await sc.play();
        }
      }
      if (arg1 === 'vol') {
          if (arg2) {
              console.log(await sc.setCurrentVolume((arg2)));
          } else {
              console.log(await sc.getCurrentVolume());
          }

      }
      if (arg1 === 'info'){
        console.log(await sc.getCurrentTrackInfo());
      }
      if (arg1 === 'toggle') {
          if (arg2 === 'shuffle') await sc.shuffle();
          if (arg1 === 'repeat') await sc.repeat();
      }
      if (arg1 === 'pos') {
         await  sc.setPosition(arg2)
      }
      if (arg1 === 'stop'){
          await sc.stop();
      }
      if (arg1 === 'help'){
          console.log(apiHelp())
      }
      if (arg1 === 'next'){
          sc.next()
      }
      if (arg1 === 'prev'){
          await sc.setPosition(0);
          await sc.previous();
      }
      if (arg1 === 'replay'){
          await sc.previous();
          await sc.setPosition(0);
      }
    }
}
if (isCommandLine)start();

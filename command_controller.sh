#!/usr/bin/env node
const sc = require('./spotify_controller');
const apiHelp = () =>
  `
    Usage:
          <command>
            Commands:
              play                         # Resumes playback where Spotify last left off.
              play <URL|spotify URI>             # Finds a song by name and plays it.
              play album <album name>      # Finds an album by name and plays it.
              play artist <artist name>    # Finds an artist by name and plays it.
              play list <playlist name>    # Finds a playlist by name and plays it.
              next                         # Skips to the next song in a playlist.
              prev                         # Returns to the previous song in a playlist.
              replay                       # Replays the current track from the beginning.
              pos <time>                   # Jumps to a time (in secs) in the current song.
              pause                        # Pauses (or resumes) Spotify playback.
              stop                         # Stops playback.
              quit                         # Stops playback and quits Spotify.
              vol up                       # Increases the volume by 10%.
              vol down                     # Decreases the volume by 10%.
              vol <amount>                 # Sets the volume to an amount between 0 and 100.
              vol [show]                   # Shows the current Spotify volume.";
              status                       # Shows the current player status.
              info                         # Shows Info about the current track.
              toggle shuffle               # Toggles shuffle playback mode.
              toggle repeat                # Toggles repeat playback mode.
              help                         # Shows help.`;

const isCommandLine = require.main.filename.includes('command_controller.sh')
async function start() {
    if (isCommandLine) {
      const [arg1, arg2, arg3] = process.argv.slice(2);
      if (arg1 === 'play') {
        if (arg3) {
            await sc.play(arg3, arg3);
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
          sc.previous();
      }
      if (arg1 === 'replay'){
          sc.previous();
          sc.setPosition(0);
      }
    }
}
if (isCommandLine)start();

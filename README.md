###Spotify Controller uses apple script to communicate with Spotify in NodeJs.

There's two ways to use this, A) ia the command line or B) import into your own
node app. Start spotify

Getting Started
`npm install`

A) Example `./command_controller.sh help`

```
Usage:
      <command>
        Commands:
          play                         # Resumes playback where Spotify last left off.
          play <song name>             # Finds a song by name and plays it.
          play album <album name>      # Finds an album by name and plays it.
          play artist <artist name>    # Finds an artist by name and plays it.
          play list <playlist name>    # Finds a playlist by name and plays it.
          play uri <uri>               # Play songs from specific uri.
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
          help                         # Shows help.
```

B) Use the class in your own node app and use the class methods directly

```
const a = new SpotifyController();
a.play('https://open.spotify.com/track/7MRyJPksH3G2cXHN8UKYzP?si=d2c89a7b5c6a4724');
```

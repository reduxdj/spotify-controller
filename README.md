# Spotify Controller

## Uses apple script to communicate with Spotify from NodeJs.

## There's two ways to use this:

- A) via the command line or
- B) import into your own nodeJS app.

Getting Started:
`npm install`

## A) To interact with spotify from the Command Line, play record etc... (see below)

To call the API which is used for some extended functions, set your environment variables for your client and secret
`CLIENT_ID=<Your Client Id> CLIENT_SECRET=<Your Secret> ./command_controller.sh help`

The app should work without your app creds, but some functionality won't be available.
To obtain a client and secret visit: https://developer.spotify.com/

```

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
        **  The following commands only worth with Audio Hijack Pro, which only runs on Yoesmeite 10.10
          record <album|playlist|track> # Records a song, album, or playlist by URI or URL
```

## B) Use the class in your own node app and use the class instance methods directly

```
const a = new SpotifyController();
a.play('https://open.spotify.com/track/7MRyJPksH3G2cXHN8UKYzP?si=d2c89a7b5c6a4724');
```

const { transformFromObjectToStringAndStripQuotes } = require('./utils');

const AAC_SETTINGS = { encoding: 'AAC', bitRate: 256, channels: 'Stereo' };
const MP3_SETTINGS = { encoding: 'MP3', bitRate: 256, channels: 'Stereo', style: 'VBR' };

const getSession = () =>
  `-- Set Spotify session in Audio Hijack Pro
    on getSession()
    	tell application "Audio Hijack Pro"
    		set sessionName to "Spotify"
    		try
    			set theSession to (first item of (every session whose name is sessionName))
    			theSession is not null
    		on error
    			set theSession to (make new application session at end of sessions)
    			set name of theSession to sessionName
    		end try
    	end tell
    	return theSession
    end getSession`;

const initiateRecording = (outputFolder, outputSettings = AAC_SETTINGS) =>
  `
  ${getSession()}
    tell application "Audio Hijack Pro"
    	activate
    	set theSession to my ${getSession()}
    	tell theSession
    		-- Recording file settings
    		set output folder to ${outputFolder}
    		set output name format to "%tag_title"
    		set title tag to track_counter
    		-- Audio format settings
    		set recording format to \`${transformFromObjectToStringAndStripQuotes(outputSettings)}\`
    	end tell

    	if hijacked of theSession is false then start hijacking theSession
    	start recording theSession
    end tell`;

const splitRecording = (sessionName) =>
  `tell application "Audio Hijack Pro"
	    tell ${sessionName}
			set title tag to track_counter
			split recording
		end tell
	end tell`;

module.exports = {
  initiateRecording,
  splitRecording,
  getSession,
};

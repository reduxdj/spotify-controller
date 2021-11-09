const { transformFromObjectToStringAndStripQuotes } = require('./utils');

const AAC_SETTINGS = { encoding: 'AAC', bitRate: 256, channels: 'Stereo' };
const MP3_SETTINGS = { encoding: 'MP3', bitRate: 256, channels: 'Stereo', style: 'VBR' };

const getSession = () =>
  `on getSession()
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

const initiateRecording = ({ title, artist, id } = { title : 'test', artist : 'test'}, outputFolder = "/Users/mini/music_archive", outputSettings = AAC_SETTINGS) =>
`property file_extension : ".${outputSettings.encoding === 'ACC' ? 'm4a' :  'mp3'}"
 tell application "Audio Hijack Pro"
	activate
	set theSession to my getSession()
  	tell theSession
       set folder_path to POSIX path of "${outputFolder}"
  	   set output folder to folder_path
  	   set output name format to "%tag_title"
       set title tag to "${id}"
	     set recording format to ${transformFromObjectToStringAndStripQuotes(outputSettings)}
       if hijacked of theSession is false then start hijacking theSession
  	   if recording of theSession is false then start recording theSession
  	end tell
  end tell
${getSession()}`;

const isRecording = () =>
  `tell application "Audio Hijack Pro"
    activate
    set info to false
    set theSession to my getSession()
    if hijacked of theSession is true
      set info to true
    end if
    return info
  end tell
  ${getSession()}
  `

const stopRecording = () => `
tell application "Audio Hijack Pro"
	  set theSession to first session whose name is "Spotify"
  	tell theSession
      stop recording theSession
      stop hijacking theSession
  	end tell
    return theSession
  end tell
  ${getSession()}
`

const splitRecording = ({title, artist, id} = {}) =>
  `tell application "Audio Hijack Pro"
      set theSession to my getSession()
      tell theSession
			   set title tag to "${id}"
         split recording
      end tell
	 end tell
   ${getSession()}
   `;

module.exports = {
  initiateRecording,
  isRecording,
  splitRecording,
  stopRecording,
  getSession,
};

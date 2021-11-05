const util = require('util');

const getTrackInfo = () => `tell application "Spotify"
    set durSec to (duration of current track / 1000)
    set tM to (round (durSec / 60) rounding down) as text
    if length of ((durSec mod 60 div 1) as text) is greater than 1 then
        set tS to (durSec mod 60 div 1) as text
    else
        set tS to ("0" & (durSec mod 60 div 1)) as text
    end if
    set myTime to tM as text & "min " & tS as text & "s"
    set pos to player position
    set nM to (round (pos / 60) rounding down) as text
    if length of ((round (pos mod 60) rounding down) as text) is greater than 1 then
        set nS to (round (pos mod 60) rounding down) as text
    else
        set nS to ("0" & (round (pos mod 60) rounding down)) as text
    end if
    set nowAt to nM as text & "min " & nS as text & "s"
    set info to "" & "artist=" & artist of current track
    set info to info & "&track=" & name of current track
    set info to info & "&albumArtist=" & album artist of current track
    set info to info & "&album=" & album of current track
    set info to info & "&durationSeconds=" & durSec
    set info to info & "&ellapsed=" & pos
    set info to info & "&duration=" & mytime
    set info to info & "&nowAt=" & nowAt
    set info to info & "&playedCount=" & played count of current track
    set info to info & "&trackNumber=" & track number of current track
    set info to info & "&popluarity=" & popularity of current track
    set info to info & "&id=" & id of current track
    set info to info & "&url=" & spotify url of current track
    set info to info & "&artwork=" & artwork url of current track
    set info to info & "&playerState=" & player state
    set info to info & "&volume=" & sound volume
    set info to info & "&shuffling=" & shuffling
    set info to info & "&repeating=" & repeating
end tell`;

const transformFromObjectToStringAndStripQuotes = (obj) => util.inspect(o).replace(/bitRate/g, 'bit rate');

const parsePrimitive = (s = '') => {
  if (s.match(/^\d*(\.\d+)?$/)) return Number(s);
  if (s === 'true' || s === 'false') return Boolean(s);
  return s;
};

const delay = (int) => new Promise((resolve) => setTimeout(() => resolve()), int);

const infoToTag = ({ album, title, artist, durationSeconds }) => {
  return { album, title: track, album, time: durationSeconds };
};

const parseQuery = (query = '') => {
  return query
    .split('&')
    .map((item) => ({ [item.split('=')[0]]: parsePrimitive(item.split('=')[1]) }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
};

const parseSpotifyUrl = (url = '') => {
  const uri = url
    .replace(/https:\/\//g, '')
    .replace(/\?si=\d+/)
    .replace(/\?si=\w+/, '');
  const parts = uri.split('/');
  return { id: parts[2], type: parts[1] };
};

module.exports = {
  getTrackInfo,
  parseQuery,
  parseSpotifyUrl,
  transformFromObjectToStringAndStripQuotes,
};

const axios = require('axios');
const Buffer = require('buffer').Buffer;
const childProcess = require('child_process');
const nodeID3 = require('node-id3').Promise;
const util = require('util');
const { delay, getTrackInfo, parsePrimitive, parseSpotifyUrl, parseQuery } = require('./utils');
const { initiateRecording, isRecording, splitRecording, stopRecording, getSession } = require('./hijack_utils');
const process = require('process');

const WRITE_DELAY = 2;
const INTERVAL = 5;
const STOP_DELAY = 2;
const VOL_INCREMENT = 10;
const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER || '/Users/mini/music_archive';

const ALBUM_MAP = {};
const PLAYLIST_MAP = {};

class SpotifyController {
  _playerState = '';
  _audioHijackSession = '';
  constructor() {
    if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) this.setApiToken();
  }
  async send(command) {
    return new Promise((resolve, reject) => {
      try {
        // console.log("Sending command", command)
        childProcess.exec(`osascript -e '${command}'`, (err, standardOut, standardErr) => {
          if (err) reject(err);
          if (standardErr) reject(err);
          resolve(standardOut.trim());
        });
      } catch (err) {
        console.log('Err', err);
        throw err;
      }
    });
  }
  _interval = null;
  setInterval(f, intSeconds) {
    clearInterval(this._interval);
    this._interval = setTimeout(() => {
      f();
    }, intSeconds * 1000);
    return delay(intSeconds);
  }
  async clearInterval(intervalId) {
    clearTimeout(intervalId);
  }

  async getPlayerState() {
    this._playerState = await this.send('tell application "Spotify" to player state as string');
    return this._playerState;
  }

  async pause() {
    return this.send('tell application "Spotify" to playpause');
  }

  parseUrl(item) {
    return parseSpotifyUrl(item);
  }

  async getTrackInfoForContextType(id, type, trackIndex = 0) {
    let results = [];
    if (type === 'playlist' && !PLAYLIST_MAP[id]) {
      results = await this.get(`https://api.spotify.com/v1/playlists/${id}/tracks`);
      PLAYLIST_MAP[id] = { trackIndex, ...results };
      return PLAYLIST_MAP[id].items[0].track.id;
    } else if (type === 'playlist' && PLAYLIST_MAP[id]) {
      return PLAYLIST_MAP[id].items[trackIndex].track.id;
    } else if (type === 'album' && !ALBUM_MAP[id]) {
      results = await this.get(`https://api.spotify.com/v1/albums/${id}/tracks`);
      ALBUM_MAP[id] = { trackIndex, ...results };
      return ALBUM_MAP[id].items[trackIndex].id;
    } else if (type === 'playlist' && ALBUM_MAP[id]) {
      return ALBUM_MAP[id].items[trackIndex].id;
    }
  }

  async playItemInContext(id, type, trackIndex) {
    const context = `in context "spotify:${type}/${id}"`;
    const result = await this.getTrackInfoForContextType(id, type);
    if (trackIndex === 0) await this.send(`open location "spotify:${type}/${id}"`);
    // if (type === 'playlist') return this.send(`tell application "Spotify" to play track in "spotify:${type === 'album' ? 'album' : 'track'}:${result}" ${context}`);
    return this.send(`tell application "Spotify" to play track "spotify:playlist:${id}"`);
    return this.send(`tell application "Spotify" to play track "spotify:album:${id}"`);
  }

  async play(item) {
    const playerState = await this.getPlayerState();
    let trackInfo;
    let currentItem;
    try {
      trackInfo = await this.getCurrentTrackInfo();
    } catch (err) {
      console.log(err);
    }
    const { type = itemType, id } = this.parseUrl(item);
    if (item && trackInfo) {
      // We are in first track
      const { track, ...rest } = trackInfo;
      currentItem = this.parseUrl(rest.id);
      if (currentItem === id && (type !== 'playlist' || type !== 'album')) {
        await this.send('tell application "Spotify" to play');
      } else if (type === 'playlist') {
        await this.playItemInContext(id, 'playlist');
      } else if (type === 'album') {
        await this.playItemInContext(id, 'album');
      }
      return { track, ...rest };
    } else if (type === 'playlist') {
      const info = parseSpotifyUrl(item);
      await this.playItemInContext(info.id, 'playlist');
      await delay(1);
      trackInfo = await this.getCurrentTrackInfo();
      return { ...trackInfo };
    } else if (type === 'album') {
      const info = parseSpotifyUrl(item);
      await this.playItemInContext(info.id, 'album');
      await delay(1);
      return { ...trackInfo };
    } else {
      await this.send('tell application "Spotify" to play');
      await delay(1);
      return { ...(await this.getCurrentTrackInfo()) };
    }
  }

  _token;
  _expiration;
  setToken(data) {
    this._token = data.access_token;
    this._expiration = Date.now() + data.expires_in * 1000;
  }
  _currentTrackInfo = {};
  async getCurrentTrackInfo(outputToConsole) {
    this._currentTrackInfo = parseQuery(await this.send(getTrackInfo()));
    if (outputToConsole) console.log(this._currentTrackInfo);
    return this._currentTrackInfo;
  }

  async getCurrentVolume() {
    return this.send('tell application "Spotify" to sound volume as integer');
  }

  async setCurrentVolume(vol) {
    return this.send(`tell application "Spotify" to set sound volume to ${vol}`);
  }
  async volUp() {
    const { volume } = parseQuery(await this.send(getTrackInfo()));
    return this.setCurrentVolume(volume < 100 ? (volume += VOL_INCREMENT) : volume);
  }

  async volDown() {
    const { volume } = parseQuery(await this.send(getTrackInfo()));
    return this.setCurrentVolume(volume < 100 ? (volume -= VOL_INCREMENT) : volume);
  }

  async next() {
    return this.send('tell application "Spotify" to next track');
  }

  async previous() {
    return this.send('tell application "Spotify" to previous track');
  }

  async setPosition(pos) {
    return this.send(`tell application \"Spotify\" to set player position to ${pos}`);
  }

  async getPosition() {
    const result = parseQuery(await this.send(getTrackInfo()));
    return result.durationSeconds - result.ellapsed;
  }

  async shuffle() {
    const shuffle = await this.send('tell application "Spotify" to shuffle');
    const not = shuffle ? 'not' : '';
  }

  async repeat() {
    const repeating = await this.send('tell application "Spotify" to repeating');
    const not = repeating ? 'not' : '';
    return this.send(`tell application "Spotify" to ${not} repeating`);
  }

  async stop() {
    return this.send(`tell application \"Spotify\" to stop`);
  }

  async record(track) {
    const isRecordingSession = (await this.send(await isRecording())) !== 'false';
    console.log('Audio-Hijack recording...', isRecordingSession);
    const currentTrackInfo = track ? await this.play(track) : await this.getCurrentTrackInfo().then(info => this.play(info.id));
    console.log('current Track Info', currentTrackInfo, track);
    if (isRecordingSession) {
      await stopRecording(currentTrackInfo);
      console.log('Audio-Hijack recording stopping and restarting...');
      if (isRecordingSession) console.log(await this.send(stopRecording(currentTrackInfo)));
      if (currentTrackInfo.ellapsed > 0) await this.setPosition(0);
    }
    await this.send(await initiateRecording(currentTrackInfo, OUTPUT_FOLDER));
    this.setInterval(() => this.checkTrack(false), Math.floor(currentTrackInfo.durationSeconds - 3));
  }

  async writeTag(tag) {
    const success = await nodeID3.write(tag, filePath);
    console.log(success);
    return success;
  }

  async checkTrack(outputToConsole) {
    const currentTrackInfo = this._currentTrackInfo;
    const trackInfo = await this.getCurrentTrackInfo(outputToConsole);
    const { durationSeconds, ellapsed } = trackInfo;
    if (durationSeconds - ellapsed < 1.5) {
      console.log('splitting track');
      await delay(WRITE_DELAY);
      this.clearInterval(this._interval);
      await this.send(splitRecording(currentTrackInfo));
      await this.next();
      const nextTrackInfo = await this.getCurrentTrackInfo(outputToConsole);
      return this.record(nextTrackInfo.id, 'track');
    } else if (durationSeconds - ellapsed < 3) {
      await this.setInterval(() => this.checkTrack(outputToConsole), 0.1);
    }
  }

  async setApiToken() {
    return axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      data: 'grant_type=client_credentials',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
      },
    })
      .then(response => this.setToken(response.data))
      .catch(e => console.log(e));
  }

  get(url, data) {
    return axios({
      url,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._token}`,
      },
    })
      .then(({ data }) => data)
      .catch(e => console.log(e));
  }

  post(url, data) {
    return axios({
      url,
      method: 'post',
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._token}`,
      },
    })
      .then(response => this.setToken(response.data))
      .catch(e => console.log(e));
  }
}

const a = new SpotifyController();
// a.play('https://open.spotify.com/track/7MRyJPksH3G2cXHN8UKYzP?si=d2c89a7b5c6a4724');
module.exports = a;

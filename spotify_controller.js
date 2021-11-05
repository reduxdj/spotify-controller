const axios = require('axios');
const Buffer = require('buffer').Buffer;
const childProcess = require('child_process');
const nodeID3 = require('node-id3').Promise;
const util = require('util');
const { getTrackInfo, parsePrimitive, parseSpotifyUrl, parseQuery } = require('./utils');
const { initiateRecording, splitRecording, getSession } = require('./hijack_utils');
const process = require('process');

const WRITE_DELAY = 2;
const INTERVAL = 0.1;
const STOP_DELAY = 2;
const VOL_INCREMENT = 10;

class SpotifyController {
  _playerState = '';
  constructor() {
    if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) this.setApiToken();
  }
  async send(command) {
    try {
      return new Promise((resolve, reject) => {
        childProcess.exec(`osascript -e '${command}'`, (err, standardOut, standardErr) => {
          if (err) reject(err);
          if (standardErr) reject(err);
          resolve(standardOut.trim());
        });
      });
    } catch (err) {
      console.log('Err', err);
    }
  }
  _interval = null;
  setInterval(f, intSeconds) {
    this._interval = setInterval(f, intSeconds * 1000);
  }
  clearInteval() {
    this.clearInterval(_interval);
  }

  async getPlayerState() {
    this._playerState = await this.send('tell application "Spotify" to player state as string');
    return this._playerState;
  }

  async pause() {
    return this.send('tell application "Spotify" to playpause');
  }

  async play(item, itemType = 'track') {
    const playerState = await this.getPlayerState();
    if (playerState === 'playing' && !item) await this.pause();
    if (item) {
      const { type = itemType, id } = parseSpotifyUrl(item);
      await this.send(`tell application "Spotify" to play track "spotify:${type}:${id}"`);
    } else {
      await this.send('tell application "Spotify" to play');
    }
    const { track } = await this.getCurrentTrackInfo();
    console.log('playing...', itemType, track);
  }

  _token = {};
  setToken(t) {
    this._token = t;
  }
  _currentTrackInfo = {};
  async getCurrentTrackInfo() {
    this._currentTrackInfo = parseQuery(await this.send(getTrackInfo()));
    console.log(this._currentTrackInfo);
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
    return this.send(`tell application \"Spotify\" to set player position to ${pos}`);
  }

  async record(track, type = 'track') {
    await this.send(await initiateRecording());
    return this.play(ite);
  }

  async recordPlaylist() {
    return this.send(await initiateRecording());
  }

  async writeTag() {
    const success = await nodeID3.write(tag, filePath);
    console.log(success);
    return success;
  }

  async checkTrack() {
    const trackInfo = await this.getTrackInfo();
    const { durationSeconds, ellapsed } = trackInfo;
    if (duration < 0.1) {
      await delay(WRITE_DELAY);
      await this.send(splitRecording());
      this.stop();
    }
  }

  async setApiToken() {
    return axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      data: 'grant_type=client_credentials',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
      },
    })
      .then((response) => this.setToken(response.data))
      .catch((e) => console.log(e));
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
      .then((response) => this.setToken(response.data))
      .catch((e) => console.log(e));
  }
}

const a = new SpotifyController();
// a.play('https://open.spotify.com/track/7MRyJPksH3G2cXHN8UKYzP?si=d2c89a7b5c6a4724');
module.exports = a;

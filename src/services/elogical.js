import axios from "axios";
import AES from "crypto-js/aes";

const API_URL = process.env.VUE_APP_API_URL;
const JWTName = "eLogicalAuthJWT";

const store = window.localStorage;

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || "12345";
const ENCRYPT = false;// process.env.NODE_ENV === "production";

class ElogicalApi {
  /**
   * @returns {Promise<{token: String, user: String}>}
   */
  authenticate() {
    return new Promise(((resolve, reject) => {
      const token = this.getToken();
      const username = this.getUser();
      const axiosOptions = {
        baseURL: API_URL,
        timeout: 10000,
        headers: {encrypted: ENCRYPT ? "1" : "0"},
        transformRequest: [function (data, headers) {
          if (data && ENCRYPT) {
            return {data: AES.encrypt(JSON.stringify(data), ENCRYPT_KEY).toString()};
          }
          return data;
        }, ...axios.defaults.transformRequest],
      };

      if (!token) {
        this.createUser()
          .then(response => {
            store.setItem(JWTName, response.data.client);
            store.setItem("username", response.data.name);
            axiosOptions.headers.authorization = `Bearer ${this.getToken()}`;
            this.axios = axios.create(axiosOptions);
            resolve({token: this.getToken(), user: this.getUser()});
          })
          .catch(reject);
      } else {
        axiosOptions.headers.authorization = `Bearer ${this.getToken()}`;
        this.axios = axios.create(axiosOptions);
        resolve({token, username});
      }
    }));
  }

  /**
   * @returns {Promise<AxiosResponse<{username: String, token: String}>>}
   * @static
   */
  createUser() {
    return axios.post(`${API_URL}/auth`);
  }

  /**
   * @returns {Promise<AxiosResponse<T>>}
   */
  getLeaderBoard() {
    return this.axios.get(`${API_URL}/client/top`);
  }

  /**
   * @returns {Promise<AxiosResponse<T>>}
   */
  getStats() {
    return this.axios.get(`${API_URL}/client/stats`);
  }

  /**
   * @param {Object} data
   * @returns {Promise<AxiosResponse<T>>}
   */
  saveAnswer(data) {
    return this.axios.post(`${API_URL}/answer`, data);
  }

  /**
   * @returns {Promise<AxiosResponse<T>>}
   */
  getTracker() {
    return this.axios.get(`${API_URL}/tracker`);
  }

  /**
   * @returns {string}
   */
  getUser() {
    return store.getItem("username");
  }

  /**
   * @returns {string}
   */
  getToken() {
    return store.getItem(JWTName);
  }

  /**
   * Posts tracking data to the server. Optionally the startTime can be provided
   * and the timespan is also calculated and posted to the server until right now.
   * @param {Date} [starTime]
   * @param {Object} data
   * @returns {Promise<AxiosResponse<T>>}
   */
  saveTrack({starTime, data}) {
    if (localStorage.trackingAllowed === "true") {
      if (starTime) {
        data.levelTime = Math.abs(starTime - new Date());
      }
      return this.axios.post(`${API_URL}/tracker`, data);
    }
    return new Promise(resolve => {
      window.console.info(data);
      resolve();
    });
  }
}

export {ElogicalApi};
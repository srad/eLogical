import axios from "axios";
import AES from "crypto-js/aes";

const API_URL = process.env.VUE_APP_API_URL;
const JWTName = "eLogicalAuthJWT";

const store = window.localStorage;

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || "12345";
const ENCRYPT = false;//process.env.NODE_ENV === "production";

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
}

export {ElogicalApi};
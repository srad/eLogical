import axios from "axios";

const API_URL = process.env.VUE_APP_API_URL;
const JWTName = "eLogicalAuthJWT";

const store = window.localStorage;

class ElogicalApi {
  /**
   * @returns {Promise<String>}
   */
  authenticate() {
    return new Promise(((resolve, reject) => {
      const token = this.getToken();
      const username = this.getUser();

      if (!token) {
        this.createUser()
          .then(response => {
            store.setItem(JWTName, response.data.client);
            store.setItem("username", response.data.name);
            this.axios = axios.create({
              baseURL: API_URL,
              timeout: 10000,
              headers: {authorization: `Bearer ${token}`},
            });
            resolve({token: this.getToken(), user: this.getUser()});
          })
          .catch(reject);
      } else {
        this.axios = axios.create({
          baseURL: API_URL,
          timeout: 10000,
          headers: {authorization: `Bearer ${token}`},
        });
        resolve({token, username});
      }
    }));
  }

  /**
   * @returns {Promise<AxiosResponse<{username: String, token: String}>>}
   * @static
   */
  createUser() {
    const URL = `${API_URL}/auth`;
    return axios.post(URL);
  }

  /**
   * @returns {Promise<AxiosResponse<T>>}
   */
  getLeaderBoard() {
    const url = `${API_URL}/client/top`;
    return this.axios.get(url);
  }

  /**
   * @param {Object} data
   * @returns {Promise<AxiosResponse<T>>}
   */
  saveAnswer(data) {
    const url = `${API_URL}/answer`;
    return this.axios.post(url, data);
  }

  getUser() {
    return store.getItem("username");
  }

  getToken() {
    return store.getItem(JWTName);
  }
}

export {ElogicalApi};
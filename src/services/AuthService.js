import axios from "axios"
import handleError from "./ErrorHandlerService";

var API_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";
const JWTName = "eLogicalAuthJWT";

export class AuthService {
  constructor() { }


  checkToken(callback) {
    var currJWT = window.localStorage.getItem(JWTName);
    if (currJWT == undefined) {
      return this.requestToken(callback);
    }
    else {
      // If a experation timer is set for the tokens it can be checked here.
      return callback();
    }
  }


  requestToken(callback) {
    const url = `${API_URL}/auth`;
    return axios.get(url).then(function (response) {
      window.localStorage.setItem(JWTName, response.data);
      return callback();
    }).catch(error => handleError(error));
  }


  getAuthHeader(callback) {
    return this.checkToken(function () {
      var authHeader = {
        authorization: `Bearer ${window.localStorage.getItem(JWTName)}`,
      };
      return callback(authHeader);
    });
  }




}

export default new AuthService;

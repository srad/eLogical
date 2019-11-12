import axios from "axios"

var API_URL = process.env.SERVER_IP || "http://localhost:3000"; // TODO: env not working
const JWTName = "eLogicalAuthJWT";

export class AuthService {
  constructor() { }

  checkToken() {
    var currJWT = window.localStorage.getItem(JWTName);
    if (currJWT == undefined) {
      this.requestToken();
    }
    else {
      // If a experation timer is set for the tokens it can be checked here.
    }
  }

  requestToken() {
    const url = `${API_URL}/auth`;
    axios.get(url).then(response => window.localStorage.setItem(JWTName, response.data));
  }

  getAuthHeader() {
    this.checkToken(); // Needs to wait for new token
    var authHeader = {
      authorization : `Bearer ${window.localStorage.getItem(JWTName)}`,
    };
    return authHeader
  }




}

export default new AuthService;

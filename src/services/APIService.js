import axios from "axios"
import AuthService from "./AuthService";
import handleError from "./ErrorHandlerService";

var API_URL = process.env.VUE_APP_API_URL || "http://localhost:3000";

export class APIService {
  constructor() { }

  getLeaderboardEntries() {
    var url = `${API_URL}/client/leaderboard`;
    var promise = AuthService.getAuthHeader(function (authHeader) {
      return axios.get(url, { headers: authHeader }).then(response => response.data).catch(error => handleError(error));
    });
    return promise;
  }


  // getLeaderboardEntries(){
  //   var url = `${API_URL}/client/leaderboard`;
  //   var leaderboard = AuthService.getAuthHeader( function (authHeader) {
  //     console.log("getLeaderboard - authHeader: " + JSON.stringify(authHeader));
  //     var data =  axios.get(url, {headers: authHeader}).then(response => response.data);
  //     console.log("getLeaderboard - data: " + JSON.stringify(data));
  //   });
  //   console.log("getLeaderboard - leaderboard: " + JSON.stringify(leaderboard));
  //   return leaderboard;
  // }


  // addLeaderboardEntries(namePar, pointsPar){
  //   const url = `${API_URL}/leaderboard`;
  //   var data = {"name": namePar, "points":pointsPar};
  //   return axios.post(url, data).then(response => response.data);
  // }
}

export default new APIService;

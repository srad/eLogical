import axios from "axios"
import AuthService from "./AuthService";

var API_URL = process.env.SERVER_IP || "http://localhost:3000"; // TODO: env not working

export class APIService{
  constructor(){}  

  getLeaderboardEntries(){
    const url = `${API_URL}/client/leaderboard`;
    var authHeader = AuthService.getAuthHeader();
    return  axios.get(url, {headers: authHeader}).then(response => response.data);
  }

  // addLeaderboardEntries(namePar, pointsPar){
  //   const url = `${API_URL}/leaderboard`;
  //   var data = {"name": namePar, "points":pointsPar};
  //   return axios.post(url, data).then(response => response.data);
  // }


}

export default new APIService;

import axios from "axios"

var API_URL = process.env.SERVER_IP || "http://localhost:3000"; // TODO: env not working


var axiosOptions = {
  headers: {
    Authentication: `Bearer ${window.localStorage.getItem("JWT")}`,
  }}

export class APIService{
  constructor(){}

  

  requestToken(){
    const url = `${API_URL}/client/token`;
    axios.get(url, ).then(response => window.localStorage.setItem("JWT", response.data));
  }

  getLeaderboardEntries(){
    const url = `${API_URL}/client/leaderboard`;
    return  axios.get(url, axiosOptions).then(response => response.data);
  }

  addLeaderboardEntries(namePar, pointsPar){
    const url = `${API_URL}/leaderboard`;
    var data = {"name": namePar, "points":pointsPar};
    return axios.post(url, data).then(response => response.data);
  }


}

export default new APIService;

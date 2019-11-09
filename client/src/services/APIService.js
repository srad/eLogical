import axios from "axios"

const API_URL = "http://localhost:4000";

export class APIService{
  constructor(){}

  getLeaderboardEntries(){
    const url = `${API_URL}/leaderboard`;
    console.log("Debug3");
    return axios.get(url).then(response => response.data);
  }

  addLeaderboardEntries(namePar, pointsPar){
    const url = `${API_URL}/leaderboard`;
    var data = {"name": namePar, "points":pointsPar};
    return axios.post(url, data).then(response => response.data);
  }


}

export default new APIService;



// export default() => {
//   return axios.create({
//     baseURL: `http://localhost:4000`
//   })
// }
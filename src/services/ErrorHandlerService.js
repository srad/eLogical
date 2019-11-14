const showDebugMessages = false;

function handeError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (showDebugMessages) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    if (showDebugMessages) {
      console.log(error.request);
    }
    alert("The eLogical-Server is currently not available.");
  } else {
    // Something happened in setting up the request that triggered an Error
    if (showDebugMessages) {
      console.log("Error", error.message);
    }
  }
  if (showDebugMessages) {
    console.log(error.config);
  }
}

export default handeError;
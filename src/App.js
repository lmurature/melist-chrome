import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App(props) {
  const { refreshToken, tabUrl } = props;

  const [userData, setUserData] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .post("https://melist-api.herokuapp.com/api/users/auth/refresh_token", {
        refresh_token: refreshToken,
      })
      .then((response) => {
        let at = response.data.access_token;
        setAccessToken(at);
        axios
          .get("https://melist-api.herokuapp.com/api/users/me", {
            headers: {
              Authorization: "Bearer " + at,
            },
          })
          .then((response) => setUserData(response.data))
          .catch((err) => setError(err));
      })
      .catch((err) => setError(err));
  }, refreshToken);

  return (
    <div className="main">
      Hola! {userData && userData.first_name + "!"}
      <br />
      {tabUrl && "estás en la pestaña con URL " + tabUrl}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";

let logoutTimer;

const AuthContext = React.createContext({
  token: null,
  login: (token) => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  return adjExpirationTime - currentTime;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  const storedExpirationDate = localStorage.getItem('expirationTime');

  const remainingTime = calculateRemainingTime(storedExpirationDate);

  if (remainingTime <= 3600){
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');

    return null;
  }

  return {token: storedToken, remainingTime: remainingTime};
}

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  const initialToken = tokenData == null ? null : tokenData.token;
  const [token, setToken] = useState(initialToken);

  const logoutHandler = () => {
    setToken(null);
    
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationTime', expirationTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.remainingTime);
      console.log('USE EFFECT');
      console.log(tokenData.remainingTime);
    }
  }, [tokenData]);

  const contextValue = {
    token: token,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

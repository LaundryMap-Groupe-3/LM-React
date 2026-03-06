import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleDarkTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <ThemeContext.Provider value={{
      isDarkTheme,
      isLoggedIn,
      toggleDarkTheme,
      toggleLogin,
      setIsDarkTheme,
      setIsLoggedIn
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
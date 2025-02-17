// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { themes } from '../themes/themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    return savedTheme ? themes[savedTheme] : themes.happy;
  });

  const changeTheme = (mood) => {
    setTheme(themes[mood]);
    localStorage.setItem('selectedTheme', mood);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(themes[savedTheme]);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

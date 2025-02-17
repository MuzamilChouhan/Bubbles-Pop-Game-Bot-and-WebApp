// src/components/MoodSelector.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import styled from 'styled-components';

const Button = styled.button`
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`;

const MoodSelector = () => {
  const { changeTheme } = useContext(ThemeContext);

  return (
    <div>
      <Button onClick={() => changeTheme('happy')}>Happy</Button>
      <Button onClick={() => changeTheme('calm')}>Calm</Button>
      <Button onClick={() => changeTheme('energetic')}>Energetic</Button>
      {/* Add more buttons for additional moods */}
    </div>
  );
};

export default MoodSelector;

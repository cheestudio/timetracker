import { useState } from 'react';

const useVisibility = (initialVisibility = true) => {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return { isVisible, toggleVisibility };
  
};

export default useVisibility;
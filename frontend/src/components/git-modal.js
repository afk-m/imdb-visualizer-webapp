import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const FloatingModal = () => {
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      <a
        href="https://github.com/yourusername/yourrepository" // Placeholder, replace with your actual GitHub repository URL
        target="_blank"
        rel="noopener noreferrer"
        title="View source code">
            <FontAwesomeIcon icon={faGithub} size="2x" />
        </a>
    </div>
    );
};

export default FloatingModal;

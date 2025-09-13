import React from 'react';
import { Title3, Caption1 } from '@fluentui/react-components';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "GardenDesigner",
  subtitle = "Interactive Garden Management Platform"
}) => {
  return (
    <header className="App-header">
      <Title3 as="h1" style={{ margin: 0, color: 'white' }}>
        {title}
      </Title3>
      <Caption1 style={{ margin: '0.25rem 0 0 0', color: 'rgba(255, 255, 255, 0.9)' }}>
        {subtitle}
      </Caption1>
    </header>
  );
};

export default Header;
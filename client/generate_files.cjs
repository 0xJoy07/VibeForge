const fs = require('fs');
const path = require('path');

const apiFiles = [
  'agent1.js', 'agent2Free.js', 'agent2Pro.js',
  'agent3Free.js', 'agent3Pro.js', 'agent4.js', 'payment.js'
];

const componentFiles = [
  'DebtInputForm.jsx', 'PortfolioSummary.jsx', 'AvalanchePreview.jsx',
  'BehavioralMeter.jsx', 'TeaserBanner.jsx', 'StrategyTable.jsx',
  'TimelinePlan.jsx', 'FlagCards.jsx', 'FinalVerdict.jsx', 'PDFExport.jsx'
];

fs.mkdirSync(path.join(__dirname, 'src', 'api'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'src', 'components'), { recursive: true });

const apiContent = (name) => `import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const ${name} = async (data) => {
  const response = await axios.post(\`\${API_URL}/${name}\`, data);
  return response.data;
};
`;

apiFiles.forEach(file => {
  const name = file.replace('.js', '');
  fs.writeFileSync(path.join(__dirname, 'src', 'api', file), apiContent(name));
});

const componentContent = (name) => `import React from 'react';

const ${name} = () => {
  return (
    <div>
      <h2>${name}</h2>
    </div>
  );
};

export default ${name};
`;

componentFiles.forEach(file => {
  const name = file.replace('.jsx', '');
  fs.writeFileSync(path.join(__dirname, 'src', 'components', file), componentContent(name));
});

console.log('Boilerplate created');

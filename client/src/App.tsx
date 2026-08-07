import React, { useState } from 'react';
import {
  defaultAgent1Response,
  defaultAgent2FreeResponse,
  defaultAgent2ProResponse,
  defaultAgent3FreeResponse,
  defaultAgent3ProResponse,
  defaultAgent4Response
} from './lib/types';

import DebtInputForm from './components/DebtInputForm';
import PortfolioSummary from './components/PortfolioSummary';
import AvalanchePreview from './components/AvalanchePreview';
import BehavioralMeter from './components/BehavioralMeter';
import TeaserBanner from './components/TeaserBanner';
import StrategyTable from './components/StrategyTable';
import TimelinePlan from './components/TimelinePlan';
import FlagCards from './components/FlagCards';
import FinalVerdict from './components/FinalVerdict';
import PDFExport from './components/PDFExport';

function App() {
  const [agent1Data, setAgent1Data] = useState(defaultAgent1Response);
  const [agent2FreeData, setAgent2FreeData] = useState(defaultAgent2FreeResponse);
  const [agent2ProData, setAgent2ProData] = useState(defaultAgent2ProResponse);
  const [agent3FreeData, setAgent3FreeData] = useState(defaultAgent3FreeResponse);
  const [agent3ProData, setAgent3ProData] = useState(defaultAgent3ProResponse);
  const [agent4Data, setAgent4Data] = useState(defaultAgent4Response);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          DebtMap
        </h1>
        <p className="mt-2 text-gray-400">Your AI-powered path to financial freedom</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <DebtInputForm />
        <PortfolioSummary />
        <AvalanchePreview />
        <BehavioralMeter />
        <TeaserBanner />
        <StrategyTable />
        <TimelinePlan />
        <FlagCards />
        <FinalVerdict />
        <PDFExport />
      </main>
    </div>
  );
}

export default App;

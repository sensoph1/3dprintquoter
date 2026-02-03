import CalculatorTab from './CalculatorTab';
import QuoteHistoryTab from './QuoteHistoryTab';
import CostsTab from './CostsTab';
import SettingsTab from './SettingsTab';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: 'Calculator', component: CalculatorTab },
    { name: 'Quote history', component: QuoteHistoryTab },
    { name: 'Costs', component: CostsTab },
    { name: 'Settings', component: SettingsTab }
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">3D Print Quoter</h1>
      </div>
      <nav className="flex-1 p-2">
        <ul>
          {tabs.map((tab) => (
            <li key={tab.name}>
              <a
                href="#"
                className={`block p-2 rounded ${
                  activeTab === tab.name ? 'bg-gray-700' : ''
                }`}
                onClick={() => setActiveTab(tab.name)}
              >
                {tab.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

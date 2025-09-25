import React, { useState } from 'react';
import { 
  Header, 
  Text, 
  Button, 
  UnderlineNav,
  Box,
  PageLayout
} from '@primer/react';
import { TrophyIcon, CalendarIcon, GraphIcon } from '@primer/octicons-react';
import { useKV } from '@github/spark/hooks';
import WorkoutLogger from './components/WorkoutLogger';
import ProgressDashboard from './components/ProgressDashboard';
import GoalManager from './components/GoalManager';
import ExerciseDatabase from './components/ExerciseDatabase';

type TabKey = 'dashboard' | 'workouts' | 'goals' | 'exercises';

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [workouts] = useKV('fitness-workouts', []);
  const [goals] = useKV('fitness-goals', []);

  const tabs = [
    { key: 'dashboard' as TabKey, label: 'Dashboard', icon: GraphIcon },
    { key: 'workouts' as TabKey, label: 'Workouts', icon: CalendarIcon },
    { key: 'goals' as TabKey, label: 'Goals', icon: TrophyIcon },
    { key: 'exercises' as TabKey, label: 'Exercises', icon: TrophyIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProgressDashboard />;
      case 'workouts':
        return <WorkoutLogger />;
      case 'goals':
        return <GoalManager />;
      case 'exercises':
        return <ExerciseDatabase />;
      default:
        return <ProgressDashboard />;
    }
  };

  return (
    <PageLayout>
      <PageLayout.Header>
        <Header>
          <Header.Item>
            <Header.Link href="#" sx={{ fontSize: 3, fontWeight: 'bold' }}>
              <TrophyIcon size={24} sx={{ mr: 2 }} />
              FitTracker
            </Header.Link>
          </Header.Item>
          <Header.Item full>
            <Text sx={{ color: 'fg.muted', ml: 3 }}>
              Track your fitness journey
            </Text>
          </Header.Item>
        </Header>
      </PageLayout.Header>

      <PageLayout.Content>
        <Box sx={{ borderBottom: 1, borderColor: 'border.default', mb: 4 }}>
          <UnderlineNav aria-label="Fitness Tracker Navigation">
            {tabs.map(({ key, label, icon: IconComponent }) => (
              <UnderlineNav.Item
                key={key}
                selected={activeTab === key}
                onSelect={() => setActiveTab(key)}
                sx={{ cursor: 'pointer' }}
              >
                <IconComponent size={16} sx={{ mr: 1 }} />
                {label}
              </UnderlineNav.Item>
            ))}
          </UnderlineNav>
        </Box>

        {renderContent()}
      </PageLayout.Content>
    </PageLayout>
  );
}

export default App;
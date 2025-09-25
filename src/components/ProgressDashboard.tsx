import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  ProgressBar,
  CounterLabel,
  StateLabel,
  Button
} from '@primer/react';
import { TrophyIcon, CalendarIcon, GraphIcon, ClockIcon, PlusIcon } from '@primer/octicons-react';
import { useKV } from '@github/spark/hooks';
import { loadSampleData } from '../lib/seedData';

interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
    notes: string;
  }>;
  duration: number;
  notes: string;
}

interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

const ProgressDashboard: React.FC = () => {
  const [workouts, setWorkouts] = useKV<Workout[]>('fitness-workouts', []);
  const [goals, setGoals] = useKV<Goal[]>('fitness-goals', []);

  const handleLoadSampleData = () => {
    loadSampleData(setWorkouts, setGoals);
  };

  const stats = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentWorkouts = workouts.filter(w => new Date(w.date) >= thirtyDaysAgo);
    
    const totalWorkouts = workouts.length;
    const workoutsThisMonth = recentWorkouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
    
    // Calculate streak
    let currentStreak = 0;
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === currentStreak || (currentStreak === 0 && diffDays <= 1)) {
        currentStreak = diffDays + 1;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return {
      totalWorkouts,
      workoutsThisMonth,
      totalMinutes,
      totalExercises,
      currentStreak: Math.max(0, currentStreak - 1)
    };
  }, [workouts]);

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ComponentType<any>; 
    color?: string;
    description?: string;
  }> = ({ title, value, icon: IconComponent, color = 'fg.default', description }) => (
    <Box 
      sx={{ 
        border: 1, 
        borderColor: 'border.default', 
        borderRadius: 2, 
        p: 3,
        textAlign: 'center'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <IconComponent size={24} color={color} />
      </Box>
      <Text sx={{ fontSize: 3, fontWeight: 'bold', display: 'block', mb: 1 }}>
        {value}
      </Text>
      <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
        {title}
      </Text>
      {description && (
        <Text sx={{ fontSize: 0, color: 'fg.muted', mt: 1 }}>
          {description}
        </Text>
      )}
    </Box>
  );

  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const isOverdue = new Date(goal.deadline) < new Date() && !goal.completed;
    
    return (
      <Box 
        sx={{ 
          border: 1, 
          borderColor: goal.completed ? 'success.emphasis' : isOverdue ? 'danger.emphasis' : 'border.default',
          borderRadius: 2, 
          p: 3 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Heading as="h4" sx={{ fontSize: 1 }}>
            {goal.title}
          </Heading>
          {goal.completed ? (
            <StateLabel status="issueOpened">Completed</StateLabel>
          ) : isOverdue ? (
            <StateLabel status="issueClosed">Overdue</StateLabel>
          ) : (
            <StateLabel status="pullOpened">Active</StateLabel>
          )}
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Text sx={{ fontSize: 1 }}>
              {goal.current} / {goal.target} {goal.unit}
            </Text>
            <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
              {Math.round(progress)}%
            </Text>
          </Box>
          <ProgressBar 
            progress={progress} 
            sx={{ 
              '& > span': { 
                backgroundColor: goal.completed ? 'success.emphasis' : 'accent.emphasis' 
              } 
            }} 
          />
        </Box>
        
        <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
          Due: {new Date(goal.deadline).toLocaleDateString()}
        </Text>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Heading as="h2" sx={{ fontSize: 3 }}>
          Fitness Dashboard
        </Heading>
        {workouts.length === 0 && goals.length === 0 && (
          <Button 
            variant="primary" 
            leadingVisual={PlusIcon}
            onClick={handleLoadSampleData}
          >
            Load Sample Data
          </Button>
        )}
      </Box>

      {/* Statistics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
        <StatCard 
          title="Total Workouts" 
          value={stats.totalWorkouts} 
          icon={CalendarIcon}
          description="All time"
        />
        <StatCard 
          title="This Month" 
          value={stats.workoutsThisMonth} 
          icon={GraphIcon}
          color="success.fg"
          description="Last 30 days"
        />
        <StatCard 
          title="Current Streak" 
          value={`${stats.currentStreak} days`} 
          icon={TrophyIcon}
          color="attention.fg"
          description="Keep it up!"
        />
        <StatCard 
          title="Total Time" 
          value={`${Math.round(stats.totalMinutes / 60)}h`} 
          icon={ClockIcon}
          description={`${stats.totalMinutes} minutes`}
        />
      </Box>

      {/* Goals Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Heading as="h3" sx={{ fontSize: 2 }}>
            Your Goals
          </Heading>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CounterLabel>
              {activeGoals.length} Active
            </CounterLabel>
            <CounterLabel>
              {completedGoals.length} Completed
            </CounterLabel>
          </Box>
        </Box>

        {goals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, border: 1, borderColor: 'border.default', borderRadius: 2 }}>
            <TrophyIcon size={32} color="fg.muted" />
            <Text sx={{ color: 'fg.muted', mt: 2, display: 'block' }}>
              No goals set yet. Visit the Goals tab to create your first goal!
            </Text>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {/* Show active goals first, then completed */}
            {[...activeGoals, ...completedGoals].map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </Box>
        )}
      </Box>

      {/* Recent Activity */}
      <Box>
        <Heading as="h3" sx={{ fontSize: 2, mb: 3 }}>
          Recent Activity
        </Heading>
        
        {workouts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, border: 1, borderColor: 'border.default', borderRadius: 2 }}>
            <CalendarIcon size={32} color="fg.muted" />
            <Text sx={{ color: 'fg.muted', mt: 2, display: 'block' }}>
              No workouts logged yet. Start by logging your first workout!
            </Text>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {workouts.slice(0, 5).map((workout) => (
              <Box 
                key={workout.id}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 3,
                  border: 1,
                  borderColor: 'border.default',
                  borderRadius: 2
                }}
              >
                <Box>
                  <Text sx={{ fontWeight: 'semibold' }}>{workout.name}</Text>
                  <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                    {workout.exercises.length} exercises • {workout.duration} minutes
                  </Text>
                </Box>
                <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                  {new Date(workout.date).toLocaleDateString()}
                </Text>
              </Box>
            ))}
            
            {workouts.length > 5 && (
              <Text sx={{ textAlign: 'center', color: 'fg.muted', fontSize: 1, mt: 2 }}>
                And {workouts.length - 5} more workouts...
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgressDashboard;
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextInput,
  FormControl,
  Select,
  Heading,
  Text,
  ProgressBar,
  StateLabel,
  Dialog,
  ButtonGroup,
  ActionList,
  ActionMenu
} from '@primer/react';
import { PlusIcon, CheckIcon, TrashIcon, TrophyIcon } from '@primer/octicons-react';
import { useKV } from '@github/spark/hooks';

interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;  
  unit: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}

const GoalManager: React.FC = () => {
  const [goals, setGoals] = useKV<Goal[]>('fitness-goals', []);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [currentGoal, setCurrentGoal] = useState({
    title: '',
    type: 'weight_loss',
    target: 0,
    current: 0,
    unit: 'lbs',
    deadline: ''
  });

  const goalTypes = [
    { value: 'weight_loss', label: 'Weight Loss', unit: 'lbs' },
    { value: 'weight_gain', label: 'Weight Gain', unit: 'lbs' },
    { value: 'workout_frequency', label: 'Workout Frequency', unit: 'workouts/week' },
    { value: 'strength', label: 'Strength Goal', unit: 'lbs' },
    { value: 'endurance', label: 'Endurance Goal', unit: 'minutes' },
    { value: 'custom', label: 'Custom Goal', unit: 'units' }
  ];

  const handleGoalTypeChange = (type: string) => {
    const goalType = goalTypes.find(gt => gt.value === type);
    setCurrentGoal(prev => ({
      ...prev,
      type,
      unit: goalType?.unit || 'units'
    }));
  };

  const handleSaveGoal = () => {
    if (!currentGoal.title.trim() || !currentGoal.deadline) return;

    if (editingGoal) {
      // Update existing goal
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === editingGoal.id 
            ? { ...goal, ...currentGoal }
            : goal
        )
      );
    } else {
      // Create new goal
      const newGoal: Goal = {
        ...currentGoal,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setGoals(prevGoals => [newGoal, ...prevGoals]);
    }

    // Reset form
    setCurrentGoal({
      title: '',
      type: 'weight_loss',
      target: 0,
      current: 0,
      unit: 'lbs',
      deadline: ''
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setCurrentGoal({
      title: goal.title,
      type: goal.type,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      deadline: goal.deadline
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
  };

  const handleToggleComplete = (goalId: string) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  const handleUpdateProgress = (goalId: string, newCurrent: number) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, current: newCurrent, completed: newCurrent >= goal.target }
          : goal
      )
    );
  };

  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempCurrent, setTempCurrent] = useState(goal.current.toString());
    
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const isOverdue = new Date(goal.deadline) < new Date() && !goal.completed;
    
    const handleSaveProgress = () => {
      const newCurrent = parseFloat(tempCurrent) || 0;
      handleUpdateProgress(goal.id, newCurrent);
      setIsEditing(false);
    };

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
          <Heading as="h3" sx={{ fontSize: 2 }}>
            {goal.title}
          </Heading>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {goal.completed ? (
              <StateLabel status="issueOpened">Completed</StateLabel>
            ) : isOverdue ? (
              <StateLabel status="issueClosed">Overdue</StateLabel>
            ) : (
              <StateLabel status="pullOpened">Active</StateLabel>
            )}
            
            <ActionMenu>
              <ActionMenu.Button variant="invisible" aria-label="Goal options" />
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item onSelect={() => handleEditGoal(goal)}>
                    Edit goal
                  </ActionList.Item>
                  <ActionList.Item onSelect={() => handleToggleComplete(goal.id)}>
                    {goal.completed ? 'Mark incomplete' : 'Mark complete'}
                  </ActionList.Item>
                  <ActionList.Item 
                    variant="danger" 
                    onSelect={() => handleDeleteGoal(goal.id)}
                  >
                    <ActionList.LeadingVisual>
                      <TrashIcon />
                    </ActionList.LeadingVisual>
                    Delete goal
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        </Box>

        <Text sx={{ color: 'fg.muted', fontSize: 1, mb: 3 }}>
          {goalTypes.find(gt => gt.value === goal.type)?.label || goal.type}
        </Text>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            {isEditing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <TextInput
                  type="number"
                  value={tempCurrent}
                  onChange={(e) => setTempCurrent(e.target.value)}
                  sx={{ width: '100px' }}
                />
                <Text>/ {goal.target} {goal.unit}</Text>
                <ButtonGroup>
                  <Button size="small" variant="primary" onClick={handleSaveProgress}>
                    <CheckIcon size={12} />
                  </Button>
                  <Button size="small" onClick={() => {
                    setIsEditing(false);
                    setTempCurrent(goal.current.toString());
                  }}>
                    Cancel
                  </Button>
                </ButtonGroup>
              </Box>
            ) : (
              <>
                <Text sx={{ fontSize: 1 }} onClick={() => setIsEditing(true)}>
                  <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                    {goal.current}
                  </span> / {goal.target} {goal.unit}
                </Text>
                <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                  {Math.round(progress)}%
                </Text>
              </>
            )}
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            Due: {new Date(goal.deadline).toLocaleDateString()}
          </Text>
          {!isEditing && !goal.completed && (
            <Button 
              size="small" 
              variant="invisible"
              onClick={() => setIsEditing(true)}
            >
              Update progress
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Heading as="h2" sx={{ fontSize: 3 }}>
          Fitness Goals
        </Heading>
        <Button 
          variant="primary" 
          leadingVisual={PlusIcon}
          onClick={() => {
            setEditingGoal(null);
            setCurrentGoal({
              title: '',
              type: 'weight_loss',
              target: 0,
              current: 0,
              unit: 'lbs',
              deadline: ''
            });
            setShowForm(true);
          }}
        >
          Create Goal
        </Button>
      </Box>

      {/* Goal Form Dialog */}
      {showForm && (
        <Dialog isOpen={showForm} onDismiss={() => setShowForm(false)}>
          <Dialog.Header>
            <TrophyIcon size={20} />
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </Dialog.Header>
          <Box sx={{ p: 3 }}>
            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label>Goal Title</FormControl.Label>
              <TextInput
                value={currentGoal.title}
                onChange={(e) => setCurrentGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Lose 10 pounds, Bench press body weight"
              />
            </FormControl>

            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label>Goal Type</FormControl.Label>
              <Select
                value={currentGoal.type}
                onChange={(e) => handleGoalTypeChange(e.target.value)}
              >
                {goalTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mb: 3 }}>
              <FormControl>
                <FormControl.Label>Current</FormControl.Label>
                <TextInput
                  type="number"
                  value={currentGoal.current.toString()}
                  onChange={(e) => setCurrentGoal(prev => ({ ...prev, current: parseFloat(e.target.value) || 0 }))}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Target</FormControl.Label>
                <TextInput
                  type="number"
                  value={currentGoal.target.toString()}
                  onChange={(e) => setCurrentGoal(prev => ({ ...prev, target: parseFloat(e.target.value) || 0 }))}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Unit</FormControl.Label>
                <TextInput
                  value={currentGoal.unit}
                  onChange={(e) => setCurrentGoal(prev => ({ ...prev, unit: e.target.value }))}
                />
              </FormControl>
            </Box>

            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label>Deadline</FormControl.Label>
              <TextInput
                type="date"
                value={currentGoal.deadline}
                onChange={(e) => setCurrentGoal(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </FormControl>

            <ButtonGroup>
              <Button variant="primary" onClick={handleSaveGoal}>
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
              <Button onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </ButtonGroup>
          </Box>
        </Dialog>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <TrophyIcon size={48} color="fg.muted" />
          <Text sx={{ color: 'fg.muted', fontSize: 2, mt: 3, mb: 2 }}>
            No goals set yet
          </Text>
          <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
            Create your first fitness goal to start tracking your progress!
          </Text>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {goals
            .sort((a, b) => {
              if (a.completed !== b.completed) {
                return a.completed ? 1 : -1; // Active goals first
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
        </Box>
      )}
    </Box>
  );
};

export default GoalManager;
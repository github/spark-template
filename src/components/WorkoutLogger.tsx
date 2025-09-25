import React, { useState } from 'react';
import {
  Box,
  Button,
  TextInput,
  FormControl,
  Textarea,
  Select,
  Heading,
  Text,
  ButtonGroup,
  ActionList,
  ActionMenu,
  Dialog
} from '@primer/react';
import { PlusIcon, TrashIcon, CalendarIcon } from '@primer/octicons-react';
import { useKV } from '@github/spark/hooks';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}

interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  notes: string;
}

const WorkoutLogger: React.FC = () => {
  const [workouts, setWorkouts] = useKV<Workout[]>('fitness-workouts', []);
  const [showForm, setShowForm] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Omit<Workout, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    exercises: [{ name: '', sets: 1, reps: 10, weight: 0, notes: '' }],
    duration: 30,
    notes: ''
  });

  const handleAddExercise = () => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: 1, reps: 10, weight: 0, notes: '' }]
    }));
  };

  const handleRemoveExercise = (index: number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const handleSaveWorkout = () => {
    if (!currentWorkout.name.trim()) return;
    
    const newWorkout: Workout = {
      ...currentWorkout,
      id: Date.now().toString()
    };

    setWorkouts(prevWorkouts => [newWorkout, ...prevWorkouts]);
    setCurrentWorkout({
      date: new Date().toISOString().split('T')[0],
      name: '',
      exercises: [{ name: '', sets: 1, reps: 10, weight: 0, notes: '' }],
      duration: 30,
      notes: ''
    });
    setShowForm(false);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Heading as="h2" sx={{ fontSize: 3 }}>
          Workout History
        </Heading>
        <Button 
          variant="primary" 
          leadingVisual={PlusIcon}
          onClick={() => setShowForm(true)}
        >
          Log Workout
        </Button>
      </Box>

      {/* Workout Form Dialog */}
      {showForm && (
        <Dialog isOpen={showForm} onDismiss={() => setShowForm(false)}>
          <Dialog.Header>
            <CalendarIcon size={20} />
            Log New Workout
          </Dialog.Header>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
              <FormControl>
                <FormControl.Label>Workout Name</FormControl.Label>
                <TextInput
                  value={currentWorkout.name}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Push Day, Cardio Session"
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Date</FormControl.Label>
                <TextInput
                  type="date"
                  value={currentWorkout.date}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, date: e.target.value }))}
                />
              </FormControl>
            </Box>

            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label>Duration (minutes)</FormControl.Label>
              <TextInput
                type="number"
                value={currentWorkout.duration.toString()}
                onChange={(e) => setCurrentWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              />
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Text sx={{ fontWeight: 'semibold' }}>Exercises</Text>
                <Button size="small" leadingVisual={PlusIcon} onClick={handleAddExercise}>
                  Add Exercise
                </Button>
              </Box>

              {currentWorkout.exercises.map((exercise, index) => (
                <Box key={index} sx={{ border: 1, borderColor: 'border.default', borderRadius: 2, p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Text sx={{ fontWeight: 'semibold' }}>Exercise {index + 1}</Text>
                    {currentWorkout.exercises.length > 1 && (
                      <Button 
                        variant="danger" 
                        size="small" 
                        leadingVisual={TrashIcon}
                        onClick={() => handleRemoveExercise(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
                    <FormControl>
                      <FormControl.Label>Exercise Name</FormControl.Label>
                      <TextInput
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        placeholder="e.g., Bench Press"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormControl.Label>Sets</FormControl.Label>
                      <TextInput
                        type="number"
                        value={exercise.sets.toString()}
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormControl.Label>Reps</FormControl.Label>
                      <TextInput
                        type="number"
                        value={exercise.reps.toString()}
                        onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormControl.Label>Weight (lbs)</FormControl.Label>
                      <TextInput
                        type="number"
                        value={exercise.weight.toString()}
                        onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </Box>
                  
                  <FormControl>
                    <FormControl.Label>Notes</FormControl.Label>
                    <TextInput
                      value={exercise.notes}
                      onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                      placeholder="Optional notes about this exercise"
                    />
                  </FormControl>
                </Box>
              ))}
            </Box>

            <FormControl sx={{ mb: 3 }}>
              <FormControl.Label>Workout Notes</FormControl.Label>
              <Textarea
                value={currentWorkout.notes}
                onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How did the workout feel? Any observations?"
              />
            </FormControl>

            <ButtonGroup>
              <Button variant="primary" onClick={handleSaveWorkout}>
                Save Workout
              </Button>
              <Button onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </ButtonGroup>
          </Box>
        </Dialog>
      )}

      {/* Workout History */}
      {workouts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
            No workouts logged yet. Start by logging your first workout!
          </Text>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {workouts.map((workout) => (
            <Box 
              key={workout.id} 
              sx={{ 
                border: 1, 
                borderColor: 'border.default', 
                borderRadius: 2, 
                p: 3 
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Heading as="h3" sx={{ fontSize: 2, mb: 1 }}>
                    {workout.name}
                  </Heading>
                  <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
                    {new Date(workout.date).toLocaleDateString()} • {workout.duration} minutes
                  </Text>
                </Box>
                <ActionMenu>
                  <ActionMenu.Button variant="invisible" aria-label="Workout options" />
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Item 
                        variant="danger" 
                        onSelect={() => handleDeleteWorkout(workout.id)}
                      >
                        <ActionList.LeadingVisual>
                          <TrashIcon />
                        </ActionList.LeadingVisual>
                        Delete workout
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Text sx={{ fontWeight: 'semibold', mb: 2 }}>Exercises:</Text>
                {workout.exercises.map((exercise, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Text sx={{ fontSize: 1 }}>
                      <strong>{exercise.name}</strong> - {exercise.sets}x{exercise.reps}
                      {exercise.weight > 0 && ` @ ${exercise.weight}lbs`}
                    </Text>
                    {exercise.notes && (
                      <Text sx={{ color: 'fg.muted', fontSize: 0, ml: 2 }}>
                        {exercise.notes}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
              
              {workout.notes && (
                <Box sx={{ borderTop: 1, borderColor: 'border.muted', pt: 2 }}>
                  <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                    {workout.notes}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default WorkoutLogger;
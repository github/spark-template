// Sample data to help users get started with the fitness tracker

export const sampleWorkouts = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    name: 'Upper Body Strength',
    exercises: [
      {
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 135,
        notes: 'Felt good, could increase weight next time'
      },
      {
        name: 'Pull-ups',
        sets: 3,
        reps: 8,
        weight: 0,
        notes: 'Bodyweight only'
      },
      {
        name: 'Overhead Press',
        sets: 3,
        reps: 8,
        weight: 95,
        notes: 'Good form maintained'
      }
    ],
    duration: 45,
    notes: 'Great workout! Feeling stronger.'
  },
  {
    id: '2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'Lower Body Power',
    exercises: [
      {
        name: 'Squats',
        sets: 4,
        reps: 12,
        weight: 155,
        notes: 'Deep squats, good mobility'
      },
      {
        name: 'Deadlift',
        sets: 3,
        reps: 8,
        weight: 185,
        notes: 'Focus on form'
      },
      {
        name: 'Lunges',
        sets: 3,
        reps: 10,
        weight: 25,
        notes: 'Each leg'
      }
    ],
    duration: 50,
    notes: 'Legs were on fire! Good session.'
  }
];

export const sampleGoals = [
  {
    id: '1',
    title: 'Bench Press Bodyweight',
    type: 'strength',
    target: 175,
    current: 135,
    unit: 'lbs',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Workout 4x per week',
    type: 'workout_frequency',
    target: 4,
    current: 2,
    unit: 'workouts/week',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString()
  }
];

export const loadSampleData = (
  setWorkouts: (data: any) => void,
  setGoals: (data: any) => void
) => {
  setWorkouts(sampleWorkouts);
  setGoals(sampleGoals);
};
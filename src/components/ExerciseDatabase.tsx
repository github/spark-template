import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  TextInput,
  Select,
  FormControl,
  ActionList,
  Button
} from '@primer/react';
import { SearchIcon, CheckIcon } from '@primer/octicons-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  muscle_groups: string[];
  instructions: string[];
}

// Comprehensive exercise database
const exerciseDatabase: Exercise[] = [
  // Chest Exercises
  {
    id: '1',
    name: 'Bench Press',
    category: 'Chest',
    description: 'A compound exercise that primarily targets the chest, shoulders, and triceps.',
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    instructions: [
      'Lie flat on the bench with feet firmly on the ground',
      'Grip the bar slightly wider than shoulder width',
      'Lower the bar to your chest with control',
      'Press the bar back up to starting position'
    ]
  },
  {
    id: '2',
    name: 'Push-ups',
    category: 'Chest',
    description: 'A bodyweight exercise that targets chest, shoulders, and core.',
    muscle_groups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower your body until chest nearly touches the ground',
      'Push back up to starting position',
      'Keep your body in a straight line throughout'
    ]
  },
  {
    id: '3',
    name: 'Dumbbell Flyes',
    category: 'Chest',
    description: 'An isolation exercise that targets the chest muscles.',
    muscle_groups: ['Chest'],
    instructions: [
      'Lie on bench holding dumbbells above chest',
      'Lower weights in wide arc until chest feels stretched',
      'Bring weights back together above chest',
      'Keep slight bend in elbows throughout movement'
    ]
  },

  // Back Exercises
  {
    id: '4',
    name: 'Pull-ups',
    category: 'Back',
    description: 'A compound bodyweight exercise that targets the back and biceps.',
    muscle_groups: ['Back', 'Biceps'],
    instructions: [
      'Hang from pull-up bar with overhand grip',
      'Pull your body up until chin clears the bar',
      'Lower yourself with control to starting position',
      'Keep core engaged throughout movement'
    ]
  },
  {
    id: '5',
    name: 'Deadlift',
    category: 'Back',
    description: 'A compound exercise that works the entire posterior chain.',
    muscle_groups: ['Back', 'Glutes', 'Hamstrings', 'Core'],
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Hinge at hips and knees to grip the bar',
      'Keep chest up and back straight',
      'Drive through heels to stand up, pulling bar up your legs'
    ]
  },
  {
    id: '6',
    name: 'Bent-over Row',
    category: 'Back',
    description: 'A compound exercise that targets the middle back and rear delts.',
    muscle_groups: ['Back', 'Shoulders', 'Biceps'],
    instructions: [
      'Hinge at hips with knees slightly bent',
      'Hold barbell with overhand grip',
      'Pull bar to lower chest/upper abdomen',
      'Lower with control, maintaining bent-over position'
    ]
  },

  // Leg Exercises
  {
    id: '7',
    name: 'Squats',
    category: 'Legs',
    description: 'A compound exercise that targets the quadriceps, glutes, and core.',
    muscle_groups: ['Quadriceps', 'Glutes', 'Core'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep knees in line with toes',
      'Drive through heels to return to standing'
    ]
  },
  {
    id: '8',
    name: 'Lunges',
    category: 'Legs',
    description: 'A unilateral exercise that targets the legs and improves balance.',
    muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    instructions: [
      'Step forward with one leg into lunge position',
      'Lower hips until both knees are bent at 90 degrees',
      'Push back to starting position',
      'Alternate legs or complete all reps on one side first'
    ]
  },
  {
    id: '9',
    name: 'Calf Raises',
    category: 'Legs',
    description: 'An isolation exercise that targets the calf muscles.',
    muscle_groups: ['Calves'],
    instructions: [
      'Stand with balls of feet on raised surface',
      'Lower heels below the level of your toes',
      'Rise up on toes as high as possible',
      'Lower with control and repeat'
    ]
  },

  // Shoulder Exercises
  {
    id: '10',
    name: 'Overhead Press',
    category: 'Shoulders',
    description: 'A compound exercise that targets the shoulders and triceps.',
    muscle_groups: ['Shoulders', 'Triceps', 'Core'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold barbell at shoulder level',
      'Press weight overhead until arms are fully extended',
      'Lower with control to starting position'
    ]
  },
  {
    id: '11',
    name: 'Lateral Raises',
    category: 'Shoulders',
    description: 'An isolation exercise that targets the side deltoids.',
    muscle_groups: ['Shoulders'],
    instructions: [
      'Stand holding dumbbells at your sides',
      'Raise weights out to sides until parallel to floor',
      'Keep slight bend in elbows',
      'Lower with control to starting position'
    ]
  },

  // Arm Exercises
  {
    id: '12',
    name: 'Bicep Curls',
    category: 'Arms',
    description: 'An isolation exercise that targets the biceps.',
    muscle_groups: ['Biceps'],
    instructions: [
      'Stand holding dumbbells at your sides',
      'Keep elbows close to your body',
      'Curl weights up towards shoulders',
      'Lower with control to starting position'
    ]
  },
  {
    id: '13',
    name: 'Tricep Dips',
    category: 'Arms',
    description: 'A bodyweight exercise that targets the triceps.',
    muscle_groups: ['Triceps', 'Shoulders'],
    instructions: [
      'Sit on edge of bench with hands gripping the edge',
      'Slide off bench supporting weight with arms',
      'Lower body by bending elbows',
      'Push back up to starting position'
    ]
  },

  // Core Exercises
  {
    id: '14',
    name: 'Plank',
    category: 'Core',
    description: 'An isometric exercise that strengthens the entire core.',
    muscle_groups: ['Core', 'Shoulders'],
    instructions: [
      'Start in push-up position',
      'Lower to forearms keeping body straight',
      'Hold position while breathing normally',
      'Keep hips level and core engaged'
    ]
  },
  {
    id: '15',
    name: 'Crunches',
    category: 'Core',
    description: 'An isolation exercise that targets the abdominal muscles.',
    muscle_groups: ['Core'],
    instructions: [
      'Lie on back with knees bent',
      'Place hands behind head or across chest',
      'Lift shoulders off ground by contracting abs',
      'Lower with control to starting position'
    ]
  }
];

const ExerciseDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories = ['All', ...Array.from(new Set(exerciseDatabase.map(ex => ex.category)))];

  const filteredExercises = useMemo(() => {
    return exerciseDatabase.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.muscle_groups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <Box 
      sx={{ 
        border: 1, 
        borderColor: 'border.default', 
        borderRadius: 2, 
        p: 3,
        cursor: 'pointer',
        ':hover': {
          borderColor: 'accent.emphasis',
          backgroundColor: 'canvas.subtle'
        }
      }}
      onClick={() => setSelectedExercise(exercise)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Heading as="h3" sx={{ fontSize: 2 }}>
          {exercise.name}
        </Heading>
        <Text sx={{ 
          fontSize: 0, 
          color: 'fg.muted', 
          backgroundColor: 'neutral.muted',
          px: 2,
          py: 1,
          borderRadius: 1
        }}>
          {exercise.category}
        </Text>
      </Box>
      
      <Text sx={{ color: 'fg.muted', fontSize: 1, mb: 2 }}>
        {exercise.description}
      </Text>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {exercise.muscle_groups.map((muscle, index) => (
          <Text 
            key={index}
            sx={{ 
              fontSize: 0, 
              backgroundColor: 'accent.subtle',
              color: 'accent.fg',
              px: 2,
              py: 1,
              borderRadius: 1
            }}
          >
            {muscle}
          </Text>
        ))}
      </Box>
    </Box>
  );

  const ExerciseDetail: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <Box sx={{ 
      border: 1, 
      borderColor: 'border.default', 
      borderRadius: 2, 
      p: 4,
      backgroundColor: 'canvas.subtle'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Heading as="h2" sx={{ fontSize: 3 }}>
          {exercise.name}
        </Heading>
        <Button onClick={() => setSelectedExercise(null)}>
          Back to List
        </Button>
      </Box>
      
      <Text sx={{ fontSize: 1, mb: 3 }}>
        {exercise.description}
      </Text>
      
      <Box sx={{ mb: 3 }}>
        <Text sx={{ fontWeight: 'semibold', mb: 2 }}>Target Muscles:</Text>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {exercise.muscle_groups.map((muscle, index) => (
            <Text 
              key={index}
              sx={{ 
                fontSize: 1, 
                backgroundColor: 'success.subtle',
                color: 'success.fg',
                px: 2,
                py: 1,
                borderRadius: 1
              }}
            >
              {muscle}
            </Text>
          ))}
        </Box>
      </Box>
      
      <Box>
        <Text sx={{ fontWeight: 'semibold', mb: 2 }}>Instructions:</Text>
        <ActionList>
          {exercise.instructions.map((instruction, index) => (
            <ActionList.Item key={index}>
              <ActionList.LeadingVisual>
                <Text sx={{ fontWeight: 'bold', color: 'accent.fg' }}>
                  {index + 1}.
                </Text>
              </ActionList.LeadingVisual>
              {instruction}
            </ActionList.Item>
          ))}
        </ActionList>
      </Box>
    </Box>
  );

  if (selectedExercise) {
    return <ExerciseDetail exercise={selectedExercise} />;
  }

  return (
    <Box>
      <Heading as="h2" sx={{ fontSize: 3, mb: 4 }}>
        Exercise Database
      </Heading>

      {/* Search and Filters */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, mb: 4 }}>
        <FormControl>
          <FormControl.Label>Search Exercises</FormControl.Label>
          <TextInput
            leadingVisual={SearchIcon}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, description, or muscle group..."
          />
        </FormControl>
        
        <FormControl>
          <FormControl.Label>Category</FormControl.Label>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
          Showing {filteredExercises.length} of {exerciseDatabase.length} exercises
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </Text>
      </Box>

      {/* Exercise Grid */}
      {filteredExercises.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <SearchIcon size={48} color="fg.muted" />
          <Text sx={{ color: 'fg.muted', fontSize: 2, mt: 3, mb: 2 }}>
            No exercises found
          </Text>
          <Text sx={{ color: 'fg.muted', fontSize: 1 }}>
            Try adjusting your search terms or category filter.
          </Text>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ExerciseDatabase;
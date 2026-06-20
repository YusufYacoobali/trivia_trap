import { ImageSourcePropType } from 'react-native';

// Shared PNG artwork for each category, used by both the category picker and
// the in-game question card so the iconography stays consistent.
export const CATEGORY_ICONS: Record<string, ImageSourcePropType> = {
  All: require('../../assets/category-icons/all.png'),
  History: require('../../assets/category-icons/history.png'),
  Science: require('../../assets/category-icons/science.png'),
  Football: require('../../assets/category-icons/football.png'),
  Movies: require('../../assets/category-icons/movies.png'),
  Geography: require('../../assets/category-icons/geography.png'),
  Animals: require('../../assets/category-icons/animals.png'),
  'Weird facts': require('../../assets/category-icons/weird-facts.png'),
};

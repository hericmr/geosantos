/**
 * Capitalizes each word in a string
 * @param str The input string to capitalize
 * @returns The string with each word capitalized
 */
export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}; 
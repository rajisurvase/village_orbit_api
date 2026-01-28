
interface PageVisibilityMap {
  [key: string]: boolean;
}

export const usePageVisibility = () => {

  const isPageVisible = (pageKey: string): boolean => {
    // return visibility[pageKey] ?? true; 
    return true
  };

  return {  isPageVisible };
};

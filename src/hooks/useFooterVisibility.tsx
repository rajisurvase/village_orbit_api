import { useState, useEffect, useCallback } from 'react';

export const useFooterVisibility = () => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const observeFooter = useCallback(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of footer is visible
      }
    );

    observer.observe(footer);
    return observer;
  }, []);

  useEffect(() => {
    // Try to observe immediately
    let observer = observeFooter();

    // If footer not found, use MutationObserver to wait for it
    if (!observer) {
      const mutationObserver = new MutationObserver(() => {
        const footer = document.querySelector('footer');
        if (footer) {
          observer = observeFooter();
          if (observer) {
            mutationObserver.disconnect();
          }
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        mutationObserver.disconnect();
        observer?.disconnect();
      };
    }

    return () => {
      observer?.disconnect();
    };
  }, [observeFooter]);

  return isFooterVisible;
};

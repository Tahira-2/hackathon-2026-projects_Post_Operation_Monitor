// MediaPipe is loaded via CDN in index.html to avoid Vite ESM issues
import { useEffect, useRef, useState } from 'react';

/**
 * Hook to manage MediaPipe Pose initialization and lifecycle.
 * @param {Function} onResultsCallback - Callback triggered when pose is detected.
 */
export const usePose = (onResultsCallback) => {
  const poseRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!window.Pose) {
      console.error("MediaPipe Pose not loaded from CDN");
      return;
    }

    const pose = new window.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onResultsCallback);
    poseRef.current = pose;
    
    // Simulate loading completion since MediaPipe initializes asynchronously
    setTimeout(() => setIsLoaded(true), 1000);

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [onResultsCallback]);

  return { pose: poseRef.current, isLoaded };
};

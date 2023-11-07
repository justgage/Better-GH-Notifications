import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A container that animates the height of its children and animates the
 * position of its children when they are added or removed.
 */
export const DynamicHeightContainer = ({
  children,
}: {
  children: React.ReactNode[];
}) => {
  const containerRef = useRef<
    HTMLDivElement & {
      children: HTMLDivElement[];
    }
  >(null);
  const [childHeights, setChildHeights] = useState<number[]>([]);
  const [topOffsets, setTopOffsets] = useState<number[]>([]);

  const parentHeight = childHeights.reduce((acc, height) => acc + height, 0);

  const calculateHeights = () => {
    if (!containerRef.current) {
      return {
        childHeights: [],
        childOffsets: [],
        totalHeight: 0,
      };
    }

    const heights = Array.from(containerRef.current.children).map(
      (child) => child.getBoundingClientRect().height
    );

    const offsets = heights.reduce((acc, height) => {
      const prevOffset = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(prevOffset + height);
      return acc;
    }, [] as number[]);

    return {
      childHeights: heights,
      childOffsets: offsets,
      totalHeight: offsets[offsets.length - 1] + heights[heights.length - 1],
    };
  };

  const updateHeights = useCallback(
    debounce(
      () => {
        const newHeights = calculateHeights();
        setChildHeights(newHeights.childHeights);
        setTopOffsets(newHeights.childOffsets);
        setTimeout(() => {
          // check the heights a bit later to make sure they haven't shifted
          // a bit from animations or other things
          const newHeights2 = calculateHeights();
          if (newHeights2.totalHeight !== newHeights.totalHeight) {
            updateHeights();
          }
        }, 100);
      },
      // debounce
      200,
      {
        leading: true,
        trailing: true,
      }
    ),
    []
  );
  // listen to dom resize events of each child element
  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(updateHeights);
      for (const child of containerRef.current.children) {
        observer.observe(child);
      }
      return () => void observer.disconnect();
    }
  }, [children]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        height: parentHeight,
      }}
      transition={{
        delay: 0.1,
      }}
      exit={{ opacity: 0 }}
      style={{
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children.map((child, index) => {
          const isLastItem = index === children.length - 1;
          const childKey = `dynamic-child-${index}`;
          const topOffset =
            index === 0 ? 0 : topOffsets[index - 1] || parentHeight + 100;
          return (
            <motion.div
              onAnimationComplete={updateHeights}
              key={childKey}
              initial={{
                opacity: 0,
                scale: 1,
                y: 0,
                top: `${topOffset + (isLastItem ? childHeights[index] : 0)}px`,
              }}
              animate={{
                opacity: 1,
                y: 0,
                top: `${topOffset}px`,
              }}
              exit={{
                opacity: 0,
                top: `${topOffset}px`,
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 500,
                mass: 0.5,
              }}
              sx={{
                position: "absolute",
                width: "100%",
              }}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

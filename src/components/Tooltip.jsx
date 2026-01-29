import React, { useState, useRef, useLayoutEffect } from 'react';

const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);
  const [styles, setStyles] = useState({}); // Combined styles for tooltip and arrow

  useLayoutEffect(() => {
    if (showTooltip && wrapperRef.current && tooltipRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const screenPadding = 10;

      let tooltipLeft = (wrapperRect.width / 2) - (tooltipRect.width / 2);
      let arrowLeft = '50%';
      let transform = 'translateX(-50%)'; // Default transform for tooltip

      // Check for left boundary
      if (wrapperRect.left + tooltipLeft < screenPadding) {
        tooltipLeft = screenPadding - wrapperRect.left;
        arrowLeft = `${(wrapperRect.width / 2) - tooltipLeft}px`;
        transform = 'translateX(0)';
      } 
      // Check for right boundary
      else if (wrapperRect.right + (wrapperRect.width / 2) - (tooltipRect.width / 2) > viewportWidth - screenPadding) {
        tooltipLeft = (viewportWidth - screenPadding) - wrapperRect.right + (wrapperRect.width / 2) - (tooltipRect.width / 2);
        arrowLeft = `${(wrapperRect.width / 2) - tooltipLeft}px`;
        transform = 'translateX(0)';
      }

      requestAnimationFrame(() => {
        setStyles({
          tooltip: {
            left: tooltipLeft,
            transform: transform,
          },
          arrow: {
            left: arrowLeft,
            transform: 'translateX(-50%)',
          }
        });
      });
    } else {
      requestAnimationFrame(() => {
        setStyles({}); // Reset styles when tooltip is hidden
      });
    }
  }, [showTooltip]); // Only re-calculate when visibility changes

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute z-20 px-3 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg shadow-sm -top-8 whitespace-nowrap transition-opacity duration-300"
          style={styles.tooltip}
        >
          {text}
          <div className="tooltip-arrow absolute h-2 w-2 bg-slate-700 rotate-45" style={{ ...styles.arrow, bottom: '-4px' }} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
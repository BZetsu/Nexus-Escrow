"use client";

import React, { useState, useEffect } from 'react';
import { timeLeft } from "@/lib/utils/time_formatter";

interface CountdownTimerProps {
  deadline: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const [timeRemaining, setTimeRemaining] = useState(() => timeLeft(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(timeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="text-base font-semibold">
      {timeRemaining}
    </div>
  );
};

export default React.memo(CountdownTimer); 
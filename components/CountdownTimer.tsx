"use client";

import { timeLeft } from "@/lib/utils/time_formatter";
import { IconButton, Stack } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import React, { useState, useEffect, memo } from "react";

const CountdownTimer = memo(({ deadline, onEdit }: { deadline: number; onEdit: () => void }) => {
  const [currentDeadline, setCurrentDeadline] = useState("");

  useEffect(() => {
    if (!deadline) return;
    
    setCurrentDeadline(timeLeft(deadline));
    
    const timer = setInterval(() => {
      setCurrentDeadline(timeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <Stack mt={4} spacing={2}>
      <div className="text-xs text-textColor">Deadline</div>
      <Stack flexDirection="row" gap={1} alignItems="center">
        <div className="text-lg font-[500] line-clamp-1">
          {currentDeadline}
        </div>
        <IconButton onClick={onEdit}>
          <EditOutlinedIcon className="text-textColor -mt-2 text-base" />
        </IconButton>
      </Stack>
    </Stack>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

export default CountdownTimer; 
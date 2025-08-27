import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, RotateCcw, Flag } from 'lucide-react';

interface LapTime {
  id: number;
  time: number;
  lapTime: number;
}

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      pausedTimeRef.current = time;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLapTimes([]);
    pausedTimeRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleLap = () => {
    if (isRunning && time > 0) {
      const lapTime = lapTimes.length > 0 ? time - lapTimes[lapTimes.length - 1].time : time;
      const newLap: LapTime = {
        id: lapTimes.length + 1,
        time: time,
        lapTime: lapTime
      };
      setLapTimes([...lapTimes, newLap]);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getFastestLap = () => {
    if (lapTimes.length === 0) return null;
    return lapTimes.reduce((fastest, current) => 
      current.lapTime < fastest.lapTime ? current : fastest
    );
  };

  const getSlowestLap = () => {
    if (lapTimes.length === 0) return null;
    return lapTimes.reduce((slowest, current) => 
      current.lapTime > slowest.lapTime ? current : slowest
    );
  };

  const fastestLap = getFastestLap();
  const slowestLap = getSlowestLap();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Timer Display */}
        <Card className="bg-gradient-card border-border/50 shadow-card backdrop-blur-sm">
          <div className="p-8 text-center">
            <div className="text-6xl font-mono font-bold text-timer-display transition-all duration-300">
              {formatTime(time)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {isRunning ? 'Running' : time > 0 ? 'Paused' : 'Ready'}
            </div>
          </div>
        </Card>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleStartPause}
            size="lg"
            variant={isRunning ? "secondary" : "default"}
            className={`px-8 py-6 text-lg font-semibold transition-all duration-300 ${
              isRunning 
                ? 'bg-secondary hover:bg-secondary/80' 
                : 'bg-gradient-primary hover:shadow-glow'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>

          {isRunning && (
            <Button
              onClick={handleLap}
              size="lg"
              variant="outline"
              className="px-6 py-6 text-lg font-semibold border-primary/30 hover:bg-primary/10 animate-scale-in"
            >
              <Flag className="w-5 h-5 mr-2" />
              Lap
            </Button>
          )}

          {(time > 0 || lapTimes.length > 0) && !isRunning && (
            <Button
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="px-6 py-6 text-lg font-semibold border-destructive/30 hover:bg-destructive/10 animate-scale-in"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Lap Times */}
        {lapTimes.length > 0 && (
          <Card className="bg-gradient-card border-border/50 shadow-card animate-fade-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Flag className="w-5 h-5 mr-2 text-primary" />
                Lap Times
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {lapTimes.map((lap) => (
                  <div
                    key={lap.id}
                    className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                      lap.id === fastestLap?.id
                        ? 'bg-success/10 border border-success/20'
                        : lap.id === slowestLap?.id && lapTimes.length > 1
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-muted-foreground w-8">
                        #{lap.id}
                      </span>
                      <span className="font-mono text-foreground">
                        {formatTime(lap.lapTime)}
                      </span>
                      {lap.id === fastestLap?.id && (
                        <span className="text-xs bg-success/20 text-success-foreground px-2 py-1 rounded-full">
                          Fastest
                        </span>
                      )}
                      {lap.id === slowestLap?.id && lapTimes.length > 1 && (
                        <span className="text-xs bg-destructive/20 text-destructive-foreground px-2 py-1 rounded-full">
                          Slowest
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatTime(lap.time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;
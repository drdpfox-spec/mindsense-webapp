import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { HelpIcon } from "@/components/HelpIcon";

export default function MedicationHistory() {
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate month boundaries
  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date;
  }, [currentDate]);

  const { data: logs = [] } = trpc.medications.getLogs.useQuery(
    {
      startDate: monthStart,
      endDate: monthEnd,
    },
    { enabled: isAuthenticated }
  );

  const { data: medications = [] } = trpc.medications.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Go to current month
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get days in month
  const daysInMonth = useMemo(() => {
    const days = [];
    const firstDay = monthStart.getDay(); // 0 = Sunday
    const lastDate = monthEnd.getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= lastDate; day++) {
      days.push(day);
    }

    return days;
  }, [monthStart, monthEnd]);

  // Group logs by date
  const logsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    logs.forEach((log: any) => {
      const date = new Date(log.scheduledTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  }, [logs]);

  // Calculate adherence for a specific day
  const getDayAdherence = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toDateString();
    const dayLogs = logsByDate[dateStr] || [];

    if (dayLogs.length === 0) return null;

    const taken = dayLogs.filter((l: any) => l.status === "taken").length;
    const missed = dayLogs.filter((l: any) => l.status === "missed").length;
    const skipped = dayLogs.filter((l: any) => l.status === "skipped").length;

    return { taken, missed, skipped, total: dayLogs.length };
  };

  // Get color class for day based on adherence
  const getDayColorClass = (day: number) => {
    const adherence = getDayAdherence(day);
    if (!adherence) return "bg-gray-50 dark:bg-gray-800";

    const { taken, missed, total } = adherence;
    const adherenceRate = (taken / total) * 100;

    if (adherenceRate === 100) return "bg-green-100 dark:bg-green-900";
    if (missed > 0) return "bg-red-100 dark:bg-red-900";
    return "bg-yellow-100 dark:bg-yellow-900";
  };

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const total = logs.length;
    const taken = logs.filter((l: any) => l.status === "taken").length;
    const missed = logs.filter((l: any) => l.status === "missed").length;
    const skipped = logs.filter((l: any) => l.status === "skipped").length;
    const adherenceRate = total > 0 ? ((taken / total) * 100).toFixed(0) : 0;

    return { total, taken, missed, skipped, adherenceRate };
  }, [logs]);

  // Calculate weekly adherence
  const weeklyAdherence = useMemo(() => {
    const weeks: Record<number, { taken: number; total: number }> = {};
    
    logs.forEach((log: any) => {
      const date = new Date(log.scheduledTime);
      const weekNum = Math.ceil(date.getDate() / 7);
      
      if (!weeks[weekNum]) {
        weeks[weekNum] = { taken: 0, total: 0 };
      }
      
      weeks[weekNum].total++;
      if (log.status === "taken") {
        weeks[weekNum].taken++;
      }
    });

    return Object.entries(weeks).map(([week, stats]) => ({
      week: parseInt(week),
      adherence: stats.total > 0 ? ((stats.taken / stats.total) * 100).toFixed(0) : 0,
    }));
  }, [logs]);

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to view medication history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold">Medication History</h1>
          <HelpIcon
            title="Medication Calendar"
            content="This calendar shows your daily medication adherence. Green days indicate all doses were taken, red days have missed doses, and yellow days have skipped doses. Click on any day to see detailed dose information. Weekly and monthly statistics help you track your overall adherence patterns."
            size="md"
          />
        </div>
        <p className="text-muted-foreground">Track your medication adherence over time</p>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.adherenceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyStats.taken} of {monthlyStats.total} doses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monthlyStats.taken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-600" />
              Missed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monthlyStats.missed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Skipped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{monthlyStats.skipped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Adherence */}
      {weeklyAdherence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Adherence</CardTitle>
            <CardDescription>Adherence percentage by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {weeklyAdherence.map((week) => (
                <div key={week.week} className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Week {week.week}</div>
                  <div className="text-2xl font-bold">{week.adherence}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const adherence = getDayAdherence(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg border-2 ${
                    isToday ? "border-teal-600" : "border-gray-200 dark:border-gray-700"
                  } ${getDayColorClass(day)} p-2 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <div className="text-sm font-semibold">{day}</div>
                  {adherence && (
                    <div className="text-xs mt-1">
                      <div className="flex gap-1">
                        {adherence.taken > 0 && (
                          <span className="text-green-700 dark:text-green-300">✓{adherence.taken}</span>
                        )}
                        {adherence.missed > 0 && (
                          <span className="text-red-700 dark:text-red-300">✗{adherence.missed}</span>
                        )}
                        {adherence.skipped > 0 && (
                          <span className="text-yellow-700 dark:text-yellow-300">⊘{adherence.skipped}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 border border-gray-300" />
              <span>All doses taken</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900 border border-gray-300" />
              <span>Some doses skipped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900 border border-gray-300" />
              <span>Doses missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-50 dark:bg-gray-800 border border-gray-300" />
              <span>No data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Medications */}
      {medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Medications</CardTitle>
            <CardDescription>Currently tracking {medications.filter((m: any) => m.isActive).length} medications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medications
                .filter((m: any) => m.isActive)
                .map((med: any) => {
                  const medLogs = logs.filter((l: any) => l.medicationId === med.id);
                  const medAdherence =
                    medLogs.length > 0
                      ? ((medLogs.filter((l: any) => l.status === "taken").length / medLogs.length) * 100).toFixed(0)
                      : 0;

                  return (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-semibold">{med.name}</div>
                        <div className="text-sm text-muted-foreground">{med.dosage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">This month</div>
                        <div className="text-lg font-bold">{medAdherence}%</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

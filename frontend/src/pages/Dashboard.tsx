import { useMemo, useState, useEffect } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, MapPin, Video } from "lucide-react";

import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStudentBookingsAPI } from "@/service/booking.service";

const CURRENT_STUDENT_ID = "69292f0a423919adced2aa8b";

interface Appointment {
  _id: string;
  tutorId: {
    _id: string;
    username: string;
    fullname?: string;
    subject?: string[];
  };
  startTime?: string;
  endTime?: string;
  meetingType: "online" | "offline";
  status: "pending" | "confirmed" | "cancelled" | "draft" | "completed";
  note?: string;
}

type ClassStatus = "scheduled" | "completed";

interface RegisteredClass {
  id: string;
  code: string;
  title: string;
  date: string;
  time: string;
  type: "online" | "offline";
  location: string;
  status: ClassStatus;
  tutorName?: string;
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper function to convert Appointment to RegisteredClass
const convertAppointmentToClass = (apt: Appointment): RegisteredClass => {
  const startDate = apt.startTime ? new Date(apt.startTime) : new Date();
  const endDate = apt.endTime ? new Date(apt.endTime) : new Date();
  
  const dateStr = format(startDate, "yyyy-MM-dd");
  const timeStr = apt.startTime && apt.endTime
    ? `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`
    : "Chưa có giờ";
  
  const subject = Array.isArray(apt.tutorId?.subject) && apt.tutorId.subject.length > 0
    ? apt.tutorId.subject[0]
    : "Môn học";
  
  const tutorName = apt.tutorId?.fullname || apt.tutorId?.username || "Tutor";
  const location = apt.meetingType === "online" ? "Google Meet" : "H6-101";
  
  // Map status: pending/confirmed -> scheduled, completed -> completed
  // Note: cancelled and draft appointments are filtered out before this function is called
  const status: ClassStatus = 
    (apt.status === "pending" || apt.status === "confirmed") ? "scheduled" : "completed";
  
  return {
    id: apt._id,
    code: subject.substring(0, 8).toUpperCase(),
    title: subject,
    date: dateStr,
    time: timeStr,
    type: apt.meetingType,
    location: location,
    status: status,
    tutorName: tutorName,
  };
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getStudentBookingsAPI(CURRENT_STUDENT_ID);
      setAppointments(data);
      
      // Set default selected to first upcoming appointment
      const upcoming = data
        .filter(apt => apt.status === "pending" || apt.status === "confirmed")
        .sort((a, b) => {
          const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return dateA - dateB;
        });
      if (upcoming.length > 0) {
        setSelectedClassId(upcoming[0]._id);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const classSchedule = useMemo(() => {
    return appointments
      .filter(apt => 
        apt.startTime && 
        apt.endTime && 
        apt.status !== "cancelled" && 
        apt.status !== "draft" // Filter out cancelled and draft appointments
      )
      .map(convertAppointmentToClass);
  }, [appointments]);

  const scheduleByDate = useMemo(() => {
    return classSchedule.reduce<Record<string, RegisteredClass[]>>((acc, cls) => {
      acc[cls.date] = acc[cls.date] ? [...acc[cls.date], cls] : [cls];
      return acc;
    }, {});
  }, [classSchedule]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentDate]);

  const selectedClass = classSchedule.find((cls) => cls.id === selectedClassId) ?? null;

  const upcomingMeetings = classSchedule
    .filter((cls) => cls.status === "scheduled")
    .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date)));

  const pastMeetings = classSchedule
    .filter((cls) => cls.status === "completed")
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

  // Calculate stats for current month
  const currentMonthAppointments = classSchedule.filter(cls => {
    const clsDate = new Date(cls.date);
    return clsDate.getMonth() === currentDate.getMonth() && 
           clsDate.getFullYear() === currentDate.getFullYear();
  });

  const monthStats = {
    scheduled: currentMonthAppointments.filter(cls => cls.status === "scheduled").length,
    completed: currentMonthAppointments.filter(cls => cls.status === "completed").length,
    offDays: 0, // Can be calculated if needed
  };
  const totalSessions = monthStats.scheduled + monthStats.completed || 1;

  const handleSelectDay = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const classes = scheduleByDate[key];
    if (classes?.length) {
      setSelectedClassId(classes[0].id);
    }
  };

  const handleNavigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newMonth =
        direction === "prev"
          ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
          : new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return newMonth;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <p className="uppercase text-xs font-semibold tracking-wider text-primary">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold text-foreground">Buổi học đã đăng ký</h1>
          <p className="text-muted-foreground">
            Theo dõi thời gian biểu, thống kê tháng và các buổi học sắp diễn ra.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card className="border border-border/80">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tháng</p>
                  <h2 className="text-xl font-semibold text-foreground">
                    {format(currentDate, "MMMM yyyy", { locale: vi })}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleNavigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleNavigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
                  {weekdayLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const items = scheduleByDate[key] ?? [];
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = items.some((cls) => cls.id === selectedClassId);

                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => handleSelectDay(day)}
                        className={cn(
                          "min-h-[96px] rounded-md border bg-background text-left p-2 transition hover:border-primary/60",
                          !isCurrentMonth && "border-dashed text-muted-foreground/60",
                          isSelected && "border-primary shadow-sm",
                        )}
                      >
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>{format(day, "d")}</span>
                          {isSameDay(day, new Date()) && isCurrentMonth && (
                            <span className="text-[10px] font-semibold text-primary">Today</span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {items.slice(0, 2).map((cls) => (
                            <Badge
                              key={cls.id}
                              variant="outline"
                              className={cn(
                                "w-full justify-start truncate text-[11px]",
                                cls.status === "scheduled"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
                              )}
                            >
                              {cls.title.length > 10 ? cls.title.substring(0, 10) + "..." : cls.title}
                            </Badge>
                          ))}
                          {items.length > 2 && (
                            <p className="text-[11px] text-muted-foreground">+{items.length - 2} lớp</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {selectedClass && (
              <Card className="border border-primary/20 bg-primary/5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Buổi học đã chọn</p>
                    <h3 className="text-2xl font-semibold text-foreground">
                      {selectedClass.title}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>
                        Ngày:{" "}
                        {format(new Date(selectedClass.date), "EEE dd/MM/yyyy", { locale: vi })}
                      </p>
                      <p>Hình thức: {selectedClass.type === "online" ? "Online" : "Offline"}</p>
                      {selectedClass.tutorName && (
                        <p>Tutor: {selectedClass.tutorName}</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/40 bg-background p-4 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {selectedClass.time}
                    </p>
                    <p className="mt-2 flex items-center gap-2">
                      {selectedClass.type === "online" ? (
                        <Video className="h-4 w-4 text-primary" />
                      ) : (
                        <MapPin className="h-4 w-4 text-primary" />
                      )}
                      {selectedClass.location}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border border-border/80">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Monthly Statistics</h3>
              </div>
              <div className="flex flex-col items-center gap-6 px-6 py-6">
                <div
                  className="relative h-32 w-32 rounded-full"
                  style={{
                    background: `conic-gradient(#f97316 0 ${
                      (monthStats.scheduled / totalSessions) * 360
                    }deg, #2563eb ${
                      (monthStats.scheduled / totalSessions) * 360
                    }deg ${
                      ((monthStats.scheduled + monthStats.completed) / totalSessions) * 360
                    }deg, #e2e8f0 ${
                      ((monthStats.scheduled + monthStats.completed) / totalSessions) * 360
                    }deg 360deg)`,
                  }}
                >
                  <div className="absolute inset-3 rounded-full bg-background" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <p className="text-2xl font-semibold text-foreground">{totalSessions}</p>
                    <span className="text-xs text-muted-foreground">sessions</span>
                  </div>
                </div>
                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                      Scheduled
                    </div>
                    <span className="font-semibold text-foreground">{monthStats.scheduled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                      Completed
                    </div>
                    <span className="font-semibold text-foreground">{monthStats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      Off days
                    </div>
                    <span className="font-semibold text-foreground">{monthStats.offDays}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border/80">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Next meetings</h3>
              </div>
              <div className="divide-y">
                {upcomingMeetings.slice(0, 3).map((meeting) => (
                  <button
                    key={meeting.id}
                    type="button"
                    className="w-full px-6 py-4 text-left transition hover:bg-muted/50"
                    onClick={() => setSelectedClassId(meeting.id)}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {meeting.time} - {meeting.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(meeting.date), "EEE dd/MM/yyyy", { locale: vi })} - {meeting.location}
                    </p>
                  </button>
                ))}
                {upcomingMeetings.length === 0 && (
                  <p className="px-6 py-4 text-sm text-muted-foreground">
                    Không có lịch học sắp tới.
                  </p>
                )}
              </div>
            </Card>

            <Card className="border border-border/80">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Past meetings</h3>
              </div>
              <div className="divide-y">
                {pastMeetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="px-6 py-4">
                    <p className="text-sm font-semibold text-foreground">
                      {meeting.time} - {meeting.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(meeting.date), "EEE dd/MM/yyyy", { locale: vi })}
                    </p>
                  </div>
                ))}
                {pastMeetings.length === 0 && (
                  <p className="px-6 py-4 text-sm text-muted-foreground">
                    Chưa có buổi nào hoàn thành.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

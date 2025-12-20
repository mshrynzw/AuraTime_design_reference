'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface AttendanceRecord {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_work_minutes: number;
  total_break_minutes: number;
  overtime_minutes: number;
  status: string;
  is_approved: boolean;
}

export default function AttendancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    overtimeHours: 0,
    daysWorked: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords();
    }
  }, [user]);

  const fetchAttendanceRecords = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('daily_attendance')
      .select('*')
      .eq('user_id', user?.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (data) {
      setAttendanceRecords(data);

      const totalMinutes = data.reduce((sum, record) => sum + record.total_work_minutes, 0);
      const totalOvertime = data.reduce((sum, record) => sum + record.overtime_minutes, 0);

      setStats({
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        overtimeHours: Math.round(totalOvertime / 60 * 10) / 10,
        daysWorked: data.filter(r => r.status === 'present').length,
      });
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      present: { label: '出勤', variant: 'default' },
      absent: { label: '欠勤', variant: 'destructive' },
      leave: { label: '休暇', variant: 'secondary' },
      holiday: { label: '休日', variant: 'outline' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">勤怠一覧</h1>
          <p className="text-gray-600 mt-1">月別の勤怠記録を確認できます</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総勤務時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}時間</div>
              <p className="text-xs text-muted-foreground">
                今月の累計
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">残業時間</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overtimeHours}時間</div>
              <p className="text-xs text-muted-foreground">
                今月の累計
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">出勤日数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.daysWorked}日</div>
              <p className="text-xs text-muted-foreground">
                今月の累計
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>勤怠記録</CardTitle>
            <CardDescription>今月の勤怠データ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>出勤時刻</TableHead>
                  <TableHead>退勤時刻</TableHead>
                  <TableHead>勤務時間</TableHead>
                  <TableHead>休憩時間</TableHead>
                  <TableHead>残業時間</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>承認</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </TableCell>
                      <TableCell>{formatTime(record.clock_in)}</TableCell>
                      <TableCell>{formatTime(record.clock_out)}</TableCell>
                      <TableCell>
                        {record.total_work_minutes > 0
                          ? formatMinutesToHours(record.total_work_minutes)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.total_break_minutes > 0
                          ? formatMinutesToHours(record.total_break_minutes)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.overtime_minutes > 0
                          ? formatMinutesToHours(record.overtime_minutes)
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.is_approved ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            承認済み
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            未承認
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 h-32">
                      勤怠記録がありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

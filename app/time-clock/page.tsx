'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, LogIn, LogOut, Coffee, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function TimeClockPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStatus, setTodayStatus] = useState<{
    clockedIn: boolean;
    onBreak: boolean;
    lastEntry: any;
  }>({
    clockedIn: false,
    onBreak: false,
    lastEntry: null,
  });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
      fetchRecentEntries();
    }
  }, [user]);

  const fetchTodayStatus = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user?.id)
      .gte('timestamp', `${today}T00:00:00`)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setTodayStatus({
        clockedIn: data.entry_type === 'clock_in' || data.entry_type === 'break_end',
        onBreak: data.entry_type === 'break_start',
        lastEntry: data,
      });
    }
  };

  const fetchRecentEntries = async () => {
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (data) {
      setRecentEntries(data);
    }
  };

  const handlePunchAction = async (entryType: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user?.id,
          company_id: profile?.company_id,
          entry_type: entryType,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;

      const actionName = {
        clock_in: '出勤',
        clock_out: '退勤',
        break_start: '休憩入',
        break_end: '休憩戻',
      }[entryType];

      toast.success(`${actionName}を記録しました`);
      await fetchTodayStatus();
      await fetchRecentEntries();
    } catch (error) {
      toast.error('打刻の記録に失敗しました');
      console.error('Error recording time entry:', error);
    }
  };

  const getEntryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      clock_in: '出勤',
      clock_out: '退勤',
      break_start: '休憩入',
      break_end: '休憩戻',
    };
    return labels[type] || type;
  };

  const getEntryTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      clock_in: 'default',
      clock_out: 'secondary',
      break_start: 'outline',
      break_end: 'outline',
    };
    return variants[type] || 'default';
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
          <h1 className="text-3xl font-bold text-gray-900">打刻</h1>
          <p className="text-gray-600 mt-1">勤怠の記録を行います</p>
        </div>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Clock className="h-12 w-12" />
                </div>
              </div>
            </CardTitle>
            <CardDescription className="text-center">
              <div className="text-6xl font-bold text-white mb-2">
                {currentTime.toLocaleTimeString('ja-JP')}
              </div>
              <div className="text-xl text-blue-100">
                {currentTime.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              {todayStatus.onBreak ? (
                <Badge className="text-lg px-4 py-2 bg-yellow-500">休憩中</Badge>
              ) : todayStatus.clockedIn ? (
                <Badge className="text-lg px-4 py-2 bg-green-500">勤務中</Badge>
              ) : (
                <Badge variant="secondary" className="text-lg px-4 py-2">未出勤</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                size="lg"
                className="h-24 bg-white text-green-600 hover:bg-white/90 font-bold"
                disabled={todayStatus.clockedIn}
                onClick={() => handlePunchAction('clock_in')}
              >
                <div className="flex flex-col items-center gap-2">
                  <LogIn className="h-8 w-8" />
                  <span className="text-lg">出勤</span>
                </div>
              </Button>

              <Button
                size="lg"
                className="h-24 bg-white text-red-600 hover:bg-white/90 font-bold"
                disabled={!todayStatus.clockedIn || todayStatus.onBreak}
                onClick={() => handlePunchAction('clock_out')}
              >
                <div className="flex flex-col items-center gap-2">
                  <LogOut className="h-8 w-8" />
                  <span className="text-lg">退勤</span>
                </div>
              </Button>

              <Button
                size="lg"
                className="h-24 bg-white/10 hover:bg-white/20 backdrop-blur border-2 border-white text-white"
                disabled={!todayStatus.clockedIn || todayStatus.onBreak}
                onClick={() => handlePunchAction('break_start')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Coffee className="h-8 w-8" />
                  <span className="text-lg">休憩入</span>
                </div>
              </Button>

              <Button
                size="lg"
                className="h-24 bg-white/10 hover:bg-white/20 backdrop-blur border-2 border-white text-white"
                disabled={!todayStatus.onBreak}
                onClick={() => handlePunchAction('break_end')}
              >
                <div className="flex flex-col items-center gap-2">
                  <CalendarIcon className="h-8 w-8" />
                  <span className="text-lg">休憩戻</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>打刻履歴</CardTitle>
            <CardDescription>最近の打刻記録（10件）</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.timestamp).toLocaleString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEntryTypeBadge(entry.entry_type)}>
                          {getEntryTypeLabel(entry.entry_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {entry.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      打刻履歴がありません
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

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, TrendingUp, Coffee, LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function DashboardPage() {
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
    }
  }, [user]);

  const fetchTodayStatus = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
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

      await fetchTodayStatus();
    } catch (error) {
      console.error('Error recording time entry:', error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-1">
            ようこそ、{profile?.full_name}さん
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の稼働時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">168時間</div>
              <p className="text-xs text-muted-foreground">
                前月比 +12時間
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">残業時間</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12時間</div>
              <p className="text-xs text-muted-foreground">
                今月の残業合計
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">有給休暇</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15日</div>
              <p className="text-xs text-muted-foreground">
                残り日数
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本日の状態</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayStatus.onBreak ? (
                  <Badge variant="outline" className="text-base">休憩中</Badge>
                ) : todayStatus.clockedIn ? (
                  <Badge className="text-base bg-green-600">勤務中</Badge>
                ) : (
                  <Badge variant="secondary" className="text-base">未出勤</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {todayStatus.lastEntry && new Date(todayStatus.lastEntry.timestamp).toLocaleTimeString('ja-JP')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-2xl">クイック打刻</CardTitle>
            <CardDescription>
              <div className="text-4xl font-bold text-blue-600 mt-4">
                {currentTime.toLocaleTimeString('ja-JP')}
              </div>
              <div className="text-sm text-gray-600 mt-2">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                size="lg"
                className="h-20 bg-green-600 hover:bg-green-700"
                disabled={todayStatus.clockedIn}
                onClick={() => handlePunchAction('clock_in')}
              >
                <div className="flex flex-col items-center gap-2">
                  <LogIn className="h-6 w-6" />
                  <span>出勤</span>
                </div>
              </Button>

              <Button
                size="lg"
                className="h-20 bg-red-600 hover:bg-red-700"
                disabled={!todayStatus.clockedIn || todayStatus.onBreak}
                onClick={() => handlePunchAction('clock_out')}
              >
                <div className="flex flex-col items-center gap-2">
                  <LogOut className="h-6 w-6" />
                  <span>退勤</span>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-20"
                disabled={!todayStatus.clockedIn || todayStatus.onBreak}
                onClick={() => handlePunchAction('break_start')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Coffee className="h-6 w-6" />
                  <span>休憩入</span>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-20"
                disabled={!todayStatus.onBreak}
                onClick={() => handlePunchAction('break_end')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Clock className="h-6 w-6" />
                  <span>休憩戻</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>直近の打刻履歴</CardTitle>
            <CardDescription>最近の勤怠記録</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">2024年12月{20-i}日</p>
                      <p className="text-sm text-gray-600">出勤: 09:00 - 退勤: 18:00</p>
                    </div>
                  </div>
                  <Badge variant="outline">承認済み</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

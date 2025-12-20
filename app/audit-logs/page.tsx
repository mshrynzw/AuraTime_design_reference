'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AuditLogsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
          <h1 className="text-3xl font-bold text-gray-900">監査ログ</h1>
          <p className="text-gray-600 mt-1">システムの操作履歴を確認します</p>
        </div>

        <Card>
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-blue-600 mb-4" />
            <CardTitle>監査ログ機能</CardTitle>
            <CardDescription>この機能は現在開発中です</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              システムの操作履歴、ユーザーアクションのログ表示機能を実装予定です。
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

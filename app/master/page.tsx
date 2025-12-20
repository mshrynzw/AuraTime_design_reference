'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function MasterPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">マスタ管理</h1>
          <p className="text-gray-600 mt-1">システムのマスタデータを管理します</p>
        </div>

        <Card>
          <CardHeader>
            <Settings className="h-12 w-12 text-blue-600 mb-4" />
            <CardTitle>マスタ管理機能</CardTitle>
            <CardDescription>この機能は現在開発中です</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              従業員、グループ、シフトテンプレートなどのマスタデータ管理機能を実装予定です。
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Database, CheckCircle2, XCircle, Loader2, Copy, Play, ChevronDown,
  ChevronRight, AlertTriangle, Terminal, RefreshCw, ArrowRight, Info,
  Zap, Shield, FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VicksLogo } from "@/components/VicksLogo";
import { useUser } from "@/lib/supabase-hooks";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  MIGRATIONS,
  BOOTSTRAP_SQL,
  type MigrationStatus,
} from "@/lib/migration-config";
import {
  checkMigrationStatuses,
  readMigrationSQL,
  runMigration,
} from "@/app/actions/setup-actions";

const OWNER_EMAILS = ["vicksmarket@gmail.com", "mom1113694362@gmail.com", "mom01113694362@icloud.com"];

function StatusBadge({ applied, small }: { applied: boolean; small?: boolean }) {
  return applied ? (
    <span className={cn("flex items-center gap-1 font-black text-green-600 bg-green-50 dark:bg-green-950/30 rounded-full px-2", small ? "text-[9px] py-0.5" : "text-[10px] py-1")}>
      <CheckCircle2 className={small ? "w-2.5 h-2.5" : "w-3 h-3"} /> مُطبَّق
    </span>
  ) : (
    <span className={cn("flex items-center gap-1 font-black text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-full px-2", small ? "text-[9px] py-0.5" : "text-[10px] py-1")}>
      <XCircle className={small ? "w-2.5 h-2.5" : "w-3 h-3"} /> معلَّق
    </span>
  );
}

function CopyButton({ text, label = "نسخ" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "✅ تم النسخ" });
    });
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
      <Copy className="w-3 h-3" />
      {copied ? "تم!" : label}
    </button>
  );
}

interface RunState {
  loading: boolean;
  result: null | { success: boolean; executed: number; errors: { statement: string; error: string }[]; noExecSqlFunction?: boolean };
}

export default function SetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const isOwner = user?.email && OWNER_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    if (!authLoading && !isOwner) router.replace("/owner/login");
  }, [authLoading, isOwner, router]);

  const [statuses, setStatuses] = useState<MigrationStatus[] | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [expandedSQL, setExpandedSQL] = useState<Record<string, boolean>>({});
  const [sqlContents, setSqlContents] = useState<Record<string, string>>({});
  const [runStates, setRunStates] = useState<Record<string, RunState>>({});
  const [bootstrapExpanded, setBootstrapExpanded] = useState(false);

  const loadStatuses = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const result = await checkMigrationStatuses();
      setStatuses(result);
    } catch (e: any) {
      setStatusError(e.message);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) loadStatuses();
  }, [isOwner, loadStatuses]);

  const toggleSQL = async (file: string) => {
    setExpandedSQL(prev => ({ ...prev, [file]: !prev[file] }));
    if (!sqlContents[file]) {
      try {
        const sql = await readMigrationSQL(file);
        setSqlContents(prev => ({ ...prev, [file]: sql }));
      } catch (e: any) {
        setSqlContents(prev => ({ ...prev, [file]: `-- Error loading file: ${e.message}` }));
      }
    }
  };

  const handleRun = async (file: string) => {
    setRunStates(prev => ({ ...prev, [file]: { loading: true, result: null } }));
    try {
      const result = await runMigration(file);
      setRunStates(prev => ({ ...prev, [file]: { loading: false, result } }));
      if (result.success) {
        toast({ title: `✅ تم تطبيق ${file} بنجاح (${result.executed} أمر)` });
        // Refresh statuses
        await loadStatuses();
      } else if (result.noExecSqlFunction) {
        toast({ variant: "destructive", title: "دالة exec_sql غير موجودة — راجع قسم الإعداد أدناه" });
        setBootstrapExpanded(true);
      } else {
        toast({ variant: "destructive", title: `اكتمل مع ${result.errors.length} خطأ` });
      }
    } catch (e: any) {
      setRunStates(prev => ({ ...prev, [file]: { loading: false, result: { success: false, executed: 0, errors: [{ statement: "", error: e.message }] } } }));
      toast({ variant: "destructive", title: "فشل التنفيذ", description: e.message });
    }
  };

  const pendingCount = statuses?.filter(s => !s.applied).length ?? 0;
  const appliedCount = statuses?.filter(s => s.applied).length ?? 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A2332]">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
      </div>
    );
  }
  if (!isOwner) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-28 text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <VicksLogo className="w-8 h-8" />
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-orange-500" />
          <span className="font-black text-sm dark:text-white">إعداد قاعدة البيانات</span>
        </div>
        <button
          onClick={() => router.push("/owner")}
          className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </button>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Summary Card */}
        <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-500" />
              <span className="font-black text-sm dark:text-white">حالة الهجرات</span>
            </div>
            <button onClick={loadStatuses} disabled={statusLoading}
              className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
              <RefreshCw className={cn("w-3.5 h-3.5 text-orange-500", statusLoading && "animate-spin")} />
            </button>
          </div>

          {statusLoading && !statuses ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
            </div>
          ) : statusError ? (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs font-bold">{statusError}</p>
            </div>
          ) : statuses ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="font-black text-lg dark:text-white">{statuses.length}</p>
                  <p className="text-[9px] font-bold text-slate-400">إجمالي</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center">
                  <p className="font-black text-lg text-green-600">{appliedCount}</p>
                  <p className="text-[9px] font-bold text-slate-400">مُطبَّق</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 text-center">
                  <p className="font-black text-lg text-orange-500">{pendingCount}</p>
                  <p className="text-[9px] font-bold text-slate-400">معلَّق</p>
                </div>
              </div>
              {pendingCount === 0 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="text-xs font-black">قاعدة البيانات محدَّثة بالكامل 🎉</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-black">{pendingCount} هجرة لم تُطبَّق بعد</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Bootstrap Card */}
        <div className="bg-white dark:bg-[#252D3D] rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setBootstrapExpanded(p => !p)}
            className="w-full flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex-1 text-right">
              <p className="font-black text-sm dark:text-white">الخطوة 0 — تفعيل التنفيذ التلقائي</p>
              <p className="text-[10px] text-slate-400 font-bold">شغِّل هذا مرة واحدة في محرر Supabase SQL لتفعيل زر التشغيل</p>
            </div>
            {bootstrapExpanded
              ? <ChevronDown className="w-4 h-4 text-slate-400" />
              : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {bootstrapExpanded && (
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  انسخ الكود أدناه والصقه في{" "}
                  <a
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "https://supabase.com/dashboard/project/")?.split(".supabase")[0]}/sql`}
                    target="_blank" rel="noopener noreferrer"
                    className="underline">محرر Supabase SQL</a>
                  {" "}ثم اضغط Run. بعد ذلك يمكنك تشغيل جميع الهجرات من هنا مباشرة.
                </p>
              </div>
              <div className="relative">
                <pre className="bg-slate-900 text-green-400 text-[10px] p-3 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                  {BOOTSTRAP_SQL}
                </pre>
                <div className="absolute top-2 left-2">
                  <CopyButton text={BOOTSTRAP_SQL} label="نسخ الكود" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Migration Cards */}
        {MIGRATIONS.map((migration, idx) => {
          const status = statuses?.find(s => s.file === migration.file);
          const runState = runStates[migration.file];
          const isExpanded = expandedSQL[migration.file];
          const sqlContent = sqlContents[migration.file];

          return (
            <div key={migration.file} className="bg-white dark:bg-[#252D3D] rounded-2xl overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-orange-500">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-sm dark:text-white">{migration.title}</p>
                      {status && <StatusBadge applied={status.applied} small />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{migration.description}</p>
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 font-mono mt-1 ltr text-left">
                      {migration.file}
                    </p>
                  </div>
                </div>

                {/* Missing info */}
                {status && !status.applied && (status.missingTables.length > 0 || status.missingColumns.length > 0) && (
                  <div className="mt-2 mr-10">
                    {status.missingTables.length > 0 && (
                      <p className="text-[9px] font-bold text-red-500">
                        جداول ناقصة: {status.missingTables.join(", ")}
                      </p>
                    )}
                    {status.missingColumns.length > 0 && (
                      <p className="text-[9px] font-bold text-orange-500">
                        أعمدة ناقصة: {status.missingColumns.map(c => `${c.table}.${c.column}`).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="px-4 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Toggle SQL */}
                  <button
                    onClick={() => toggleSQL(migration.file)}
                    className="flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-orange-500 transition-colors">
                    <FileCode2 className="w-3 h-3" />
                    {isExpanded ? "إخفاء SQL" : "عرض SQL"}
                  </button>

                  {/* Copy SQL */}
                  {sqlContent && (
                    <CopyButton text={sqlContent} />
                  )}
                </div>

                {/* Run button */}
                <Button
                  onClick={() => handleRun(migration.file)}
                  disabled={runState?.loading}
                  size="sm"
                  className={cn(
                    "h-8 rounded-xl font-black text-[11px] gap-1",
                    status?.applied
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  )}>
                  {runState?.loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {status?.applied ? "إعادة تشغيل" : "تطبيق"}
                </Button>
              </div>

              {/* Run result */}
              {runState?.result && (
                <div className={cn(
                  "mx-4 mb-3 rounded-xl p-3",
                  runState.result.noExecSqlFunction
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : runState.result.success
                    ? "bg-green-50 dark:bg-green-950/20"
                    : "bg-red-50 dark:bg-red-950/20"
                )}>
                  {runState.result.noExecSqlFunction ? (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-amber-700 dark:text-amber-300">
                          دالة exec_sql غير موجودة
                        </p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          شغِّل "الخطوة 0" أعلاه في محرر Supabase SQL أولاً
                        </p>
                      </div>
                    </div>
                  ) : runState.result.success ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-black text-green-700 dark:text-green-300">
                        تم تنفيذ {runState.result.executed} أمر بنجاح ✅
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs font-black text-red-600">
                          {runState.result.executed} أمر ناجح، {runState.result.errors.length} خطأ
                        </p>
                      </div>
                      <div className="space-y-1 mt-1">
                        {runState.result.errors.slice(0, 3).map((err, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900 rounded-lg p-2">
                            <p className="text-[9px] font-mono text-red-500 line-clamp-2">{err.error}</p>
                            {err.statement && (
                              <p className="text-[9px] font-mono text-slate-400 line-clamp-1 mt-0.5">{err.statement}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SQL Code Block */}
              {isExpanded && (
                <div className="mx-4 mb-4 relative">
                  {!sqlContent ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin w-4 h-4 text-orange-500" />
                    </div>
                  ) : (
                    <>
                      <pre className="bg-slate-900 text-green-300 text-[9px] p-3 rounded-xl overflow-x-auto leading-relaxed font-mono max-h-60 whitespace-pre-wrap">
                        {sqlContent}
                      </pre>
                      <div className="absolute top-2 left-2">
                        <CopyButton text={sqlContent} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Quick-run all pending */}
        {statuses && pendingCount > 0 && (
          <div className="bg-orange-500 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" />
              <p className="font-black text-sm">تطبيق كل الهجرات المعلقة</p>
            </div>
            <p className="text-[10px] font-bold text-orange-100 mb-3">
              {pendingCount} هجرة لم تُطبَّق. تأكد من تشغيل الخطوة 0 أولاً ثم اضغط.
            </p>
            <Button
              onClick={async () => {
                const pending = statuses.filter(s => !s.applied).map(s => s.file);
                for (const file of pending) {
                  await handleRun(file);
                }
              }}
              className="w-full h-11 bg-white text-orange-500 hover:bg-orange-50 rounded-xl font-black text-sm">
              <Play className="w-4 h-4 ml-1" />
              تشغيل {pendingCount} هجرة الآن
            </Button>
          </div>
        )}

        {/* Info footer */}
        <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <p className="font-black text-xs dark:text-white">ملاحظات مهمة</p>
          </div>
          <ul className="space-y-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 list-disc list-inside">
            <li>جميع الهجرات آمنة للتكرار (IF NOT EXISTS / ON CONFLICT DO NOTHING)</li>
            <li>يتطلب زر التشغيل وجود دالة exec_sql في Supabase (راجع الخطوة 0)</li>
            <li>يمكنك دائماً نسخ SQL يدوياً وتشغيله في محرر Supabase SQL</li>
            <li>الهجرات تُنفَّذ بمفتاح service_role الذي يتجاوز RLS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

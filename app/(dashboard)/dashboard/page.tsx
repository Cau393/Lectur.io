// Layer: UI
// Type: Server Component — page structure
// RLS: N/A — page structure only

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddSubjectForm } from '@/components/dashboard/AddSubjectForm';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <Card className="max-w-xl rounded-xl border-[var(--bg-border)] bg-[var(--bg-surface)] p-6 shadow-none transition-all duration-200 ease-out">
        <CardHeader className="space-y-2 p-0 pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Add Subject
          </CardTitle>
          <CardDescription className="text-base text-[var(--text-secondary)]">
            Enter a subject name and AI will generate an 80-minute class syllabus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <AddSubjectForm />
        </CardContent>
      </Card>
    </div>
  );
}

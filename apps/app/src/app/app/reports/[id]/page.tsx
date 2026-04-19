import { ReportDetailPage } from "@/components/reports/ReportDetailPage"

export default async function ReportDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <ReportDetailPage reportId={id} />
}
import { Document, Page, StyleSheet, Text, View, type DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"

import { formatCurrency, formatNumber } from "@/lib/data/locations.shared"
import { formatReportDate, markdownToBlocks } from "@/lib/reports/shared"
import type { ReportDetailRecord } from "@/types/report"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    color: "#0f172a",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  brand: {
    fontSize: 12,
    color: "#0f766e",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    color: "#475569",
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  metricLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#64748b",
  },
  value: {
    color: "#0f172a",
    maxWidth: "60%",
    textAlign: "right",
  },
  insightCard: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  insightMeta: {
    color: "#475569",
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 6,
    color: "#0f172a",
    lineHeight: 1.5,
  },
  bullet: {
    marginBottom: 4,
    color: "#0f172a",
    paddingLeft: 8,
  },
})

export function buildReportPdfDocument(report: ReportDetailRecord): ReactElement<DocumentProps> {
  const snapshot = report.report_payload_json.location_snapshot

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Nordly</Text>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.subtitle}>
            {report.company_name} • {report.location_name ?? snapshot.location_name} • {formatReportDate(report.created_at)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.card}>
            <Text style={styles.paragraph}>{report.summary_json.executive_summary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Savings Summary</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Monthly Savings</Text>
              <Text style={styles.metricValue}>{formatCurrency(report.estimated_monthly_savings_value)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Yearly Savings</Text>
              <Text style={styles.metricValue}>{formatCurrency(report.estimated_yearly_savings_value)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValue}>{Math.round(report.overall_confidence_score * 100)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Snapshot</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{snapshot.location_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location type</Text>
              <Text style={styles.value}>{snapshot.location_type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Industry</Text>
              <Text style={styles.value}>{snapshot.industry}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>City</Text>
              <Text style={styles.value}>{snapshot.city}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Country</Text>
              <Text style={styles.value}>{snapshot.country}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Floor area</Text>
              <Text style={styles.value}>{snapshot.floor_area_sqm > 0 ? `${formatNumber(snapshot.floor_area_sqm)} sqm` : "Not provided"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Insights</Text>
          {report.insights.map((insight) => {
            const markdown = markdownToBlocks(insight.description_md)

            return (
              <View key={insight.id || insight.title} style={styles.insightCard}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightMeta}>
                  {insight.category} • {formatCurrency(insight.estimated_savings_value)} / month • {insight.estimated_savings_percent}% estimated savings
                </Text>
                {markdown.paragraphs.map((paragraph, index) => (
                  <Text key={`${insight.title}-p-${index}`} style={styles.paragraph}>{paragraph}</Text>
                ))}
                {markdown.bullets.map((bullet, index) => (
                  <Text key={`${insight.title}-b-${index}`} style={styles.bullet}>• {bullet}</Text>
                ))}
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.card}>
            {report.next_steps.map((step, index) => (
              <Text key={`step-${index}`} style={styles.bullet}>• {step}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}

export function ReportPdfDocument({ report }: { report: ReportDetailRecord }) {
  return buildReportPdfDocument(report)
}
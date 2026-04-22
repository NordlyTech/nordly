import { Circle, Document, Page, Path, StyleSheet, Svg, Text, View, type DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"

import { formatCurrency, formatNumber } from "@/lib/data/locations.shared"
import { formatReportDate, isPremiumTier, markdownToBlocks } from "@/lib/reports/shared"
import type { ReportDetailRecord } from "@/types/report"

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 34,
    fontSize: 10.5,
    color: "#1F2A37",
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  brandLockup: {
    marginLeft: 8,
  },
  brandText: {
    fontSize: 13,
    color: "#0A6F92",
    fontWeight: 700,
  },
  brandSubtext: {
    marginTop: 2,
    fontSize: 9.5,
    color: "#64748B",
  },
  header: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE6EE",
  },
  title: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: 7,
    lineHeight: 1.2,
  },
  subtitle: {
    color: "#64748B",
    lineHeight: 1.5,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 10,
    backgroundColor: "#F4F8FB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  metaChipLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
    letterSpacing: 0.8,
  },
  metaChipValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1F2A37",
  },
  sectionHeadingBlock: {
    marginBottom: 10,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 9,
    color: "#1F2A37",
  },
  metricsRow: {
    flexDirection: "row",
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  metricCardLast: {
    marginRight: 0,
  },
  metricLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748B",
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1F2A37",
  },
  card: {
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  cardMuted: {
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#F4F8FB",
  },
  twoColumn: {
    flexDirection: "row",
    marginBottom: 10,
  },
  columnLeft: {
    width: "49%",
    marginRight: "2%",
  },
  columnRight: {
    width: "49%",
  },
  subtleText: {
    color: "#64748B",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#64748B",
  },
  value: {
    color: "#1F2A37",
    maxWidth: "60%",
    textAlign: "right",
    fontWeight: 600,
  },
  insightCard: {
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  insightHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  insightTag: {
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 8,
    backgroundColor: "#F4F8FB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 5,
  },
  insightTagText: {
    fontSize: 8,
    color: "#1F2A37",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  priorityHigh: {
    borderColor: "#F3D8D8",
    backgroundColor: "#FDF2F2",
  },
  priorityMedium: {
    borderColor: "#F3E7CE",
    backgroundColor: "#FFF8ED",
  },
  priorityLow: {
    borderColor: "#DCE6EE",
    backgroundColor: "#F4F8FB",
  },
  insightMetricGrid: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
  },
  insightMetricCell: {
    flex: 1,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#F4F8FB",
  },
  insightMetricCellLast: {
    marginRight: 0,
  },
  insightMetricLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 3,
  },
  insightMetricValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1F2A37",
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: 700,
    maxWidth: "72%",
    lineHeight: 1.3,
  },
  insightMeta: {
    color: "#64748B",
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 6,
    color: "#1F2A37",
    lineHeight: 1.5,
  },
  bullet: {
    marginBottom: 4,
    color: "#1F2A37",
    paddingLeft: 8,
  },
  prioritiesRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  priorityCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DCE6EE",
    backgroundColor: "#F4F8FB",
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
    minHeight: 56,
  },
  priorityCardLast: {
    marginRight: 0,
  },
  priorityIndex: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#64748B",
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 600,
    lineHeight: 1.35,
    color: "#1F2A37",
  },
  numberedStep: {
    borderWidth: 1,
    borderColor: "#DCE6EE",
    borderRadius: 10,
    backgroundColor: "#F4F8FB",
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0E8DB8",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 1.6,
    fontSize: 9,
    fontWeight: 700,
    marginRight: 8,
  },
  stepText: {
    flex: 1,
    color: "#1F2A37",
    lineHeight: 1.45,
  },
  footerCta: {
    borderWidth: 1,
    borderColor: "#B9E3EF",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#D9F0F7",
  },
  footerCtaTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: "#0A6F92",
  },
  footerCtaBody: {
    color: "#1F2A37",
    lineHeight: 1.5,
  },
  reportFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#DCE6EE",
  },
  reportFooterText: {
    color: "#64748B",
    fontSize: 8,
    textAlign: "center",
  },
})

function asReadableText(value: string | null | undefined, fallback = "Not available") {
  if (!value) {
    return fallback
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : fallback
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "Not available"
  }

  return `${Math.round(value * 100)}%`
}

function formatInsightPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "Not available"
  }

  return `${value}%`
}

function priorityStyle(priority: string) {
  if (priority === "high") {
    return styles.priorityHigh
  }

  if (priority === "medium") {
    return styles.priorityMedium
  }

  return styles.priorityLow
}

function NordlyPdfLogo() {
  return (
    <View style={styles.brandRow}>
      <Svg width={26} height={26} viewBox="0 0 220 230">
        <Circle cx="110" cy="115" r="98" fill="#0E8DB8" />
        <Path
          d="M74 112C74 85 97 65 145 68C149 117 133 147 106 156C86 162 72 149 74 112Z"
          stroke="#FFFFFF"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M72 159L127 104"
          stroke="#FFFFFF"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.brandLockup}>
        <Text style={styles.brandText}>Nordly</Text>
        <Text style={styles.brandSubtext}>Energy intelligence</Text>
      </View>
    </View>
  )
}

function reportCompanyLine(report: ReportDetailRecord) {
  const snapshot = report.report_payload_json.location_snapshot
  const locationName = report.location_name ?? snapshot.location_name
  return `${asReadableText(report.company_name)} • ${asReadableText(locationName)} • ${formatReportDate(report.created_at)}`
}

function ReportCoverPage({ report }: { report: ReportDetailRecord }) {
  const priorities = report.summary_json.top_priorities.slice(0, 3)

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <NordlyPdfLogo />
        <Text style={styles.title}>{asReadableText(report.title, "Executive Energy Savings Report")}</Text>
        <Text style={styles.subtitle}>{reportCompanyLine(report)}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeadingBlock} wrap={false}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.paragraph}>{asReadableText(report.summary_json.executive_summary, "No executive summary available.")}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipLabel}>Report Type</Text>
              <Text style={styles.metaChipValue}>Executive Savings</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipLabel}>Status</Text>
              <Text style={styles.metaChipValue}>{asReadableText(report.status)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeadingBlock} wrap={false}>
          <Text style={styles.sectionTitle}>Savings Overview</Text>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Estimated Monthly Savings</Text>
            <Text style={styles.metricValue}>{formatCurrency(report.estimated_monthly_savings_value)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Estimated Yearly Savings</Text>
            <Text style={styles.metricValue}>{formatCurrency(report.estimated_yearly_savings_value)}</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardLast]}>
            <Text style={styles.metricLabel}>Confidence Score</Text>
            <Text style={styles.metricValue}>{formatPercent(report.overall_confidence_score)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeadingBlock} wrap={false}>
          <Text style={styles.sectionTitle}>Top 3 Priorities</Text>
        </View>
        <View style={styles.prioritiesRow}>
          {[0, 1, 2].map((index) => (
            <View key={`priority-${index}`} style={index === 2 ? [styles.priorityCard, styles.priorityCardLast] : styles.priorityCard}>
              <Text style={styles.priorityIndex}>Priority {index + 1}</Text>
              <Text style={styles.priorityText}>{asReadableText(priorities[index], "No priority available")}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  )
}

function ReportLocationSnapshotPage({ report }: { report: ReportDetailRecord }) {
  const snapshot = report.report_payload_json.location_snapshot

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <NordlyPdfLogo />
        <Text style={styles.sectionTitle}>Location Snapshot</Text>
        <Text style={styles.subtitle}>{reportCompanyLine(report)}</Text>
      </View>

      <View style={styles.twoColumn}>
        <View style={styles.columnLeft}>
          <View style={styles.card}>
            <Text style={styles.metricLabel}>Location Profile</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Company</Text>
              <Text style={styles.value}>{asReadableText(snapshot.company_name)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Industry</Text>
              <Text style={styles.value}>{asReadableText(snapshot.industry)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{asReadableText(snapshot.location_name)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Location Type</Text>
              <Text style={styles.value}>{asReadableText(snapshot.location_type)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>City</Text>
              <Text style={styles.value}>{asReadableText(snapshot.city)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Country</Text>
              <Text style={styles.value}>{asReadableText(snapshot.country)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.columnRight}>
          <View style={styles.cardMuted}>
            <Text style={styles.metricLabel}>Operational Context</Text>
            <Text style={styles.subtleText}>{asReadableText(snapshot.operating_hours_notes, "Operating hour details not provided.")}</Text>
            <Text style={styles.metricLabel}>Occupancy Notes</Text>
            <Text style={styles.subtleText}>{asReadableText(snapshot.occupancy_notes, "Occupancy notes not provided.")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.twoColumn}>
        <View style={styles.columnLeft}>
          <View style={styles.card}>
            <Text style={styles.metricLabel}>Energy Context</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Known Energy Cost</Text>
              <Text style={styles.value}>{snapshot.known_energy_cost > 0 ? formatCurrency(snapshot.known_energy_cost) : "Not provided"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Known Energy kWh</Text>
              <Text style={styles.value}>{snapshot.known_energy_kwh > 0 ? formatNumber(snapshot.known_energy_kwh) : "Not provided"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Floor Area</Text>
              <Text style={styles.value}>{snapshot.floor_area_sqm > 0 ? `${formatNumber(snapshot.floor_area_sqm)} sqm` : "Not provided"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.columnRight}>
          {snapshot.equipment_context.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.metricLabel}>Equipment Context</Text>
              {snapshot.equipment_context.slice(0, 10).map((entry, index) => (
                <Text key={`equipment-${index}`} style={styles.bullet}>• {entry}</Text>
              ))}
            </View>
          ) : (
            <View style={styles.cardMuted}>
              <Text style={styles.metricLabel}>Equipment Context</Text>
              <Text style={styles.subtleText}>No equipment context is available for this location.</Text>
            </View>
          )}
        </View>
      </View>
    </Page>
  )
}

function ReportOpportunitiesPages({ report }: { report: ReportDetailRecord }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <NordlyPdfLogo />
        <Text style={styles.sectionTitle}>Opportunities</Text>
        <Text style={styles.subtitle}>Commercial recommendations prioritized for impact, feasibility, and confidence.</Text>
      </View>

      {report.insights.map((insight) => {
        const markdown = markdownToBlocks(insight.description_md)

        return (
          <View key={insight.id || insight.title} style={styles.insightCard} wrap={false}>
            <View style={styles.insightHeaderRow}>
              <Text style={styles.insightTitle}>{asReadableText(insight.title, "Opportunity")}</Text>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.insightTag}>
                  <Text style={styles.insightTagText}>{asReadableText(insight.category)}</Text>
                </View>
                <View style={[styles.insightTag, priorityStyle(insight.priority)]}>
                  <Text style={styles.insightTagText}>{asReadableText(insight.priority)} priority</Text>
                </View>
              </View>
            </View>

            <Text style={styles.insightMeta}>{asReadableText(insight.summary, "No summary provided.")}</Text>

            <View style={styles.insightMetricGrid}>
              <View style={styles.insightMetricCell}>
                <Text style={styles.insightMetricLabel}>Estimated Value</Text>
                <Text style={styles.insightMetricValue}>{formatCurrency(insight.estimated_savings_value)}</Text>
              </View>
              <View style={styles.insightMetricCell}>
                <Text style={styles.insightMetricLabel}>Savings Percent</Text>
                <Text style={styles.insightMetricValue}>{formatInsightPercent(insight.estimated_savings_percent)}</Text>
              </View>
              <View style={[styles.insightMetricCell, styles.insightMetricCellLast]}>
                <Text style={styles.insightMetricLabel}>Confidence</Text>
                <Text style={styles.insightMetricValue}>{formatPercent(insight.confidence_score)}</Text>
              </View>
            </View>

            <View style={styles.insightMetricGrid}>
              <View style={styles.insightMetricCell}>
                <Text style={styles.insightMetricLabel}>Effort Level</Text>
                <Text style={styles.insightMetricValue}>{asReadableText(insight.effort_level)}</Text>
              </View>
              <View style={[styles.insightMetricCell, styles.insightMetricCellLast]}>
                <Text style={styles.insightMetricLabel}>Recommended Action</Text>
                <Text style={styles.insightMetricValue}>{asReadableText(insight.mission_recommendation, "No recommendation available")}</Text>
              </View>
            </View>

            {markdown.paragraphs.map((paragraph, index) => (
              <Text key={`${insight.title}-p-${index}`} style={styles.paragraph}>{paragraph}</Text>
            ))}

            {markdown.bullets.map((bullet, index) => (
              <Text key={`${insight.title}-b-${index}`} style={styles.bullet}>• {bullet}</Text>
            ))}
          </View>
        )
      })}
    </Page>
  )
}

function ReportFinalPage({ report }: { report: ReportDetailRecord }) {
  const showPremiumCta = !isPremiumTier(report.subscription_tier)

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <NordlyPdfLogo />
        <Text style={styles.sectionTitle}>Next Steps</Text>
        <Text style={styles.subtitle}>A practical sequence to convert recommendations into measurable business outcomes.</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeadingBlock} wrap={false}>
          <Text style={styles.sectionTitle}>Prioritized Action Plan</Text>
        </View>
        {report.next_steps.length > 0 ? report.next_steps.slice(0, 6).map((step, index) => (
          <View key={`step-${index}`} style={styles.numberedStep} wrap={false}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        )) : (
          <View style={styles.cardMuted}>
            <Text style={styles.subtleText}>No next steps available.</Text>
          </View>
        )}
      </View>

      {showPremiumCta ? (
        <View style={styles.section} wrap={false}>
          <View style={styles.footerCta}>
            <Text style={styles.footerCtaTitle}>Unlock Deeper Report Accuracy</Text>
            <Text style={styles.footerCtaBody}>
              Add equipment and unlock deeper report accuracy with Nordly Premium.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.reportFooter}>
        <Text style={styles.reportFooterText}>
          Generated by Nordly • AI-powered energy savings and ESG action platform
        </Text>
      </View>
    </Page>
  )
}

export function buildReportPdfDocument(report: ReportDetailRecord): ReactElement<DocumentProps> {
  return (
    <Document>
      <ReportCoverPage report={report} />
      <ReportLocationSnapshotPage report={report} />
      <ReportOpportunitiesPages report={report} />
      <ReportFinalPage report={report} />
    </Document>
  )
}

export function ReportPdfDocument({ report }: { report: ReportDetailRecord }) {
  return buildReportPdfDocument(report)
}
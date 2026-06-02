import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { TailoredCv } from '#/schemas/tailored-cv'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.4 },
  jobTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  company: { fontSize: 12, color: '#555555', marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  item: { marginBottom: 8 },
  itemTitle: { fontFamily: 'Helvetica-Bold' },
  itemMeta: { color: '#777777', fontSize: 9, marginBottom: 2 },
  bullet: { flexDirection: 'row', marginBottom: 2 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
})

type CvDocumentProps = {
  jobTitle: string
  company: string
  cv: TailoredCv
}

export function CvDocument({ jobTitle, company, cv }: CvDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.jobTitle}>{jobTitle}</Text>
        <Text style={styles.company}>{company}</Text>

        <Text style={styles.sectionTitle}>Summary</Text>
        <Text>{cv.summary}</Text>

        {cv.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{cv.skills.join(' · ')}</Text>
          </>
        )}

        {cv.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {exp.role} — {exp.organization}
                </Text>
                <Text style={styles.itemMeta}>{exp.period}</Text>
                {exp.highlights.map((h, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {cv.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {cv.projects.map((p, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemTitle}>{p.name}</Text>
                <Text>{p.description}</Text>
                {p.highlights.map((h, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {cv.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((e, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemTitle}>{e.degree}</Text>
                <Text style={styles.itemMeta}>
                  {e.institution} · {e.period}
                </Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}

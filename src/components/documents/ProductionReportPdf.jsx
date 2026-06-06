import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logoSrc from '../../assets/logo.png';
import { formatCurrency } from '../../lib/utils';

const C = {
  black:     '#0A0A0B',
  gray900:   '#3F3F46',
  gray700:   '#52525B',
  gray600:   '#71717A',
  gray300:   '#D1D1D6',
  gray100:   '#F4F4F5',
  white:     '#FFFFFF',
  champagne: '#C9B99A',
};

const s = StyleSheet.create({
  page:        { padding: '15mm 18mm 26mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logo:        { width: 90, height: 55, objectFit: 'contain' },
  docBlock:    { alignItems: 'flex-end' },
  docTitle:    { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase', letterSpacing: -0.5 },
  docSub:      { fontSize: 8, color: C.gray600, marginTop: 3, letterSpacing: 0.5 },

  dividerGray: { height: 0.5, backgroundColor: C.gray300 },
  dividerChamp:{ height: 2, backgroundColor: C.champagne, marginBottom: 10 },

  metaStrip:   { backgroundColor: C.gray100, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderRadius: 4 },
  metaItem:    { fontSize: 7.5, color: C.gray700 },
  metaBold:    { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.black },

  // Employee block
  empBlock:    { marginBottom: 12 },
  empHeader:   { backgroundColor: C.black, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 },
  empName:     { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
  empMeta:     { fontSize: 7.5, color: '#A1A1AA' },

  // Table
  tableHead:   { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, backgroundColor: C.gray100, borderBottom: '0.5px solid ' + C.gray300 },
  tableRow:    { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, borderBottom: '0.25px solid #E4E4E7' },
  th:          { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.7 },
  td:          { fontSize: 8.5, color: C.black },
  tdMuted:     { fontSize: 7, color: C.gray600 },

  colDate:     { width: 52 },
  colWork:     { flex: 1 },
  colQty:      { width: 30, textAlign: 'right' },
  colPrice:    { width: 65, textAlign: 'right', fontFamily: 'Courier' },
  colTotal:    { width: 65, textAlign: 'right', fontFamily: 'Courier' },

  subtotalRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#FAFAFA', borderBottom: '0.5px solid ' + C.gray300 },
  subtotalLbl: { fontSize: 8, color: C.gray700, marginRight: 8 },
  subtotalVal: { fontSize: 9, fontFamily: 'Courier-Bold', color: C.black, width: 65, textAlign: 'right' },

  // Grand total
  grandBox:    { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end' },
  grandInner:  { borderTop: '2px solid ' + C.champagne, paddingTop: 8, paddingHorizontal: 14, alignItems: 'flex-end' },
  grandLbl:    { fontSize: 8, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  grandVal:    { fontSize: 16, fontFamily: 'Courier-Bold', color: C.black },

  footer:      { position: 'absolute', bottom: '10mm', left: '18mm', right: '18mm' },
  footerLine:  { height: 0.5, backgroundColor: C.gray300, marginBottom: 4 },
  footerRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  footerText:  { fontSize: 6, color: '#A1A1AA' },
});

function formatPdfDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPdfDateLong(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function groupByEmployee(records) {
  const map = {};
  for (const r of records) {
    const emp = r.employees;
    if (!emp) continue;
    if (!map[emp.id]) map[emp.id] = { employee: emp, records: [], subtotal: 0 };
    map[emp.id].records.push(r);
    map[emp.id].subtotal += Number(r.total || 0);
  }
  return Object.values(map).sort((a, b) => a.employee.name.localeCompare(b.employee.name));
}

export function ProductionReportPdf({ records, startDate, endDate, employeeName, taxId }) {
  const groups = groupByEmployee(records);
  const grandTotal = records.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const generatedAt = new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const periodLabel = startDate === endDate
    ? formatPdfDateLong(startDate)
    : `${formatPdfDate(startDate)} — ${formatPdfDate(endDate)}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docTitle}>Reporte de Producción</Text>
            <Text style={s.docSub}>Martinez Star Home · MASH</Text>
          </View>
        </View>

        <View style={s.dividerGray} />
        <View style={s.dividerChamp} />

        {/* Meta strip */}
        <View style={s.metaStrip}>
          <Text style={s.metaItem}>Período: <Text style={s.metaBold}>{periodLabel}</Text></Text>
          {employeeName ? <Text style={s.metaItem}>Empleado: <Text style={s.metaBold}>{employeeName}</Text></Text> : null}
          <Text style={s.metaItem}>Total registros: <Text style={s.metaBold}>{records.length}</Text></Text>
          <Text style={s.metaItem}>Generado: <Text style={s.metaBold}>{generatedAt}</Text></Text>
        </View>

        {/* Employee groups */}
        {groups.map((group) => (
          <View key={group.employee.id} style={s.empBlock} wrap={false}>
            <View style={s.empHeader}>
              <Text style={s.empName}>{group.employee.name}</Text>
              <Text style={s.empMeta}>{group.employee.employee_id} · {group.employee.area}</Text>
            </View>

            {/* Column headers */}
            <View style={s.tableHead}>
              <Text style={[s.th, s.colDate]}>Fecha</Text>
              <Text style={[s.th, s.colWork]}>Trabajo</Text>
              <Text style={[s.th, s.colQty]}>Cant.</Text>
              <Text style={[s.th, s.colPrice]}>Precio unit.</Text>
              <Text style={[s.th, s.colTotal]}>Total</Text>
            </View>

            {/* Rows */}
            {group.records.map((row) => (
              <View key={row.id} style={s.tableRow}>
                <Text style={[s.td, s.colDate]}>{formatPdfDate(row.date)}</Text>
                <View style={s.colWork}>
                  <Text style={s.td}>{row.tarifario?.work_name ?? '—'}</Text>
                  <Text style={s.tdMuted}>{row.tarifario?.area ?? ''}</Text>
                </View>
                <Text style={[s.td, s.colQty]}>{row.quantity}</Text>
                <Text style={[s.td, s.colPrice]}>{formatCurrency(row.unit_price)}</Text>
                <Text style={[s.td, s.colTotal]}>{formatCurrency(row.total)}</Text>
              </View>
            ))}

            {/* Subtotal */}
            <View style={s.subtotalRow}>
              <Text style={s.subtotalLbl}>Subtotal {group.employee.name}</Text>
              <Text style={s.subtotalVal}>{formatCurrency(group.subtotal)}</Text>
            </View>
          </View>
        ))}

        {/* Grand total */}
        <View style={s.grandBox}>
          <View style={s.grandInner}>
            <Text style={s.grandLbl}>Total general</Text>
            <Text style={s.grandVal}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View fixed style={s.footer}>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>Martinez Star Home{taxId ? ` · ${taxId}` : ''}</Text>
            <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </View>

      </Page>
    </Document>
  );
}

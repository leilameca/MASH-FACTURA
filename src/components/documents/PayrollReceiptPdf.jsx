import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logoSrc from '../../assets/logo.png';
import signatureSrc from '../../assets/documents/company-signature.png';
import { formatCurrency } from '../../lib/utils';

const C = {
  black:     '#0A0A0B',
  gray700:   '#52525B',
  gray600:   '#71717A',
  gray300:   '#D1D1D6',
  gray100:   '#F4F4F5',
  white:     '#FFFFFF',
  champagne: '#C9B99A',
  green:     '#166534',
  greenBg:   '#F0FDF4',
};

const s = StyleSheet.create({
  page:       { padding: '15mm 18mm 26mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logo:       { width: 90, height: 55, objectFit: 'contain' },
  docBlock:   { alignItems: 'flex-end' },
  docTitle:   { fontSize: 22, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: -0.5 },
  docSub:     { fontSize: 8, color: C.gray600, marginTop: 3, letterSpacing: 0.5 },

  dividerG:   { height: 0.5, backgroundColor: C.gray300 },
  dividerC:   { height: 2, backgroundColor: C.champagne, marginBottom: 12 },

  twoCol:     { flexDirection: 'row', gap: 20, marginBottom: 14 },
  block:      { flex: 1, borderLeft: '2.5px solid ' + C.champagne, paddingLeft: 8 },
  blockLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 },
  blockTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  fieldLbl:   { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1 },
  fieldVal:   { fontSize: 9, color: C.black, marginBottom: 5 },

  // Summary table
  sumTable:   { marginBottom: 14 },
  sumHead:    { flexDirection: 'row', backgroundColor: C.black, paddingVertical: 7, paddingHorizontal: 10 },
  sumRow:     { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderBottom: '0.25px solid #E4E4E7' },
  sumRowAlt:  { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: C.gray100, borderBottom: '0.25px solid #E4E4E7' },
  th:         { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.8 },
  td:         { fontSize: 9, color: C.black },
  colConcept: { flex: 1 },
  colAmount:  { width: 90, textAlign: 'right', fontFamily: 'Courier' },

  // Total box
  totalBox:   { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  totalInner: { borderTop: '2px solid ' + C.champagne, paddingTop: 8, paddingHorizontal: 14, alignItems: 'flex-end' },
  totalLbl:   { fontSize: 8, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  totalVal:   { fontSize: 18, fontFamily: 'Courier-Bold', color: C.black },

  paidStamp:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.green, backgroundColor: C.greenBg, padding: '5 12', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 },

  // Order ref
  orderBox:   { marginBottom: 14, padding: 8, backgroundColor: C.gray100, borderLeft: '2px solid ' + C.champagne },
  orderLbl:   { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  orderVal:   { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.black },

  // Signatures
  sigSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 26 },
  sigBlock:   { flex: 1 },
  sigImg:     { width: 100, height: 34, objectFit: 'contain', alignSelf: 'center', marginBottom: 2 },
  sigSpace:   { height: 36 },
  sigLine:    { height: 0.5, backgroundColor: C.gray300, marginBottom: 4 },
  sigLbl:     { fontSize: 7, color: C.gray600, textAlign: 'center' },

  footer:     { position: 'absolute', bottom: '10mm', left: '18mm', right: '18mm' },
  footerLine: { height: 0.5, backgroundColor: C.gray300, marginBottom: 4 },
  footerRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 6, color: '#A1A1AA' },
});

const COMPANY = {
  name:    'Martinez Star Home',
  address: 'Calle 10 Gurabo, Santiago, R.D.',
  phone:   '+1 (809) 327-2139',
  email:   'Martinezstarhome@gmail.com',
};

const METHOD_LABELS = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia bancaria',
  tarjeta:       'Tarjeta',
  qik:           'Qik',
  cheque:        'Cheque',
  otro:          'Otro',
};

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtPeriod(periodKey) {
  if (!periodKey) return '—';
  const [year, month] = periodKey.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
}

export function PayrollReceiptPdf({ employee, period, production, bonus, discount, net, payment, records = [], taxId }) {
  const receiptNumber = `NOM-${period.replace('-', '')}-${employee.employee_id}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docTitle}>Comprobante de Pago</Text>
            <Text style={s.docSub}>{receiptNumber}</Text>
          </View>
        </View>

        <View style={s.dividerG} />
        <View style={s.dividerC} />

        {/* Employee + Company */}
        <View style={s.twoCol}>
          <View style={s.block}>
            <Text style={s.blockLabel}>Empleado</Text>
            <Text style={s.blockTitle}>{employee.name}</Text>
            <Text style={s.fieldLbl}>ID</Text>
            <Text style={s.fieldVal}>{employee.employee_id}</Text>
            <Text style={s.fieldLbl}>Área</Text>
            <Text style={s.fieldVal}>{employee.area ? employee.area.charAt(0).toUpperCase() + employee.area.slice(1) : '—'}</Text>
          </View>
          <View style={s.block}>
            <Text style={s.blockLabel}>Empresa</Text>
            <Text style={s.blockTitle}>{COMPANY.name}</Text>
            <Text style={s.fieldLbl}>Cédula</Text>
            <Text style={s.fieldVal}>{taxId || '—'}</Text>
            <Text style={s.fieldLbl}>Período</Text>
            <Text style={s.fieldVal}>{fmtPeriod(period)}</Text>
          </View>
        </View>

        {/* Work records table */}
        <View style={s.sumTable}>
          <View style={s.sumHead}>
            <Text style={[s.th, s.colConcept]}>Trabajo</Text>
            <Text style={[s.th, { width: 40, textAlign: 'right' }]}>Cant.</Text>
            <Text style={[s.th, { width: 70, textAlign: 'right' }]}>Precio</Text>
            <Text style={[s.th, s.colAmount]}>Total</Text>
          </View>
          {records.length > 0
            ? records.map((r) => (
              <View key={r.id} style={s.sumRow}>
                <View style={s.colConcept}>
                  <Text style={s.td}>{r.tarifario?.work_name ?? '—'}</Text>
                  <Text style={s.tdMuted}>{r.date}</Text>
                </View>
                <Text style={[s.td, { width: 40, textAlign: 'right' }]}>{r.quantity}</Text>
                <Text style={[s.td, { width: 70, textAlign: 'right', fontFamily: 'Courier' }]}>{formatCurrency(r.unit_price)}</Text>
                <Text style={[s.td, s.colAmount]}>{formatCurrency(r.total)}</Text>
              </View>
            ))
            : (
              <View style={s.sumRow}>
                <Text style={[s.td, s.colConcept]}>Trabajos del período</Text>
                <Text style={[s.td, s.colAmount]}>{formatCurrency(production)}</Text>
              </View>
            )}
          {bonus > 0 && (
            <View style={s.sumRowAlt}>
              <Text style={[s.td, s.colConcept]}>Bono</Text>
              <Text style={[s.td, s.colAmount]}>+ {formatCurrency(bonus)}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={s.sumRowAlt}>
              <Text style={[s.td, s.colConcept]}>Descuento</Text>
              <Text style={[s.td, s.colAmount]}>− {formatCurrency(discount)}</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={s.totalBox}>
          <View style={s.totalInner}>
            <Text style={s.totalLbl}>Total pagado</Text>
            <Text style={s.totalVal}>{formatCurrency(payment.amount)}</Text>
          </View>
        </View>

        {/* Paid stamp */}
        <Text style={s.paidStamp}>
          Pagado el {fmtDate(payment.payment_date)} · {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
        </Text>

        {/* Order ref (optional) */}
        {payment.order_number ? (
          <View style={s.orderBox}>
            <Text style={s.orderLbl}>Vinculado al pedido</Text>
            <Text style={s.orderVal}>{payment.order_number}</Text>
          </View>
        ) : null}

        {/* Notes */}
        {payment.notes ? (
          <View style={s.orderBox}>
            <Text style={s.orderLbl}>Notas</Text>
            <Text style={{ fontSize: 9, color: C.black }}>{payment.notes}</Text>
          </View>
        ) : null}

        {/* Signatures */}
        <View style={s.sigSection}>
          <View style={s.sigBlock}>
            <Image src={signatureSrc} style={s.sigImg} />
            <View style={s.sigLine} />
            <Text style={s.sigLbl}>Firma empresa</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigSpace} />
            <View style={s.sigLine} />
            <Text style={s.sigLbl}>Firma empleado</Text>
          </View>
        </View>

        {/* Footer */}
        <View fixed style={s.footer}>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>{COMPANY.name}{taxId ? ` · ${taxId}` : ''} · {COMPANY.phone}</Text>
            <Text style={s.footerText}>{receiptNumber}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}

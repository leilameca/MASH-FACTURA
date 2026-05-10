import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatCurrency } from '../../lib/utils';
import logoSrc from '../../assets/logo.png';

const C = {
  black: '#0A0A0B',
  gray700: '#52525B',
  gray600: '#71717A',
  gray300: '#D1D1D6',
  gray100: '#F4F4F5',
  white: '#FFFFFF',
  champagne: '#C9B99A',
  olive: '#4A5240',
};

const s = StyleSheet.create({
  page: { padding: '15mm 18mm 28mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logo: { width: 110, height: 70, objectFit: 'contain' },
  docBlock: { alignItems: 'flex-end' },
  docType: { fontSize: 25, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase' },
  docNumber: { fontSize: 9, color: C.gray600, marginTop: 3 },
  dividerGray: { height: 0.5, backgroundColor: C.gray300 },
  dividerChamp: { height: 2, backgroundColor: C.champagne, marginBottom: 12 },
  receiptBox: { backgroundColor: C.black, padding: 18, marginVertical: 16, borderRadius: 4 },
  receiptLabel: { fontSize: 7, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 1 },
  receiptAmount: { marginTop: 6, fontSize: 28, fontFamily: 'Courier-Bold', color: C.white },
  receiptSub: { marginTop: 4, fontSize: 9, color: C.champagne },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  col: { flex: 1, borderLeft: '2.5px solid ' + C.champagne, paddingLeft: 8 },
  sectionLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 },
  fieldLabel: { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1 },
  fieldValue: { fontSize: 9, color: C.black, marginBottom: 5 },
  bold: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.black, marginBottom: 4 },
  totals: { marginLeft: 'auto', width: 240, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottom: '0.25px solid #E4E4E7' },
  totalLabel: { fontSize: 8.5, color: C.gray600 },
  totalValue: { fontSize: 9.5, fontFamily: 'Courier', color: C.black },
  balanceValue: { fontSize: 12, fontFamily: 'Courier-Bold', color: C.olive },
  notesBox: { marginTop: 18, padding: 10, backgroundColor: C.gray100, borderLeft: '2px solid ' + C.champagne },
  notesText: { fontSize: 8, color: C.gray700, lineHeight: 1.5 },
  sigSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 20 },
  sigBlock: { flex: 1 },
  sigLine: { height: 0.5, backgroundColor: C.gray300, marginBottom: 4 },
  sigLabel: { fontSize: 7, color: C.gray600, textAlign: 'center' },
  footer: { position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' },
  footerLine: { height: 0.5, backgroundColor: C.gray300, marginBottom: 5 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 6.5, color: '#A1A1AA' },
});

const COMPANY = {
  phone: '+1 (809) 327-2139',
  instagram: '@martinez_star_home',
  email: 'Martinezstarhome@gmail.com',
  rnc: 'RNC 130-77604-2',
};

function formatPdfDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function PaymentReceiptPdf({ payment, invoice, client, balanceBefore }) {
  const number = `REC-${payment?.id?.slice(0, 8)?.toUpperCase() || Date.now()}`;
  const amount = Number(payment?.amount || 0);
  const previous = Number(balanceBefore ?? invoice?.total ?? 0);
  const pending = Math.max(previous - amount, 0);

  return (
    <Document author="MASH Flow" creator="Martinez Star Home" title={`Recibo de Pago ${number}`}>
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docType}>Recibo de Pago</Text>
            <Text style={s.docNumber}>N°: {number}</Text>
          </View>
        </View>

        <View style={s.dividerGray} />
        <View style={s.dividerChamp} />

        <View style={s.receiptBox}>
          <Text style={s.receiptLabel}>Monto recibido</Text>
          <Text style={s.receiptAmount}>{formatCurrency(amount)}</Text>
          <Text style={s.receiptSub}>Método: {payment?.payment_method || '—'} · Fecha: {formatPdfDate(payment?.payment_date)}</Text>
        </View>

        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Recibido de</Text>
            <Text style={s.bold}>{client?.full_name || 'Cliente'}</Text>
            {client?.phone ? <Text style={s.fieldValue}>{client.phone}</Text> : null}
            {client?.email ? <Text style={[s.fieldValue, { color: C.gray600 }]}>{client.email}</Text> : null}
          </View>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Referencia</Text>
            <Field label="Factura" value={invoice?.invoice_number || '—'} />
            <Field label="Referencia de pago" value={payment?.reference || '—'} />
            <Field label="Método" value={payment?.payment_method || '—'} />
          </View>
        </View>

        <View style={s.totals}>
          <TotalRow label="Balance anterior" value={formatCurrency(previous)} />
          <TotalRow label="Monto recibido" value={`-${formatCurrency(amount)}`} />
          <View style={[s.totalRow, { borderBottom: 'none', marginTop: 4 }]}>
            <Text style={[s.totalLabel, { fontFamily: 'Helvetica-Bold', color: C.black }]}>Balance pendiente</Text>
            <Text style={s.balanceValue}>{formatCurrency(pending)}</Text>
          </View>
        </View>

        <View style={s.notesBox}>
          <Text style={s.notesText}>{payment?.notes || 'Este recibo confirma el pago indicado. Conserve este documento para sus registros.'}</Text>
        </View>

        <View style={s.sigSection}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Recibido por MASH</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Firma del cliente</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>MASH / Martinez Star Home · {COMPANY.rnc}</Text>
            <Text style={s.footerText}>{number}</Text>
            <Text style={s.footerText}>{COMPANY.phone} · {COMPANY.instagram} · {COMPANY.email}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Field({ label, value }) {
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

function TotalRow({ label, value }) {
  return (
    <View style={s.totalRow}>
      <Text style={s.totalLabel}>{label}</Text>
      <Text style={s.totalValue}>{value}</Text>
    </View>
  );
}

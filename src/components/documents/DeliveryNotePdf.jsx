import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logoSrc from '../../assets/logo.png';
import signatureSrc from '../../assets/documents/company-signature.png';

const C = {
  black: '#0A0A0B',
  gray700: '#52525B',
  gray600: '#71717A',
  gray300: '#D1D1D6',
  gray100: '#F4F4F5',
  white: '#FFFFFF',
  champagne: '#C9B99A',
};

const s = StyleSheet.create({
  page: { padding: '15mm 18mm 28mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logo: { width: 110, height: 70, objectFit: 'contain' },
  docBlock: { alignItems: 'flex-end' },
  docType: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase' },
  docNumber: { fontSize: 9, color: C.gray600, marginTop: 3 },
  dividerGray: { height: 0.5, backgroundColor: C.gray300 },
  dividerChamp: { height: 2, backgroundColor: C.champagne, marginBottom: 12 },
  contactStrip: { backgroundColor: C.gray100, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderRadius: 4 },
  contactItem: { fontSize: 7, color: C.gray700 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  col: { flex: 1, borderLeft: '2.5px solid ' + C.champagne, paddingLeft: 8 },
  sectionLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 },
  fieldLabel: { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1 },
  fieldValue: { fontSize: 9, color: C.black, marginBottom: 5 },
  bold: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.black, marginBottom: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: C.black, paddingVertical: 7, paddingHorizontal: 10 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottom: '0.25px solid #E4E4E7' },
  th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.8 },
  td: { fontSize: 9, color: C.black },
  colDesc: { flex: 1 },
  colQty: { width: 60, textAlign: 'right' },
  notesBox: { marginTop: 14, padding: 10, backgroundColor: C.gray100, borderLeft: '2px solid ' + C.champagne },
  notesLabel: { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  notesText: { fontSize: 8.5, color: C.black, lineHeight: 1.5 },
  sigSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 20 },
  sigBlock: { flex: 1 },
  signatureImage: { width: 105, height: 36, objectFit: 'contain', alignSelf: 'center', marginBottom: 2 },
  signatureSpace: { height: 38 },
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
  address: 'Calle 10 Gurabo, Santiago, R.D.',
  rnc: 'RNC 130-77604-2',
};

function formatPdfDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function DeliveryNotePdf({ order, client, items = [] }) {
  const number = order?.order_number || `PED-${order?.id?.slice(0, 6) || '000'}`;
  const deliveryNumber = `ENT-${number.replace(/[^0-9]/g, '') || number}`;

  return (
    <Document author="MASH Flow" creator="Martinez Star Home" title={`Albarán de Entrega ${deliveryNumber}`}>
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docType}>Albarán de Entrega</Text>
            <Text style={s.docNumber}>N°: {deliveryNumber}</Text>
          </View>
        </View>

        <View style={s.dividerGray} />
        <View style={s.dividerChamp} />

        <View style={s.contactStrip}>
          <Text style={s.contactItem}>{COMPANY.phone}</Text>
          <Text style={s.contactItem}>{COMPANY.instagram}</Text>
          <Text style={s.contactItem}>{COMPANY.email}</Text>
          <Text style={s.contactItem}>{COMPANY.address}</Text>
          <Text style={s.contactItem}>{COMPANY.rnc}</Text>
        </View>

        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Cliente</Text>
            <Text style={s.bold}>{client?.full_name || 'Cliente'}</Text>
            {client?.phone ? <Text style={s.fieldValue}>{client.phone}</Text> : null}
            {client?.email ? <Text style={[s.fieldValue, { color: C.gray600 }]}>{client.email}</Text> : null}
          </View>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Entrega</Text>
            <Field label="Pedido" value={number} />
            <Field label="Fecha estimada" value={formatPdfDate(order?.estimated_delivery_date)} />
            <Field label="Fecha real" value={formatPdfDate(order?.actual_delivery_date)} />
            <Field label="Condición de entrega" value="Recibido conforme, salvo observaciones indicadas." />
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={[s.th, s.colDesc]}>Producto entregado</Text>
          <Text style={[s.th, s.colQty]}>Cantidad</Text>
        </View>
        {items.length ? items.map((item, index) => (
          <View key={item.id || index} style={s.tableRow}>
            <Text style={[s.td, s.colDesc]}>{item.description || item.name || 'Producto'}</Text>
            <Text style={[s.td, s.colQty]}>{item.quantity || 1}</Text>
          </View>
        )) : (
          <View style={s.tableRow}>
            <Text style={[s.td, s.colDesc]}>{order?.internal_notes || 'Productos asociados al pedido'}</Text>
            <Text style={[s.td, s.colQty]}>1</Text>
          </View>
        )}

        <View style={s.notesBox}>
          <Text style={s.notesLabel}>Observaciones</Text>
          <Text style={s.notesText}>{order?.internal_notes || 'Entrega realizada en condición satisfactoria. El cliente confirma recepción de los artículos listados.'}</Text>
        </View>

        <View style={s.sigSection}>
          <SignatureBlock label="Nombre de quien recibe" />
          <SignatureBlock label="Firma de quien recibe" />
          <SignatureBlock label="Representante MASH" signed />
        </View>

        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>MASH / Martinez Star Home · {COMPANY.rnc}</Text>
            <Text style={s.footerText}>{deliveryNumber}</Text>
            <Text style={s.footerText}>{COMPANY.phone} · {COMPANY.instagram}</Text>
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

function SignatureBlock({ label, signed = false }) {
  return (
    <View style={s.sigBlock}>
      {signed ? <Image src={signatureSrc} style={s.signatureImage} /> : <View style={s.signatureSpace} />}
      <View style={s.sigLine} />
      <Text style={s.sigLabel}>{label}</Text>
    </View>
  );
}

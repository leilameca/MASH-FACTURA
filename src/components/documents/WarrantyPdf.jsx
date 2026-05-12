import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logoSrc from '../../assets/logo.png';
import signatureSrc from '../../assets/documents/company-signature.png';

const C = {
  black:     '#0A0A0B',
  gray700:   '#52525B',
  gray600:   '#71717A',
  gray300:   '#D1D1D6',
  gray100:   '#F4F4F5',
  white:     '#FFFFFF',
  champagne: '#C9B99A',
  olive:     '#4A5240',
};

const s = StyleSheet.create({
  page:         { padding: '15mm 18mm 28mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },

  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logo:         { width: 110, height: 70, objectFit: 'contain' },
  docBlock:     { alignItems: 'flex-end' },
  docType:      { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase', letterSpacing: -0.5 },
  docNumber:    { fontSize: 9, color: C.gray600, marginTop: 3 },

  dividerGray:  { height: 0.5, backgroundColor: C.gray300 },
  dividerChamp: { height: 2, backgroundColor: C.champagne, marginBottom: 12 },

  contactStrip:   { backgroundColor: C.gray100, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderRadius: 4 },
  contactItem:    { fontSize: 7, color: C.gray700 },

  // Hero warranty badge
  heroBox:        { backgroundColor: C.black, padding: '16px 20px', marginBottom: 16, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle:      { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroPeriod:     { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.champagne },
  heroSub:        { fontSize: 7.5, color: '#A1A1AA', marginTop: 3 },

  twoCol:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  col:            { flex: 1, borderLeft: '2.5px solid ' + C.champagne, paddingLeft: 8 },
  sectionLabel:   { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 },
  fieldLabel:     { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1 },
  fieldValue:     { fontSize: 9, color: C.black, marginBottom: 5 },
  bold:           { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.black, marginBottom: 4 },

  sectionTitle:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 12, borderBottom: '0.5px solid ' + C.gray300, paddingBottom: 4 },

  tableHeader:    { flexDirection: 'row', backgroundColor: C.black, paddingVertical: 7, paddingHorizontal: 10 },
  tableRow:       { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottom: '0.25px solid #E4E4E7' },
  th:             { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.8 },
  td:             { fontSize: 9, color: C.black },
  colDesc:        { flex: 1 },
  colQty:         { width: 50, textAlign: 'right' },

  coverageGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  coverageItem:   { flexDirection: 'row', alignItems: 'center', gap: 4, width: '45%' },
  dot:            { width: 4, height: 4, backgroundColor: C.champagne, borderRadius: 2 },
  coverageText:   { fontSize: 8, color: C.black },

  exclusionItem:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  xDot:          { width: 4, height: 4, backgroundColor: C.gray300, borderRadius: 2 },
  exclusionText:  { fontSize: 7.5, color: C.gray600 },

  sigSection:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 20 },
  sigBlock:       { flex: 1 },
  signatureImage: { width: 105, height: 36, objectFit: 'contain', alignSelf: 'center', marginBottom: 2 },
  signatureSpace: { height: 38 },
  sigLine:        { height: 0.5, backgroundColor: C.gray300, marginBottom: 4 },
  sigLabel:       { fontSize: 7, color: C.gray600, textAlign: 'center' },

  condSection:    { marginTop: 14, paddingTop: 8, borderTop: '0.5px solid ' + C.gray300 },
  condLabel:      { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  condText:       { fontSize: 7, color: C.gray700, lineHeight: 1.5 },

  footer:         { position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' },
  footerLine:     { height: 0.5, backgroundColor: C.gray300, marginBottom: 5 },
  footerRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  footerText:     { fontSize: 6.5, color: '#A1A1AA' },
});

const COMPANY = {
  phone:     '+1 (809) 327-2139',
  instagram: '@martinez_star_home',
  email:     'Martinezstarhome@gmail.com',
  address:   'Calle 10 Gurabo, Santiago, R.D.',
  rnc:       'RNC 130-77604-2',
};

const WARRANTY_COVERAGE = [
  'Defectos de fabricación',
  'Fallas en soldaduras',
  'Defectos en pintura de fábrica',
  'Fallas estructurales en materiales',
  'Defectos en herrajes y accesorios',
  'Problemas en tejido de diseño',
];

const WARRANTY_EXCLUSIONS = [
  'Desgaste natural por uso',
  'Daños por exposición extrema al clima',
  'Daños causados por el cliente',
  'Modificaciones no autorizadas',
];

function formatPdfDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function WarrantyPdf({ order, client, items }) {
  const number = order?.order_number || `PED-${order?.id?.slice(0, 6) || '000'}`;
  const warrantyNumber = `GAR-${number.replace(/[^0-9]/g, '')}`;
  const issueDate = order?.actual_delivery_date || order?.estimated_delivery_date || new Date().toISOString().slice(0, 10);
  const expiryDate = new Date(issueDate + 'T12:00:00');
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const expiryStr = expiryDate.toISOString().slice(0, 10);

  return (
    <Document author="MASH Flow" creator="Martinez Star Home" title={`Garantía ${warrantyNumber}`}>
      <Page size="LETTER" style={s.page}>

        {/* ── HEADER ─────────────────────────────────── */}
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docType}>Garantía</Text>
            <Text style={s.docNumber}>N°: {warrantyNumber}</Text>
          </View>
        </View>

        <View style={s.dividerGray} />
        <View style={s.dividerChamp} />

        {/* ── CONTACT STRIP ──────────────────────────── */}
        <View style={s.contactStrip}>
          <Text style={s.contactItem}>{COMPANY.phone}</Text>
          <Text style={s.contactItem}>{COMPANY.instagram}</Text>
          <Text style={s.contactItem}>{COMPANY.email}</Text>
          <Text style={s.contactItem}>{COMPANY.address}</Text>
          <Text style={s.contactItem}>{COMPANY.rnc}</Text>
        </View>

        {/* ── HERO WARRANTY BADGE ────────────────────── */}
        <View style={s.heroBox}>
          <View>
            <Text style={s.heroTitle}>Certificado de Garantía</Text>
            <Text style={s.heroSub}>Martinez Star Home garantiza la calidad de este producto</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.heroPeriod}>1 Año</Text>
            <Text style={s.heroSub}>de garantía limitada</Text>
          </View>
        </View>

        {/* ── CLIENT + ORDER DETAILS ──────────────────── */}
        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Cliente</Text>
            <Text style={s.bold}>{client?.full_name || 'Cliente'}</Text>
            {client?.phone ? <Text style={s.fieldValue}>{client.phone}</Text> : null}
            {client?.email ? <Text style={[s.fieldValue, { color: C.gray600 }]}>{client.email}</Text> : null}
          </View>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Detalles</Text>
            <Field label="N° de pedido" value={number} />
            <Field label="Fecha de entrega" value={formatPdfDate(issueDate)} />
            <Field label="Garantía válida hasta" value={formatPdfDate(expiryStr)} />
          </View>
        </View>

        {/* ── PRODUCTOS AMPARADOS ────────────────────── */}
        {items?.length ? (
          <>
            <Text style={s.sectionTitle}>Productos amparados</Text>
            <View style={s.tableHeader}>
              <Text style={[s.th, s.colDesc]}>Producto / Descripción</Text>
              <Text style={[s.th, s.colQty]}>Cant.</Text>
            </View>
            {items.map((item, idx) => (
              <View key={item.id ?? idx} style={s.tableRow}>
                <Text style={[s.td, s.colDesc]}>{item.description || item.name || '—'}</Text>
                <Text style={[s.td, s.colQty]}>{item.quantity ?? 1}</Text>
              </View>
            ))}
          </>
        ) : null}

        {/* ── COBERTURA ──────────────────────────────── */}
        <Text style={s.sectionTitle}>Qué cubre esta garantía</Text>
        <View style={s.coverageGrid}>
          {WARRANTY_COVERAGE.map((item) => (
            <View key={item} style={s.coverageItem}>
              <View style={s.dot} />
              <Text style={s.coverageText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.sectionTitle, { marginTop: 10 }]}>Exclusiones</Text>
        {WARRANTY_EXCLUSIONS.map((item) => (
          <View key={item} style={s.exclusionItem}>
            <View style={s.xDot} />
            <Text style={s.exclusionText}>{item}</Text>
          </View>
        ))}

        {/* ── FIRMAS ─────────────────────────────────── */}
        <View style={s.sigSection}>
          <SignatureBlock label="Firma del cliente" />
          <SignatureBlock label="Representante MASH" signed />
          <SignatureBlock label="Fecha de entrega" />
        </View>

        {/* ── TÉRMINOS ───────────────────────────────── */}
        <View style={s.condSection}>
          <Text style={s.condLabel}>Términos de garantía</Text>
          <Text style={s.condText}>
            Esta garantía es válida por 12 meses a partir de la fecha de entrega del producto. Para hacer válida la garantía, el cliente debe presentar este documento junto con su factura de compra. MASH / Martinez Star Home se reserva el derecho de reparar o reemplazar el producto defectuoso. La garantía no cubre daños causados por mal uso, accidentes, modificaciones o desgaste natural. Para reclamaciones contactar al +1 (809) 327-2139.
          </Text>
        </View>

        {/* ── FOOTER ─────────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>MASH / Martinez Star Home · {COMPANY.rnc}</Text>
            <Text style={s.footerText}>{warrantyNumber}</Text>
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

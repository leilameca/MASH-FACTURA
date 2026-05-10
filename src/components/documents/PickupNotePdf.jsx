import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import logoSrc from '../../assets/logo.png';

const C = {
  black:     '#0A0A0B',
  gray700:   '#52525B',
  gray600:   '#71717A',
  gray300:   '#D1D1D6',
  gray100:   '#F4F4F5',
  white:     '#FFFFFF',
  champagne: '#C9B99A',
};

const s = StyleSheet.create({
  page:         { padding: '15mm 18mm 28mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },

  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logo:         { width: 110, height: 70, objectFit: 'contain' },
  docBlock:     { alignItems: 'flex-end' },
  docType:      { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase', letterSpacing: -0.3 },
  docNumber:    { fontSize: 9, color: C.gray600, marginTop: 3 },

  dividerGray:  { height: 0.5, backgroundColor: C.gray300 },
  dividerChamp: { height: 2, backgroundColor: C.champagne, marginBottom: 12 },

  contactStrip:   { backgroundColor: C.gray100, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderRadius: 4 },
  contactItem:    { fontSize: 7, color: C.gray700 },

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
  tdMuted:        { fontSize: 7.5, color: C.gray600, marginTop: 1 },
  colItem:        { flex: 1 },
  colMaterial:    { width: 80 },
  colColor:       { width: 60 },
  colCondition:   { width: 90 },

  notesBox:       { marginTop: 14, padding: 10, backgroundColor: C.gray100, borderLeft: '2px solid ' + C.champagne },
  notesLabel:     { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  notesText:      { fontSize: 8.5, color: C.black, lineHeight: 1.5 },

  sigSection:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, gap: 20 },
  sigBlock:       { flex: 1 },
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

function formatPdfDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function PickupNotePdf({ repair, client }) {
  const number = repair?.repair_number || `REP-${repair?.id?.slice(0, 6) || '000'}`;

  return (
    <Document author="MASH Flow" creator="Martinez Star Home" title={`Albarán de Recogida ${number}`}>
      <Page size="LETTER" style={s.page}>

        {/* ── HEADER ─────────────────────────────────── */}
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docType}>Albarán de Recogida</Text>
            <Text style={s.docNumber}>N°: {number}</Text>
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

        {/* ── CLIENT + REPAIR DETAILS ─────────────────── */}
        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Datos del cliente</Text>
            <Text style={s.bold}>{client?.full_name || 'Cliente'}</Text>
            {client?.phone ? <Text style={s.fieldValue}>{client.phone}</Text> : null}
            {client?.email ? <Text style={[s.fieldValue, { color: C.gray600 }]}>{client.email}</Text> : null}
          </View>
          <View style={s.col}>
            <Text style={s.sectionLabel}>Datos de la recogida</Text>
            <Field label="Fecha de recogida" value={formatPdfDate(repair?.pickup_date)} />
            <Field label="Hora" value={repair?.pickup_time || '—'} />
            <Field label="Persona que entrega" value={repair?.delivered_by || '—'} />
            <Field label="Dirección" value={repair?.pickup_address || '—'} />
            <Field label="Días estimados" value={repair?.estimated_review_days ? `${repair.estimated_review_days} días` : '—'} />
          </View>
        </View>

        {/* ── ARTÍCULOS RECOGIDOS ────────────────────── */}
        <Text style={s.sectionTitle}>Artículos recogidos</Text>
        <View style={s.tableHeader}>
          <Text style={[s.th, s.colItem]}>Artículo / Descripción</Text>
          <Text style={[s.th, s.colMaterial]}>Material</Text>
          <Text style={[s.th, s.colColor]}>Color</Text>
          <Text style={[s.th, s.colCondition]}>Estado recibido</Text>
        </View>
        <View style={s.tableRow}>
          <View style={s.colItem}>
            <Text style={s.td}>{repair?.furniture_type || '—'}</Text>
            {repair?.problem_description ? <Text style={s.tdMuted}>{repair.problem_description}</Text> : null}
          </View>
          <Text style={[s.td, s.colMaterial]}>{repair?.material || '—'}</Text>
          <Text style={[s.td, s.colColor]}>{repair?.color || '—'}</Text>
          <Text style={[s.td, s.colCondition]}>{repair?.condition_status || '—'}</Text>
        </View>

        {/* ── ACCESORIOS ─────────────────────────────── */}
        {repair?.accessories_received ? (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Accesorios recibidos</Text>
            <Text style={s.notesText}>{repair.accessories_received}</Text>
          </View>
        ) : null}

        {/* ── NOTAS DE CONDICIÓN ─────────────────────── */}
        {repair?.condition_notes ? (
          <View style={[s.notesBox, { marginTop: 8 }]}>
            <Text style={s.notesLabel}>Observaciones del estado</Text>
            <Text style={s.notesText}>{repair.condition_notes}</Text>
          </View>
        ) : null}

        {/* ── FIRMAS ─────────────────────────────────── */}
        <View style={s.sigSection}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Firma del cliente</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Recibido por MASH</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Fecha</Text>
          </View>
        </View>

        {/* ── TÉRMINOS ───────────────────────────────── */}
        <View style={s.condSection}>
          <Text style={s.condLabel}>Términos de recepción</Text>
          <Text style={s.condText}>
            El artículo ha sido recibido en el estado descrito en este documento. MASH / Martinez Star Home no se responsabiliza por daños preexistentes no declarados. El tiempo de diagnóstico es estimado y puede variar. El cliente será notificado antes de proceder con cualquier reparación que implique costos adicionales.
          </Text>
        </View>

        {/* ── FOOTER ─────────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <View style={s.footerRow}>
            <Text style={s.footerText}>MASH / Martinez Star Home · {COMPANY.rnc}</Text>
            <Text style={s.footerText}>{number}</Text>
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

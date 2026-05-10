import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatCurrency } from '../../lib/utils';
import logoSrc from '../../assets/logo.png';

const C = {
  black:      '#0A0A0B',
  gray900:    '#3F3F46',
  gray700:    '#52525B',
  gray600:    '#71717A',
  gray300:    '#D1D1D6',
  gray100:    '#F4F4F5',
  white:      '#FFFFFF',
  champagne:  '#C9B99A',
  danger:     '#991B1B',
};

const s = StyleSheet.create({
  page:         { padding: '15mm 18mm 28mm 18mm', fontFamily: 'Helvetica', backgroundColor: C.white, color: C.black },

  // ── Header
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logo:         { width: 110, height: 70, objectFit: 'contain' },
  docBlock:     { alignItems: 'flex-end' },
  docType:      { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.black, textTransform: 'uppercase', letterSpacing: -0.5 },
  docNumber:    { fontSize: 10, color: C.gray600, marginTop: 3, letterSpacing: 0.5 },

  // ── Champagne divider line
  dividerGray:  { height: 0.5, backgroundColor: C.gray300, marginTop: 0 },
  dividerChamp: { height: 2, backgroundColor: C.champagne, marginBottom: 12 },

  // ── Contact strip (gray band)
  contactStrip:   { backgroundColor: C.gray100, paddingVertical: 6, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderRadius: 4 },
  contactItem:    { fontSize: 7, color: C.gray700 },

  // ── Client + details side by side
  clientSection:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  clientBlock:    { flex: 1, paddingRight: 20, borderLeft: '2.5px solid ' + C.champagne, paddingLeft: 8 },
  detailsBlock:   { width: 185 },
  sectionLabel:   { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5 },
  clientName:     { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.black, marginBottom: 3 },
  fieldLabel:     { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1 },
  fieldValue:     { fontSize: 9, color: C.black, marginBottom: 5 },

  // ── Table
  tableHeader:    { flexDirection: 'row', backgroundColor: C.black, paddingVertical: 7, paddingHorizontal: 10 },
  tableRow:       { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottom: '0.25px solid #E4E4E7' },
  th:             { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textTransform: 'uppercase', letterSpacing: 0.8 },
  td:             { fontSize: 9, color: C.black },
  tdMuted:        { fontSize: 7.5, color: C.gray600, marginTop: 1 },
  colDesc:        { flex: 1 },
  colQty:         { width: 45, textAlign: 'right' },
  colPrice:       { width: 80, textAlign: 'right', fontFamily: 'Courier' },
  colTotal:       { width: 85, textAlign: 'right', fontFamily: 'Courier' },

  // ── Totals
  totalsSection:  { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totalsBox:      { width: 220 },
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '0.25px solid #E4E4E7' },
  totalLabel:     { fontSize: 8.5, color: C.gray600 },
  totalValue:     { fontSize: 9, fontFamily: 'Courier', color: C.black },
  grandDividerG:  { height: 0.5, backgroundColor: C.gray300, marginVertical: 2 },
  grandDividerC:  { height: 2, backgroundColor: C.champagne, marginBottom: 4 },
  grandLabel:     { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.black },
  grandValue:     { fontSize: 14, fontFamily: 'Courier-Bold', color: C.black },

  // ── Balance / paid
  balanceDue:     { fontSize: 12, fontFamily: 'Courier-Bold', color: C.danger },
  paidFull:       { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#166534', backgroundColor: '#F0FDF4', padding: 5, marginTop: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },

  // ── Deposit box (quotes)
  depositBox:     { marginTop: 6, padding: 8, backgroundColor: C.gray100, borderLeft: '2px solid ' + C.champagne },
  depositLabel:   { fontSize: 6.5, color: C.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  depositValue:   { fontSize: 12, fontFamily: 'Courier-Bold', color: C.black },
  depositSub:     { fontSize: 7, color: C.gray600, marginTop: 1 },

  // ── Payment info section (Factura)
  paySection:     { marginTop: 16, padding: 10, borderTop: '0.5px solid ' + C.gray300 },
  payTitle:       { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 },
  payRow:         { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  payOption:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  payBox:         { width: 8, height: 8, border: '0.75px solid ' + C.gray300 },
  payLabel:       { fontSize: 8, color: C.black },
  payDetail:      { fontSize: 7, color: C.gray600, marginTop: 2, marginLeft: 12 },

  // ── Terms
  condSection:    { marginTop: 14, paddingTop: 8, borderTop: '0.5px solid ' + C.gray300 },
  condLabel:      { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.gray600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  condText:       { fontSize: 7, color: C.gray700, lineHeight: 1.5 },

  // ── Footer (fixed)
  footer:         { position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' },
  footerLine:     { height: 0.5, backgroundColor: C.gray300, marginBottom: 5 },
  footerRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  footerText:     { fontSize: 6.5, color: '#A1A1AA' },
});

const COMPANY = {
  name:      'Martinez Star Home',
  rnc:       'RNC 130-77604-2',
  address:   'Calle 10 Gurabo, Santiago, R.D.',
  phone:     '+1 (809) 327-2139',
  email:     'Martinezstarhome@gmail.com',
  instagram: '@martinez_star_home',
};

function formatPdfDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function FinancialPdf({ type, number, client, values, items }) {
  const isInvoice = type === 'FACTURA';
  const balance = Number(values.balance_due ?? Math.max((values.total ?? 0) - (values.amount_paid ?? 0), 0));
  const isPaid   = isInvoice && balance <= 0 && Number(values.total ?? 0) > 0;
  const services = Number(values.delivery_fee ?? 0) + Number(values.pickup_fee ?? 0) + Number(values.installation_fee ?? 0);

  return (
    <Document author="MASH Flow" creator="Martinez Star Home" title={`${type} ${number}`}>
      <Page size="LETTER" style={s.page}>

        {/* ── HEADER ─────────────────────────────────── */}
        <View style={s.header}>
          <Image src={logoSrc} style={s.logo} />
          <View style={s.docBlock}>
            <Text style={s.docType}>{type}</Text>
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

        {/* ── CLIENT + DETAILS ───────────────────────── */}
        <View style={s.clientSection}>
          <View style={s.clientBlock}>
            <Text style={s.sectionLabel}>{isInvoice ? 'Facturar a' : 'Cotización para'}</Text>
            <Text style={s.clientName}>{client?.full_name ?? 'Cliente'}</Text>
            {client?.phone ? <Text style={s.fieldValue}>{client.phone}</Text> : null}
            {client?.email ? <Text style={[s.fieldValue, { color: C.gray600 }]}>{client.email}</Text> : null}
          </View>

          <View style={s.detailsBlock}>
            <Text style={s.sectionLabel}>Detalles del documento</Text>
            <DetailRow label="Fecha de emisión" value={formatPdfDate(values.issue_date)} />
            {values.valid_until ? <DetailRow label="Válida hasta" value={formatPdfDate(values.valid_until)} /> : null}
            {values.due_date ? <DetailRow label="Fecha de vencimiento" value={formatPdfDate(values.due_date)} /> : null}
            {values.ncf ? <DetailRow label="NCF" value={values.ncf} /> : null}
            {isInvoice && values.payment_method ? <DetailRow label="Método de pago" value={values.payment_method} /> : null}
          </View>
        </View>

        {/* ── ITEMS TABLE ────────────────────────────── */}
        <View style={s.tableHeader}>
          <Text style={[s.th, s.colDesc]}>Descripción</Text>
          <Text style={[s.th, s.colQty]}>Cant.</Text>
          <Text style={[s.th, s.colPrice]}>P. Unit.</Text>
          <Text style={[s.th, s.colTotal]}>Total</Text>
        </View>
        {(items ?? []).map((item, idx) => (
          <View key={item.id ?? item.localId ?? idx} style={s.tableRow}>
            <View style={s.colDesc}>
              <Text style={s.td}>{item.description || '—'}</Text>
              {item.notes ? <Text style={s.tdMuted}>{item.notes}</Text> : null}
            </View>
            <Text style={[s.td, s.colQty]}>{item.quantity ?? 1}</Text>
            <Text style={[s.td, s.colPrice]}>{formatCurrency(item.unit_price ?? 0)}</Text>
            <Text style={[s.td, s.colTotal]}>{formatCurrency(Number(item.quantity ?? 1) * Number(item.unit_price ?? 0))}</Text>
          </View>
        ))}

        {/* ── TOTALS ─────────────────────────────────── */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <TotalRow label="Subtotal" value={formatCurrency(values.subtotal ?? 0)} />
            {Number(values.discount) > 0 ? <TotalRow label="Descuento" value={`-${formatCurrency(values.discount ?? 0)}`} /> : null}
            {values.tax_enabled ? <TotalRow label="ITBIS (18%)" value={formatCurrency(values.tax_amount ?? 0)} /> : null}
            {services > 0 ? <TotalRow label="Envío / Instalación" value={formatCurrency(services)} /> : null}

            <View style={s.grandDividerG} />
            <View style={s.grandDividerC} />
            <View style={[s.totalRow, { borderBottom: 'none', paddingVertical: 5 }]}>
              <Text style={s.grandLabel}>TOTAL</Text>
              <Text style={s.grandValue}>{formatCurrency(values.total ?? 0)}</Text>
            </View>

            {isInvoice ? (
              <>
                {Number(values.amount_paid) > 0 ? (
                  <TotalRow label="Pagado" value={`(${formatCurrency(values.amount_paid)})`} />
                ) : null}
                {isPaid ? (
                  <Text style={s.paidFull}>Cancelada en su totalidad</Text>
                ) : (
                  <View style={[s.totalRow, { borderBottom: 'none', marginTop: 4 }]}>
                    <Text style={[s.totalLabel, { fontFamily: 'Helvetica-Bold', color: C.black }]}>Balance pendiente</Text>
                    <Text style={s.balanceDue}>{formatCurrency(balance)}</Text>
                  </View>
                )}
              </>
            ) : null}

            {!isInvoice && Number(values.required_deposit) > 0 ? (
              <View style={s.depositBox}>
                <Text style={s.depositLabel}>Anticipo requerido</Text>
                <Text style={s.depositValue}>{formatCurrency(values.required_deposit)}</Text>
                <Text style={s.depositSub}>50% del total para confirmar el pedido</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── PAYMENT INFO (facturas) ─────────────────── */}
        {isInvoice ? (
          <View style={s.paySection}>
            <Text style={s.payTitle}>Información de pago</Text>
            <View style={s.payRow}>
              <View>
                <View style={s.payOption}>
                  <View style={s.payBox} />
                  <Text style={s.payLabel}>Efectivo</Text>
                </View>
              </View>
              <View>
                <View style={s.payOption}>
                  <View style={s.payBox} />
                  <Text style={s.payLabel}>Transferencia bancaria</Text>
                </View>
                <Text style={s.payDetail}>Banco Popular · Cta. 000-000000-0</Text>
              </View>
              <View>
                <View style={s.payOption}>
                  <View style={s.payBox} />
                  <Text style={s.payLabel}>Tarjeta</Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── CONDITIONS ─────────────────────────────── */}
        <View style={s.condSection}>
          <Text style={s.condLabel}>Términos y condiciones</Text>
          <Text style={s.condText}>
            {isInvoice
              ? values.invoice_terms || 'El incumplimiento del pago en la fecha acordada puede generar cargos adicionales. MASH agradece su preferencia y confianza.'
              : values.quote_terms || 'Anticipo del 50% requerido para confirmar el pedido. Saldo a cancelar a la entrega. Cotización válida por 30 días. Precios sujetos a cambio sin previo aviso. MASH se reserva el derecho de modificar precios y disponibilidad.'}
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

function TotalRow({ label, value }) {
  return (
    <View style={s.totalRow}>
      <Text style={s.totalLabel}>{label}</Text>
      <Text style={s.totalValue}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

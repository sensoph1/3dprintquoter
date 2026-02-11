import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  shopName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    color: '#334155',
  },
  invoiceMeta: {
    textAlign: 'right',
    marginTop: 4,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748b',
    marginBottom: 6,
  },
  customerInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#64748b',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  colDescription: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colUnitPrice: { width: '17.5%', textAlign: 'right' },
  colTotal: { width: '17.5%', textAlign: 'right' },
  itemName: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 8,
    color: '#64748b',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    width: 200,
  },
  totalsLabel: {
    width: '50%',
    textAlign: 'right',
    paddingRight: 10,
    color: '#64748b',
  },
  totalsValue: {
    width: '50%',
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    marginTop: 4,
    paddingTop: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  notes: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#92400e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

const InvoicePDF = ({ estimate, invoiceData, shopName }) => {
  const { customerName, customerEmail, quantity, notes, invoiceNumber, date } = invoiceData;
  const unitPrice = estimate.unitPrice || 0;
  const lineTotal = unitPrice * quantity;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{shopName || 'My Studio'}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>#{invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>{date}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customerName || 'Customer'}</Text>
            {customerEmail && <Text>{customerEmail}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text style={styles.itemName}>{estimate.name}</Text>
              <Text style={styles.itemDetails}>
                {estimate.category && `${estimate.category} • `}
                Quote #{estimate.quoteNo}
              </Text>
            </View>
            <Text style={[styles.colQty, { textAlign: 'center' }]}>{quantity}</Text>
            <Text style={styles.colUnitPrice}>${unitPrice.toFixed(2)}</Text>
            <Text style={styles.colTotal}>${lineTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>${lineTotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.grandTotal]}>
            <Text style={[styles.totalsLabel, styles.grandTotalLabel]}>Total Due</Text>
            <Text style={[styles.totalsValue, styles.grandTotalValue]}>${lineTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;

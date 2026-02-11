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
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  year: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginTop: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLabel: {
    color: '#64748b',
  },
  rowValue: {
    fontFamily: 'Helvetica-Bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 5,
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  profitSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },
  profitValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },
  lossSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
  },
  lossLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
  },
  lossValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
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
  note: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    fontSize: 8,
    color: '#92400e',
  },
});

const AnnualSummaryPDF = ({ data, year, shopName }) => {
  const isProfit = data.netProfit >= 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{shopName || 'My Studio'}</Text>
          <Text style={styles.subtitle}>Annual Financial Summary</Text>
          <Text style={styles.year}>{year}</Text>
        </View>

        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Sales ({data.salesCount} transactions)</Text>
            <Text style={styles.rowValue}>${data.totalRevenue.toFixed(2)}</Text>
          </View>
          {data.revenueByPayment && Object.entries(data.revenueByPayment).map(([method, amount]) => (
            <View style={styles.row} key={method}>
              <Text style={styles.rowLabel}>  {method || 'Unspecified'}</Text>
              <Text style={styles.rowValue}>${amount.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Revenue</Text>
            <Text style={styles.totalValue}>${data.totalRevenue.toFixed(2)}</Text>
          </View>
        </View>

        {/* Expenses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Subscriptions & Software</Text>
            <Text style={styles.rowValue}>${data.subscriptionCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Event Fees (Booth + Other)</Text>
            <Text style={styles.rowValue}>${data.eventCosts.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cost of Goods Sold (from sales)</Text>
            <Text style={styles.rowValue}>${data.totalCOGS.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={styles.totalValue}>${data.totalExpenses.toFixed(2)}</Text>
          </View>
        </View>

        {/* Net Profit/Loss */}
        <View style={isProfit ? styles.profitSection : styles.lossSection}>
          <View style={styles.profitRow}>
            <Text style={isProfit ? styles.profitLabel : styles.lossLabel}>
              {isProfit ? 'Net Profit' : 'Net Loss'}
            </Text>
            <Text style={isProfit ? styles.profitValue : styles.lossValue}>
              ${Math.abs(data.netProfit).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            Note: This summary is for reference only. Material purchase costs are not tracked separately -
            only COGS from recorded sales is included. Consult a tax professional for official filings.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated {new Date().toLocaleDateString()} by PrintPrice Pro
        </Text>
      </Page>
    </Document>
  );
};

export default AnnualSummaryPDF;

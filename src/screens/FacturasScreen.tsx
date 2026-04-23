import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { FileText, DollarSign, Clock, AlertCircle, CheckCircle, TrendingUp, Filter } from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";
import { darkTheme, lightTheme, appRadius, appShadows, appSpacing } from "@/theme";
import { getApiErrorMessage } from "@/services/http";
import { getFacturasDashboard } from "@/services/facturas";
import { FacturaListItem } from "@/types/api";

export function FacturasScreen() {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<FacturaListItem[]>([]);

  async function loadData() {
    try {
      setError(null);
      const data = await getFacturasDashboard();
      setStats(data.resumen);
      setInvoices(data.recientes);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadData();
      setLoading(false);
    }
    init();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Facturas</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Mes en Curso</Text>
        </View>
        <Filter size={20} color={colors.textDim} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Stats Cards Row 1 */}
        <View style={styles.cardGrid}>
          <StatCard
            label="Monto Total (Mes)"
            value={`$${Number(stats?.montoFacturadoMes || 0).toLocaleString()}`}
            icon={<DollarSign size={16} color={colors.primary} />}
            colors={colors}
          />
          <StatCard
            label="Pagado (Mes)"
            value={`$${Number(stats?.montoPagadoMes || 0).toLocaleString()}`}
            icon={<CheckCircle size={16} color={colors.success} />}
            colors={colors}
          />
        </View>

        {/* Stats Cards Row 2 */}
        <View style={styles.cardGrid}>
          <StatCard
            label="Pendiente (Mes)"
            value={`$${Number(stats?.montoPendienteMes || 0).toLocaleString()}`}
            icon={<Clock size={16} color={colors.warning} />}
            colors={colors}
          />
          <StatCard
            label="Adelantado"
            value={`$${Number(stats?.montoAdelantadoMes || 0).toLocaleString()}`}
            icon={<TrendingUp size={16} color={colors.secondary} />}
            colors={colors}
          />
        </View>

        {/* Stats Cards Row 3 */}
        <View style={styles.cardGrid}>
          <StatCard
            label="Parciales"
            value={`${stats?.facturasParcialesMes || 0}`}
            icon={<AlertCircle size={16} color={colors.accent} />}
            colors={colors}
          />
          <View style={{ flex: 1 }} />
        </View>

        {/* Bar Chart Section */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
           <Text style={[styles.chartTitle, { color: colors.text }]}>Tendencia de Cobros (Mes)</Text>
           <View style={styles.barChartContainer}>
             {/* Custom Bar Chart for month progress */}
             <View style={styles.barGroup}>
               <View style={[styles.barBase, { backgroundColor: colors.surfaceAlt }]}>
                 <View style={[styles.barFill, { backgroundColor: colors.primary, height: "100%" }]} />
               </View>
               <Text style={[styles.barLabel, { color: colors.textDim }]}>Facturado</Text>
             </View>
             
             <View style={styles.barGroup}>
               <View style={[styles.barBase, { backgroundColor: colors.surfaceAlt }]}>
                 <View style={[styles.barFill, { 
                   backgroundColor: colors.success, 
                   height: `${(Number(stats?.montoPagadoMes) / (Number(stats?.montoFacturadoMes) || 1)) * 100}%` 
                 }]} />
               </View>
               <Text style={[styles.barLabel, { color: colors.textDim }]}>Cobrado</Text>
             </View>

             <View style={styles.barGroup}>
               <View style={[styles.barBase, { backgroundColor: colors.surfaceAlt }]}>
                 <View style={[styles.barFill, { 
                   backgroundColor: colors.warning, 
                   height: `${(Number(stats?.montoPendienteMes) / (Number(stats?.montoFacturadoMes) || 1)) * 100}%` 
                 }]} />
               </View>
               <Text style={[styles.barLabel, { color: colors.textDim }]}>Pendiente</Text>
             </View>
           </View>
        </View>

        {/* Data Table */}
        <View style={[styles.tableContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableTitle, { color: colors.text }]}>Recientes</Text>
            <FileText size={16} color={colors.textDim} />
          </View>
          
          <View style={styles.tableLabels}>
            <Text style={[styles.labelCell, { flex: 2, color: colors.textDim }]}>CLIENTE</Text>
            <Text style={[styles.labelCell, { flex: 1.2, color: colors.textDim, textAlign: "right" }]}>ESTADO</Text>
            <Text style={[styles.labelCell, { flex: 1.5, color: colors.textDim, textAlign: "right" }]}>TOTAL</Text>
          </View>

          {invoices.map((item, idx) => (
            <View key={item.id} style={[styles.tableRow, idx === invoices.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.cellText, { color: colors.text, fontWeight: "600" }]} numberOfLines={1}>
                  {item.clienteNombre} {item.clienteApellidos}
                </Text>
                <Text style={[styles.cellSub, { color: colors.textDim }]}>#{item.numeroFactura}</Text>
              </View>
              <View style={{ flex: 1.2, alignItems: "flex-end" }}>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.estado, colors) + "20" }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(item.estado, colors) }]}>{item.estado}</Text>
                </View>
              </View>
              <View style={{ flex: 1.5, alignItems: "flex-end" }}>
                <Text style={[styles.cellText, { color: colors.text, fontWeight: "800" }]}>
                  ${Number(item.total).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
          
          {invoices.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textDim }]}>No hay facturas recientes</Text>
          )}
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function StatCard({ label, value, icon, colors }: { label: string; value: string; icon: any; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.statIcon}>{icon}</View>
      <View>
        <Text style={[styles.statLabel, { color: colors.textDim }]}>{label}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function getStatusColor(status: string, colors: any) {
  const s = status.toLowerCase();
  if (s.includes("pagada")) return colors.success;
  if (s.includes("pendiente")) return colors.warning;
  if (s.includes("anulada")) return colors.danger;
  if (s.includes("parcial")) return colors.accent;
  return colors.primary;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: appSpacing.lg,
    paddingTop: appSpacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appSpacing.md,
  },
  title: { fontSize: 28, fontWeight: "900" },
  subtitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  scrollContent: { padding: appSpacing.lg, gap: appSpacing.lg },
  cardGrid: { flexDirection: "row", gap: appSpacing.md },
  statCard: {
    flex: 1,
    padding: appSpacing.md,
    borderRadius: appRadius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...appShadows.soft,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  statValue: { fontSize: 16, fontWeight: "900", marginTop: 1 },
  
  chartCard: {
    padding: appSpacing.lg,
    borderRadius: appRadius.xl,
    borderWidth: 1,
    ...appShadows.soft,
  },
  chartTitle: { fontSize: 14, fontWeight: "700", marginBottom: appSpacing.lg },
  barChartContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    alignItems: "flex-end",
    height: 120,
    paddingTop: 10,
  },
  barGroup: { alignItems: "center", gap: 8 },
  barBase: { width: 40, height: 80, borderRadius: 8, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 8 },
  barLabel: { fontSize: 10, fontWeight: "700" },

  tableContainer: {
    borderRadius: appRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    ...appShadows.soft,
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: appSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  tableTitle: { fontSize: 16, fontWeight: "800" },
  tableLabels: {
    flexDirection: "row",
    paddingHorizontal: appSpacing.md,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  labelCell: { fontSize: 10, fontWeight: "800" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: appSpacing.md,
    borderBottomWidth: 1,
  },
  cellText: { fontSize: 13 },
  cellSub: { fontSize: 10, marginTop: 2 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  emptyText: { textAlign: "center", padding: appSpacing.xxl, fontStyle: "italic" },
  errorBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#F43F5E",
    padding: 10,
    borderRadius: 8,
  },
  errorText: { color: "#FFF", fontSize: 12, textAlign: "center" },
});

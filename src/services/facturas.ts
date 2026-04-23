import { http } from "@/services/http";
import { ApiResponse, FacturaListItem } from "@/types/api";

interface FacturasDashboardData {
  resumen: {
    totalFacturas: number;
    montoFacturado: number;
    facturasPendientes: number;
    montoPendiente: number;
    facturasParciales: number;
    montoParcialPendiente: number;
    facturasAdelantadas: number;
    montoAdelantadoPendiente: number;
    facturasPagadas: number;
    montoPagado: number;
    facturasAnuladas: number;
    montoAnulado: number;
    cobradoMesActual: number;
    facturadoMesActual: number;
    montoPendienteGlobal: number;
    pagadasMesActual: {
      count: number;
      monto: number;
    };
  };
  recientes: FacturaListItem[];
  vencidas: unknown[];
  topDeudores: unknown[];
}

export async function getFacturasDashboard(): Promise<FacturasDashboardData> {
  const response = await http.get<ApiResponse<FacturasDashboardData>>("/api/facturas/dashboard");
  
  if (!response.data.success) {
    throw new Error(response.data.error || "No se pudo cargar el dashboard de facturas");
  }

  return response.data.data;
}

export async function getFacturasList(search = "", status = ""): Promise<FacturaListItem[]> {
  // We can use the 'recientes' from dashboard or call a specific list endpoint
  // For now, let's use the dashboard to get the most recent ones as a 'datatable'
  const data = await getFacturasDashboard();
  return data.recientes;
}

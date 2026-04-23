import { http } from "@/services/http";
import { ApiResponse } from "@/types/api";

export interface Movement {
  id: string;
  tipo: string;
  monto: string;
  descripcion: string;
  fecha: string;
  metodo: string;
  categoria: string;
}

export interface MonthData {
  mes: string;
  ingresos: number;
  gastos: number;
}

export interface DashboardStats {
  totalClientes: number;
  recentMovements: Movement[];
  finance: {
    saldoTotalEfectivo: number;
    cajaPrincipal: number;
    cajaPapeleria: number;
    history: MonthData[];
  };
}

export async function getDashboardData(): Promise<DashboardStats> {
  const [clientsRes, movementsRes, cajaStatsRes, cajaPrincipalRes, papeleriaStatsRes] = await Promise.all([
    http.get("/api/clientes", { params: { limit: 1 } }),
    http.get("/api/recent-movements"),
    http.get("/api/caja-stats"),
    http.get("/api/caja-principal"),
    http.get("/api/papeleria-stats")
  ]);

  return {
    totalClientes: (clientsRes.data as any).meta?.pagination?.total || 0,
    recentMovements: (movementsRes.data as any).data || [],
    finance: {
      saldoTotalEfectivo: (cajaStatsRes.data as any).data?.saldoTotal || 0,
      cajaPrincipal: (cajaPrincipalRes.data as any).data?.balanceActual || 0,
      cajaPapeleria: (papeleriaStatsRes.data as any).data?.balanceActual || 0,
      history: (cajaStatsRes.data as any).data?.ultimosMeses || []
    }
  };
}

import { api } from "@/lib/api";

// ── Types matching Go API dashboard response ─────────────────────────

type GoDashboardLowStock = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  status: string;
  isActive: boolean;
  price: string;
  stockUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  categoryName?: string;
};

type GoDashboardData = {
  totalProducts: number;
  lowStockList: GoDashboardLowStock[];
};

// ── Frontend types (what the admin page expects) ─────────────────────

type DashboardLowStockProduct = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  categoryName: string;
};

export type AdminDashboardData = {
  stats: {
    totalProducts: number;
    lowStockProducts: number;
  };
  lowStockList: DashboardLowStockProduct[];
};

// ── API function ─────────────────────────────────────────────────────

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const res = await api.get<GoDashboardData>("/api/admin/dashboard", {
    withAuth: true,
    next: { revalidate: 0 },
  });

  const data = res.data!;

  const lowStockList: DashboardLowStockProduct[] = (data.lowStockList ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    unit: p.unit,
    lowStockThreshold: p.lowStockThreshold,
    categoryName: p.categoryName ?? "",
  }));

  return {
    stats: {
      totalProducts: data.totalProducts,
      lowStockProducts: lowStockList.length,
    },
    lowStockList,
  };
}

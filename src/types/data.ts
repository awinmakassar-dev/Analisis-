export interface DashboardData {
  'Demografi Kembangan': DemografiData[];
  'Lokasi Strategis GPS': LokasiData[];
  'Alokasi Driver Zoning': ZonaData[];
  'Proyeksi 30 Hari': DailyData[];
  'Portfolio Produk': ProductData[];
  'Analisis Kompetitor': CompetitorData[];
  'Customer Segmentation': SegmentData[];
  'Investment Breakdown': InvestmentData[];
  'Operasional per Shift': ShiftData[];
  'Heatmap Demand 24 Jam': HeatmapData[];
  'KPI Bulanan 12 Bulan': MonthlyData[];
  'Risk Register': RiskData[];
  'Break Even Analysis': BreakEvenData[];
  'Sensitivity Analysis': SensitivityData[];
  'Staffing dan Gaji': StaffData[];
  'Master Summary': SummaryData[];
  'Customer Detailed Real': CustomerDetailData[];
  'Risk Register Detailed': RiskDetailData[];
  'Climate Data BMKG': ClimateData[];
  'Traffic Pattern Real': TrafficData[];
  'Regulatory Compliance': RegulatoryData[];
  'Zona Radius Data': ZonaRadiusData[];
  'Zona Distance Matrix': ZonaDistanceMatrix[];
}

export interface DemografiData {
  Wilayah: string;
  Populasi_2024: number;
  Kepadatan_jiwa_km2: number;
  Luas_km2: number;
  Usia_Produktif_15_59_persen: number;
  Kelas_Ekonomi: string;
  Sumber_Data: string;
  Sumber_Link: string;
}

export interface LokasiData {
  Nama_Lokasi: string;
  Kategori: string;
  Kelurahan: string;
  Latitude: number;
  Longitude: number;
  Traffic_Level: string;
  Target_Priority: number;
  Estimasi_Footfall_per_Hari: number;
  Sumber_Koordinat: string;
  Sumber_Link: string;
}

export interface ZonaData {
  Zona_Operasional: string;
  Lokasi_Spesifik: string;
  Jumlah_Driver: number;
  Shift_Pagi_07_12: number;
  Shift_Siang_12_17: number;
  Shift_Sore_17_21: number;
  Target_Cup_per_Driver_per_Hari: number;
  Harga_Rata_rata_per_Cup: number;
  Radius_Operasional_km: number;
  Karakteristik_Traffic: string;
  Total_Driver_Zona: number;
}

export interface DailyData {
  Tanggal: string;
  Hari: string;
  Is_Weekend: boolean;
  Target_Cup_Total: number;
  Actual_Cup_Total: number;
  Achievement_Rate_persen: number;
  Active_Driver: number;
  Cup_per_Driver_Avg: number;
  Revenue_Rp: number;
  COGS_Rp: number;
  Operational_Cost_Rp: number;
  Fixed_Cost_Rp: number;
  Net_Profit_Rp: number;
  Accumulated_Profit_Rp: number;
}

export interface ProductData {
  SKU_Code: string;
  Nama_Produk: string;
  Deskripsi: string;
  Kategori: string;
  Sub_Kategori: string;
  Harga_Jual_Rp: number;
  HPP_per_Cup_Rp: number;
  Margin_persen: number;
  Estimasi_Daily_Sales_persen: number;
  Target_Priority: number;
  Waktu_Preparasi_menit: number;
  Ketersediaan: string;
  Keuntungan_per_Cup: number;
  Bahan_Utama: string;
  Unique_Selling_Point: string;
}

export interface CompetitorData {
  Brand: string;
  Model_Bisnis: string;
  Harga_Kopi_Susu_Rp: number;
  Jumlah_Outlet_Kembangan: number;
  Lokasi_Presence: string;
  Target_Segment: string;
  Strength: string;
  Weakness: string;
  Threat_Level: string;
  Menu_Utama: string;
  Keunggulan: string;
}

export interface SegmentData {
  Nama_Segment: string;
  Estimasi_Populasi: number;
  Lifetime_Value_3bulan: number;
  Avg_Transaction_Value_Rp: number;
  Purchase_Frequency_per_Minggu: number;
  Karakteristik_Utama: string;
  Pain_Points: string;
  Preferred_Channel: string;
  Peak_Days: string;
}

export interface InvestmentData {
  Kategori: string;
  Item: string;
  Jumlah_Unit: number;
  Harga_per_Unit_Rp: number;
  Total_Biaya_Rp: number;
  Tipe_Biaya: string;
  Kategori_Utama: string;
}

export interface ShiftData {
  Hari: string;
  Shift: string;
  Active_Driver: number;
  Cup_per_Driver_Avg: number;
  Total_Cup_Shift: number;
  Avg_Price_per_Cup: number;
  Revenue_Shift_Rp: number;
  Operational_Cost_Rp: number;
  COGS_Rp: number;
}

export interface HeatmapData {
  Zona: string;
  Jam: number;
  Jam_Label: string;
  Demand_Index: number;
  Recommended_Driver: number;
  Keterangan: string;
}

export interface MonthlyData {
  Bulan: string;
  Bulan_Ke: number;
  Hari_Dalam_Bulan: number;
  Avg_Cup_per_Hari: number;
  Total_Cup_Bulan: number;
  Avg_Harga_per_Cup: number;
  Revenue_Rp: number;
  COGS_Rp: number;
  Operational_Cost_Rp: number;
  Marketing_Cost_Rp: number;
  Fixed_Cost_Rp: number;
  Net_Profit_Rp: number;
  Profit_Margin_persen: number;
  Accumulated_Profit_Rp: number;
  Driver_Count: number;
}

export interface RiskData {
  Risk_ID: string;
  Kategori_Risiko: string;
  Deskripsi_Risiko: string;
  Probabilitas: string;
  Impact: string;
  Risk_Score: number;
  Mitigation_Strategy: string;
  Contingency_Plan: string;
  Owner: string;
}

export interface BreakEvenData {
  Metrik: string;
  Nilai: number;
  Satuan: string;
}

export interface SensitivityData {
  Scenario: string;
  Cup_per_Driver_per_Day: number;
  Avg_Price_per_Cup: number;
  Total_Cup_per_Day: number;
  Total_Cup_per_Month: number;
  Revenue_per_Month_Rp: number;
  COGS_Rp: number;
  Operational_Cost_Rp: number;
  Fixed_Cost_Rp: number;
  Net_Profit_Rp: number;
  Profit_Margin_persen: number;
  ROI_Month_persen: number;
}

export interface StaffData {
  Posisi: string;
  Jumlah_Staff: number;
  Gaji_Pokok_per_Bulan: number;
  Bonus_Performance: number;
  Benefits: number;
  Total_Cost_per_Staff: number;
  Total_Cost_per_Jabatan: number;
  Shift: string;
}

export interface SummaryData {
  Kategori: string;
  Metrik: string;
  Nilai: string | number;
  Satuan: string;
  Sumber: string;
}

export interface CustomerDetailData {
  Segment_ID: string;
  Nama_Segment_Utama: string;
  Sub_Area: string;
  Populasi_Total: number;
  Populasi_Target_Coffee_Drinkers: number;
  Usia_Rata_Rata: number;
  Income_Level_Rata_Rata_Rp: number;
  Peak_Hours: string;
  Traffic_Level: string;
  Avg_Daily_Footfall: number;
  Estimated_Daily_Coffee_Demand_Cups: number;
  Sumber_Data: string;
  Koordinat_Latitude: number;
  Koordinat_Longitude: number;
  Sumber_Link: string;
  // Additional detailed fields
  Gender_Distribution?: Record<string, number>;
  Education_Level?: Record<string, number>;
  Job_Type?: Record<string, number>;
  Coffee_Preference?: Record<string, number>;
  Spending_Habit?: string;
  Loyalty_Potential?: string;
}

export interface RiskDetailData {
  Risk_ID: string;
  Kategori_Risiko: string;
  Risk_Description: string;
  Probability: string;
  Impact: string;
  Risk_Score: number;
  Mitigation_Strategy: string;
  Contingency_Plan: string;
  Early_Warning_Indicators: string;
  Owner: string;
  Status: string;
  Sumber_Link: string;
}

export interface ClimateData {
  Bulan: string;
  Curah_Hujan_mm: number;
  Hari_Hujan: number;
  Suhu_Rata_Rata_C: number;
  Suhu_Min_C: number;
  Suhu_Max_C: number;
  Kelembaban_persen: number;
  Kecepatan_Angin_m_s: number;
  Musim: string;
  Impact_to_Operations: string;
  Sumber: string;
  Sumber_Link: string;
}

export interface TrafficData {
  Zona: string;
  Waktu: string;
  Traffic_Level: string;
  Congestion_Index: number;
  Avg_Speed_kmh: number;
  Estimated_Delay_menit: number;
  Best_Time_Operations: string;
  Keterangan: string;
}

export interface RegulatoryData {
  Jenis_Izin: string;
  Kode_KBLI: string;
  Instansi_Pemberi: string;
  Status_Wajib: string;
  Estimasi_Biaya_Rp: number;
  Estimasi_Waktu_Hari: number;
  Persyaratan_Utama: string;
  Risiko_Jika_Tidak_Punya: string;
  Status_Pengurusan: string;
  Sumber_Link: string;
}

export interface ZonaRadiusData {
  Zona_ID: string;
  Nama_Zona: string;
  Lokasi_HUB: string;
  Latitude: number;
  Longitude: number;
  Radius_KM: number;
  Radius_Menit_Motor: number;
  Radius_Menit_Mobil: number;
  Jarak_ke_Zona_B_KM: number;
  Jarak_ke_Zona_C_KM: number;
  Jarak_ke_Zona_D_KM: number;
  Jarak_ke_Zona_E_KM: number;
  Populasi_Total: number;
  Footfall_Harian: number;
  Demand_Power: number;
  Risiko_Lalu_Lintas: {
    Risiko: string;
    Level: string;
    Deskripsi: string;
  }[];
}

export interface ZonaDistanceMatrix {
  From: string;
  To: string;
  Jarak_KM: number;
  Waktu_Motor_Menit: number;
  Waktu_Mobil_Menit: number;
  Kondisi_Jalan: string;
}

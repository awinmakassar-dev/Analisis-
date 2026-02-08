import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, Database, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { DashboardData } from '@/types/data';

interface ExportDataProps {
  data: DashboardData | null;
}

export default function ExportData({ data }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (exportType: 'all' | 'filtered' | 'summary') => {
    if (!data) return;
    
    setIsExporting(true);
    
    try {
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: 'Makkanya Express - Data Export',
        Subject: 'Dashboard Data Export',
        Author: 'Makkanya Express Analytics',
        CreatedDate: new Date()
      };

      // 1. Sheet: Ringkasan Dashboard
      const summaryData = [
        ['RINGKASAN DASHBOARD MAKKANYA EXPRESS'],
        [''],
        ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
        ['Waktu Export', new Date().toLocaleTimeString('id-ID')],
        [''],
        ['METRIK UTAMA'],
        ['Total Populasi Target', data['Customer Detailed Real'].reduce((sum, c) => sum + c.Populasi_Target_Coffee_Drinkers, 0).toLocaleString('id-ID')],
        ['Total Footfall Harian', data['Lokasi Strategis GPS'].reduce((sum, l) => sum + l.Estimasi_Footfall_per_Hari, 0).toLocaleString('id-ID')],
        ['Total Demand Harian', data['Customer Detailed Real'].reduce((sum, c) => sum + c.Estimated_Daily_Coffee_Demand_Cups, 0).toLocaleString('id-ID')],
        ['Total Revenue (30 Hari)', 'Rp ' + data['Proyeksi 30 Hari'].reduce((sum, d) => sum + d.Revenue_Rp, 0).toLocaleString('id-ID')],
        ['Total Net Profit (30 Hari)', 'Rp ' + data['Proyeksi 30 Hari'].reduce((sum, d) => sum + d.Net_Profit_Rp, 0).toLocaleString('id-ID')],
        ['Total Cup Terjual (30 Hari)', data['Proyeksi 30 Hari'].reduce((sum, d) => sum + d.Actual_Cup_Total, 0).toLocaleString('id-ID')],
        ['Avg Achievement Rate', (data['Proyeksi 30 Hari'].reduce((sum, d) => sum + d.Achievement_Rate_persen, 0) / data['Proyeksi 30 Hari'].length).toFixed(1) + '%'],
        [''],
        ['JUMLAH DATA'],
        ['Jumlah Lokasi', data['Lokasi Strategis GPS'].length],
        ['Jumlah Produk', data['Portfolio Produk'].length],
        ['Jumlah Segment Customer', data['Customer Segmentation'].length],
        ['Jumlah Zona', data['Zona Radius Data']?.length || 0],
        ['Jumlah Risiko', data['Risk Register Detailed'].length],
        ['Jumlah Data Proyeksi', data['Proyeksi 30 Hari'].length],
        ['Jumlah Data KPI Bulanan', data['KPI Bulanan 12 Bulan'].length],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      // 2. Sheet: Data Lokasi
      const lokasiHeaders = [
        'Nama Lokasi', 'Kategori', 'Kelurahan', 'Latitude', 'Longitude', 
        'Traffic Level', 'Target Priority', 'Footfall per Hari', 'Sumber Data'
      ];
      const lokasiData = data['Lokasi Strategis GPS'].map(l => [
        l.Nama_Lokasi,
        l.Kategori,
        l.Kelurahan,
        l.Latitude,
        l.Longitude,
        l.Traffic_Level,
        l.Target_Priority,
        l.Estimasi_Footfall_per_Hari,
        l.Sumber_Koordinat
      ]);
      const wsLokasi = XLSX.utils.aoa_to_sheet([lokasiHeaders, ...lokasiData]);
      XLSX.utils.book_append_sheet(wb, wsLokasi, 'Data Lokasi');

      // 3. Sheet: Data Zona & Radius
      const zonaHeaders = [
        'Zona ID', 'Nama Zona', 'Lokasi HUB', 'Radius (KM)', 'Waktu Motor (Menit)', 
        'Waktu Mobil (Menit)', 'Populasi', 'Footfall Harian', 'Demand Power'
      ];
      const zonaData = data['Zona Radius Data'].map(z => [
        z.Zona_ID,
        z.Nama_Zona,
        z.Lokasi_HUB,
        z.Radius_KM,
        z.Radius_Menit_Motor,
        z.Radius_Menit_Mobil,
        z.Populasi_Total,
        z.Footfall_Harian,
        z.Demand_Power
      ]);
      const wsZona = XLSX.utils.aoa_to_sheet([zonaHeaders, ...zonaData]);
      XLSX.utils.book_append_sheet(wb, wsZona, 'Data Zona & Radius');

      // 4. Sheet: Jarak Antar Zona
      const jarakHeaders = ['Dari Zona', 'Ke Zona', 'Jarak (KM)', 'Waktu Motor (Menit)', 'Waktu Mobil (Menit)', 'Kondisi Jalan'];
      const jarakData = data['Zona Distance Matrix'].map(d => [
        d.From, d.To, d.Jarak_KM, d.Waktu_Motor_Menit, d.Waktu_Mobil_Menit, d.Kondisi_Jalan
      ]);
      const wsJarak = XLSX.utils.aoa_to_sheet([jarakHeaders, ...jarakData]);
      XLSX.utils.book_append_sheet(wb, wsJarak, 'Jarak Antar Zona');

      // 5. Sheet: Data Customer Segment
      const customerHeaders = [
        'Segment ID', 'Nama Segment', 'Sub Area', 'Populasi Total', 'Target Coffee Drinkers',
        'Usia Rata-rata', 'Income per Bulan', 'Peak Hours', 'Traffic Level', 
        'Footfall Harian', 'Demand Harian', 'Spending Habit', 'Loyalty Potential'
      ];
      const customerData = data['Customer Detailed Real'].map(c => [
        c.Segment_ID,
        c.Nama_Segment_Utama,
        c.Sub_Area,
        c.Populasi_Total,
        c.Populasi_Target_Coffee_Drinkers,
        c.Usia_Rata_Rata,
        c.Income_Level_Rata_Rata_Rp,
        c.Peak_Hours,
        c.Traffic_Level,
        c.Avg_Daily_Footfall,
        c.Estimated_Daily_Coffee_Demand_Cups,
        c.Spending_Habit || '-',
        c.Loyalty_Potential || '-'
      ]);
      const wsCustomer = XLSX.utils.aoa_to_sheet([customerHeaders, ...customerData]);
      XLSX.utils.book_append_sheet(wb, wsCustomer, 'Customer Segment');

      // 6. Sheet: Data Produk
      const produkHeaders = [
        'SKU Code', 'Nama Produk', 'Deskripsi', 'Kategori', 'Sub Kategori',
        'Harga Jual (Rp)', 'HPP per Cup (Rp)', 'Margin (%)', 'Estimasi Daily Sales (%)',
        'Keuntungan per Cup (Rp)', 'Waktu Preparasi (Menit)', 'USP'
      ];
      const produkData = data['Portfolio Produk'].map(p => [
        p.SKU_Code,
        p.Nama_Produk,
        p.Deskripsi,
        p.Kategori,
        p.Sub_Kategori,
        p.Harga_Jual_Rp,
        p.HPP_per_Cup_Rp,
        p.Margin_persen,
        p.Estimasi_Daily_Sales_persen,
        p.Keuntungan_per_Cup,
        p.Waktu_Preparasi_menit,
        p.Unique_Selling_Point
      ]);
      const wsProduk = XLSX.utils.aoa_to_sheet([produkHeaders, ...produkData]);
      XLSX.utils.book_append_sheet(wb, wsProduk, 'Data Produk');

      // 7. Sheet: Analisis Kompetitor
      const kompetitorHeaders = [
        'Brand', 'Model Bisnis', 'Harga Kopi Susu (Rp)', 'Jumlah Outlet Kembangan',
        'Lokasi Presence', 'Target Segment', 'Strength', 'Weakness', 'Threat Level'
      ];
      const kompetitorData = data['Analisis Kompetitor'].map(k => [
        k.Brand,
        k.Model_Bisnis,
        k.Harga_Kopi_Susu_Rp,
        k.Jumlah_Outlet_Kembangan,
        k.Lokasi_Presence,
        k.Target_Segment,
        k.Strength,
        k.Weakness,
        k.Threat_Level
      ]);
      const wsKompetitor = XLSX.utils.aoa_to_sheet([kompetitorHeaders, ...kompetitorData]);
      XLSX.utils.book_append_sheet(wb, wsKompetitor, 'Analisis Kompetitor');

      // 8. Sheet: Proyeksi 30 Hari
      const proyeksiHeaders = [
        'Tanggal', 'Hari', 'Is Weekend', 'Target Cup Total', 'Actual Cup Total', 'Achievement Rate (%)',
        'Active Driver', 'Cup per Driver Avg', 'Revenue (Rp)', 'COGS (Rp)', 'Operational Cost (Rp)',
        'Fixed Cost (Rp)', 'Net Profit (Rp)', 'Accumulated Profit (Rp)'
      ];
      const proyeksiData = data['Proyeksi 30 Hari'].map(p => [
        p.Tanggal,
        p.Hari,
        p.Is_Weekend ? 'Ya' : 'Tidak',
        p.Target_Cup_Total,
        p.Actual_Cup_Total,
        p.Achievement_Rate_persen,
        p.Active_Driver,
        p.Cup_per_Driver_Avg,
        p.Revenue_Rp,
        p.COGS_Rp,
        p.Operational_Cost_Rp,
        p.Fixed_Cost_Rp,
        p.Net_Profit_Rp,
        p.Accumulated_Profit_Rp
      ]);
      const wsProyeksi = XLSX.utils.aoa_to_sheet([proyeksiHeaders, ...proyeksiData]);
      XLSX.utils.book_append_sheet(wb, wsProyeksi, 'Proyeksi 30 Hari');

      // 9. Sheet: KPI Bulanan 12 Bulan
      const kpiHeaders = [
        'Bulan', 'Bulan Ke', 'Hari Dalam Bulan', 'Avg Cup per Hari', 'Total Cup Bulan',
        'Avg Harga per Cup', 'Revenue (Rp)', 'COGS (Rp)', 'Operational Cost (Rp)',
        'Marketing Cost (Rp)', 'Fixed Cost (Rp)', 'Net Profit (Rp)', 'Profit Margin (%)',
        'Accumulated Profit (Rp)', 'Driver Count'
      ];
      const kpiData = data['KPI Bulanan 12 Bulan'].map(k => [
        k.Bulan,
        k.Bulan_Ke,
        k.Hari_Dalam_Bulan,
        k.Avg_Cup_per_Hari,
        k.Total_Cup_Bulan,
        k.Avg_Harga_per_Cup,
        k.Revenue_Rp,
        k.COGS_Rp,
        k.Operational_Cost_Rp,
        k.Marketing_Cost_Rp,
        k.Fixed_Cost_Rp,
        k.Net_Profit_Rp,
        k.Profit_Margin_persen,
        k.Accumulated_Profit_Rp,
        k.Driver_Count
      ]);
      const wsKPI = XLSX.utils.aoa_to_sheet([kpiHeaders, ...kpiData]);
      XLSX.utils.book_append_sheet(wb, wsKPI, 'KPI Bulanan 12 Bulan');

      // 10. Sheet: Heatmap Demand 24 Jam
      const heatmapHeaders = ['Jam', 'Zona', 'Demand Index', 'Recommended Driver'];
      const heatmapData = data['Heatmap Demand 24 Jam'].map(h => [
        h.Jam,
        h.Zona,
        h.Demand_Index,
        h.Recommended_Driver
      ]);
      const wsHeatmap = XLSX.utils.aoa_to_sheet([heatmapHeaders, ...heatmapData]);
      XLSX.utils.book_append_sheet(wb, wsHeatmap, 'Heatmap Demand 24 Jam');

      // 11. Sheet: Data Risiko
      const risikoHeaders = [
        'ID Risiko', 'Kategori Risiko', 'Deskripsi Risiko', 'Probability', 'Impact',
        'Risk Score', 'Mitigation Strategy', 'Contingency Plan', 'Early Warning Indicators',
        'Owner', 'Status', 'Sumber Link'
      ];
      const risikoData = data['Risk Register Detailed'].map(r => [
        r.Risk_ID,
        r.Kategori_Risiko,
        r.Risk_Description,
        r.Probability,
        r.Impact,
        r.Risk_Score,
        r.Mitigation_Strategy,
        r.Contingency_Plan,
        r.Early_Warning_Indicators,
        r.Owner,
        r.Status,
        r.Sumber_Link
      ]);
      const wsRisiko = XLSX.utils.aoa_to_sheet([risikoHeaders, ...risikoData]);
      XLSX.utils.book_append_sheet(wb, wsRisiko, 'Data Risiko');

      // 12. Sheet: Investment Breakdown
      const investasiHeaders = ['Kategori', 'Item', 'Jumlah Unit', 'Harga per Unit (Rp)', 'Total Biaya (Rp)'];
      const investasiData = data['Investment Breakdown'].map(i => [
        i.Kategori,
        i.Item,
        i.Jumlah_Unit,
        i.Harga_per_Unit_Rp,
        i.Total_Biaya_Rp
      ]);
      const wsInvestasi = XLSX.utils.aoa_to_sheet([investasiHeaders, ...investasiData]);
      XLSX.utils.book_append_sheet(wb, wsInvestasi, 'Investment Breakdown');

      // 13. Sheet: Break Even Analysis
      const bepHeaders = ['Metrik', 'Nilai', 'Satuan'];
      const bepData = data['Break Even Analysis'].map(b => [
        b.Metrik,
        b.Nilai,
        b.Satuan
      ]);
      const wsBEP = XLSX.utils.aoa_to_sheet([bepHeaders, ...bepData]);
      XLSX.utils.book_append_sheet(wb, wsBEP, 'Break Even Analysis');

      // 14. Sheet: Demografi Kembangan
      const demografiHeaders = [
        'Wilayah', 'Populasi 2024', 'Kepadatan (jiwa/km2)', 'Luas (km2)',
        'Usia Produktif 15-59 (%)', 'Kelas Ekonomi', 'Sumber Data', 'Sumber Link'
      ];
      const demografiData = data['Demografi Kembangan'].map(d => [
        d.Wilayah,
        d.Populasi_2024,
        d.Kepadatan_jiwa_km2,
        d.Luas_km2,
        d.Usia_Produktif_15_59_persen,
        d.Kelas_Ekonomi,
        d.Sumber_Data,
        d.Sumber_Link
      ]);
      const wsDemografi = XLSX.utils.aoa_to_sheet([demografiHeaders, ...demografiData]);
      XLSX.utils.book_append_sheet(wb, wsDemografi, 'Demografi Kembangan');

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Makkanya_Express_Data_Export_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat export data. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-gray-700"
          disabled={!data || isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Pilih Format Export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => exportToExcel('all')}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          <div>
            <p className="text-sm">Export ke Excel (.xlsx)</p>
            <p className="text-xs text-gray-500">Semua data dashboard</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-[10px] text-gray-500">
            <Database className="w-3 h-3 inline mr-1" />
            {data ? '14 sheet data tersedia' : 'Data tidak tersedia'}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

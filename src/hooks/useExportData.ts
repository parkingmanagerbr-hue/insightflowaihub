import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
}

export const useExportData = () => {
  const { toast } = useToast();

  const exportToCSV = useCallback((
    data: Record<string, unknown>[],
    columns: string[],
    options: ExportOptions = {}
  ) => {
    const { filename = 'export' } = options;

    if (!data || data.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados para exportar',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create CSV content
      const escapeCSV = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, newline or quote
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headerRow = columns.map(escapeCSV).join(',');
      const dataRows = data.map(row => 
        columns.map(col => escapeCSV(row[col])).join(',')
      );
      
      const csvContent = [headerRow, ...dataRows].join('\n');
      
      // Add BOM for Excel UTF-8 compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Exportado!',
        description: `${data.length} registros exportados para CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const exportToExcel = useCallback((
    data: Record<string, unknown>[],
    columns: string[],
    options: ExportOptions = {}
  ) => {
    const { filename = 'export', sheetName = 'Dados' } = options;

    if (!data || data.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados para exportar',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create Excel XML (simple format compatible with Excel)
      const escapeXML = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const getDataType = (value: unknown): string => {
        if (typeof value === 'number') return 'Number';
        if (typeof value === 'boolean') return 'Boolean';
        return 'String';
      };

      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXML(sheetName)}">
    <Table>`;

      // Header row
      xmlContent += '\n      <Row ss:StyleID="Header">';
      columns.forEach(col => {
        xmlContent += `\n        <Cell><Data ss:Type="String">${escapeXML(col)}</Data></Cell>`;
      });
      xmlContent += '\n      </Row>';

      // Data rows
      data.forEach(row => {
        xmlContent += '\n      <Row>';
        columns.forEach(col => {
          const value = row[col];
          const dataType = getDataType(value);
          xmlContent += `\n        <Cell><Data ss:Type="${dataType}">${escapeXML(value)}</Data></Cell>`;
        });
        xmlContent += '\n      </Row>';
      });

      xmlContent += `
    </Table>
  </Worksheet>
</Workbook>`;

      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
      
      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Exportado!',
        description: `${data.length} registros exportados para Excel`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const exportToJSON = useCallback((
    data: Record<string, unknown>[],
    options: ExportOptions = {}
  ) => {
    const { filename = 'export' } = options;

    if (!data || data.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados para exportar',
        variant: 'destructive',
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Exportado!',
        description: `${data.length} registros exportados para JSON`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    exportToCSV,
    exportToExcel,
    exportToJSON,
  };
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ComparablesAPIResponse } from '@/lib/comparables/types';

interface ComparablesViewProps {
  comparablesData: ComparablesAPIResponse;
}

export function ComparablesView({ comparablesData }: ComparablesViewProps) {
  const { comparables, total_count, median_comparable_value } = comparablesData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Comparables Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Comparables Found</p>
              <p className="text-2xl font-bold">{total_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Median Comparable Value</p>
              <p className="text-2xl font-bold">{formatCurrency(median_comparable_value)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparable Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Square Footage</TableHead>
                  <TableHead>Year Built</TableHead>
                  <TableHead>Original Value</TableHead>
                  <TableHead>Adjusted Value</TableHead>
                  <TableHead>Adjusted PSF</TableHead>
                  <TableHead>Total Adjustment</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparables.map((comp, index) => (
                  <TableRow key={comp.account_id}>
                    <TableCell className="font-medium">
                      {comp.address}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {comp.account_id}
                    </TableCell>
                    <TableCell>
                      {comp.basic_info.square_footage.toLocaleString()} sq ft
                    </TableCell>
                    <TableCell>
                      {comp.basic_info.year_built}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(comp.financial_data.original_market_value)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(comp.financial_data.adjusted_value)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(comp.financial_data.adjusted_price_per_sqft)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={comp.adjustments.total_adjustment_pct >= 0 ? "default" : "secondary"}>
                        {formatPercentage(comp.adjustments.total_adjustment_pct)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {comp.analysis.comparable_score.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {comparables.map((comp, index) => (
              <div key={comp.account_id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{comp.address} ({comp.account_id})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size Adjustment</p>
                    <p className="font-medium">
                      {formatPercentage(comp.adjustments.size_adjustment_pct)} 
                      <span className="text-sm text-muted-foreground ml-1">
                        ({formatCurrency(comp.adjustments.size_adjustment_amount)})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age Adjustment</p>
                    <p className="font-medium">
                      {formatPercentage(comp.adjustments.age_adjustment_pct)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({formatCurrency(comp.adjustments.age_adjustment_amount)})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Features Adjustment</p>
                    <p className="font-medium">
                      {formatPercentage(comp.adjustments.features_adjustment_pct)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({formatCurrency(comp.adjustments.features_adjustment_amount)})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Land Adjustment</p>
                    <p className="font-medium">
                      {formatPercentage(comp.adjustments.land_adjustment_pct)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({formatCurrency(comp.adjustments.land_adjustment_amount)})
                      </span>
                    </p>
                  </div>
                </div>
                {comp.analysis.adjustment_notes.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Adjustment Notes:</p>
                    <ul className="text-sm space-y-1">
                      {comp.analysis.adjustment_notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_COLORS = [
  "hsl(210, 100%, 50%)",
  "hsl(160, 100%, 45%)",
  "hsl(280, 100%, 55%)",
  "hsl(30, 100%, 55%)",
  "hsl(340, 100%, 55%)",
];

export function LoginMethodChart({
  data,
}: {
  data: Array<{ label: string; count: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Métodos de Acceso</CardTitle>
        <CardDescription>Distribución por proveedor de identidad</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin datos de acceso
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={4} fill="hsl(210, 100%, 50%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function VerificationChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estado de Verificación</CardTitle>
        <CardDescription>Correos verificados vs pendientes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopClientsChart({
  data,
}: {
  data: Array<{ name: string; tokenCount: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Apps con Más Tokens Emitidos</CardTitle>
        <CardDescription>Top clientes OAuth por uso</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin tokens emitidos
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="tokenCount"
                radius={4}
                fill="hsl(160, 100%, 45%)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

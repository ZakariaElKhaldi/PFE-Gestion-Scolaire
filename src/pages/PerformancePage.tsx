
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const performanceData = [
  { month: "Sept", math: 15, french: 14, history: 16 },
  { month: "Oct", math: 16, french: 15, history: 15 },
  { month: "Nov", math: 14, french: 16, history: 17 },
  { month: "Dec", math: 17, french: 15, history: 16 },
  { month: "Jan", math: 16, french: 17, history: 18 },
];

const PerformancePage = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h1 className="text-3xl font-bold tracking-tight">
        Suivi des Performances
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Moyenne Générale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">16.2/20</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3/28</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+2.1</div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-sm bg-white/50">
        <CardHeader>
          <CardTitle>Évolution des Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="math"
                  stroke="#9b87f5"
                  name="Mathématiques"
                />
                <Line
                  type="monotone"
                  dataKey="french"
                  stroke="#7E69AB"
                  name="Français"
                />
                <Line
                  type="monotone"
                  dataKey="history"
                  stroke="#D6BCFA"
                  name="Histoire"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;

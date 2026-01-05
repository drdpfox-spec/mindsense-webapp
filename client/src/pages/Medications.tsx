import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pill, Plus, FileText, Calendar, HelpCircle } from "lucide-react";

export default function Medications() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Medications</h1>
              <p className="text-sm text-muted-foreground">Manage your medications and track adherence</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <FileText className="h-4 w-4 mr-2" />
                E-Prescriptions
              </Button>
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Adherence Statistics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Adherence Statistics</h2>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Adherence Rate</p>
                <p className="text-3xl font-bold">0%</p>
                <p className="text-xs text-muted-foreground mt-1">0 of 0 doses taken</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Taken</p>
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-xs text-muted-foreground mt-1">Doses completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Missed</p>
                <p className="text-3xl font-bold text-red-600">0</p>
                <p className="text-xs text-muted-foreground mt-1">Doses missed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Skipped</p>
                <p className="text-3xl font-bold text-yellow-600">0</p>
                <p className="text-xs text-muted-foreground mt-1">Doses skipped</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Empty State */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="flex justify-center mb-6">
              <Pill className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">No medications yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first medication to start tracking adherence
            </p>

            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

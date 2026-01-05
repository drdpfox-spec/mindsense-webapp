import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Plus } from "lucide-react";

export default function Journal() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Health Journal</h1>
              <p className="text-sm text-muted-foreground">Track symptoms, medications, and lifestyle factors</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-yellow-50 border-2 border-dashed border-yellow-400">
            <TabsTrigger value="all" className="data-[state=active]:bg-yellow-200">All</TabsTrigger>
            <TabsTrigger value="symptom" className="data-[state=active]:bg-yellow-200">Symptoms</TabsTrigger>
            <TabsTrigger value="medication" className="data-[state=active]:bg-yellow-200">Medications</TabsTrigger>
            <TabsTrigger value="lifestyle" className="data-[state=active]:bg-yellow-200">Lifestyle</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="flex justify-center mb-6">
                  <Activity className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mb-2">No Entries Yet</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Start tracking your health by adding your first journal entry
                </p>

                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptom">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="flex justify-center mb-6">
                  <Activity className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mb-2">No Symptom Entries</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Track your symptoms to identify patterns
                </p>

                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medication">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="flex justify-center mb-6">
                  <Activity className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mb-2">No Medication Entries</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Log medication changes and effects
                </p>

                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="flex justify-center mb-6">
                  <Activity className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mb-2">No Lifestyle Entries</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Record diet, exercise, and sleep patterns
                </p>

                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { AppLayout } from "@/components/layout";
import { 
  useListVehicles, 
  useCreateVehicle, 
  useUpdateVehicle, 
  useDeleteVehicle,
  ListVehiclesStatus,
  Vehicle
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Car, Plus, Filter, Edit, Trash2, Gauge, Settings2, Armchair, Zap, User 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const vehicleSchema = z.object({
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z.coerce.number().min(1900, "Invalid year"),
  licensePlate: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  dailyRate: z.coerce.number().min(0, "Must be positive"),
  status: z.enum(["available", "rented", "maintenance"]),
  color: z.string().min(1, "Required"),
  mileage: z.coerce.number().min(0),
  fuelType: z.string().min(1, "Required"),
  transmission: z.string().min(1, "Required"),
  seats: z.coerce.number().min(1),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function Vehicles() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    status: statusFilter !== "all" ? (statusFilter as ListVehiclesStatus) : undefined,
    category: categoryFilter || undefined,
  };

  const { data: vehicles, isLoading } = useListVehicles(queryParams);
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: "available",
      mileage: 0,
      seats: 5,
      fuelType: "Gasoline",
      transmission: "Automatic",
      imageUrl: "",
      description: "",
    }
  });

  const openModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      form.reset({
        ...vehicle,
        imageUrl: vehicle.imageUrl || "",
        description: vehicle.description || "",
      });
    } else {
      setEditingVehicle(null);
      form.reset({
        status: "available",
        mileage: 0,
        seats: 5,
        fuelType: "Gasoline",
        transmission: "Automatic",
        imageUrl: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      if (editingVehicle) {
        await updateMutation.mutateAsync({ id: editingVehicle.id, data });
        toast({ title: "Vehicle updated successfully" });
      } else {
        await createMutation.mutateAsync({ data });
        toast({ title: "Vehicle created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error saving vehicle", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Vehicle deleted" });
    } catch (error: any) {
      toast({ title: "Error deleting vehicle", description: error.message, variant: "destructive" });
    }
  };

  const statusColors = {
    available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
    rented: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    maintenance: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Fleet Management</h1>
            <p className="text-muted-foreground mt-1">Manage your vehicles, track status and update details.</p>
          </div>
          <Button 
            onClick={() => openModal()}
            className="rounded-xl px-6 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Vehicle
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 px-3 border-r border-border text-muted-foreground hidden sm:flex">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Filter by category (e.g. SUV)" 
            className="w-full sm:w-[250px] bg-background"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {(Array.isArray(vehicles) ? vehicles : []).map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-card rounded-2xl overflow-hidden shadow-md shadow-black/5 border border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {/* Unsplash beautiful car photo fallback */}
                    {/* sleek modern car */}
                    <img 
                      src={vehicle.imageUrl || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600"} 
                      alt={vehicle.make}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${statusColors[vehicle.status]}`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-display font-bold text-foreground">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-muted-foreground text-sm font-medium">{vehicle.year} • {vehicle.category}</p>
                      </div>
                      <div className="text-right bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                        <p className="text-primary font-bold text-lg">₹{vehicle.dailyRate}</p>
                        <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">Per Day</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <Armchair className="w-4 h-4 mr-2 text-foreground/50" /> {vehicle.seats} Seats
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <Settings2 className="w-4 h-4 mr-2 text-foreground/50" /> {vehicle.transmission}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <Zap className="w-4 h-4 mr-2 text-foreground/50" /> {vehicle.fuelType}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <Gauge className="w-4 h-4 mr-2 text-foreground/50" /> {vehicle.mileage.toLocaleString()} mi
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border mt-auto">
                      <Button variant="outline" className="flex-1 rounded-xl" onClick={() => openModal(vehicle)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" className="rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(vehicle.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border rounded-2xl">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-muted px-6 py-4 border-b border-border">
              <DialogTitle className="text-xl font-display font-bold">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </DialogTitle>
            </div>
            
            <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Make</label>
                <Input {...form.register("make")} className="bg-background rounded-xl" placeholder="e.g. Toyota" />
                {form.formState.errors.make && <span className="text-xs text-destructive">{form.formState.errors.make.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Model</label>
                <Input {...form.register("model")} className="bg-background rounded-xl" placeholder="e.g. Camry" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Year</label>
                <Input type="number" {...form.register("year")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">License Plate</label>
                <Input {...form.register("licensePlate")} className="bg-background rounded-xl uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Category</label>
                <Input {...form.register("category")} className="bg-background rounded-xl" placeholder="e.g. SUV, Sedan" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Daily Rate ($)</label>
                <Input type="number" step="0.01" {...form.register("dailyRate")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Status</label>
                <Select onValueChange={(val) => form.setValue("status", val as any)} defaultValue={form.getValues("status")}>
                  <SelectTrigger className="bg-background rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Color</label>
                <Input {...form.register("color")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Transmission</label>
                <Input {...form.register("transmission")} className="bg-background rounded-xl" placeholder="Automatic" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Fuel Type</label>
                <Input {...form.register("fuelType")} className="bg-background rounded-xl" placeholder="Gasoline, Electric" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Seats</label>
                <Input type="number" {...form.register("seats")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Mileage</label>
                <Input type="number" {...form.register("mileage")} className="bg-background rounded-xl" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground">Image URL</label>
                <Input {...form.register("imageUrl")} className="bg-background rounded-xl" placeholder="https://..." />
              </div>
            </div>

            <div className="bg-muted px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Vehicle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

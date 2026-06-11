import React, { useState } from "react";
import { AppLayout } from "@/components/layout";
import { 
  useListRentals, 
  useCreateRental, 
  useUpdateRental,
  useListVehicles,
  useListCustomers,
  ListRentalsStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Calendar, Clock, CheckCircle2, XCircle, ArrowRightLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Added DialogDescription
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";

const createRentalSchema = z.object({
  vehicleId: z.coerce.number().min(1, "Required"),
  customerId: z.coerce.number().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  dailyRate: z.coerce.number().min(0, "Required"),
  notes: z.string().optional().nullable()
});

export default function Rentals() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [returnRentalId, setReturnRentalId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    status: statusFilter !== "all" ? (statusFilter as ListRentalsStatus) : undefined,
  };

  const { data: rentals, isLoading } = useListRentals(queryParams);
  const { data: vehicles } = useListVehicles({ status: "available" }); // Only available for new rentals
  const { data: customers } = useListCustomers();
  
  const createMutation = useCreateRental();
  const updateMutation = useUpdateRental();

  const form = useForm<z.infer<typeof createRentalSchema>>({
    resolver: zodResolver(createRentalSchema),
    defaultValues: {
      dailyRate: 0,
      notes: ""
    }
  });

  const onVehicleSelect = (id: string) => {
    const v = vehicles?.find(v => v.id.toString() === id);
    if (v) {
      form.setValue("vehicleId", v.id);
      form.setValue("dailyRate", v.dailyRate);
    }
  };

  const onCreateSubmit = async (data: z.infer<typeof createRentalSchema>) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] }); // invalidate vehicles to update status
      toast({ title: "Rental created" });
      setIsCreateOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ title: "Error creating rental", description: error.message, variant: "destructive" });
    }
  };

  const handleReturn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!returnRentalId) return;
    
    const formData = new FormData(e.currentTarget);
    const actualReturnDate = formData.get("actualReturnDate") as string;
    
    // Find rental
    const rental = rentals?.find(r => r.id === returnRentalId);
    if (!rental) return;

    // Calc days
    const days = Math.max(1, differenceInDays(new Date(actualReturnDate), new Date(rental.startDate)));
    const totalCost = days * rental.dailyRate;

    try {
      await updateMutation.mutateAsync({
        id: returnRentalId,
        data: {
          status: "completed",
          actualReturnDate,
          totalCost
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Vehicle returned successfully", description: `Total cost: ₹${totalCost.toLocaleString('en-IN')}` });
      setReturnRentalId(null);
    } catch (error: any) {
      toast({ title: "Error returning vehicle", description: error.message, variant: "destructive" });
    }
  };

  const handleCancel = async (id: number) => {
    if(!window.confirm("Cancel this rental?")) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: "cancelled" }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Rental cancelled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "active": return <Clock className="w-4 h-4 text-blue-500" />;
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Rentals</h1>
            <p className="text-muted-foreground mt-1">Track active rentals and process returns.</p>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl px-6 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> New Rental
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rentals</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground text-sm font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Vehicle & Customer</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Financials</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
               ) : (Array.isArray(rentals) ? rentals : []).map((rental, index) => (
                  <motion.tr 
                    key={rental.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-foreground">
                        {rental.vehicle.make} {rental.vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {rental.customer.firstName} {rental.customer.lastName}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(rental.startDate), 'MMM d, yyyy')}</span>
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <span>{format(new Date(rental.endDate), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-foreground">₹{rental.dailyRate}/day</div>
                      {rental.totalCost && (
                        <div className="text-xs text-emerald-600 font-bold mt-1 bg-emerald-100 inline-block px-2 py-0.5 rounded">
                          Total: ₹{rental.totalCost}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 capitalize text-sm font-bold">
                        <StatusIcon status={rental.status} />
                        {rental.status}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {rental.status === 'active' && (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setReturnRentalId(rental.id)} className="rounded-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            Return
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(rental.id)} className="rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {!isLoading && rentals?.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No rentals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border rounded-2xl">
          <form onSubmit={form.handleSubmit(onCreateSubmit)}>
            <div className="bg-muted px-6 py-4 border-b border-border">
              <DialogTitle className="text-xl font-display font-bold">Create Rental</DialogTitle>
              {/* Added to satisfy Radix UI accessibility requirement */}
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Fill out the form details below to book a new vehicle rental contract.
              </DialogDescription>
            </div>
            
            <div className="px-6 py-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Select Vehicle</label>
                <Select onValueChange={onVehicleSelect}>
                  <SelectTrigger className="bg-background rounded-xl">
                    <SelectValue placeholder="Available Vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                   {(Array.isArray(vehicles) ? vehicles : []).map(v => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.make} {v.model} (₹{v.dailyRate}/day)
                      </SelectItem>
                    ))}
                    {vehicles?.length === 0 && <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                  </SelectContent>
                </Select>
                {form.formState.errors.vehicleId && <span className="text-xs text-destructive">Required</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Select Customer</label>
                <Select onValueChange={(val) => form.setValue("customerId", parseInt(val))}>
                  <SelectTrigger className="bg-background rounded-xl">
                    <SelectValue placeholder="Customer" />
                  </SelectTrigger>
                  <SelectContent>
                  {(Array.isArray(customers) ? customers : []).map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.firstName} {c.lastName} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.customerId && <span className="text-xs text-destructive">Required</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Start Date</label>
                  <Input type="date" {...form.register("startDate")} className="bg-background rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Expected End</label>
                  <Input type="date" {...form.register("endDate")} className="bg-background rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Agreed Daily Rate (₹)</label>
                <Input type="number" step="0.01" {...form.register("dailyRate")} className="bg-background rounded-xl" />
              </div>
            </div>

            <div className="bg-muted px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                {createMutation.isPending ? "Processing..." : "Create Rental"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Modal */}
      <Dialog open={!!returnRentalId} onOpenChange={(o) => !o && setReturnRentalId(null)}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-card border-border rounded-2xl">
          <form onSubmit={handleReturn}>
            <div className="bg-primary/10 text-primary px-6 py-4 border-b border-primary/20">
              <DialogTitle className="text-xl font-display font-bold">Process Return</DialogTitle>
              {/* Added DialogDescription here to semanticize layout and fix accessibility warning */}
              <DialogDescription className="text-sm text-muted-foreground/80 mt-1">
                Total cost will be automatically calculated based on the daily rate and actual days rented.
              </DialogDescription>
            </div>
            
            <div className="px-6 py-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Actual Return Date</label>
                <Input 
                  type="date" 
                  name="actualReturnDate"
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  required 
                  className="bg-background rounded-xl" 
                />
              </div>
            </div>

            <div className="bg-muted px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setReturnRentalId(null)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                {updateMutation.isPending ? "Processing..." : "Complete Return"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
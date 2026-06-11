import React, { useState } from "react";
import { AppLayout } from "@/components/layout";
import { 
  useListCustomers, 
  useCreateCustomer, 
  useUpdateCustomer, 
  useDeleteCustomer,
  Customer
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Search, Edit, Trash2, UserCircle, Phone, Mail, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const customerSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Required"),
  driverLicenseNumber: z.string().min(1, "Required"),
  address: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function Customers() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: customers, isLoading } = useListCustomers({ search: search || undefined });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      driverLicenseNumber: "",
      address: "",
      dateOfBirth: "",
    }
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.reset({
        ...customer,
        address: customer.address || "",
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : "",
      });
    } else {
      setEditingCustomer(null);
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        driverLicenseNumber: "",
        address: "",
        dateOfBirth: "",
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({ id: editingCustomer.id, data });
        toast({ title: "Customer updated" });
      } else {
        await createMutation.mutateAsync({ data });
        toast({ title: "Customer created" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: "Error saving customer", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer deleted" });
    } catch (error: any) {
      toast({ title: "Error deleting customer", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">Manage your customer database and profiles.</p>
          </div>
          <Button 
            onClick={() => openModal()}
            className="rounded-xl px-6 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Customer
          </Button>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-10 bg-background rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground text-sm font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Customer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">License / Details</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
               ) : (Array.isArray(customers) ? customers : []).map((customer, index) => (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-display">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center text-sm text-foreground">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-foreground">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {customer.phone}
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center text-sm font-medium text-foreground bg-background border px-2 py-1 rounded-md inline-flex">
                        <FileText className="w-4 h-4 mr-2 text-primary" /> {customer.driverLicenseNumber}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openModal(customer)} className="rounded-lg">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} className="rounded-lg hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {!isLoading && customers?.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border rounded-2xl">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-muted px-6 py-4 border-b border-border">
              <DialogTitle className="text-xl font-display font-bold">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
            </div>
            
            <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">First Name</label>
                <Input {...form.register("firstName")} className="bg-background rounded-xl" />
                {form.formState.errors.firstName && <span className="text-xs text-destructive">{form.formState.errors.firstName.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Last Name</label>
                <Input {...form.register("lastName")} className="bg-background rounded-xl" />
                {form.formState.errors.lastName && <span className="text-xs text-destructive">{form.formState.errors.lastName.message}</span>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-foreground">Email</label>
                <Input type="email" {...form.register("email")} className="bg-background rounded-xl" />
                {form.formState.errors.email && <span className="text-xs text-destructive">{form.formState.errors.email.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Phone</label>
                <Input {...form.register("phone")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">License Number</label>
                <Input {...form.register("driverLicenseNumber")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-foreground">Address</label>
                <Input {...form.register("address")} className="bg-background rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-foreground">Date of Birth</label>
                <Input type="date" {...form.register("dateOfBirth")} className="bg-background rounded-xl" />
              </div>
            </div>

            <div className="bg-muted px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

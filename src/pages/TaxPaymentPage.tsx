import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CUSTOM_ROUTES } from "@/custom-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageSEO } from "@/hooks/usePageSEO";
import { VILLAGES } from "@/config/villageConfig";
import { Loader2 } from "lucide-react";
import useApiAuth from "@/hooks/useApiAuth";

interface TaxType {
  code: string;
  label: string;
  amount: string;
}

const TaxPaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useApiAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTax, setSelectedTax] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    villageAccount: "",
  });

  usePageSEO({
    title: "Tax Payment - Pay Village Taxes Online",
    description: "Pay your village taxes online securely. Property tax, water tax, and other municipal taxes.",
    keywords: ["tax payment", "online tax", "village tax", "property tax", "water tax"],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to pay your village tax online");
      navigate(CUSTOM_ROUTES.AUTH);
    }
  }, [user, authLoading, navigate]);

  // Tax types configuration
  const taxTypes: TaxType[] = [
    { code: "PROPERTY", label: "Property Tax", amount: "500" },
    { code: "WATER", label: "Water & Sewage Tax", amount: "300" },
    { code: "SANITATION", label: "Sanitation Tax", amount: "200" },
    { code: "STREET_LIGHT", label: "Street Light Tax", amount: "150" },
  ];

  const selectedTaxType = taxTypes.find((t) => t.code === selectedTax);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTax) {
      toast.error("Please select a tax type");
      return;
    }

    if (!formData.name || !formData.mobile) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      // Get village ID from database
      const { data: villageData } = await supabase
        .from("villages")
        .select("id")
        .eq("name", VILLAGES.shivankhed.name)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("create-tax-payment", {
        body: {
          taxType: selectedTaxType?.label,
          amount: selectedTaxType?.amount,
          payerName: formData.name,
          payerMobile: formData.mobile,
          payerEmail: formData.email,
          villageAccount: formData.villageAccount,
          villageId: villageData?.id,
        },
      });

      if (error) throw error;

      console.log("Payment order created:", data);

      // Redirect to Cashfree payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pay Village Taxes</CardTitle>
          <CardDescription>
            Pay your village taxes online securely using our payment gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tax-type">Tax Type *</Label>
              <Select value={selectedTax} onValueChange={setSelectedTax}>
                <SelectTrigger id="tax-type">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  {taxTypes.map((tax) => (
                    <SelectItem key={tax.code} value={tax.code}>
                      {tax.label} - ₹{tax.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTaxType && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-2xl font-bold">₹{selectedTaxType.amount}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="village-account">Village ID / Account Number (Optional)</Label>
              <Input
                id="village-account"
                type="text"
                placeholder="Enter village account number if available"
                value={formData.villageAccount}
                onChange={(e) => setFormData({ ...formData, villageAccount: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || !selectedTax}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Cashfree. Your payment information is encrypted and secure.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxPaymentPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  Filter,
  Mail,
  Phone,
  User,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CustomLoader from "@/components/CustomLoader";
import * as XLSX from "xlsx";
import useApiAuth from "@/hooks/useApiAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GetContactList,
  UpdateContactStatus,
} from "@/services/feedbackService";
import { VILLAGES } from "@/config/villageConfig";
import useDebounce from "@/hooks/useDebounce";

const ContactMessagesAdmin = () => {
  const navigate = useNavigate();
  const { loading: authLoading, hasPermission } = useApiAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: UpdateContactStatus,
  });

  const { data: contactList, isLoading } = useQuery({
    queryKey: [
      "contactMessages",
      VILLAGES.shivankhed.id,
      statusFilter,
      dateFilter,
      debouncedSearch,
    ],
    queryFn: () =>
      GetContactList({
        page: 0,
        limit: 20,
        villageId: VILLAGES.shivankhed.id,
        status: statusFilter === "all" ? undefined : statusFilter,
        date: dateFilter || undefined,
        search: debouncedSearch || undefined,
      }),
    select(data) {
      return data.data.contacts;
    },
  });

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      contactList.map((msg) => ({
        Date: new Date(msg.createdAt).toLocaleDateString(),
        Name: msg.name,
        Mobile: msg.mobile,
        Email: msg.email || "N/A",
        Subject: msg.subject,
        Message: msg.message,
        Status: msg.status,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Messages");
    XLSX.writeFile(
      workbook,
      `contact_messages_${new Date().toISOString().split("T")[0]}.xlsx`,
    );

    toast({
      title: "Downloaded",
      description: "Contact messages exported to Excel",
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    mutateAsync(
      {
        contactId: id,
        status: newStatus,
      },
      {
        onSuccess() {
          toast({
            title: "Status Updated",
            description: `Message marked as ${newStatus}`,
          });
        },
        onError() {
          toast({
            title: "Error",
            description: "Failed to update status. Please try again.",
            variant: "destructive",
          });
        }
      },
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading || isLoading) return <CustomLoader />;
  if (!hasPermission("contact:view")) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold">Contact Form Messages</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all contact form submissions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Export</label>
                <Button
                  onClick={downloadExcel}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Messages ({contactList.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    contactList.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {msg.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {msg.mobile}
                            </div>
                            {msg.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {msg.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            {msg.subject}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {msg.message}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(msg.status)}>
                            {msg.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={msg.status}
                            onValueChange={(value) =>
                              updateStatus(msg.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="in_progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactMessagesAdmin;

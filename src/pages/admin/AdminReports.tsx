import { useEffect, useState } from "react";
import { Search, Eye, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface Report {
  id: number;
  reporter_username: string;
  reported_user_username: string | null;
  reason: string;
  description: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
  admin_username: string | null;
}

interface ReportDetail extends Report {
  reporter_avatar: string | null;
  reported_content: {
    type: "post" | "comment";
    content: any;
  } | null;
  resolution_notes: string | null;
}

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterReason, setFilterReason] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "remove" | "warn" | "suspend" | "dismiss" | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const { toast } = useToast();

  const reasons = [
    { value: "all", label: "All Reasons" },
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "abusive_language", label: "Abusive Language" },
    { value: "misinformation", label: "Misinformation" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "sexual_content", label: "Sexual Content" },
    { value: "violence", label: "Violence" },
    { value: "scam", label: "Scam" },
    { value: "other", label: "Other" },
  ];

  const fetchReports = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      if (filterReason !== "all") {
        params.append("reason", filterReason);
      }

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setTotalReports(data.total);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(page);
  }, [page, filterStatus, filterReason]);

  const handleViewDetail = async (reportId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data.report);
        setShowDetailModal(true);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch report details", variant: "destructive" });
    }
  };

  const handleAction = (type: "approve" | "remove" | "warn" | "suspend" | "dismiss") => {
    setActionType(type);
    setActionNotes("");
    setShowActionDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      const token = localStorage.getItem("token");

      if (actionType === "dismiss") {
        // Update report status to dismissed
        const response = await fetch(`/api/admin/reports/${selectedReport.id}/status`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: "dismissed", resolution_notes: actionNotes })
        });

        if (response.ok) {
          toast({ title: "Success", description: "Report dismissed" });
          setShowDetailModal(false);
          fetchReports(page);
        }
      } else {
        // Take moderator action
        const response = await fetch(`/api/admin/reports/${selectedReport.id}/action`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ action: actionType, reason: actionNotes })
        });

        if (response.ok) {
          toast({ title: "Success", description: `Action '${actionType}' applied` });
          setShowDetailModal(false);
          fetchReports(page);
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to take action", variant: "destructive" });
    } finally {
      setShowActionDialog(false);
      setActionType(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-muted";
    }
  };

  const totalPages = Math.ceil(totalReports / limit);

  return (
    <AdminLayout title="Reports & Moderation">
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username/reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-none"
            />
          </div>

          <Select value={filterStatus} onValueChange={(value) => {
            setFilterStatus(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-40 bg-secondary border-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterReason} onValueChange={(value) => {
            setFilterReason(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-40 bg-secondary border-none">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map(reason => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          Total: {totalReports} reports | Page {page} of {totalPages}
        </p>
      </div>

      {/* Reports Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No reports found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/50">
                <TableHead className="text-muted-foreground font-semibold">Report ID</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Reporter</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Reported User</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Reason</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">#{report.id}</TableCell>
                  <TableCell className="text-sm">{report.reporter_username}</TableCell>
                  <TableCell className="text-sm">{report.reported_user_username || "N/A"}</TableCell>
                  <TableCell className="text-sm">{report.reason}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetail(report.id)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, page - 2) + i;
            if (pageNum > totalPages) return null;
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">Report #{selectedReport.id}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reporter</p>
                  <p className="font-medium">@{selectedReport.reporter_username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reported User</p>
                  <p className="font-medium">{selectedReport.reported_user_username || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium">{selectedReport.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedReport.description && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm bg-muted p-3 rounded">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.reported_content && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Reported {selectedReport.reported_content.type === "post" ? "Post" : "Comment"}
                  </p>
                  <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {selectedReport.reported_content.content.content}
                  </div>
                </div>
              )}

              {selectedReport.resolution_notes && selectedReport.status !== "pending" && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Resolution Notes</p>
                  <p className="text-sm bg-green-50 dark:bg-green-950 p-3 rounded">{selectedReport.resolution_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedReport.status === "pending" && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3">Moderation Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAction("warn")}
                      className="w-full"
                    >
                      Warn User
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction("suspend")}
                      className="w-full"
                    >
                      Suspend User
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleAction("remove")}
                      className="w-full"
                    >
                      Remove Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction("dismiss")}
                      className="w-full"
                    >
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Action Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "warn" ? "Warn User" : actionType === "suspend" ? "Suspend User" : actionType === "remove" ? "Remove Content" : "Dismiss Report"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notes/Reason (optional)</label>
              <Textarea
                placeholder="Add notes about this action..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="min-h-20"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className="flex-1"
            >
              {actionType === "warn" ? "Warn" : actionType === "suspend" ? "Suspend" : actionType === "remove" ? "Remove" : "Dismiss"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminReports;

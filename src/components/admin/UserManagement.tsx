import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Shield, KeyRound } from "lucide-react";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToResetMFA, setUserToResetMFA] = useState<any>(null);
  const [isResettingMFA, setIsResettingMFA] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      return profiles?.map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.id) || []
      }));
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: !currentStatus })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Business verification status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update business verification", variant: "destructive" });
    },
  });

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: userToDelete.id },
      });

      if (error) throw error;

      toast({
        title: "User deleted",
        description: `${userToDelete.email} has been permanently deleted.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setUserToDelete(null);
    } catch (error: any) {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetMFA = async () => {
    if (!userToResetMFA) return;
    
    setIsResettingMFA(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-mfa", {
        body: { userId: userToResetMFA.id },
      });

      if (error) throw error;

      toast({
        title: "MFA Reset",
        description: `MFA has been reset for ${userToResetMFA.email}. ${data?.message || ''}`,
      });
      
      setUserToResetMFA(null);
    } catch (error: any) {
      toast({
        title: "Failed to reset MFA",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsResettingMFA(false);
    }
  };

  const filteredUsers = users?.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers?.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users, verification status, and GDPR deletion requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by email, name, or username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">Show 20</SelectItem>
                  <SelectItem value="50">Show 50</SelectItem>
                  <SelectItem value="100">Show 100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading users...</p>
            ) : (
              <>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Business Verified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers?.map((user) => {
                        const hasBusinessRole = user.user_roles?.some((r: any) => 
                          r.role === 'employer' || r.role === 'recruiter'
                        );
                        const isAdmin = user.user_roles?.some((r: any) => r.role === 'admin');
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {user.full_name || "N/A"}
                                {user.is_verified && <VerifiedBadge />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {user.user_roles?.map((role: any, idx: number) => (
                                  <Badge key={idx} variant="secondary">
                                    {role.role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {hasBusinessRole ? (
                                <Badge variant={user.is_verified ? "default" : "secondary"}>
                                  {user.is_verified ? "Yes" : "No"}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {hasBusinessRole && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      toggleVerificationMutation.mutate({
                                        userId: user.id,
                                        currentStatus: user.is_verified,
                                      })
                                    }
                                  >
                                    <Shield className="h-4 w-4 mr-1" />
                                    {user.is_verified ? "Unverify" : "Verify"}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setUserToResetMFA(user)}
                                >
                                  <KeyRound className="h-4 w-4 mr-1" />
                                  Reset MFA
                                </Button>
                                {!isAdmin && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setUserToDelete(user)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} results
                  </p>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account (GDPR)</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will <strong>permanently delete</strong> the user account for:
              </p>
              <p className="font-medium text-foreground">
                {userToDelete?.email}
              </p>
              <p className="text-destructive">
                This action cannot be undone. All user data including profile, certifications, 
                applications, and activity will be permanently removed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToResetMFA} onOpenChange={(open) => !open && setUserToResetMFA(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset MFA for User</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will reset all MFA factors and backup codes for:
              </p>
              <p className="font-medium text-foreground">
                {userToResetMFA?.email}
              </p>
              <p>
                The user will need to set up MFA again on their next login.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingMFA}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetMFA}
              disabled={isResettingMFA}
            >
              {isResettingMFA ? "Resetting..." : "Reset MFA"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

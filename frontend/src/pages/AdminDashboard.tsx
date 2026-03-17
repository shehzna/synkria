
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

interface User {
    id: string;
    email: string;
    name: string;
    age: number;
    cycle_length: number;
    is_staff: boolean;
    is_active: boolean;
    date_joined?: string;
}

import { Navbar } from "@/components/Navbar";

export const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();
    const dispatch = useAppDispatch();

    // Get auth state from Redux
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        console.log("AdminDashboard mounted. Auth:", { isAuthenticated, hasToken: !!token });
        const fetchUsers = async () => {
            if (!isAuthenticated || !token) {
                // Should be handled by ProtectedRoute, but double check
                // If we are here and not authenticated, something is wrong with state consistency
                setError("Authentication required.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/api/admin/users/", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    setError("Access Denied: You must be an administrator to view this page.");
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({
                    title: "Error",
                    description: "Failed to load users.",
                    variant: "destructive",
                });
                setError("An error occurred while fetching users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAuthenticated, token, toast]);

    const toggleUserStatus = async (userId: string) => {
        if (!token) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/toggle-status/`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update user status");
            }

            const data = await response.json();

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_active: data.is_active } : user
            ));

            toast({
                title: "Success",
                description: data.message,
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center">Loading...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto py-10 flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p>{error}</p>
                        <Button variant="outline" onClick={() => {
                            dispatch(logout());
                            navigate("/login");
                        }}>Logout</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Cycle Length</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.age}</TableCell>
                                            <TableCell>{user.cycle_length}</TableCell>
                                            <TableCell>
                                                {user.is_staff ? <Badge variant="default">Admin</Badge> : <Badge variant="secondary">User</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                {user.is_active ? <Badge className="bg-green-500">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                {!user.is_staff && (
                                                    <Button
                                                        variant={user.is_active ? "destructive" : "default"}
                                                        size="sm"
                                                        onClick={() => toggleUserStatus(user.id)}
                                                    >
                                                        {user.is_active ? "Block" : "Unblock"}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
